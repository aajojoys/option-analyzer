from pandas.tseries.frequencies import DAYS
from pytz import UTC
import pandas as pd
import numpy as np

from asset_info.model_utils import assetpair_get_obj_symbol
from asset_info.view_utils import assetinfoapi_get_obj_symbol
from data_collection.enums import COLNAME_ASK, COLNAME_ASKQ, COLNAME_BID, COLNAME_BIDQ, COLNAME_CLOSEP, COLNAME_CSYMBOL, COLNAME_DELTA, COLNAME_GAMMA, COLNAME_HIGHP, COLNAME_INDEXPRICE, COLNAME_LOWP, COLNAME_MARK, COLNAME_MARKIV, COLNAME_OI, COLNAME_OIU, COLNAME_OPENP, COLNAME_OPENTIME, COLNAME_OPTIONTYPE, COLNAME_STRIKE, COLNAME_SYMBOL, COLNAME_THETA, COLNAME_VEGA, COLNAME_VOLUME, DAYS_IN_YEAR, DBNAME_BINANCEOPTION, ACTIVITY_INTERVAL_1H_STR, OPTIONTYPE_NAMEDICT, TITLE_VALUE
from data_collection.view_utils import datacollectionapi_mongod_option_res
from option_chain.utils.builder import databaseinfo_get_basefield_dict_dbname
from pricing.greeks import Greeks
from pricing.pmodels import PRICINGMODEL_NAMEFUNC_DICT
from utility.general import D_INTERVAL_TO_MS, H_INTERVAL_TO_MS, PERIOD_STR_1H, TIMESTAMP_UNIT_MS, TIMESTAMP_UNIT_S, datetime_to_str, datetime_to_timestamp, str_to_datetime_aware, timestamp_to_datetime, ts_calc, ts_convert_s_and_ms, ts_delta, ts_floor

SEPARATOR = "-"

