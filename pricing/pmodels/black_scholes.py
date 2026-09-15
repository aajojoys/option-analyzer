from scipy.stats import norm

from data_collection.enums import OPTIONTYPE_CALL, OPTIONTYPE_PUT
from pricing.core import calc_d1, calc_d2_by_d1, calc_discount


def blackscholes_price(S, K, T, r, sigma, option_type, q=0.0):
    """
    Args:
        S (float): Spot price
        K (float): Strike
        T (float): Time to expiry (years)
        r (float): Risk-free rate
        sigma (float): Implied volatility
        option_type (str) : "call" or "put"
        q (float): Dividend yield
    """

    d1 = calc_d1(S, K, T, r, sigma, q=q)
    d2 = calc_d2_by_d1(d1, T, sigma)

    if option_type == OPTIONTYPE_CALL:
        return (calc_discount(S, T, q) * norm.cdf(d1)) - (calc_discount(K, T, r) * norm.cdf(d2))
    elif option_type == OPTIONTYPE_PUT:
        return (calc_discount(K, T, r) * norm.cdf(-d2)) - (calc_discount(S, T, q) * norm.cdf(-d1))
