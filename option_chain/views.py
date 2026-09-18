import json, uuid

from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponseNotFound
from django.views import View

from asset_info.view_utils import assetinfoapi_get_active_symbolpairs
from utility.general import generate_uuid, res_js_to_py_dict, timestamp_to_datetime, ts_convert_s_and_ms, TIMESTAMP_UNIT_S, PERIOD_STR_1H, ts_floor, is_digit_str
from option_chain.utils.builder import OptionChain
from data_collection.enums import DBNAME_BINANCEOPTION
from utility.session_utils import SESSION_EXTRA_KEY, SESSION_INFO_KEY, SESSION_INSTANCE_KEY, SessionUtils

CHAINSESSION_IDS = "chainsession_ids"
CHAINSESSION_PREFIX = "OC"
MAX_SESSION_COUNT = 10
CHAIN_API_URL = "/chain/api/"
MENUNAME_OPTIONCHAIN = "option-chain"

def oc_add_extra_func(oc_instance, session_kwargs):
    session_kwargs[SESSION_EXTRA_KEY]["expiry_list"] = oc_instance.get_list_expiries()
    return session_kwargs

class OptionChainView(View):
    def __init__(self, db_info=DBNAME_BINANCEOPTION):
        # super().__init__(CHAINSESSION_IDS, MAX_SESSION_COUNT)
        self.db_info = db_info
        self.my_sessionutils = SessionUtils(CHAINSESSION_IDS, MAX_SESSION_COUNT)

    def __create_session_id(self):
        return generate_uuid()

    def __to_mongodb_ts_format(self, ts):
        return ts_convert_s_and_ms(int(ts), TIMESTAMP_UNIT_S)

    def __query_int_format_value(self, val, func):
        return func(val) if is_digit_str(val) else val

    def __create_session_kwargs(self, dictfield, key=None):
        kwargs = { SESSION_INFO_KEY: {}, SESSION_INSTANCE_KEY: {}, SESSION_EXTRA_KEY: {} }
        if key:
            kwargs[key] = dictfield
        else:
            kwargs[SESSION_INSTANCE_KEY] = dictfield
            kwargs[SESSION_INFO_KEY] = dictfield
        return kwargs

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
            if session_id and self.my_sessionutils.has_session(session_id):
                session_kwargs = self.my_sessionutils.get_sessioninfo(session_id)
                context = dict(
                    menu_name=MENUNAME_OPTIONCHAIN,
                    active_symbols=assetinfoapi_get_active_symbolpairs(self.db_info),
                    timestamp=timestamp_to_datetime(session_kwargs[SESSION_INFO_KEY]['timestamp'], None),
                    timestamp_int=session_kwargs[SESSION_INFO_KEY]['timestamp'],
                    selected_symbol=session_kwargs[SESSION_INFO_KEY]['symbol'],
                    # expiry_list=session_kwargs[SESSION_EXTRA_KEY]['expiry_list'],
                    session_id=session_id,
                )
                return render(request, 'modules/option_chain.html', context=context)
            else:
                oc_dictfield = dict(symbol=symbol, timestamp=timestamp)
                session_kwargs = self.__create_session_kwargs(oc_dictfield) if (res_dict and symbol and timestamp) else {}
                if session_kwargs:
                    session_id = self.my_sessionutils.find_session(session_kwargs)
                    if not session_id: 
                        session_id = self.__create_session_id()
                        this_instance = self.my_sessionutils.getorcreate_session(session_id, OptionChain, session_kwargs, None)
                elif (not session_id) and not session_kwargs:
                    session_id = self.my_sessionutils.default_id
                if session_id and self.my_sessionutils.has_session(session_id):
                    return redirect("chain:option_chain", session_id=session_id)
            return HttpResponseNotFound()
        # else/ elif endpoint:
        elif endpoint and (path == CHAIN_API_URL) and query_session_id and self.my_sessionutils.has_session(query_session_id):
            context = dict(success=True)
            res = None
            # session_kwargs = self.my_sessionutils.get_sessioninfo(query_session_id)
            # not creating session with endpoint api
            oc_instance = self.my_sessionutils.getorcreate_session(query_session_id, None, {}, None)
            if oc_instance is None: return HttpResponseNotFound()
            expiry = res_dict.get('expiry')
            if expiry and is_digit_str(expiry): expiry = self.__query_int_format_value(expiry, self.__to_mongodb_ts_format)
            strike = res_dict.get('strike')
            if strike and is_digit_str(strike): strike = self.__query_int_format_value(strike, float)
            contract = res_dict.get('contract')
            res = None
            if endpoint == "m_expiry":
                res = oc_instance.get_list_expiries()
            elif endpoint == "s_expiry" and expiry:
                res = oc_instance.get_expiry(expiry)
            elif endpoint == "m_strike" and expiry:
                res = oc_instance.get_list_strikes(expiry)
            elif endpoint == "s_strike" and expiry and strike:
                res = oc_instance.get_strike(expiry, strike)
            elif endpoint == "s_contract" and contract:
                res = oc_instance.get_contract_by_name(contract)
            elif endpoint == "filter_query":
                query = json.loads(res_dict.get('query', '{}'))
                field_list = json.loads(res_dict.get('fields', '[]'))
                if query and ("expiry" in query): query['expiry'] = self.__query_int_format_value(query["expiry"], self.__to_mongodb_ts_format)
                group_by = res_dict.get('group_by', '')
                res = None if not field_list else oc_instance.get_filter_columns(query, field_list, group_by)
            elif endpoint == "market_summary":
                res = oc_instance.get_market_summary()
            elif endpoint == "chain_table":
                res = oc_instance.get_chain_table(expiry)

            if res is not None:
                context["data"] = res
            else:
                context["success"] = False

            # return JsonResponse(json.dumps(context), safe=False)
            return JsonResponse(context, safe=False)
        else:
            return HttpResponseNotFound()
