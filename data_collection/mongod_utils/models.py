from django.conf import settings
from data_collection.enums import COLNAME_CSYMBOL, COLNAME_OPENTIME, COLNAME_SYMBOL

import itertools

from utility.general import TIMESTAMP_UNIT_S, ts_isunit
# Create your models here.

''' Mongodb '''
class ConnMongodb:
    def __init__(self, db_name, collection_name):
        self.client_ins = settings.MONGOD_CLIENT
        self.db_name = db_name
        self.db = self.client_ins[self.db_name]
        self.collection_name = collection_name
        self.db_collection = self.db[self.collection_name]

    def get_collection_names(self):
        """
        Get all collection names of given db_name
        """
        return self.db.list_collection_names()

    def get_database_names(self):
        """
        Get all database names except system database ('admin', 'config', 'local')
        """
        dbs = self.client_ins.list_database_names()
        for db in ["admin", "config", "local"]:
            if db in dbs: dbs.remove(db)
        return dbs

    def create_index(self, field):
        return self.db_collection.create_index(field)

    def drop(self):
        return self.db_collection.drop()

    def validate_operation(self, action, res):
        if not res:
            raise Exception(f"{action} not complete.")

    def insert(self, dictfield):
        return self.db_collection.insert_one(dictfield)

    def bulk_insert(self, list_dictfield):
        status = self.db_collection.insert_many(list_dictfield)
        self.validate_operation("Bulk Insert", status.acknowledged)

    def __get_aggregate_value_helper(self, field, func_name):
        grouped_field = {'_id': None}
        create_max_field = lambda field: {func_name+"_"+field: {"$"+func_name: "$"+field}}
        grouped_field.update(create_max_field(field))
        return {"$group": grouped_field}
    
    def __get_match_aggregate_value(self, field, func_name, match_field={}):
        aggregate_list = []
        if match_field:
            aggregate_list.append(match_field)
        group_field = self.__get_aggregate_value_helper(field, func_name)
        aggregate_list.append(group_field)
        res = list(self.db_collection.aggregate(aggregate_list))
        # if res is empty (empty record/ new collection) return None
        return res[0][func_name+"_"+field] if res else None

    def __get_match_values_helper(self, query_field={}):
        if query_field:
            return {"$match": query_field}

    def get_max_agg_value(self, field):
        return self.__get_match_aggregate_value(field, "max")

    def get_min_agg_value(self, field):
        return self.__get_match_aggregate_value(field, "min")

    def get_match_min_value(self, match_queryfield, field):
        match_field = self.__get_match_values_helper(match_queryfield)
        return self.__get_match_aggregate_value(field, "min", match_field=match_field)

    # introduce sort limit to replace match aggregate (computational & memory intensive)
    def __get_sort_limit_field_helper(self, field, asce_or_desc, match_field):
        # assuming the function will only be used for getting min or max of opentime, but other field
        res = list(self.db_collection.find(match_field).sort(COLNAME_OPENTIME, asce_or_desc).limit(1))
        return res[0][field] if res else None

    def get_min_sort_value(self, field, match_field={}):
        return self.__get_sort_limit_field_helper(field, 1, match_field)

    def get_max_sort_value(self, field, match_field={}):
        return self.__get_sort_limit_field_helper(field, -1, match_field)

