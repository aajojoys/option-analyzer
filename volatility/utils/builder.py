import pandas as pd
import numpy as np

from utility.general import D_INTERVAL_TO_MS, H_INTERVAL_TO_MS, PERIOD_STR_1H, ts_calc, ts_convert_s_and_ms, TIMESTAMP_UNIT_S, ts_floor
from data_collection.enums import OPTIONTYPE_CALL, OPTIONTYPE_PUT, COLNAME_EXPIRY, COLNAME_INDEXPRICE, COLNAME_MARKIV, COLNAME_OPENTIME, COLNAME_OPTIONTYPE, COLNAME_STRIKE, OPTIONTYPE_CALL, OPTIONTYPE_PUT
from data_collection.mongod_utils.model_utils import mongod_get_option_res

SEPARATOR = "-"
COLNAME_TIMETOEXP = "tte"
COLNAME_DIST = "dist"
COLNAME_ATMSTRIKE = "atm_strike"
COLNAME_CALLIV = "call_iv"
COLNAME_PUTIV = "put_iv"
COLNAME_AVGIV = "avg_iv"
COLNAME_SKEW = "skew"
COLNAME_CONTRACTS = "contracts"
COLNAME_IVRANK = "iv_rank" # min max scaling
COLNAME_IVPERCENTILE = "iv_pct"

