from django.http import JsonResponse

from data_collection.view_utils import *

import json

# Create your views here.
def datacollection_api(request, *arg, **kwargs):
    if request.method == "GET":
        context = {}
        res_dict = request.GET.dict()
        endpoint = res_dict.pop("endpoint")
        if endpoint == "mongod_option_res":
            context = datacollectionapi_mongod_option_res(res_dict)
        elif endpoint == "dbinfo_all_names":
            context = datacollectionapi_databaseinfo_all_names()
        elif endpoint == "dbinfo_all_basefields_inputname":
            context = datacollectionapi_databaseinfo_get_all_basefields_inputname(res_dict)
        elif endpoint == "basefield_default_values":
            context = datacollectionapi_basefield_get_default_values()
        # check if json.dumps is needed
        return JsonResponse(json.dumps(context), safe=False) # require default argument for converting datetime to str
