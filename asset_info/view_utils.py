from asset_info.model_utils import assetpair_get_isactive_symbolpairs, assetpair_get_obj_symbol
from data_collection.model_utils import databaseinfo_get_obj_name

def assetinfoapi_get_obj_symbol(db_name, symbol):
    database_info = databaseinfo_get_obj_name(db_name)
    return assetpair_get_obj_symbol(database_info, symbol)

def assetinfoapi_get_active_symbolpairs(db_name, isActive=True):
    """
    Get sorted list of active symbolpairs of AssetPair

    Args:
        market_name (str): DatabaseInfo.name
    Returns:
        (list): list of active AssetPair symbolpairs

    """
    database_info = databaseinfo_get_obj_name(db_name)
    pairs = assetpair_get_isactive_symbolpairs(database_info, isActive=isActive)
    pairs.sort()
    return pairs