class Volatility():
    def __init__(self, oc_instance):
        self.max_period_d = 7
        self.oc = oc_instance
        self.__init_timesession()
        self.__create_dprev_df()

    def __get_timetoexp(self, df):
        return pd.to_timedelta(df[self.oc.colname[COLNAME_EXPIRY]] - df[self.oc.colname[COLNAME_OPENTIME]], unit="s") / pd.Timedelta(days=1)

    def __init_timesession(self):
        self.end_ts = ts_floor(self.oc.timestamp, PERIOD_STR_1H)
        self.start_ts = ts_calc(self.end_ts, self.max_period_d, D_INTERVAL_TO_MS, lambda a,b: a-b)
        self.dprev_ts = ts_calc(ts_calc(self.end_ts, 1, H_INTERVAL_TO_MS, lambda a,b: a+b), 1, D_INTERVAL_TO_MS, lambda a,b: a-b)
        self.s_start_ts = ts_convert_s_and_ms(self.start_ts, TIMESTAMP_UNIT_S)
        self.s_end_ts = ts_convert_s_and_ms(self.end_ts, TIMESTAMP_UNIT_S)
        self.s_dprev_ts = ts_convert_s_and_ms(self.dprev_ts, TIMESTAMP_UNIT_S)

    def __get_dprev_data(self, include_listfields=[]):
        # self.start_ts, self.end_ts take care by __init_timesession
        dictfield = dict(db_name=self.oc.db_name, activity_interval=self.oc.activity_interval, start_ts=self.start_ts, end_ts=self.end_ts, symbol=self.oc.symbol, include_listfields=include_listfields)
        res = list(mongod_get_option_res(**dictfield))
        return self.oc.prep_df(res)

    def __create_dprev_df(self):
        # if not hasattr(self, 'df_dprev'):
        include_listfields = [self.oc.colname[COLNAME_OPENTIME], self.oc.colname[COLNAME_MARKIV], self.oc.colname[COLNAME_OPTIONTYPE], self.oc.colname[COLNAME_INDEXPRICE], self.oc.colname[COLNAME_EXPIRY], self.oc.colname[COLNAME_STRIKE]]
        self.df_dprev = self.__get_dprev_data(include_listfields=include_listfields)

    def get_ivsurface(self, option_type):
        query_dict = { self.oc.colname[COLNAME_OPTIONTYPE]: option_type }
        field_list = [self.oc.colname[COLNAME_STRIKE], self.oc.colname[COLNAME_OPENTIME], self.oc.colname[COLNAME_EXPIRY], self.oc.colname[COLNAME_MARKIV]]
        df = self.oc.filter(query_dict)[field_list]
        df[COLNAME_TIMETOEXP] = self.__get_timetoexp(df)
        df_pivot = df.drop(self.oc.colname[COLNAME_EXPIRY], axis=1).pivot(index=COLNAME_TIMETOEXP, columns=self.oc.colname[COLNAME_STRIKE], values=self.oc.colname[COLNAME_MARKIV]).replace(np.nan, None)
        return {
            COLNAME_TIMETOEXP: df_pivot.index.values.tolist(),
            self.oc.colname[COLNAME_STRIKE]: df_pivot.columns.values.tolist(),
            self.oc.colname[COLNAME_MARKIV]: df_pivot.values.tolist(),
            self.oc.colname[COLNAME_EXPIRY]: df[self.oc.colname[COLNAME_EXPIRY]].values.tolist(),
        }

    def get_ivsmile(self, expiry):
        query_dict = { self.oc.colname[COLNAME_EXPIRY]: expiry }
        field_list = [self.oc.colname[COLNAME_STRIKE], self.oc.colname[COLNAME_MARKIV], self.oc.colname[COLNAME_OPTIONTYPE]]
        group_by = self.oc.colname[COLNAME_OPTIONTYPE]
        return self.oc.get_filter_columns(query_dict, field_list, group_by)

    def get_termstructure(self):
        field_list = [self.oc.colname[COLNAME_STRIKE], self.oc.colname[COLNAME_EXPIRY], self.oc.colname[COLNAME_MARKIV], COLNAME_TIMETOEXP]
        df = self.oc.df.loc[
        (self.oc.df[self.oc.colname[COLNAME_STRIKE]] - self.oc.df[self.oc.colname[COLNAME_INDEXPRICE]]).abs()
            .groupby([self.oc.df[self.oc.colname[COLNAME_OPTIONTYPE]], self.oc.df[self.oc.colname[COLNAME_EXPIRY]]])
            .idxmin()
        ]
        df[COLNAME_TIMETOEXP] = self.__get_timetoexp(df)
        return self.oc.groupby_extract(df.round(2), self.oc.colname[COLNAME_OPTIONTYPE], field_list, sort_key=self.oc.colname[COLNAME_EXPIRY])
    
    def get_atmivhist(self):
            res = {
                OPTIONTYPE_CALL: {
                    self.oc.colname[COLNAME_OPENTIME]: [],
                    self.oc.colname[COLNAME_MARKIV]: [],
                },
                OPTIONTYPE_PUT: {
                    self.oc.colname[COLNAME_OPENTIME]: [],
                    self.oc.colname[COLNAME_MARKIV]: [],
                },
            }

            for ts, chain in self.df_dprev.groupby(self.oc.colname[COLNAME_OPENTIME], sort=True):

                # nearest expiry
                nearest = chain[self.oc.colname[COLNAME_EXPIRY]].min()
                chain = chain[chain[self.oc.colname[COLNAME_EXPIRY]] == nearest]

                # ATM distance
                chain = chain.assign(
                    dist=(chain[self.oc.colname[COLNAME_STRIKE]] - chain[self.oc.colname[COLNAME_INDEXPRICE]]).abs()
                )

                # ATM Call
                call = chain[chain[self.oc.colname[COLNAME_OPTIONTYPE]] == OPTIONTYPE_CALL]
                call = call.loc[call[COLNAME_DIST].idxmin()]

                # ATM Put
                put = chain[chain[self.oc.colname[COLNAME_OPTIONTYPE]] == OPTIONTYPE_PUT]
                put = put.loc[put[COLNAME_DIST].idxmin()]

                res[OPTIONTYPE_CALL][self.oc.colname[COLNAME_OPENTIME]].append(ts)
                res[OPTIONTYPE_PUT][self.oc.colname[COLNAME_OPENTIME]].append(ts)
                res[OPTIONTYPE_CALL][self.oc.colname[COLNAME_MARKIV]].append(round(float(call[self.oc.colname[COLNAME_MARKIV]]),4))
                res[OPTIONTYPE_PUT][self.oc.colname[COLNAME_MARKIV]].append(round(float(put[self.oc.colname[COLNAME_MARKIV]]),4))
            return res

    def get_iv_stats(self, expiry):

        # Historical data of ONE expiry
        df = self.df_dprev[
            self.df_dprev[self.oc.colname[COLNAME_EXPIRY]] == expiry
        ]

        avg_iv = []

        # Iterate through every historical timestamp
        for ts, chain in df.groupby(self.oc.colname[COLNAME_OPENTIME], sort=True):
            chain = chain.assign(
                dist=(
                    chain[self.oc.colname[COLNAME_STRIKE]]
                    - chain[self.oc.colname[COLNAME_INDEXPRICE]]
                ).abs()
            )

            atm_strike = chain.loc[
                chain[COLNAME_DIST].idxmin(),
                self.oc.colname[COLNAME_STRIKE]
            ]
            atm = chain[
                chain[self.oc.colname[COLNAME_STRIKE]] == atm_strike
            ]
            call = atm.loc[
                atm[self.oc.colname[COLNAME_OPTIONTYPE]] == OPTIONTYPE_CALL,
                self.oc.colname[COLNAME_MARKIV]
            ].iat[0]
            put = atm.loc[
                atm[self.oc.colname[COLNAME_OPTIONTYPE]] == OPTIONTYPE_PUT,
                self.oc.colname[COLNAME_MARKIV]
            ].iat[0]
            avg_iv.append((call + put) / 2)

            current = avg_iv[-1]
            lo = np.min(avg_iv)
            hi = np.max(avg_iv)
            if hi == lo:
                iv_rank = np.nan
            else:
                iv_rank = 100 * (current - lo) / (hi - lo)

            iv_percentile = (
                np.sum(avg_iv <= current)
                / len(avg_iv)
                * 100
            )

        return {
            COLNAME_IVRANK: float(iv_rank),
            COLNAME_IVPERCENTILE: float(iv_percentile),
        }

    def get_voltable(self):
        res = {
            self.oc.colname[COLNAME_EXPIRY]: [],
            COLNAME_TIMETOEXP: [],
            COLNAME_ATMSTRIKE: [],
            COLNAME_CALLIV: [],
            COLNAME_PUTIV: [],
            COLNAME_AVGIV: [],
            COLNAME_SKEW: [],
            COLNAME_CONTRACTS: [],
            COLNAME_IVRANK: [],
            COLNAME_IVPERCENTILE: [],
        }

        for expiry, chain in self.oc.df.groupby(self.oc.colname[COLNAME_EXPIRY], sort=True):

            # ATM strike
            chain = chain.assign(
                dist=(chain[self.oc.colname[COLNAME_STRIKE]] - chain[self.oc.colname[COLNAME_INDEXPRICE]]).abs(),
                tte=pd.to_timedelta(self.oc.df[self.oc.colname[COLNAME_EXPIRY]] - self.oc.df[self.oc.colname[COLNAME_OPENTIME]], unit="s") / pd.Timedelta(days=1)
            )

            atm_strike = (
                chain.loc[chain[COLNAME_DIST].idxmin(), self.oc.colname[COLNAME_STRIKE]]
            )

            atm = chain[chain[self.oc.colname[COLNAME_STRIKE]] == atm_strike]

            call = atm.loc[atm[self.oc.colname[COLNAME_OPTIONTYPE]] == OPTIONTYPE_CALL, self.oc.colname[COLNAME_MARKIV]].iloc[0]
            put  = atm.loc[atm[self.oc.colname[COLNAME_OPTIONTYPE]] == OPTIONTYPE_PUT, self.oc.colname[COLNAME_MARKIV]].iloc[0]

            res_ivstats= self.get_iv_stats(expiry)

            res[self.oc.colname[COLNAME_EXPIRY]].append(expiry)
            res[COLNAME_TIMETOEXP].append(chain[COLNAME_TIMETOEXP].iat[0])
            res[COLNAME_ATMSTRIKE].append(atm_strike)
            res[COLNAME_CALLIV].append(call)
            res[COLNAME_PUTIV].append(put)
            res[COLNAME_AVGIV].append((call + put) / 2)
            res[COLNAME_IVRANK].append(res_ivstats[COLNAME_IVRANK])
            res[COLNAME_IVPERCENTILE].append(res_ivstats[COLNAME_IVPERCENTILE])
            res[COLNAME_SKEW].append(put - call)
            res[COLNAME_CONTRACTS].append(len(chain))

        return pd.DataFrame(res).astype(float).round(4).to_dict("records")
