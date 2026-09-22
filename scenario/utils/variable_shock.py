import numpy as np

from data_collection.enums import COLNAME_EXPIRY, COLNAME_INDEXPRICE, COLNAME_OPENTIME, COLNAME_OPTIONTYPE, COLNAME_MARKIV, COLNAME_STRIKE
from pricing.core import generate_steps, generate_val_steps, time_to_expiry_in_s, time_to_expiry_in_s
from pricing.greeks import Greeks
from pricing.pmodels import PRICINGMODEL_NAMEFUNC_DICT
from pricing.pmodels.black_scholes import blackscholes_price
from utility.general import H_INTERVAL_TO_MS, TIMESTAMP_UNIT_MS, TIMESTAMP_UNIT_S, ts_calc, ts_convert_s_and_ms

LOWER_PCT = -0.2
UPPER_PCT = 0.2
STEP_PCT = 0.05

LOWER_H = 0
UPPER_H = 24
STEP_H = 1

VARIABLE_SIGMA = "sigma"
VARIABLE_PRICE = "S"
VARIABLE_TTE = "T"
VARIABLE_STRIKE = "K"
VARIABLE_OPTIONTYPE = "option_type"
OUTPUTKEY_FAIRVALUE = "fair_value"

def variable_shock(pricing_kwargs, input_key, output_key, lower, upper, step, range_func=generate_steps):
    """
    Price scenario by shocking the underlying price.

    Parameters
    ----------
    contract
        Contract snapshot.

    shock_prices
        Iterable of underlying prices.

    Returns
    -------
    dict
        {
            "spot": [...],
            "option_price": [...]
        }
    """

    output_vals = []

    curr_val = pricing_kwargs[input_key]
    if range_func == generate_steps:
        range_vals = range_func(curr_val, lower, upper, step)
    elif range_func == generate_val_steps:
        range_vals = range_func(lower, upper, step)
    model_name = pricing_kwargs.pop("model_name")

    if output_key == OUTPUTKEY_FAIRVALUE:
        func = lambda dictfield: PRICINGMODEL_NAMEFUNC_DICT[model_name](**dictfield)
    else:
        func = lambda dictfield: getattr(Greeks(**dictfield), output_key)()

    for val in range_vals:
        dictfield = pricing_kwargs.copy()
        dictfield[input_key] = val
        output_vals.append(func(dictfield))

    return {
        "range": range_vals,
        "output": np.array(output_vals),
    }

def price_shock(contract, r, q=0.0, lower=LOWER_PCT, upper=UPPER_PCT, step=STEP_PCT):
    return variable_shock(VARIABLE_PRICE, COLNAME_INDEXPRICE, contract, r, q, lower, upper, step)

def iv_shock(contract, r, q=0.0, lower=LOWER_PCT, upper=UPPER_PCT, step=STEP_PCT):
    return variable_shock(VARIABLE_SIGMA, COLNAME_MARKIV, contract, r, q, lower, upper, step)

def time_decay(contract, r, q=0.0, lower=LOWER_H, upper=UPPER_H, step=STEP_H):
    return variable_shock(VARIABLE_TTE, COLNAME_OPENTIME, contract, r, q, lower, upper, step)
