import { get_json } from "../../base/fetch.js";
import BaseUrl from "../../base/baseurl.js";
import { isobject_empty } from "../../base/utility.js";
import { get_input_sessionid, get_sessioninfo_kwargs } from "../base/utility.js";

const SCENARIO_API = '/scenario/api/';
const ENDPOINT_OC_DATA = 'oc_data';
const ENDPOINT_PRICING_INPUT = 'pricing_input';
const ENDPOINT_PRICING_RESULT = 'pricing_result';
const ENDPOINT_SENSITIVITY_INPUT = 'sensitivity_input';
const ENDPOINT_SENSITIVITY_RESULT = 'sensitivity_result';
const ENDPOINT_PAYOFF_RESULT = 'payoff_result';
const QUERYPARAM_SESSION_ID = "session_id";

const SCENARIO_URL = new BaseUrl(SCENARIO_API);

async function api_get_scenario(query_obj, with_sessioninfo=false) {
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
    const query_url = SCENARIO_URL.get_query_url(query_obj);
    return await get_json(query_url, query_obj);
}

// export async function api_get_scenario_list_expiry(symbol, timestamp) {
export async function api_get_scenario_get_ocdata(query_params) {
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
    return await api_get_scenario({...query_params, ...query_obj});
}

// export async function api_get_scenario_get_expiry(symbol, timestamp, expiry) {
export async function api_get_scenario_pricing_input() {
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
    return await api_get_scenario(query_obj);
}

export async function api_get_scenario_pricing_result(query_params) {
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
        endpoint: ENDPOINT_PRICING_RESULT,
        ...query_params,
    }
    return await api_get_scenario(query_obj);
}

export async function api_get_scenario_sensitivity_input() {
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
        endpoint: ENDPOINT_SENSITIVITY_INPUT,
    }
    return await api_get_scenario(query_obj);
}

export async function api_get_scenario_sensitivity_result(query_params) {
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
        endpoint: ENDPOINT_SENSITIVITY_RESULT,
        ...query_params,
    }
    return await api_get_scenario(query_obj);
}

// export async function api_get_scenario_get_contract(symbol, timestamp, contract) {
export async function api_get_scenario_payoff_result(query_params) {
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
        endpoint: ENDPOINT_PAYOFF_RESULT,
        ...query_params,
    }
    return await api_get_scenario(query_obj);
}