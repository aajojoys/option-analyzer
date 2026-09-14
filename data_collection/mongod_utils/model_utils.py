from data_collection.mongod_utils import ActivityMongodb
from data_collection.enums import *
from utility.general import (
    D_INTERVAL_TO_MS, M_INTERVAL_TO_MS, PERIOD_STR_1M, TIMESTAMP_UNIT_MS, TIMESTAMP_UNIT_S, get_period_int_interval, get_period_str_interval, is_m_interval,
    ts_convert_s_and_ms, ts_delta, ts_calc, ts_ceil, ts_floor,
)

import itertools

""" Model Utility Function """
COLLECTIONTYPE_MASTER = "master"
COLLECTIONTYPE_RECENT = "recent"
OPENTIME = "t"
COLLECTIONS = {
    ACTIVITYINFONAME_OPTION: {
        COLLECTIONTYPE_MASTER: {
            ACTIVITY_INTERVAL_1H_STR: COL_OPTION_MASTER_1H,
        },
    },
}

''' helper function '''
def get_activity_min_field_value(AM_instance, field):
    """
    Get min value of selected field of given ActivityMongodb instance
    Assuming field will only be openTime ('t') & mongodb records in 's' unit
    Convert timestamp fieldvalue to 'ms' unit
    
    Args:
        AM_instance (class object): ActivityMongodb instance
        field (str): selected field name
    Returns:
        (int or float or str) minimum field value

    """
    ts = AM_instance.get_min_sort_value(field)
    return ts_convert_s_and_ms(ts, TIMESTAMP_UNIT_MS)

def get_activity_max_field_value(AM_instance, field):
    """
    Get max value of selected field of given ActivityMongodb instance
    Assuming field will only be openTime ('t') & mongodb records in 's' unit
    Convert timestamp fieldvalue to 'ms' unit
    
    Args:
        AM_instance (class object): ActivityMongodb instance
        field (str): selected field name
    Returns:
        (int or float or str) maximum field value

    """
    ts = AM_instance.get_max_sort_value(field)
    return ts_convert_s_and_ms(ts, TIMESTAMP_UNIT_MS)

def get_activity_collection_val(db_name, activityinfo_name, collection, field_value_func, field_name, AM_instance=None):
    """
    Get ActivityMongodb instance & request field value by given field_value_func 

    Args:
        db_name (str): databaseinfo name
        activityinfo_name (str): activityinfo name
        collection (str): collection name
        field_value_func (function): get_activity_min_field_value or get_activity_max_field_value
        field_name (str): field name (start time or end time)
        AM_instance (class object): Not initializing ActivityMongodb if AM_instance is provided
    Returns:
        (int, class): field value, ActivityMongodb instance
        or 
        (None, None): if database does not exist

    """
    if not AM_instance: AM_instance = ActivityMongodb(db_name, activityinfo_name, collection)
    if (db_name not in AM_instance.get_database_names()) or (collection not in AM_instance.get_collection_names()): return None, None
    val = field_value_func(AM_instance, field_name)
    return val, AM_instance

def get_activity_collection_helper(db_name, activityinfo_name, collection_type, activity_interval, field_value_func, field_name, suffix=""):
    """
    Get desired collection by given infos & returns aggregate field value & ActivityMongodb instance

    Args:
        db_name (str): databaseinfo name
        activityinfo_name (str): activityinfo name
        collection_type (str): type of collection ('master' or 'recent')
        activity_interval (str): activity interval e.g. INTERVAL_1M_STR, INTERVAL_1D_STR, etc
        field_value_func (function): get_activity_min_field_value or get_activity_max_field_value
        field_name (str): field name (start time or end time)
        suffix (str): suffix to append at the end of collectio name e.g. option_master_1m_2020 (suffix=2020)
    Returns:
        (int, class): field value, ActivityMongodb instance
        or 
        (None, None): if collection not recorded in variables 'COLLECTIONS' or if database does not exist

    """
    if collection_type not in COLLECTIONS[activityinfo_name]: return None, None
    collection = COLLECTIONS[activityinfo_name][collection_type][activity_interval]
    return get_activity_collection_val(db_name, activityinfo_name, collection, field_value_func, field_name)

