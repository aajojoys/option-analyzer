import { get_json } from "../../base/fetch.js";
import BaseUrl from "../../base/baseurl.js";
import { isobject_empty } from "../../base/utility.js";
import { get_input_sessionid, get_sessioninfo_kwargs } from "../base/utility.js";

const VOLATILITY_API = '/volatility/api/';
const ENDPOINT_LIST_EXPIRY = 'm_expiry';
const ENDPOINT_GET_IVSMILE = 'iv_smile';
const ENDPOINT_GET_IVSURFACE = 'iv_surface';
const ENDPOINT_GET_TERMSTRUCTURE = 'term_structure';
const ENDPOINT_GET_ATMIVHIST = 'atmiv_hist';
const ENDPOINT_GET_VOLTABLE = 'vol_table';
const QUERYPARAM_SESSION_ID = "session_id";

const VOLATILITY_URL = new BaseUrl(VOLATILITY_API);

async function api_get_volatility(query_obj, with_sessioninfo=false) {
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
    const query_url = VOLATILITY_URL.get_query_url(query_obj);
    return await get_json(query_url, query_obj);
}

export async function api_get_volatility_list_expiry() {
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
        endpoint: ENDPOINT_LIST_EXPIRY,
    }
    return await api_get_volatility(query_obj);
}

// export async function api_get_volatility_list_expiry(symbol, timestamp) {
export async function api_get_volatility_ivsmile(query_params) {
    /**
     * API request for endpoint s_fieldvalues_pk in FUNCTIONINFO_URL
     * Return (object): Returns object containing field values for requested pk
     *
     * @param { string } pk: selected primary key to request 
     *
     */
    let query_obj = {
        expiry: query_params.expiry,
        endpoint: ENDPOINT_GET_IVSMILE,
    }
    return await api_get_volatility(query_obj);
}

// export async function api_get_volatility_get_expiry(symbol, timestamp, expiry) {
export async function api_get_volatility_ivsurface(query_params) {
    /**
     * API request for endpoint m_pkfuncname_source in FUNCTIONINFO_URLreturns
     * Return (object): Returns nested object containing pk & func_name key and its values
     *
     * @param { string } source: selected source attribute to request 
     *
     */
    let query_obj = {
        option_type: query_params.option_type,
        endpoint: ENDPOINT_GET_IVSURFACE,
    }
    return await api_get_volatility(query_obj);
}

// export async function api_get_volatility_list_strike(symbol, timestamp, expiry) {
export async function api_get_volatility_termstructure() {
    /**
     * API request for endpoint m_pkfuncname_source in FUNCTIONINFO_URLreturns
     * Return (object): Returns nested object containing pk & func_name key and its values
     *
     * @param { string } source: selected source attribute to request 
     *
     */
    let query_obj = {
        endpoint: ENDPOINT_GET_TERMSTRUCTURE,
    }
    return await api_get_volatility(query_obj);
}

// export async function api_get_volatility_get_strike(symbol, timestamp, expiry, strike) {
export async function api_get_volatility_atmivhist(query_params) {
    /**
     * API request for endpoint m_pkfuncname_source in FUNCTIONINFO_URLreturns
     * Return (object): Returns nested object containing pk & func_name key and its values
     *
     * @param { string } source: selected source attribute to request 
     *
     */
    let query_obj = {
        endpoint: ENDPOINT_GET_ATMIVHIST,
    }
    return await api_get_volatility(query_obj);
}

// export async function api_get_volatility_get_contract(symbol, timestamp, contract) {
export async function api_get_volatility_voltable() {
    /**
     * API request for endpoint m_pkfuncname_source in FUNCTIONINFO_URLreturns
     * Return (object): Returns nested object containing pk & func_name key and its values
     *
     * @param { string } source: selected source attribute to request 
     *
     */
    let query_obj = {
        endpoint: ENDPOINT_GET_VOLTABLE,
    }
    return await api_get_volatility(query_obj);
}