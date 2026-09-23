from pathlib import Path

from visitor.model_utils import *
from utility.general import get_client_ip, get_ip_info, is_localhost

VISITOR_RECORD_EXEMPTED_PATH = ['/admin', '/chain/api/', '/contract/api/', '/volatility/api/', '/scenario/api/', '/data_collection/api/']
VISITOR_RECORD_ALLOW_PATH = ['/', '/admin', '/chain', '/contract', '/volatility', '/scenario', '/data_collection']

def visitor_to_restrict(request):
    user_agent = request.headers.get("User-Agent", "")
    if (not user_agent) or ('bot' in user_agent.lower()): return True
    path = Path(request.path)
    if len(path.parts) == 1: return False # ("/",)
    path = str(f"/{path.parts[1]}")
    path_length = len(path)
    if path_length and (path[:path_length] not in VISITOR_RECORD_ALLOW_PATH): return True
    return False

def visitoripinfo_getorcreate(request):
    ipaddr_list = visitoripinfo_get_all_ipaddr()
    curr_ip = get_client_ip(request)
    if curr_ip in ipaddr_list:
        return visitoripinfo_get_obj(dict(ip_addr=curr_ip))
    else:
        ip_info = get_ip_info(curr_ip)
        return visitoripinfo_create_obj(dict(ip_addr=curr_ip, ip_info=ip_info))

def visitorinfo_add(request):
    dictfield = dict(
        visitor_ipinfo=visitoripinfo_getorcreate(request),
        method=request.method,
        host=request.get_host(),
        path=request.path,
        query_string=request.META.get("QUERY_STRING", ""),
        user_agent=request.headers.get("User-Agent", ""),
        referer=request.headers.get("Referer", ""),
    )
    obj = visitorinfo_create_obj(dictfield)
    return dictfield['visitor_ipinfo'].ip_addr

def visitorinfo_isexempted(path):
    for except_path in VISITOR_RECORD_EXEMPTED_PATH:
        status = path[:len(except_path)] == except_path
        if status: return True
    return False

def visitorinfo_collect(request):
    path = request.path
    ip_addr = get_client_ip(request)
    if (path and visitorinfo_isexempted(path)) or is_localhost(ip_addr):
        return ip_addr
    else:
        visitorinfo_add(request)