def get_activity_collection(db_name, activityinfo_name, activity_interval, start_ts, end_ts):
    """
    Get requested best available timestamp of given collection info

    Args:
        db_name (str): databaseinfo name
        activityinfo_name (str): activityinfo name
        activity_interval (str): activity interval e.g. INTERVAL_1M_STR, INTERVAL_1D_STR, etc
        start_ts (int): start timestamp in 'ms' unit
        end_ts (int): end timestamp in 'ms' unit
    Returns:
        (dict): dict containing ActivityMongodb instance as key & best available start_ts & end_ts as values

    """
    # case where "option_recent_[interval]" does not contain data (not every activity has recent collection type)
    min_recent_t, recent_AM_instance = get_activity_collection_helper(db_name, activityinfo_name, COLLECTIONTYPE_RECENT, activity_interval, get_activity_min_field_value, OPENTIME)
    col_start_end = {}
    if min_recent_t and (min_recent_t <= start_ts):
        # if recent collection exists (min_recent_t is not None) or requested start_ts >= min_recent_t)
        col_start_end[recent_AM_instance] = {"start_ts": start_ts, "end_ts": end_ts}
    else:
        # recent collection does not exists / contains no data / requested start_ts < min_recent_t
        start_collection = COLLECTIONS[activityinfo_name][COLLECTIONTYPE_MASTER][activity_interval]
        start_max_end_t, start_AM_instance = get_activity_collection_val(db_name, activityinfo_name, start_collection, get_activity_max_field_value, OPENTIME)
        if start_max_end_t and (start_max_end_t < start_ts):
            # for case where available maximum end timestamp < request start_ts, return empty dict
            # especially for INTERVAL_1D_STR (single collection)
            return {}
        start_min_start_t = None
        if start_AM_instance: start_min_start_t, start_AM_instance = get_activity_collection_val(db_name, activityinfo_name, start_collection, get_activity_min_field_value, OPENTIME, AM_instance=start_AM_instance)
        # set end_ts = start_ts if end_ts is None (request one timestamp)
        if not end_ts: end_ts = start_ts
        """
            condition check for no record with given timestamps
            for case:
                1. start_AM_instance == None: collection not found
                2. start_min_start_t and (end_ts < start_min_start_t): collection is found but requested 'end_ts' is less than start_min_start_t (no record)
            not adding condition check for end_AM_instance (record could have min_period more than 1 thus missing value depending on interval requested) e.g. ACTIVITYINFONAME_METRIC
        """
        if not start_AM_instance or (start_min_start_t and (end_ts < start_min_start_t)): return {}
        col_start_end[start_AM_instance] = {"start_ts": start_ts, "end_ts": start_max_end_t}
        if end_ts <= start_max_end_t:
            col_start_end[start_AM_instance]["end_ts"] = end_ts
        elif min_recent_t and (end_ts >= min_recent_t):
            col_start_end[recent_AM_instance] = {"start_ts": min_recent_t, "end_ts": end_ts}
    return col_start_end

def get_activity_res_helper(AM_instance, activity_interval, start_ts, end_ts, symbol, contract_symbol, ignore_listfields, include_listfields):
    """
    Request option data with desired range from mongodb
    particularly for OPTION_INTERVAL_1M_STR, if request range is large -> loop through upon data collection (to not kill server by congesting traffic)

    Args:
        AM_instance (class): ActivityMongodb instance
        activity_interval (str): activity interval e.g. INTERVAL_1M_STR, INTERVAL_1D_STR, etc
        start_ts (int): start timestamp in 'ms' unit
        end_ts (int): end timestamp in 'ms' unit
        symbol (str or None): if (symbol contains str) == PARTIAL_SYMBOL; if (symbol is None) == ALL_SYMBOL
        ignore_listfields (list): list of field names to exclude 
        include_listfields (list): list of field names to include ONLY
    Returns:
        (list): list of requested activity data
        
    """
    # when querying single result, make end_ts = None for single filter in mongod (intuitively faster execution)
    # increment refers to period_int of underlying activity interval (to function 'ts_calc' for next request)
    # activity_interval == PERIOD_STR_1D -> 1
    # activity_interval == PERIOD_STR_5M -> 5
    # INTERVAL_1D_STR -> 1
    increment = get_period_int_interval(activity_interval)
    if end_ts and ((start_ts == end_ts) or (ts_ceil(start_ts, get_period_str_interval(activity_interval)) == end_ts)):
        end_ts = None
    if not end_ts:
        kwargs = dict(start_ts=ts_convert_s_and_ms(start_ts, TIMESTAMP_UNIT_S), end_ts=None, symbol=symbol, contract_symbol=contract_symbol, ignore_listfields=ignore_listfields, include_listfields=include_listfields)
        return AM_instance.find(**kwargs)
    else:
        res = []
        symbol_status = PARTIAL_SYMBOL if symbol else ALL_SYMBOL
        single_duration = SINGLE_QUERY_DURATION_IN_D[activity_interval][symbol_status]
        curr_startts = start_ts
        # in case end_ts is ts_ceil
        # TOERROR: assuming query ts_ceil of end_ts or ts_floor of end_ts both will include end_ts
        curr_endts = end_ts = ts_floor(end_ts, PERIOD_STR_1M)
        while True:
            if curr_startts > end_ts:
                break
            elif (curr_startts == end_ts):
                curr_endts = None
            elif int(ts_delta(curr_startts, end_ts, D_INTERVAL_TO_MS)) >= single_duration:
                curr_endts = ts_calc(curr_startts, single_duration, D_INTERVAL_TO_MS, lambda a,b: a+b)
                if curr_endts > end_ts: curr_endts = end_ts
            else:
                curr_endts = end_ts
            kwargs = dict(start_ts=ts_convert_s_and_ms(curr_startts, TIMESTAMP_UNIT_S), end_ts=ts_convert_s_and_ms(curr_endts, TIMESTAMP_UNIT_S), symbol=symbol, contract_symbol=contract_symbol, ignore_listfields=ignore_listfields)
            res += list(AM_instance.find(**kwargs))
            # curr_startts = ts_calc(ts_floor(curr_endts, PERIOD_STR_1M), 1, M_INTERVAL_TO_MS, lambda a,b: a+b)
            # if curr_endts is None == (curr_startts == end_ts) indicates request is done
            if curr_endts == None: break
            # increment is 60 (PERIOD_INT_1H) in this case (option) so use M_INTERVAL_TO_MS instead of H_INTERVAL_TO_MS (increment=1)
            curr_startts = ts_calc(curr_endts, increment, M_INTERVAL_TO_MS, lambda a,b: a+b)
        return res

