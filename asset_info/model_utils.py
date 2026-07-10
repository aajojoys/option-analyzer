from utility.model_utils import *
from asset_info.models import *

""" AssetPair """
def assetpair_get_objs_isactive(database_info, isActive=True):
    dict_field = {'database_info': database_info, 'isActive': isActive}
    return model_get_filter_objs(dict_field, Model=AssetPair)

def assetpair_get_isactive_symbolpairs(database_info, isActive=True):
    assetpair_objs = assetpair_get_objs_isactive(database_info, isActive)
    return [ obj.symbol for obj in assetpair_objs ]
