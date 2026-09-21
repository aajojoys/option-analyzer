import json
from optparse import Option

from django.shortcuts import render, redirect
from django.http import HttpResponseNotFound, JsonResponse, HttpResponseForbidden
from django.views import View

from asset_info.view_utils import assetinfoapi_get_active_symbolpairs
from option_chain.views import CHAIN_API_URL, CHAINSESSION_IDS
from utility import session_utils
from utility.general import TIMESTAMP_UNIT_MS, generate_uuid, res_js_to_py_dict, timestamp_to_datetime, ts_convert_s_and_ms, TIMESTAMP_UNIT_S, PERIOD_STR_1H, ts_floor, is_digit_str
from option_chain.utils.builder import OptionChain
from utility.cache_utils import MyCacheUtils
from data_collection.enums import COLNAME_CSYMBOL, COLNAME_EXPIRY, COLNAME_OPTIONTYPE, COLNAME_SYMBOL, DBNAME_BINANCEOPTION, OPTIONTYPE_ALL, OPTIONTYPE_NAMEDICT, OPTIONTYPE_NAMEDICT_REVERSE
from utility.session_utils import SESSION_EXTRA_KEY, SESSION_INFO_KEY, SESSION_INSTANCE_KEY, SessionUtils
from volatility.utils.builder import Volatility

VOLSESSION_IDS = "volsession_ids"
VOLSESSION_PREFIX = "VS"
MAX_SESSION_COUNT = 10
VOL_API_URL = "/volatility/api/"
MENUNAME_VOLATILITY = "volatility"

class VolatilityView(SessionUtils, View):
    def __init__(self, db_info=DBNAME_BINANCEOPTION):
        self.db_info = db_info
        self.oc_sessionutils = SessionUtils(CHAINSESSION_IDS, MAX_SESSION_COUNT)
        self.vs_sessionutils = SessionUtils(VOLSESSION_IDS, MAX_SESSION_COUNT)

    def __create_session_id(self):
        return generate_uuid()

    def __create_session_kwargs(self, dictfield, key=None):
        kwargs = { SESSION_INFO_KEY: {}, SESSION_INSTANCE_KEY: {}, SESSION_EXTRA_KEY: {} }
        if key:
            kwargs[key] = dictfield
        else:
            kwargs[SESSION_INSTANCE_KEY] = dictfield
            kwargs[SESSION_INFO_KEY] = dictfield
        return kwargs

    def __to_mongodb_ts_format(self, ts):
        return ts_convert_s_and_ms(int(ts), TIMESTAMP_UNIT_S)

    def __query_int_format_value(self, val, func):
        return func(val) if is_digit_str(val) else val

    def __get_oc_instance(self, symbol, timestamp):
        oc_dictfield = dict(symbol=symbol, timestamp=timestamp)
        oc_session_kwargs = self.__create_session_kwargs(oc_dictfield)
        oc_sessionid = self.oc_sessionutils.find_session(oc_session_kwargs)
        oc_instance = self.oc_sessionutils.getorcreate_session(oc_sessionid, OptionChain, oc_session_kwargs, None) if oc_sessionid else OptionChain(**oc_session_kwargs[SESSION_INSTANCE_KEY], skip_record=True)
        return oc_instance

    def get(self, request, *args, **kwargs):
        session_id = kwargs.get('session_id')
        res_dict = res_js_to_py_dict(request.GET.dict())
        query_session_id = res_dict.get('session_id')
        endpoint = res_dict.pop("endpoint", None)
        path = request.path
        symbol = res_dict.get('symbol')
        timestamp = res_dict.get('timestamp')
        if timestamp: timestamp = ts_floor(int(timestamp), PERIOD_STR_1H);
        if not endpoint:
            if session_id and self.vs_sessionutils.has_session(session_id):
                vs_session_kwargs = self.vs_sessionutils.get_sessioninfo(session_id)
                context = dict(
                    menu_name=MENUNAME_VOLATILITY,
                    active_symbols=assetinfoapi_get_active_symbolpairs(self.db_info),
                    timestamp=timestamp_to_datetime(vs_session_kwargs[SESSION_INFO_KEY]['timestamp']),
                    selected_symbol=vs_session_kwargs[SESSION_INFO_KEY]['symbol'],
                    # expiry_list=[ ts_convert_s_and_ms(expiry, TIMESTAMP_UNIT_MS) for expiry in vs_session_kwargs['oc_data'][selected_optiontype].keys()],
                    session_id=session_id,
                )
                return render(request, 'modules/volatility.html', context=context)
            else:
                vs_dictfeild = dict(symbol=symbol, timestamp=timestamp)
                vs_session_kwargs = self.__create_session_kwargs(vs_dictfeild, key=SESSION_INFO_KEY) if (res_dict and symbol and timestamp) else {}
                if vs_session_kwargs:
                    session_id = self.vs_sessionutils.find_session(vs_session_kwargs)
                    if not session_id: 
                        session_id = self.__create_session_id()
                        oc_instance = self.__get_oc_instance(symbol, timestamp)
                        vs_session_kwargs[SESSION_INSTANCE_KEY] = dict(oc_instance=oc_instance)
                        this_instance = self.vs_sessionutils.getorcreate_session(session_id, Volatility, vs_session_kwargs, None)
                elif (not session_id) and not vs_session_kwargs:
                    session_id = self.vs_sessionutils.default_id
                if session_id and self.vs_sessionutils.has_session(session_id):
                    return redirect("volatility", session_id=session_id)
            return HttpResponseNotFound()
        # else/ elif endpoint:
        elif endpoint and (path == VOL_API_URL) and query_session_id and self.vs_sessionutils.has_session(query_session_id):
            context = dict(success=True)
            res = None
            # not creating session with endpoint api
            vs_session_kwargs = self.vs_sessionutils.get_sessioninfo(query_session_id)
            vs_instance = self.vs_sessionutils.getorcreate_session(query_session_id, Volatility, {}, None)
            if not vs_instance: return HttpResponseNotFound()
            expiry = res_dict.get('expiry')
            if expiry and is_digit_str(expiry): expiry = self.__query_int_format_value(expiry, self.__to_mongodb_ts_format)
            option_type = res_dict.get('option_type')
            res = None
            if endpoint == "m_expiry":
                res = vs_instance.oc.get_list_expiries()
            if endpoint == "iv_smile":
                res = vs_instance.get_ivsmile(expiry)
            elif endpoint == "iv_surface":
                res = vs_instance.get_ivsurface(option_type)
            elif endpoint == "term_structure":
                res = vs_instance.get_termstructure()
            elif endpoint == "atmiv_hist":
                res = vs_instance.get_atmivhist()
            elif endpoint== "vol_table":
                res = vs_instance.get_voltable()

            if res:
                context["data"] = res
            else:
                context["success"] = False

            # return JsonResponse(json.dumps(context), safe=False)
            return JsonResponse(context, safe=False)
        else:
            return HttpResponseNotFound()
