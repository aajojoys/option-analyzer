import { get_json } from "../../base/fetch.js";
import BaseUrl from "../../base/baseurl.js";
import { isobject_empty } from "../../base/utility.js";
import { get_input_sessionid, get_sessioninfo_kwargs } from "../base/utility.js";

const OPTIONCHAIN_API = '/chain/api/';
const ENDPOINT_LIST_EXPIRY = 'm_expiry';
const ENDPOINT_GET_EXPIRY = 's_expiry';
const ENDPOINT_LIST_STRIKE = 'm_strike';
const ENDPOINT_GET_STRIKE = 's_strike';
const ENDPOINT_GET_CONTRACT = 's_contract';
const ENDPOINT_FILTER_QUERY = 'filter_query';
const ENDPOINT_MARKET_SUMMARY = 'market_summary';
const ENDPOINT_CHAIN_TABLE = 'chain_table';
const QUERYPARAM_SESSION_ID = "session_id";

const OPTIONCHAIN_URL = new BaseUrl(OPTIONCHAIN_API);

async function api_get_optionchain(query_obj, with_sessioninfo=false) {
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
    const query_url = OPTIONCHAIN_URL.get_query_url(query_obj);
    return await get_json(query_url, query_obj);
}

// export async function api_get_optionchain_list_expiry(symbol, timestamp) {
export async function api_get_optionchain_list_expiry() {
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
    return await api_get_optionchain(query_obj);
}

// export async function api_get_optionchain_get_expiry(symbol, timestamp, expiry) {
export async function api_get_optionchain_get_expiry(query_params) {
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
        expiry: query_params.expiry,
        endpoint: ENDPOINT_GET_EXPIRY,
    }
    return await api_get_optionchain(query_obj);
}

// export async function api_get_optionchain_list_strike(symbol, timestamp, expiry) {
export async function api_get_optionchain_list_strike(query_params) {
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
        expiry: query_params.expiry,
        endpoint: ENDPOINT_LIST_STRIKE,
    }
    return await api_get_optionchain(query_obj);
}

// export async function api_get_optionchain_get_strike(symbol, timestamp, expiry, strike) {
export async function api_get_optionchain_get_strike(query_params) {
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
        expiry: query_params.expiry,
        strike: query_params.strike,
        endpoint: ENDPOINT_GET_STRIKE,
    }
    return await api_get_optionchain(query_obj);
}

// export async function api_get_optionchain_get_contract(symbol, timestamp, contract) {
export async function api_get_optionchain_get_contract(query_params) {
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
        contract: query_params.contract,
        endpoint: ENDPOINT_GET_CONTRACT,
    }
    return await api_get_optionchain(query_obj);
}

// export async function api_get_optionchain_filter_query(symbol, timestamp, query_obj={}, field_arr=[]) {
export async function api_get_optionchain_filter_query(query_params) {
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
        query: JSON.stringify(query_params.query_obj || {}),
        fields: JSON.stringify(query_params.field_arr|| []),
        group_by: query_params.group_by || "",
        endpoint: ENDPOINT_FILTER_QUERY,
    }
    return await api_get_optionchain(requery_obj);
}

export async function api_get_optionchain_market_summary() {
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
        endpoint: ENDPOINT_MARKET_SUMMARY,
    }
    return await api_get_optionchain(query_obj);
}

export async function api_get_optionchain_chain_table(query_params) {
    let query_obj = {
        // symbol: symbol,
        // timestamp: timestamp,
        expiry: query_params.expiry,
        endpoint: ENDPOINT_CHAIN_TABLE,
    }
    return await api_get_optionchain(query_obj);
}