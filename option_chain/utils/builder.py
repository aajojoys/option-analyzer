import pandas as pd
import numpy as np

from asset_info.view_utils import assetinfoapi_get_obj_symbol
from utility.general import TIMESTAMP_UNIT_MS, timestamp_to_datetime, ts_convert_s_and_ms, datetime_to_timestamp, str_to_datetime_aware, UTC, TIMESTAMP_UNIT_S
from data_collection.enums import ACTIVITY_INTERVAL_1H_STR, COLNAME_ASK, COLNAME_BID, COLNAME_CSYMBOL, COLNAME_DELTA, COLNAME_EXPIRY, COLNAME_GAMMA, COLNAME_INDEXPRICE, COLNAME_MARK, COLNAME_MARKIV, COLNAME_OI, COLNAME_OPENTIME, COLNAME_OPTIONTYPE, COLNAME_STRIKE, COLNAME_SYMBOL, COLNAME_VOLUME, DBNAME_BINANCEOPTION, NAME_EXPIRY, NAME_STRIKE, OPTIONTYPE_CALL, OPTIONTYPE_PUT
from data_collection.mongod_utils.model_utils import mongod_get_option_res
from data_collection.model_utils import databaseinfo_get_basefield_dict_dbname

SEPARATOR = "-"

class OptionChain():
    def __init__(self, symbol, timestamp, skip_record=False):
        self.db_name = DBNAME_BINANCEOPTION
        self.activity_interval = ACTIVITY_INTERVAL_1H_STR
        self.symbol = symbol
        self.timestamp = timestamp
        self.colname = databaseinfo_get_basefield_dict_dbname(self.db_name)
        self.data = self.init_data(skip_record)
        if not skip_record: self.__init_assetinfo()

    def __timestamp_int_to_ts(self, ts_int):
        return timestamp_to_datetime(ts_convert_s_and_ms(ts_int, TIMESTAMP_UNIT_MS))

    def __timestamp_ts_to_int(self, ts):
        return ts_convert_s_and_ms(datetime_to_timestamp(ts), TIMESTAMP_UNIT_S)

    def __format_ts_name(self, ts_name):
        return f"{ts_name}_in_ts"

    def __prep_df_format(self, df):
        if self.colname[COLNAME_MARKIV] in df.columns:
            df[self.colname[COLNAME_MARKIV]] = df[self.colname[COLNAME_MARKIV]] * 100

    def prep_df(self, res):
        df = pd.DataFrame(res)
        df.rename(self.colname, axis=1, inplace=True)
        self.__prep_df_format(df)
        # self.df[self.__format_ts_name(self.colname[COLNAME_OPENTIME])] = pd.to_datetime(self.df[self.colname[COLNAME_OPENTIME]], unit='s', utc=True)
        # self.df[self.__format_ts_name(self.colname[COLNAME_EXPIRY])] = pd.to_datetime(self.df[self.colname[COLNAME_EXPIRY]], unit='s', utc=True)
        return df

    def __init_assetinfo(self):
        self.assetpair_obj = assetinfoapi_get_obj_symbol(self.db_name, self.symbol)
        self.asset_info = {
            'symbol': self.assetpair_obj.base_asset.symbol,
            'name': self.assetpair_obj.base_asset.asset_base.name,
        }

    def init_data(self, skip_record):
        dictfield = dict(db_name=self.db_name, activity_interval=self.activity_interval, start_ts=self.timestamp, symbol=self.symbol)
        res = list(mongod_get_option_res(**dictfield))
        self.df = self.prep_df(res)
        if skip_record: return {}
        res_master = {}
        for di in res:
            expiry = di[COLNAME_EXPIRY]
            strike = di[COLNAME_STRIKE]
            option_type = di[COLNAME_OPTIONTYPE]
            res_master.setdefault(expiry, {})
            res_master[expiry][strike] = {f"{option_type}": di}
        return res_master

    def get_list_expiries(self):
        if self.data:
            return list(self.data.keys())
        else:
            return self.df[self.colname[COLNAME_EXPIRY]].unique().tolist()

    def get_expiry(self, expiry):
        return self.data[expiry]
        # if expiry in self.data: return self.data[expiry]
        # return {}

    def get_list_strikes(self, expiry):
        return list(self.data[expiry].keys())

    def get_strike(self, expiry, strike):
        return self.data[expiry][strike]

    def get_list_contracts(self):
        return self.df['contract']
    def get_contract(self, expiry, strike, option_type):
        return self.data[expiry][strike][option_type]

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

    def get_contract_by_name(self, contract_name):
        expiry, strike, option_type = self.__extract_contract_name(contract_name)
        return self.get_contract(expiry, strike, option_type)

    def get_data(self):
        return self.data

    def filter(self, query):
        res_bool = None
        for key, val in query.items():
            if res_bool is None:
                res_bool = self.df[key] == val
            else:
                res_bool &= self.df[key] == val
        return self.df if res_bool is None else self.df[res_bool]
        
    '''
    def extract(self, field_list, df=None):
        df = self.df if df is None else df
        return df[field_list]
    '''

    def custom_sort(self, df, sort_key=None):
        if sort_key and (sort_key in df.columns):
            return df.sort_values(sort_key, ascending=True)
        else:
            strike_colname = self.colname[COLNAME_STRIKE]
            expiry_colname = self.colname[COLNAME_EXPIRY]
            sort_keys = []
            if strike_colname in df.columns: sort_keys.append(strike_colname)
            if expiry_colname in df.columns: sort_keys.append(expiry_colname)
            return df.sort_values(sort_keys, ascending=True) if sort_keys else df

    def extract(self, df, field_list):
        df = df.replace({np.nan: None})
        return { fkey: df[fkey].tolist() for fkey in field_list }
    
    def groupby_extract(self, df, group_key, field_list, sort_key=None):
        if group_key in df.columns:
            return { val: self.extract(self.custom_sort(group, sort_key=sort_key), field_list) for val, group in df.groupby(group_key) }

    def preprocess_columns(self, res, field_list):
        remain = set(field_list).intersection({self.colname[COLNAME_OPENTIME], self.colname[COLNAME_EXPIRY]})
        if not remain: return
        for key in list(remain):
            res[key] = res[self.__format_ts_name(key)].values

    def get_surface(self, query, x, y, z):
        df = self.custom_sort(self.filter(query) if query else self.df)
        # self.preprocess_columns(res, field_list)
        surface = df.pivot(
            index=x,
            columns=y,
            values=z
        )
        # surface = surface.where(surface.notna(), None)
        return {
            x: surface.index.tolist(),
            y: surface.columns.tolist(),
            z: surface.astype(object).where(surface.notna(), None).values.tolist(),
        }

    def get_filter_columns(self, query, field_list, group_by):
        res = self.custom_sort(self.filter(query) if query else self.df)
        # self.preprocess_columns(res, field_list)
        if group_by and (group_by in res.columns):
            res = self.groupby_extract(res, group_by, field_list)
        elif field_list and not (set(field_list) - set(res.columns)):
            res = self.extract(res, field_list)
        # if res is not None:
        #     res = dataframe_to_json(res, index=False) if to_json else res.to_dict(orient="list")
        return res

    def get_market_summary(self):
        index_price = self.df.iloc[0,:][self.colname[COLNAME_INDEXPRICE]]
        total_contract = self.df.shape[0]
        total_oi = self.df[self.colname[COLNAME_OI]].sum()
        total_volume = self.df[self.colname[COLNAME_VOLUME]].sum()
        total_call_oi = self.df[self.df[self.colname[COLNAME_OPTIONTYPE]] == OPTIONTYPE_CALL][self.colname[COLNAME_OI]].sum()
        total_put_oi = self.df[self.df[self.colname[COLNAME_OPTIONTYPE]] == OPTIONTYPE_PUT][self.colname[COLNAME_OI]].sum()
        call_put_ratio = total_call_oi / total_put_oi
        return {
            "Underlying Asset": f"{self.asset_info['name']} ({self.asset_info['symbol']})",
            "Index Price": f"{index_price:.4f} {self.assetpair_obj.quote_asset.symbol}",
            "Total No of contracts": f"{total_contract:.1f}",
            "Total Open Interest": f"{total_oi:.2f}",
            "Total Contract Volume": f"{total_volume:.2f}",
            "Total Call Open Interest": f"{total_call_oi:.2f}",
            "Total Put Open Interest": f"{total_put_oi:.2f}",
            "Call/ Put Ratio": f"{call_put_ratio:.2f}",
        }

    def get_chain_table(self, expiry):
        columns = [self.colname[COLNAME_OPTIONTYPE], self.colname[COLNAME_BID], self.colname[COLNAME_ASK], self.colname[COLNAME_MARK], self.colname[COLNAME_MARKIV], self.colname[COLNAME_DELTA], self.colname[COLNAME_GAMMA], self.colname[COLNAME_OI], self.colname[COLNAME_VOLUME], self.colname[COLNAME_STRIKE]]
        chain = self.df[self.df[self.colname[COLNAME_EXPIRY]] == expiry][columns].set_index([self.colname[COLNAME_STRIKE], self.colname[COLNAME_OPTIONTYPE]]).unstack(self.colname[COLNAME_OPTIONTYPE])
        chain.columns = [ f'{"c" if ot == OPTIONTYPE_CALL else "p"}_{field}' for field, ot in chain.columns]
        chain = chain.reset_index().astype(float).round(4)
        return chain.to_dict("records")

    def get_contractsession_data(self, field_list=[COLNAME_OPTIONTYPE, COLNAME_EXPIRY, COLNAME_CSYMBOL]):
        cols = [ self.colname[field] for field in field_list ]
        result = {}
        for option_type, expiry, contract in self.df[cols].itertuples(index=False):
            result.setdefault(option_type, {}).setdefault(expiry, []).append(contract)

        # sort contract
        for option_type in list(result.keys()):
            for expiry in list(result[option_type].keys()):
                result[option_type][expiry].sort()
        return result

