import json
from django.http import JsonResponse

from asset_info.view_utils import assetinfoapi_get_active_symbolpairs
from utility.general import res_js_to_py_dict

# Create your views here.
ENDPOINT_STR = "endpoint"
DB_NAME = "db_name"

def assetinfo_api(request):
    context = {}
    if request.method == "GET":
        res_dict = res_js_to_py_dict(request.GET.dict())
        endpoint = res_dict.pop(ENDPOINT_STR)
        db_name = res_dict.get(DB_NAME)
        if endpoint == "ap_active_symbolpairs":
            context = assetinfoapi_get_active_symbolpairs(db_name)
        return JsonResponse(json.dumps(context), safe=False)
