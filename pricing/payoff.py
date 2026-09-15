import numpy as np


def long_call(spot, strike, premium=0.0):
    """
    Long Call P&L

    Args:
        spot (float): spot price
        strike (float): strike price
        premium (float): premium price
    """
    return np.maximum(spot - strike, 0.0) - premium


def short_call(spot, strike, premium=0.0):
    """
    Short Call P&L

    Args:
        spot (float): spot price
        strike (float): strike price
        premium (float): premium price
    """
    return premium - np.maximum(spot - strike, 0.0)


def long_put(spot, strike, premium=0.0):
    """
    Long Put P&L

    Args:
        spot (float): spot price
        strike (float): strike price
        premium (float): premium price
    """
    return np.maximum(strike - spot, 0.0) - premium


def short_put(spot, strike, premium=0.0):
    """
    Short Put P&L

    Args:
        spot (float): spot price
        strike (float): strike price
        premium (float): premium price
    """
    return premium - np.maximum(strike - spot, 0.0)

def bull_call_spread(spot, lower_strike, upper_strike, lower_premium=0.0, upper_premium=0.0):
    return long_call(spot, lower_strike, lower_premium) + short_call(spot, upper_strike, upper_premium)

def bear_put_spread(spot, lower_strike, upper_strike, lower_premium=0.0, upper_premium=0.0):
    return long_put(spot, upper_strike, upper_premium) + short_put(spot, lower_strike, lower_premium)

def long_straddle(spot, strike, call_premium=0.0, put_premium=0.0):
    return long_call(spot, strike, call_premium) + long_put(spot, strike, put_premium)

def long_strangle(spot, put_strike, call_strike, put_premium=0.0, call_premium=0.0):
    return long_put(spot, put_strike, put_premium) + long_call(spot, call_strike, call_premium)

def long_call_butterfly(spot, lower, middle, upper, p_lower=0.0, p_middle=0.0, p_upper=0.0):
    return (
        long_call(spot, lower, p_lower)
        + 2 * short_call(spot, middle, p_middle)
        + long_call(spot, upper, p_upper)
    )

def iron_condor(spot, put_low, put_high, call_low, call_high, p_plow=0.0, p_phigh=0.0, p_clow=0.0, p_chigh=0.0):
    return (
        long_put(spot, put_low, p_plow)
        + short_put(spot, put_high, p_phigh)
        + short_call(spot, call_low, p_clow)
        + long_call(spot, call_high, p_chigh)
    )
