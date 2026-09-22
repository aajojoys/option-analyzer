from data_collection.enums import COLNAME_EXPIRY, COLNAME_INDEXPRICE, COLNAME_OPENTIME, COLNAME_OPTIONTYPE, COLNAME_MARKIV, COLNAME_STRIKE
from pricing.core import generate_steps, time_to_expiry_in_s
from pricing.pmodels.black_scholes import blackscholes_price


LOWER_PCT = -0.2
UPPER_PCT = 0.2
STEP_PCT = 0.05

def variable_shock(key, contract, r, q=0.0, lower_pct=LOWER_PCT, upper_pct=UPPER_PCT, step_pct=STEP_PCT):
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

    option_prices = []

    curr_val = contract[key]
    range_vals = generate_steps(curr_val, lower_pct, upper_pct, step_pct)
    t_to_exp = time_to_expiry_in_s(contract[COLNAME_OPENTIME], contract[COLNAME_EXPIRY])

    for val in range_vals:
        dictfield = dict(
            S=contract[COLNAME_INDEXPRICE],
            K=contract[COLNAME_STRIKE],
            T=t_to_exp,
            r=r,
            sigma=contract[COLNAME_MARKIV],
            option_type=contract[COLNAME_OPTIONTYPE],
            q=q,
        )
        dictfield[key] = val

        price = blackscholes_price(**dictfield)
        option_prices.append(price)

    return {
        "values": list(range_vals),
        "option_price": option_prices,
    }
