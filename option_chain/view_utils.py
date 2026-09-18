import json

from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views import View

from utility.general import res_js_to_py_dict
from option_chain.utils.builder import OptionChain
from utility.cache_utils import MyCacheUtils
from data_collection.enums import DBNAME_BINANCEOPTION
from asset_info.model_utils import assetpair_get_isactive_symbolpairs

CHAINSESSION_IDS = "chainsession_ids"
CHAINSESSION_PREFIX = "cs"
MAX_SESSION_COUNT = 5

class OptionChainViewUtils(View):
    def __init__(self, db_info=DBNAME_BINANCEOPTION):
        self.db_info = db_info
        self.chainsession_ids = MyCacheUtils.getorset_keyvalue(CHAINSESSION_IDS, [])

    def get_session_id(self, symbol, timestamp):
        return f"{CHAINSESSION_IDS}_{symbol}_{timestamp}"

    def validate_session(self):
        if len(self.chainsession_ids) == MAX_SESSION_COUNT:
            self.chainsession_ids.pop(0)
            MyCacheUtils.set_keyvalue(CHAINSESSION_IDS, self.chainsession_ids)

    def delete_session(self, session_id):
        MyCacheUtils.delete_key(session_id)
        self.chainsession_ids.remove(session_id)
        MyCacheUtils.set_keyvalue(CHAINSESSION_IDS, self.chainsession_ids)

    def getorcreate_session(self, symbol, timestamp):
        session_id = self.get_session_id(symbol, timestamp)
        if session_id not in self.chainsession_ids:
            self.validate_session()
            oc = OptionChain(symbol, timestamp)
            MyCacheUtils.set_keyvalue(session_id, oc)
        else:
            oc = MyCacheUtils.get_key(session_id)
        return oc

    def get(self, request, *args, **kwargs):
        res_dict = res_js_to_py_dict(request.GET.dict())
        endpoint = res_dict.pop('endpoint')
        if not endpoint: 
            context = dict(active_symbols=assetpair_get_isactive_symbolpairs(self.db_info))
            return render(request, 'modules/option_chain.html', context=context)
        symbol = res_dict.pop('symbol')
        timestamp = res_dict.pop('timestamp')
        context = dict(success=True)
        if not symbol or not timestamp:
            context = dict(success=False)
        else:
            oc_instance = self.getorcreate_session(symbol, timestamp)
            expiry = res_dict.get('expiry')
            strike = res_dict.get('strike')
            contract = res_dict.get('contract')
            res = None
            if endpoint == "m_expiry":
                res = oc_instance.get_list_expiries()
            elif endpoint == "s_expiry" and expiry:
                res = oc_instance.get_expiry(expiry)
            elif endpoint == "m_strikes" and expiry:
                res = oc_instance.get_list_strikes(expiry)
            elif endpoint == "s_strike" and expiry and strike:
                res = oc_instance.get_strike(expiry, strike)
            elif endpoint == "s_contract" and contract:
                res = oc_instance.get_contract_by_name(contract)

            if res:
                context["data"] = res
            else:
                context["success"] = False

        return JsonResponse(json.dumps(context), safe=False)