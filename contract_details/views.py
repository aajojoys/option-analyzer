import json
from optparse import Option

from django.shortcuts import render, redirect
from django.http import HttpResponseNotFound, JsonResponse, HttpResponseForbidden
from django.views import View

from asset_info.view_utils import assetinfoapi_get_active_symbolpairs
from contract_details.utils.builder import ContractSession
from option_chain.views import CHAIN_API_URL, CHAINSESSION_IDS
from utility import session_utils
from utility.general import TIMESTAMP_UNIT_MS, generate_uuid, res_js_to_py_dict, timestamp_to_datetime, ts_convert_s_and_ms, TIMESTAMP_UNIT_S, PERIOD_STR_1H, ts_floor, is_digit_str
from option_chain.utils.builder import OptionChain
from utility.cache_utils import MyCacheUtils
from data_collection.enums import COLNAME_CSYMBOL, COLNAME_EXPIRY, COLNAME_OPTIONTYPE, COLNAME_SYMBOL, DBNAME_BINANCEOPTION, OPTIONTYPE_ALL, OPTIONTYPE_NAMEDICT, OPTIONTYPE_NAMEDICT_REVERSE
from utility.session_utils import SESSION_EXTRA_KEY, SESSION_INFO_KEY, SESSION_INSTANCE_KEY, SessionUtils

CONTRACTSESSION_IDS = "contractsession_ids"
CONTRACTSESSION_PREFIX = "CS"
MAX_SESSION_COUNT = 10
CONTRACT_API_URL = "/contract/api/"
MENUNAME_CONTRACTDETAILS = "contract-details"

