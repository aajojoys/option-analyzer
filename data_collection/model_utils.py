from utility.model_utils import *
from data_collection.models import *

''' Model BaseField '''
def basefield_get_objs_dictfield(dictfield, objs=None):
    return model_get_filter_objs(dictfield, objs=objs, Model=BaseField)

def basefield_get_fieldvalues_fieldnames(dictfield, listfield, objs=None):
    """
    Get field values based on given fieldnames (listfield)

    Args:
        dictfield (dict): dictfield for filtering query
        listfield (list): list of field names
        objs (model object): if objs is given (not None), get field values from passing objs directly without querying
    Returns:
        (list): list of field values

    """
    if not objs: objs = basefield_get_objs_dictfield(dictfield)
    return list(model_get_objs_values(listfield, objs=objs, Model=BaseField)) if objs else []

''' Model DatabaseInfo '''
def databaseinfo_get_obj_dictfield(dictfield):
    return model_get_obj(DatabaseInfo, dictfield)

def databaseinfo_get_all_names():
    listfield = ['name']
    return list(model_get_objs_values(listfield, Model=DatabaseInfo))

def databaseinfo_get_obj_name(db_name):
    """
    Get DatabaseInfo object by DatabaseInfo.name

    Args:
        db_name (str): name of database info in string
    Returns:
        (model object): DatabaseInfo model object 

    """
    dictfield = { "name": db_name }
    return databaseinfo_get_obj_dictfield(dictfield)

def databaseinfo_get_basefield_objs_dbname(db_name, basefield_dictfield={}):
    """
    Get underlying basefield model objects by given DatabaseInfo.name

    Args:
        db_name (str): DatabaseInfo.name in string
        basefield_dictfield (dict): dict containing desired basefield
    Returns:
        (model objects): BaseField objects

    """
    dbinfo_obj = databaseinfo_get_obj_name(db_name)
    if not dbinfo_obj: return []
    basefield_objs = dbinfo_obj.basefields.all()
    if not basefield_objs: return []
    if basefield_dictfield: basefield_objs = model_get_filter_objs(basefield_dictfield, objs=basefield_objs, Model=BaseField)
    return basefield_objs

def databaseinfo_get_basefield_fieldvalues_dbname(db_name, field_name):
    """
    Get field values of selected BaseField model objects

    Args:
        db_name (str): DatabaseInfo.name in string
        field_name (str): desired field name (only support single field name NOT a list)
    Returns:
        (list): list of field values

    """
    basefield_objs = databaseinfo_get_basefield_objs_dbname(db_name)
    return [ getattr(obj, field_name) for obj in basefield_objs ] if basefield_objs else []

def databaseinfo_get_basefield_options(db_name):
    """
    Get underlying DatabaseInfo.basefield_options

    Args:
        db_name (str): DatabaseInfo.name in string
    Returns:
        (dict): selected DatabaseInfo.basefield_options or empty dict

    """
    dbinfo_obj = databaseinfo_get_obj_name(db_name)
    return dbinfo_obj.basefield_options if dbinfo_obj else {}