def mongod_get_activity_ts_validate(activity_interval, start_ts, end_ts, symbol, contract_symbol):
    """
    Validate requested datetime range & overwrite 'end_ts' (if datetime range is out of bound) to prevent causing memory overflow
    Refers to 'MAX_QUERY_DURATION_IN_D' for more info

    Args:
        activity_interval (str): activity interval e.g. INTERVAL_1M_STR, INTERVAL_1D_STR, etc
        start_ts (int): start timestamp in 'ms' unit
        end_ts (int): end timestamp in 'ms' unit
        symbol (str or None): if (symbol contains str) == PARTIAL_SYMBOL; if (symbol is None) == ALL_SYMBOL
    Returns:
        (int): overwritten end timestamp

    """
    symbol_status = PARTIAL_SYMBOL if (contract_symbol or symbol) else ALL_SYMBOL
    max_duration = MAX_QUERY_DURATION_IN_D[activity_interval][symbol_status]
    if end_ts and (ts_delta(start_ts, end_ts, 'D') >= max_duration):
        end_ts = ts_calc(ts_calc(start_ts, max_duration, 'D', lambda a,b: a+b), 1, 'MS', lambda a,b: a-b)
    return end_ts

''' master function '''
def mongod_get_activity_res(db_name, activityinfo_name, activity_interval, start_ts, end_ts=None, symbol=None, contract_symbol=None, ignore_listfields=[], include_listfields=[]):
    """
    activity_interval (str): "1m" for 1 minute or "1d" for 1 day
    Three possibilities:
    1) get all option from master
    2) get all option from recent
    3) get partial option from master and others from recent
    Assumption: max_endtime_recent is greater than equal to end_ts
    Bonus: no duplication is needed for records in recent and master option model

    Args:
        db_name (str): databaseinfo name
        activityinfo_name (str): activityinfo name
        activity_interval (str): activity interval e.g. INTERVAL_1M_STR, INTERVAL_1D_STR, etc
        start_ts (int): start timestamp in 'ms' unit
        end_ts (int): end timestamp in 'ms' unit
        symbol (str or None): if (symbol contains str) == PARTIAL_SYMBOL; if (symbol is None) == ALL_SYMBOL
        ignore_listfields (list): list of field names to exclude 
        include_listfields (list): list of field names to include ONLY
    Returns:
        (list): requested activity data

    """
    end_ts = mongod_get_activity_ts_validate(activity_interval, start_ts, end_ts, symbol, contract_symbol)
    col_start_end = get_activity_collection(db_name, activityinfo_name, activity_interval, start_ts, end_ts)
    if not col_start_end: return []
    res_master = []
    for AM_instance, start_end_dict in col_start_end.items():
        kwargs = dict(AM_instance=AM_instance, activity_interval=activity_interval, start_ts=start_end_dict["start_ts"], end_ts=start_end_dict["end_ts"], symbol=symbol, contract_symbol=contract_symbol, ignore_listfields=ignore_listfields, include_listfields=include_listfields)
        res = get_activity_res_helper(**kwargs)
        res_master = res if not res_master else itertools.chain(res_master, res)
    return res_master

def mongod_get_option_res(db_name, activity_interval, start_ts, end_ts=None, symbol=None, contract_symbol=None, ignore_listfields=[], include_listfields=[]):
    """
    mongod_get_activity_res for ACTIVITYINFONAME_OPTION
    """
    kwargs = dict(db_name=db_name, activityinfo_name=ACTIVITYINFONAME_OPTION, activity_interval=activity_interval, start_ts=start_ts, end_ts=end_ts, symbol=symbol, contract_symbol=contract_symbol, ignore_listfields=ignore_listfields, include_listfields=include_listfields)
    return mongod_get_activity_res(**kwargs)

def mongod_get_option_minmax_field(db_name, field_name):
    dictfield = dict(db_name=db_name, activityinfo_name=ACTIVITYINFONAME_OPTION, collection=COL_OPTION_MASTER_1H, field_name=field_name)
    min_ts, AM = get_activity_collection_val(**dictfield, field_value_func=get_activity_min_field_value)
    max_ts, AM = get_activity_collection_val(**dictfield, field_value_func=get_activity_max_field_value)
    return dict(min=min_ts, max=max_ts)
