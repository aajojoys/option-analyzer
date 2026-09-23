from utility.model_utils import *
from visitor.models import *

def visitoripinfo_get_obj(dictfield):
    return model_get_obj(VisitorIpinfo, dictfield)

def visitoripinfo_create_obj(dictfield):
    return model_add(VisitorIpinfo, dictfield)

def visitoripinfo_get_all_ipaddr():
    return model_get_objs_values(['ip_addr'], Model=VisitorIpinfo)

def visitorinfo_create_obj(dictfield):
    return model_add(VisitorInfo, dictfield)