class ActivityMongodb(ConnMongodb):
    def __init__(self, db_name, activityinfo_name, collection_name): #, tzinfo='UTC'):
        self.activityinfo_name = activityinfo_name
        super().__init__(db_name, collection_name)
        
    def __filter(self, start_ts, end_ts, symbol, contract_symbol):
        query_field = {}
        print(start_ts, end_ts, symbol, contract_symbol)
        is_contract = bool(contract_symbol)
        selected_symbol = contract_symbol if is_contract else symbol
        selected_colname_symbol = COLNAME_CSYMBOL if is_contract else COLNAME_SYMBOL
        if (symbol or contract_symbol) and isinstance(selected_symbol, str):
            query_field[selected_colname_symbol] = selected_symbol
        elif (symbol or contract_symbol) and isinstance(selected_symbol, list):
            query_field[selected_colname_symbol] = {"$in": selected_symbol }

        if start_ts and end_ts:
            if end_ts < start_ts: raise Exception(f"Find operation on end_ts ({end_ts}) is less than start_ts ({start_ts})")
            """
            UPDATE: start_time/ end_time to be replaced by start_ts/ end_ts (unix timestamp int will be stored)
            if not (datetime_isaware(start_ts) and datetime_isaware(end_ts)):
                raise Exception("Ensure datetime is time awared.")
            """
            # $lte: end_ts based on "t" (open_time) e.g. if $lte: dt == dt_floor(dt, '1T') or if $lte: dt == dt_ceil(dt, '1T'), dt will be include
            # query_field['t'] = {"$gte": start_ts, "$lte": end_ts}
            """ History update: from $lte to $lt to accomodate tv_chart.global.js and $lte is hardly used (not common practice: usually not inclusive
                    assuming related function (find, delete_many) uses endtime argument with endtime (ceil) in all cases -> no amendment at the moment
                Update: from $lt to $lte to emulate binance public kline api parameters
            """
            # $lte: end_ts based on "t" (open_time) e.g. ~~if $lte: dt == dt_floor(dt, '1T') or~~ if $lte: dt == dt_ceil(dt, '1T'), dt will be include
            query_field[COLNAME_OPENTIME] = {"$gte": start_ts, "$lte": end_ts}
            # query_field['T'] = {"$lte": end_ts}
        elif start_ts:
            """
            UPDATE: start_time/ end_time to be replaced by start_ts/ end_ts (unix timestamp int will be stored)
            if not datetime_isaware(start_ts):
                raise Exception("Ensure datetime is time awared.")
            """
            # query_field['t'] = {"$eq": start_ts}
            query_field[COLNAME_OPENTIME] = start_ts
        return query_field

    def __get_ignore_field(self, ignore_listfields):
        ignore_field = {'_id': False}
        if ignore_listfields:
            addition = dict(zip(ignore_listfields, itertools.repeat(False, len(ignore_listfields))))
            ignore_field.update(addition)
        return ignore_field
    
    def __get_include_field(self, include_listfields):
        """
        Specify list fields to include
        pymongo will exclude exclude unlist fields by default if include_listfields is provided & not empty

        Args:
            include_listfields (list): listfields to include
        Returns:
            (dict): dict containing list fields to include as key & 'True' boolean value

        """
        include_field = {}
        if include_listfields:
            addition = dict(zip(include_listfields, itertools.repeat(True, len(include_listfields))))
            include_field.update(addition)
        return include_field

    def __get_fields(self, ignore_listfields, include_listfields):
        ignore_field = self.__get_ignore_field(ignore_listfields)
        include_field = self.__get_include_field(include_listfields) if include_listfields else {}
        dictfield = { **ignore_field, **include_field }
        return dictfield

    def __validate_ts(self, ts, msg=""):
        if ts and (not ts_isunit(ts, TIMESTAMP_UNIT_S)):
            raise Exception(f"{msg}.\nGiven timestamp ({ts}) is in wrong format.\nRaising exception to avoid unexpected action e.g. deletion of unintended records.")

    def find(self, start_ts=None, end_ts=None, symbol=None, contract_symbol=None, ignore_listfields=[], include_listfields=[]):
        msg = f"Function 'data_collection.mongod_utils.models.ActivityMongodb.find' fails to run with parameters (start_ts={start_ts}, end_ts={end_ts}, symbol={symbol})"
        self.__validate_ts(start_ts, msg)
        self.__validate_ts(end_ts, msg)
        query_field = self.__filter(start_ts=start_ts, end_ts=end_ts, symbol=symbol, contract_symbol=contract_symbol)
        fields = self.__get_fields(ignore_listfields, include_listfields)
        res_find = self.db_collection.find(query_field, fields)
        return res_find.sort(COLNAME_OPENTIME, 1) if end_ts else res_find

    def delete_many(self, start_ts, end_ts=None, symbol=None, contract_symbol=None):
        msg = f"Function 'data_collection.mongod_utils.models.ActivityMongodb.delete_many' fails to run with parameters (start_ts={start_ts}, end_ts={end_ts}, symbol={symbol})"
        self.__validate_ts(start_ts, msg)
        self.__validate_ts(end_ts, msg)
        query_field = self.__filter(start_ts=start_ts, end_ts=end_ts, symbol=symbol, contract_symbol=contract_symbol)
        status = self.db_collection.delete_many(query_field)
        self.validate_operation("Delete Many", status.acknowledged)
