from data_collection.enums import ACTIVITY_INTERVAL_1H_STR, COLNAME_OPENTIME, DBNAME_BINANCEOPTION
from data_collection.model_utils import *
from data_collection.mongod_utils import mongod_get_option_res
from data_collection.mongod_utils.model_utils import mongod_get_option_minmax_field
from utility.general import res_js_to_py_dict

def datacollectionapi_databaseinfo_all_names():
    """
    Get all DatabaseInfo.names

    Returns:
        (list): list containing DatabaseInfo.name

    """
    return databaseinfo_get_all_names()

def datacollectionapi_databaseinfo_get_all_basefields_inputname(dictfield):
    """
    Get all underlying basefield input_name by given DatabaseInfo.name
    
    Args:
        db_name (str): DatabaseInfo.name
    Returns:
        (list): list of input name

    """
    return databaseinfo_get_basefield_fieldvalues_dbname(dictfield.get('db_name', None), "input_name")

def datacollectionapi_basefield_get_default_values(listfield=["input_name", "is_extra", "activityinfo_name__name"]):
    """
    Get underlying basefield field values by given field names
    
    Args:
        listfield (list): list of field names (default to 'input_name', 'is_extra', 'activityinfo_name__name')
    Returns:
        (list): list of field values

    """
    activityinfo_query_key = "activityinfo_name__name"
    activityinfo_key = "activity_info"
    fieldvalues =  basefield_get_fieldvalues_fieldnames({}, listfield, objs=None)
    if activityinfo_query_key in listfield:
        for dictfield in fieldvalues: dictfield[activityinfo_key] = dictfield.pop(activityinfo_query_key)
    return fieldvalues

def datacollectionapi_mongod_option_res(res_dict):
    res_dict = res_js_to_py_dict(res_dict)
    db_name = res_dict.pop('db_name')
    res_dict['activity_interval'] = ACTIVITY_INTERVAL_1H_STR
    startts_val = res_dict.get('start_ts')
    endts_val = res_dict.get('end_ts')
    if startts_val: res_dict['start_ts'] = int(startts_val)
    if endts_val: res_dict['end_ts'] = int(endts_val)
    res = mongod_get_option_res(db_name, **res_dict)
    return list(res)

def datacollectionapi_mongod_option_minmax_opentime():
    return mongod_get_option_minmax_field(DBNAME_BINANCEOPTION, COLNAME_OPENTIME)