class ContractSession():
	def __init__(self, symbol, timestamp, contract_symbol, expiry, option_type):
		self.db_name = DBNAME_BINANCEOPTION
		self.activity_interval = ACTIVITY_INTERVAL_1H_STR
		self.symbol = symbol
		self.contract_symbol = contract_symbol
		self.max_period_d = 7
		self.hist_fieldname_ohlcv = "ohlcv"
		self.hist_fieldname_bam = "bam"
		self.hist_fieldname_greeks = "greeks"
		self.colname = databaseinfo_get_basefield_dict_dbname(self.db_name)
		self.ignore_fields = [COLNAME_BIDQ, COLNAME_ASKQ, COLNAME_OIU, COLNAME_OPTIONTYPE, COLNAME_STRIKE, COLNAME_SYMBOL, COLNAME_CSYMBOL]
		self.assetpair_obj = assetinfoapi_get_obj_symbol(self.db_name, self.symbol)
		self.__init_context(timestamp)

	def __init_assetinfo(self):
		self.asset_info = {
			'symbol': self.assetpair_obj.base_asset.symbol,
			'name': self.assetpair_obj.base_asset.asset_base.name,
		}

    # get rid of np.nan
	def __format_value(self, val):
		return None if val != val else val

	def __init_contractinfo(self):
		self.expiry_ts = ts_convert_s_and_ms(self.expiry, TIMESTAMP_UNIT_MS)
		d_delta = ts_delta(self.end_ts, self.expiry_ts, D_INTERVAL_TO_MS)
		self.contract_info = {
			'expiry': self.expiry_ts,
			'dte': d_delta,
		}

	def __init_stats(self):
		vol = self.data[self.colname[COLNAME_VOLUME]]
		oi = self.data[self.colname[COLNAME_OI]]
		miv = self.data[self.colname[COLNAME_MARKIV]]
		poi = self.dprev_data[self.colname[COLNAME_OI]]
		dprev_df = self.df[self.df[self.colname[COLNAME_OPENTIME]] >= self.s_dprev_ts]
		agg_vol = dprev_df[self.colname[COLNAME_VOLUME]].sum()
		iv_perc = dprev_df[self.colname[COLNAME_MARKIV]].rank(pct=True).values[-1] * 100
		oi_pctchg = 0 if (oi == 0) or (poi == 0) else ((oi/poi) - 1) * 100
		return {
			'oi': oi,
			'miv': miv,
			'oi_pctchg': oi_pctchg,
			'vol': vol,
			'agg_vol': agg_vol,
			'iv_perc': iv_perc,
		}
		
	def __init_marketprices(self):
		bid_price = self.data[self.colname[COLNAME_BID]]
		ask_price = self.data[self.colname[COLNAME_ASK]]
		mid_price = (bid_price + ask_price) / 2
		spread_price = ask_price - bid_price
		spread_pct = (spread_price / mid_price) * 100
		mark_price = self.data[self.colname[COLNAME_MARK]]
		self.market_prices = {
			'bid': bid_price,
			'ask': ask_price,
			'spread_pct': spread_pct,
			'mid': mid_price,
			'mark': mark_price,
		}
	
	def __convert_contract_expiry_to_ts(self, contract_expiry):
		return ts_convert_s_and_ms(datetime_to_timestamp(str_to_datetime_aware(contract_expiry, "%y%m%d", timezone=UTC)), TIMESTAMP_UNIT_S)

	def __extract_contract_name(self, contract_name):
		exp_ind = contract_name.find(SEPARATOR) + 1
		k_ind = contract_name.find(SEPARATOR, exp_ind) + 1
		option_type = contract_name[-1]
		expiry = contract_name[exp_ind:k_ind-1]
		strike = float(contract_name[k_ind:-2])
		expiry = self.__convert_contract_expiry_to_ts(expiry)
		return expiry, strike, option_type

	def __get_timesession(self, timestamp):
		self.end_ts = ts_floor(timestamp, PERIOD_STR_1H)
		self.start_ts = ts_calc(self.end_ts, self.max_period_d, D_INTERVAL_TO_MS, lambda a,b: a-b)
		self.dprev_ts = ts_calc(ts_calc(self.end_ts, 1, H_INTERVAL_TO_MS, lambda a,b: a+b), 1, D_INTERVAL_TO_MS, lambda a,b: a-b)
		self.s_start_ts = ts_convert_s_and_ms(self.start_ts, TIMESTAMP_UNIT_S)
		self.s_end_ts = ts_convert_s_and_ms(self.end_ts, TIMESTAMP_UNIT_S)
		self.s_dprev_ts = ts_convert_s_and_ms(self.dprev_ts, TIMESTAMP_UNIT_S)
	
	def __get_data(self, s_timestamp):
		# might be nested dict
		cond_bool = self.df[self.colname[COLNAME_OPENTIME]] == s_timestamp
		return self.df[cond_bool].iloc[0, :].to_dict()
	
	def __init_currentdata(self):
		self.data = self.__get_data(self.s_end_ts)
		self.dprev_data = self.__get_data(self.s_dprev_ts)

	def __prep_df_format(self, df):
		if self.colname[COLNAME_MARKIV] in df.columns:
			df[self.colname[COLNAME_MARKIV]] = df[self.colname[COLNAME_MARKIV]] * 100

	def __prep_df(self, res):
		# self.df = pd.DataFrame(res).ffill().sort_values(COLNAME_OPENTIME, ascending=True)
		df = pd.DataFrame(res).sort_values(COLNAME_OPENTIME, ascending=True)
		df.rename(self.colname, axis=1, inplace=True)
		self.__prep_df_format(df)
		return df

	def __init_data(self):
		dictfield = dict(
			db_name=self.db_name,
			start_ts=self.start_ts,
			end_ts=self.end_ts,
			contract_symbol=self.contract_symbol,
			ignore_listfields=self.ignore_fields,
		)
		res = datacollectionapi_mongod_option_res(dictfield)
		self.df = self.__prep_df(res)

	def __init_context(self, timestamp):
		self.__get_timesession(timestamp)
		self.expiry, self.strike, self.option_type = self.__extract_contract_name(self.contract_symbol)
		self.__init_data()
		self.__init_currentdata()
		self.__init_assetinfo()
		self.__init_contractinfo()
		self.__init_marketprices()

	def __extract(self, df, field_list):
		return { fkey: df[fkey].tolist() for fkey in field_list }

	def __get_pricing_input(self):
		return dict(
			S = self.data[self.colname[COLNAME_INDEXPRICE]],
			K = self.strike,
			T = self.contract_info['dte'] / DAYS_IN_YEAR,
			sigma = self.data[self.colname[COLNAME_MARKIV]] / 100,
		)
		# return dict(S=self.S, K=self.K, T=self.T, sigma=self.sigma)

	def __get_greeks_data(self):
		return dict(
			delta = self.data[self.colname[COLNAME_DELTA]],
			gamma = self.data[self.colname[COLNAME_GAMMA]],
			theta = self.data[self.colname[COLNAME_THETA]],
			vega = self.data[self.colname[COLNAME_VEGA]],
		)

	def __price_option(self, model_name, kwargs):
		pricing_func = PRICINGMODEL_NAMEFUNC_DICT[model_name]
		return pricing_func(**kwargs)
	
	def __price_model(self, kwargs, with_default=True):
		if with_default: kwargs.update(self.__get_pricing_input())
		kwargs['option_type'] = self.option_type
		model_name = kwargs.pop('model_name')
		model_price = self.__price_option(model_name, kwargs)
		g = Greeks(**kwargs)
		res = g.all()
		res['price'] = model_price
		return { key: float(val) for key, val in res.items() }

	def get_contract_info(self):
		underlying_price = self.data[self.colname[COLNAME_INDEXPRICE]]
		quote_symbol = self.assetpair_obj.quote_asset.symbol
		return {
			"Underlying Asset": f"{self.asset_info['name']} ({self.asset_info['symbol']})",
			"Underlying Price": f"{underlying_price:.2f} {quote_symbol}",
			"Option Type": OPTIONTYPE_NAMEDICT[self.option_type],
			"Strike": f"{self.strike} {quote_symbol}",
			"Expiry": datetime_to_str(timestamp_to_datetime(self.contract_info['expiry']), "%d %b %Y") + " (UTC)",
			"Day To Expiry": f"{self.contract_info['dte']:.1f} days",
		}

	def get_stats(self):
		stats_dict = self.__init_stats()
		return {
			'Open Interest (OI)': f"{stats_dict['oi']} contracts",
			'Change in OI (24h)': f"{stats_dict['oi_pctchg']:.2f} %",
			'Volume': f"{stats_dict['vol']:.2f} contracts",
			'Volume (24h)': f"{stats_dict['agg_vol']:.2f} contracts",
			'Implied Volatility (IV)': f"{stats_dict['miv']:.2f} %",
			'IV Percentile (24h)': f"{stats_dict['iv_perc']:.2f} %",
		}

	def get_market_prices(self):
		quote_symbol = self.assetpair_obj.quote_asset.symbol
		return {
			"Mark Price": f"{self.market_prices['mark']} {quote_symbol}",
			"Bid Price": f"{self.market_prices['bid']} {quote_symbol}",
			"Ask Price": f"{self.market_prices['ask']} {quote_symbol}",
			"Mid Price": f"{self.market_prices['mid']} {quote_symbol}",
			"Spread (%)": f"{self.market_prices['spread_pct']:.2f} %",
		}
	
	def get_greeks(self, greeks=None):
		if greeks is None: greeks = self.__get_greeks_data()
		res = {
			# "Delta": round(greeks['delta'], 4),
			# "Gamma": round(greeks['gamma'], 4),
			# "Theta (per day)": round(greeks['theta'], 4),
			# "Vega (per 1% IV)": round(greeks['vega'], 4),
			"Delta": f"{greeks['delta']:.4f}",
			"Gamma": f"{greeks['gamma']:.4f}",
			"Theta (per day)": f"{greeks['theta']:.4f}",
			"Vega (per 1% IV)": f"{greeks['vega']:.4f}",
		}
		if 'rho' in greeks: res["Rho (per 1% r)"] = f"{greeks['rho']:.4f}"
		return res

	def get_hist(self, field_value):
		field_list = [self.colname[COLNAME_OPENTIME]]
		if field_value == self.hist_fieldname_ohlcv:
			field_list += [self.colname[COLNAME_OPENP], self.colname[COLNAME_HIGHP], self.colname[COLNAME_LOWP], self.colname[COLNAME_CLOSEP], self.colname[COLNAME_VOLUME]]
		elif field_value == self.hist_fieldname_bam:
			field_list += [self.colname[COLNAME_BID], self.colname[COLNAME_ASK], self.colname[COLNAME_MARK]]
		elif field_value == self.hist_fieldname_greeks:
			field_list += [self.colname[COLNAME_DELTA], self.colname[COLNAME_GAMMA], self.colname[COLNAME_THETA], self.colname[COLNAME_VEGA]]
		else:
			field_list += [self.colname[field_value]]
		dprev_df = self.df[self.df[self.colname[COLNAME_OPENTIME]] >= self.s_dprev_ts]
		return self.__extract(dprev_df, field_list)

	def get_pricing_input(self):
		input = self.__get_pricing_input()
		return {
			"Underlying Price": f"{input['S']:.2f}",
			"Strike Price": f"{input['K']}",
			"Time To Expiry": f"{self.contract_info['dte']:.1f} day/s ({input['T']:.4f} year)",
			"Volatility (IV)": f"{input['sigma'] * 100:.2f} %",
			"Variables:": TITLE_VALUE,
			"Risk Free Rate": "0.04",
			"Dividend": "0.0",
			"Pricing Model": "black-scholes",
		}

	def get_compare_price(self, theory_price):
		mark_price = self.market_prices['mark']
		bid_price = self.market_prices['bid']
		ask_price = self.market_prices['ask']
		diff = theory_price - mark_price
		diff_pct = (diff / mark_price) * 100
		if theory_price < bid_price:
			description = "Undervalued"
		elif theory_price > ask_price:
			description = "Overvalued"
		else:
			description = "Fairly Priced"
		return {
			"Mark Price": f"{self.market_prices['mark']:.2f}",
			"Fair Value": f"{theory_price:.2f}",
			"Absolute Difference": f"{diff:.2f}",
			"Percentage Difference": f"{diff_pct:.2f} %",
			"Status": description,
			"Description": f"{abs(diff_pct):.2f}% {'below' if (diff_pct < 0) else 'above'} market price",
		}

	def get_general_info(self):
		res_all = {}
		res_all.update({"Contract Info:": TITLE_VALUE})
		res_all.update(self.get_contract_info())
		res_all.update({"Statistic:": TITLE_VALUE})
		res_all.update(self.get_stats())
		return res_all

	def get_pricing_result(self, r, q, model_name):
		kwargs = dict(r=r, q=q, model_name=model_name)
		res_result = self.__price_model(kwargs)
		res_all = {"result": {}, "greeks": {}}
		res_all["result"]['Theoretical Price'] = round(res_result['price'], 4)
		res_all["result"].update(self.get_compare_price(res_result['price']))
		res_all["greeks"].update(self.get_greeks(res_result))
		return res_all