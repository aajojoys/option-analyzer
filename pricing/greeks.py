from scipy.stats import norm
import numpy as np
from data_collection.enums import DAYS_IN_YEAR, OPTIONTYPE_ALL, OPTIONTYPE_CALL, OPTIONTYPE_PUT

from pricing.core import calc_d1, calc_d2_by_d1, calc_discount

def validate_greeks(S, K, T, r, sigma, option_type, q, key):
    pass

class Greeks():
    def __init__(self, S, K, T, r, sigma, option_type=None, q=0.0):
        self.S = S
        self.K = K
        self.T = T
        self.r = r
        self.sigma = sigma
        self.option_type = option_type
        self.q = q
        self.__calc_basic()

    def update_enums(self, kwargs):
        for key, val in kwargs.entries():
            setattr(self, key, val)
        self.__calc_basic()

    def __calc_basic(self):
        self.d1 = calc_d1(self.S, self.K, self.T, self.r, self.sigma, q=self.q)
        self.d2 = calc_d2_by_d1(self.d1, self.T, self.sigma)
        self.q_discounted = calc_discount(1, self.T, self.q)
        self.qdiscounted_S = self.S * self.q_discounted
        self.rdiscounted_K = calc_discount(self.K, self.T, self.r)
        self.pdf = norm.pdf(self.d1)

    def delta(self):
        if self.option_type == OPTIONTYPE_CALL:
            return self.q_discounted * norm.cdf(self.d1)
        elif self.option_type == OPTIONTYPE_PUT:
            return self.q_discounted * (norm.cdf(self.d1) - 1)
        else:
            return 0

    def gamma(self):
        return self.q_discounted * self.pdf / (self.S * self.sigma * np.sqrt(self.T))

    def vega(self):
        res = (self.qdiscounted_S * self.pdf * np.sqrt(self.T))
        return res / 100 # per (1% IV) follow binance's value format

    def theta(self):
        res = (-self.qdiscounted_S * self.pdf * self.sigma / (2 * np.sqrt(self.T)))
        return res / DAYS_IN_YEAR # per day follows binance's value format

    def rho(self):
        if self.option_type == OPTIONTYPE_CALL:
            res = self.rdiscounted_K * self.T * norm.cdf(self.d2)
        elif self.option_type == OPTIONTYPE_PUT:
            res = - self.rdiscounted_K * self.T * norm.cdf(-self.d2)
        else:
            return 0
        return res / 100 # per (1% r) for unified purpose

    def all(self):
        return {
            "delta": self.delta(),
            "gamma": self.gamma(),
            "vega": self.vega(),
            "theta": self.theta(),
            "rho": self.rho(),
        }