class ContractView(SessionUtils, View):
    def __init__(self, db_info=DBNAME_BINANCEOPTION):
        self.db_info = db_info
        self.oc_sessionutils = SessionUtils(CHAINSESSION_IDS, MAX_SESSION_COUNT)
        self.cs_sessionutils = SessionUtils(CONTRACTSESSION_IDS, MAX_SESSION_COUNT)

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

    def __get_oc_data(self, symbol, timestamp):
        oc_dictfield = dict(symbol=symbol, timestamp=timestamp)
        oc_session_kwargs = self.__create_session_kwargs(oc_dictfield)
        oc_sessionid = self.oc_sessionutils.find_session(oc_session_kwargs)
        oc_instance = self.oc_sessionutils.getorcreate_session(oc_sessionid, OptionChain, oc_session_kwargs, None) if oc_sessionid else OptionChain(**oc_session_kwargs[SESSION_INSTANCE_KEY], skip_record=True)
        return oc_instance.get_contractsession_data()

    def get(self, request, *args, **kwargs):
        session_id = kwargs.get('session_id')
        res_dict = res_js_to_py_dict(request.GET.dict())
        query_session_id = res_dict.get('session_id')
        endpoint = res_dict.pop("endpoint", None)
        path = request.path
        symbol = res_dict.get('symbol')
        contract_symbol = res_dict.get('contract_symbol')
        option_type = res_dict.get('option_type')
        expiry = res_dict.get('expiry')
        if expiry and is_digit_str(expiry): expiry = self.__query_int_format_value(expiry, self.__to_mongodb_ts_format)
        timestamp = res_dict.get('timestamp')
        if timestamp: timestamp = ts_floor(int(timestamp), PERIOD_STR_1H);
        if not endpoint:
            if session_id and self.cs_sessionutils.has_session(session_id):
                cs_session_kwargs = self.cs_sessionutils.get_sessioninfo(session_id)
                selected_optiontype = cs_session_kwargs[SESSION_INFO_KEY]['option_type']
                selected_expiry = cs_session_kwargs[SESSION_INFO_KEY]['expiry']
                expiry_list=list(cs_session_kwargs[SESSION_EXTRA_KEY]['oc_data'][selected_optiontype].keys())
                expirydt_list=[ timestamp_to_datetime(ts_convert_s_and_ms(expiry, TIMESTAMP_UNIT_MS)) for expiry in expiry_list ]
                context = dict(
                    menu_name=MENUNAME_CONTRACTDETAILS,
                    active_symbols=assetinfoapi_get_active_symbolpairs(self.db_info),
                    timestamp=timestamp_to_datetime(cs_session_kwargs[SESSION_INFO_KEY]['timestamp']),
                    selected_symbol=cs_session_kwargs[SESSION_INFO_KEY]['symbol'],
                    selected_optiontype=selected_optiontype,
                    selected_expiry=selected_expiry,
                    selected_contractsymbol=cs_session_kwargs[SESSION_INFO_KEY]['contract_symbol'],
                    # expiry_list=[ ts_convert_s_and_ms(expiry, TIMESTAMP_UNIT_MS) for expiry in cs_session_kwargs['oc_data'][selected_optiontype].keys()],
                    expiry_tups=zip(expiry_list, expirydt_list),
                    contractsymbol_list=cs_session_kwargs[SESSION_EXTRA_KEY]['oc_data'][selected_optiontype][selected_expiry],
                    optiontype_dict=OPTIONTYPE_NAMEDICT,
                    session_id=session_id,
                )
                return render(request, 'modules/contract_details.html', context=context)
            else:
                cs_dictfeild = dict(symbol=symbol, timestamp=timestamp, expiry=expiry, option_type=option_type, contract_symbol=contract_symbol)
                cs_session_kwargs = self.__create_session_kwargs(cs_dictfeild) if (res_dict and symbol and timestamp and expiry and option_type and contract_symbol) else {}
                if cs_session_kwargs:
                    session_id = self.cs_sessionutils.find_session(cs_session_kwargs)  
                    if not session_id:
                        session_id = self.__create_session_id()
                        cs_session_kwargs[SESSION_EXTRA_KEY]['oc_data'] = self.__get_oc_data(symbol, timestamp)
                        this_instance = self.cs_sessionutils.getorcreate_session(session_id, ContractSession, cs_session_kwargs, None)
                elif (not session_id) and not cs_session_kwargs:
                    session_id = self.cs_sessionutils.default_id
                if session_id and self.cs_sessionutils.has_session(session_id):
                    return redirect("contract_details", session_id=session_id)
            return HttpResponseNotFound()
        # else/ elif endpoint:
        elif endpoint and (path == CONTRACT_API_URL) and query_session_id and self.cs_sessionutils.has_session(query_session_id):
            context = dict(success=True)
            res = None
            # not creating session with endpoint api
            cs_session_kwargs = self.cs_sessionutils.get_sessioninfo(query_session_id)
            cs_instance = self.cs_sessionutils.getorcreate_session(query_session_id, None, {}, None) if (endpoint != "oc_data") else None
            expiry = res_dict.get('expiry')
            if expiry and is_digit_str(expiry): expiry = self.__query_int_format_value(expiry, self.__to_mongodb_ts_format)
            strike = res_dict.get('strike')
            if strike and is_digit_str(strike): strike = self.__query_int_format_value(strike, float)
            res = None
            if endpoint == "oc_data" and symbol and timestamp:
                use_cache = True
                use_cache &= (symbol == cs_session_kwargs[SESSION_INFO_KEY]["symbol"])
                use_cache &= (timestamp == cs_session_kwargs[SESSION_INFO_KEY]["timestamp"])
                res = cs_session_kwargs[SESSION_EXTRA_KEY]['oc_data'] if use_cache else self.__get_oc_data(symbol, timestamp)
            elif endpoint == "general_info":
                res = cs_instance.get_general_info()
            elif endpoint == "market_prices":
                res = cs_instance.get_market_prices()
            elif endpoint == "greeks_info":
                res = cs_instance.get_greeks()
            elif endpoint == "pricing_input":
                res = cs_instance.get_pricing_input()
            elif endpoint == "pricing_result":
                r = res_dict.get('r')
                q = res_dict.get('q')
                r = float(r) if r else 0.04
                q = float(q) if q else 0.0
                model_name = res_dict.get('model_name', "black-scholes")
                kwargs = dict(r=r, q=q, model_name=model_name)
                res = cs_instance.get_pricing_result(**kwargs)
            elif endpoint == "hist_data":
                field_value = res_dict.get('field')
                res = cs_instance.get_hist(field_value)

            if res is not None:
                context["data"] = res
            else:
                context["success"] = False

            # return JsonResponse(json.dumps(context), safe=False)
            return JsonResponse(context, safe=False)
        else:
            return HttpResponseNotFound()
