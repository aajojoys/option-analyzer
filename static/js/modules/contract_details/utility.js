import { get_json } from "../../base/fetch.js";
import BaseUrl from "../../base/baseurl.js";
import { isobject_empty } from "../../base/utility.js";
import { get_input_sessionid, get_sessioninfo_kwargs } from "../base/utility.js";

const CONTRACTDETAILS_API = '/contract/api/';
const ENDPOINT_OC_DATA = 'oc_data';
const ENDPOINT_GENERAL_INFO = 'general_info';
const ENDPOINT_MARKET_PRICES = 'market_prices';
const ENDPOINT_GREEKS_INFO = 'greeks_info';
const ENDPOINT_PRICING_INPUT = 'pricing_input';
const ENDPOINT_PRICING_RESULT = 'pricing_result';
const ENDPOINT_HISTORY_DATA = 'hist_data';
const QUERYPARAM_SESSION_ID = "session_id";

const CONTRACTDETAILS_URL = new BaseUrl(CONTRACTDETAILS_API);

async function api_get_contractdetails(query_obj, with_sessioninfo=false) {
    /**
     * Return (object): api request utility function for FUNCTIONINFO_URL that returns object
     *
     * @param { object } query_obj: object containing query parameters and its values;
     *
     */
    if (with_sessioninfo) {
        sessioninfo_obj = get_sessioninfo_kwargs();
        query_obj = {...query_obj, ...sessioninfo_obj };
    }
    query_obj[QUERYPARAM_SESSION_ID] = get_input_sessionid();
    const query_url = CONTRACTDETAILS_URL.get_query_url(query_obj);
    return await get_json(query_url, query_obj);
}

// export async function api_get_contractdetails_list_expiry(symbol, timestamp) {
export async function api_get_contractdetails_get_ocdata(query_params) {
    /**
     * API request for endpoint s_fieldvalues_pk in FUNCTIONINFO_URL
     * Return (object): Returns object containing field values for requested pk
     *
     * @param { string } pk: selected primary key to request 
     *
     */
    let query_obj = {
        // symbol: symbol,
        // timestamp: timestamp,
        endpoint: ENDPOINT_OC_DATA,
    }
    return await api_get_contractdetails({...query_params, ...query_obj});
}

// export async function api_get_contractdetails_get_expiry(symbol, timestamp, expiry) {
export async function api_get_contractdetails_get_generalinfo() {
    /**
     * API request for endpoint m_pkfuncname_source in FUNCTIONINFO_URLreturns
     * Return (object): Returns nested object containing pk & func_name key and its values
     *
     * @param { string } source: selected source attribute to request 
     *
     */
    let query_obj = {
        // symbol: symbol,
        // timestamp: timestamp,
        endpoint: ENDPOINT_GENERAL_INFO,
    }
    return await api_get_contractdetails(query_obj);
}

export async function api_get_contractdetails_get_greeksinfo() {
    /**
     * API request for endpoint m_pkfuncname_source in FUNCTIONINFO_URLreturns
     * Return (object): Returns nested object containing pk & func_name key and its values
     *
     * @param { string } source: selected source attribute to request 
     *
     */
    let query_obj = {
        // symbol: symbol,
        // timestamp: timestamp,
        endpoint: ENDPOINT_GREEKS_INFO,
    }
    return await api_get_contractdetails(query_obj);
}

// export async function api_get_contractdetails_list_strike(symbol, timestamp, expiry) {
export async function api_get_contractdetails_get_marketprices() {
    /**
     * API request for endpoint m_pkfuncname_source in FUNCTIONINFO_URLreturns
     * Return (object): Returns nested object containing pk & func_name key and its values
     *
     * @param { string } source: selected source attribute to request 
     *
     */
    let query_obj = {
        // symbol: symbol,
        // timestamp: timestamp,
        endpoint: ENDPOINT_MARKET_PRICES,
    }
    return await api_get_contractdetails(query_obj);
}

// export async function api_get_contractdetails_get_contract(symbol, timestamp, contract) {
export async function api_get_contractdetails_get_pricing_input() {
    /**
     * API request for endpoint m_pkfuncname_source in FUNCTIONINFO_URLreturns
     * Return (object): Returns nested object containing pk & func_name key and its values
     *
     * @param { string } source: selected source attribute to request 
     *
     */
    let query_obj = {
        // symbol: symbol,
        // timestamp: timestamp,
        endpoint: ENDPOINT_PRICING_INPUT,
    }
    return await api_get_contractdetails(query_obj);
}

// export async function api_get_contractdetails_filter_query(symbol, timestamp, query_obj={}, field_arr=[]) {
export async function api_get_contractdetails_get_pricing_result(query_params) {
    /**
     * API request for endpoint m_pkfuncname_source in FUNCTIONINFO_URLreturns
     * Return (object): Returns nested object containing pk & func_name key and its values
     *
     * @param { string } source: selected source attribute to request 
     *
     */
    let requery_obj = {
        // symbol: symbol,
        // timestamp: timestamp,
        r: query_params.r,
        q: query_params.q,
        model_name: query_params.model_name,
        endpoint: ENDPOINT_PRICING_RESULT,
    }
    return await api_get_contractdetails(requery_obj);
}

export async function api_get_contractdetails_get_histdata(query_params) {
    /**
     * API request for endpoint m_pkfuncname_source in FUNCTIONINFO_URLreturns
     * Return (object): Returns nested object containing pk & func_name key and its values
     *
     * @param { string } source: selected source attribute to request 
     *
     */
    let query_obj = {
        field: query_params.field_key,
        endpoint: ENDPOINT_HISTORY_DATA,
    }
    return await api_get_contractdetails(query_obj);
}