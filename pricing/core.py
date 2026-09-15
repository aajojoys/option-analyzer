import numpy as np
from data_collection.enums import SECONDS_PER_YEAR

def time_to_expiry_in_s(open_ts, expiry_ts):
    return (expiry_ts - open_ts) / SECONDS_PER_YEAR

def generate_steps(val, lower_pct, upper_pct, step):
    range_vals = np.linspace(lower_pct, upper_pct, step)
    if val == 0:
        return range_vals
    else:
        return val * (1 + (range_vals / 100))

def generate_val_steps(lower_val, upper_val, step_count):
    return np.linspace(lower_val, upper_val, step_count+1)

def calc_d1(S, K, T, r, sigma, q=0.0):
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
    return (np.log(S / K) + (r - q + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))

def calc_d2_by_d1(d1, T, sigma):
    return d1 - sigma * np.sqrt(T)

def calc_d2(S, K, T, r, sigma, q=0.0):
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
    return calc_d1(S, K, T, r, sigma, q=q) - sigma * np.sqrt(T)

def calc_discount(U, T, r):
    """
    Args:
        U (float): Underlying price
        T (float): Time to expiry (years)
        r (float): rate
    """
    return U * np.exp(-r *T)