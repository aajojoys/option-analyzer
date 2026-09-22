from pytz import UTC
import pandas as pd
import numpy as np

from asset_info.model_utils import assetpair_get_obj_symbol
from asset_info.view_utils import assetinfoapi_get_obj_symbol
from contract_details.views import ContractSession
from data_collection.enums import COLNAME_ASK, COLNAME_ASKQ, COLNAME_BID, COLNAME_BIDQ, COLNAME_CLOSEP, COLNAME_CSYMBOL, COLNAME_DELTA, COLNAME_GAMMA, COLNAME_HIGHP, COLNAME_INDEXPRICE, COLNAME_LOWP, COLNAME_MARK, COLNAME_MARKIV, COLNAME_OI, COLNAME_OIU, COLNAME_OPENP, COLNAME_OPENTIME, COLNAME_OPTIONTYPE, COLNAME_STRIKE, COLNAME_SYMBOL, COLNAME_THETA, COLNAME_VEGA, COLNAME_VOLUME, DAYS_IN_YEAR, DBNAME_BINANCEOPTION, ACTIVITY_INTERVAL_1H_STR, OPTIONTYPE_CALL, OPTIONTYPE_NAMEDICT, OPTIONTYPE_PUT, POSITION_LONG, POSITION_SHORT, TITLE_VALUE
from data_collection.view_utils import datacollectionapi_mongod_option_res
from option_chain.utils.builder import databaseinfo_get_basefield_dict_dbname
from pricing.core import generate_steps, generate_val_steps
from pricing.greeks import Greeks
from pricing.payoff import long_call, long_put, short_call, short_put
from pricing.pmodels import PRICINGMODEL_BLACKSCHOLES, PRICINGMODEL_NAMEFUNC_DICT
from scenario.utils.variable_shock import variable_shock
from utility.general import round_sig_step

DEFAULT_RATE = 0.04
DEFAULT_DIVIDEND = 0.0

class ScenarioSession(ContractSession):
	def __init__(self, symbol, timestamp, contract_symbol, expiry, option_type):
		super().__init__(symbol, timestamp, contract_symbol, expiry, option_type)
		self.__init_context()

	def __init_context(self):
		self.__init_pricing_input()
	
	def __init_pricing_input(self):
		self.pricing_kwargs = self._ContractSession__get_pricing_input()
		for key, val in self.pricing_kwargs.items(): setattr(self, key, val)
	
	def get_scenario_pricing_input(self):
		pricing_kwargs = self.__get_all_default_pricing_input()
		return {
			"Underlying Asset": f"{self.asset_info['name']} ({self.asset_info['symbol']})",
			"Strike Price": f"{pricing_kwargs['K']}",
			"Option Type": f"{OPTIONTYPE_NAMEDICT[self.option_type]}",
			"Variable (Default value):": TITLE_VALUE,
			f"Underlying Price ({pricing_kwargs['S']:.2f} {self.assetpair_obj.quote_asset.symbol})": f"{pricing_kwargs['S']:.2f}",
			f"Time To Expiry ({pricing_kwargs['T']:.4f} year)": f"{pricing_kwargs['T']:.4f}",
			f"Implied Volatility ({pricing_kwargs['sigma']*100:.2f} %)": f"{pricing_kwargs['sigma'] * 100:.2f}",
			f"Risk Free Rate ({pricing_kwargs['r']:.2f})": f"{pricing_kwargs['r']}",
			f"Dividend ({pricing_kwargs['q']:.2f})": f"{pricing_kwargs['q']}",
			"Pricing Model": f"{pricing_kwargs['model_name']}",
		}
		
	def __get_pricing_scenario_result_helper(self, kwargs, with_default):
		res_result = self._ContractSession__price_model(kwargs, with_default=with_default)
		res = {}
		res['Theoretical Price'] = f"{res_result['price']:.4f}"
		res.update(self.get_compare_price(res_result['price']))
		del res['Description']
		res.update(self.get_greeks(res_result))
		return res

	def get_scenario_pricing_result(self, kwargs):
		current_kwargs = dict(r=kwargs.get('r'), q=kwargs.get('q'), model_name=kwargs.get('model_name'))
		res_current = self.__get_pricing_scenario_result_helper(current_kwargs, True)
		res_scenario = self.__get_pricing_scenario_result_helper(kwargs, False)
		df = pd.DataFrame({
			'Result': list(res_current.keys()),
			'Current': list(res_current.values()),
			'Scenario': list(res_scenario.values()),
		})
		# return df.to_dict("records")
		df = df.set_index("Result")
		res = {"Result": df.columns.tolist()}
		res.update(df.T.to_dict("list"))
		return res

	def __get_all_default_pricing_input(self):
		res = self.pricing_kwargs.copy()
		res['option_type'] = self.option_type
		res['r'] = DEFAULT_RATE
		res['q'] = DEFAULT_DIVIDEND
		res['model_name'] = PRICINGMODEL_BLACKSCHOLES
		return res

	def get_sensitivity_input(self):
		pricing_kwargs = self.__get_all_default_pricing_input()
		pct = 20
		index_price = pricing_kwargs["S"]
		anchor = round_sig_step(index_price)
		return dict(
			input = "S",
			output = "fair_value",
			lower=anchor * (1 - (pct/100)),
			upper=anchor * (1 + (pct/100)),
			step=10,
			values=self.__get_all_default_pricing_input(),
		)

	def get_sensitivity_result(self, input_key, output_key, lower, upper, step):
		pricing_kwargs = self.__get_all_default_pricing_input()
		res = variable_shock(pricing_kwargs, input_key, output_key, lower, upper, step, range_func=generate_val_steps)
		res["output"] = res["output"].astype(float).round(4)
		return {
			f"{input_key}": res["range"].astype(float).round(4).tolist(),
			f"{output_key}": np.where(res["output"] != res["output"], None, res["output"]).tolist(),
		}

	def get_payoff_result(self, position):
		lower_pct = -40
		upper_pct = 40
		step = 10
		isoption_call = self.option_type == OPTIONTYPE_CALL
		isoption_put = self.option_type == OPTIONTYPE_PUT
		isposition_long = position == POSITION_LONG
		isposition_short = position == POSITION_SHORT
		if (isposition_long) and (isoption_call):
			func = long_call
		elif (isposition_long) and (isoption_put):
			func = long_put
		elif (isposition_short) and (isoption_call):
			func = short_call
		elif (isposition_short) and (isoption_put):
			func = short_put

		index_price=self.data[self.colname[COLNAME_INDEXPRICE]]
		mark_price = self.market_prices["mark"]
		strike_price = self.strike
		dictfield = dict(
			premium=mark_price,
			strike=strike_price,
		)
		anchor = round_sig_step(index_price)
		breakeven = strike_price + mark_price if isoption_call else strike_price - mark_price
		ranges = [index_price, breakeven, strike_price]
		xmin = min(ranges)
		xmax = max(ranges)
		lower = min(anchor * (1 + lower_pct / 100), xmin)
		upper = max(anchor * (1 + upper_pct / 100), xmax)
		range_vals = generate_val_steps(lower, upper, step)
		res = {}
		res['range'] = range_vals.astype(float).tolist()
		res['pnl'] = [ round(float(func(**dictfield, spot=price)), 4) for price in range_vals ]
		res['current'] = round(float(index_price), 4)
		res['breakeven'] = round(float(breakeven), 4)
		return res
