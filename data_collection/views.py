from django.http import JsonResponse

from data_collection.view_utils import *

import json

# Create your views here.
def datacollection_api(request, *arg, **kwargs):
    if request.method == "GET":
        context = dict(success=True)
        res_dict = request.GET.dict()
        endpoint = res_dict.pop("endpoint")
        if endpoint == "mongod_option_minmaxt":
            res = datacollectionapi_mongod_option_minmax_opentime()
        # elif endpoint == "mongod_option_res":
        #     res = datacollectionapi_mongod_option_res(res_dict)
        # elif endpoint == "dbinfo_all_names":
        #     res = datacollectionapi_databaseinfo_all_names()
        # elif endpoint == "dbinfo_all_basefields_inputname":
        #     res = datacollectionapi_databaseinfo_get_all_basefields_inputname(res_dict)
        # elif endpoint == "basefield_default_values":
        #     res = datacollectionapi_basefield_get_default_values()
        # check if json.dumps is needed
        if res:
            context['data'] = res
        else:
            context['success'] = False
            
        return JsonResponse(context, safe=False) # require default argument for converting datetime to str
