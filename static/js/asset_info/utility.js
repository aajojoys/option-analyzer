import BaseUrl from "../base/baseurl.js";
import { get_json } from "../base/fetch.js";

const assetinfo_url = new BaseUrl("/asset_info/api/");

async function api_get_assetinfo_helper(query_obj) {
    const query_url = assetinfo_url.get_query_url(query_obj);
    return await get_json(query_url);
}

export async function api_get_assetbase_all_symbols() {
    const query_obj = {
        endpoint: "ab_all_symbols",
    }
    return await api_get_assetinfo_helper(query_obj);
}

export async function api_get_assetinfo_active_symbols(market_name) {
    const query_obj = {
        endpoint: "ai_active_symbols",
        market_name: market_name,
    }
    return await api_get_assetinfo_helper(query_obj);
}

export async function api_get_assetpair_all_symbolpairs(market_name=null) {
    /**
     * - Get symbolpairs based on given market_name
     * - Get symbolpairs from all market_names (market_name == null) (for case where market_name is unknown ahead)
     * Return { array }
     *
     * @param { string } market_name (optional): symbolpairs from selected market name 
     *
     */
    const query_obj = {
        endpoint: "ap_all_symbolpairs",
    };
    if (market_name) { query_obj['market_name'] = market_name; }
    return await api_get_assetinfo_helper(query_obj);
}

export async function api_get_assetpair_active_symbolpairs(market_name) {
    const query_obj = {
        endpoint: "ap_active_symbolpairs",
        isActive: true,
        market_name: market_name,
    };
    return await api_get_assetinfo_helper(query_obj);
}

export async function api_get_assetpair_active_basequotesymbols(market_name) {
    const query_obj = {
        endpoint: "ap_active_basequotesymbols",
        market_name: market_name,
    };
    return await api_get_assetinfo_helper(query_obj);
}

export async function api_get_assetpair_pricescale(market_name, symbolpair) {
    const query_obj = {
        endpoint: "ap_pricescale_symbolpair",
        symbolpair: symbolpair,
        market_name: market_name,
    };
    return await api_get_assetinfo_helper(query_obj);
}

export async function api_get_assetpair_ticksize(market_name, symbolpair) {
    const query_obj = {
        endpoint: "ap_ticksize_symbolpair",
        symbolpair: symbolpair,
        market_name: market_name,
    };
    return await api_get_assetinfo_helper(query_obj);
}

export async function api_get_assetpair_stepsize(market_name, symbolpair) {
    const query_obj = {
        endpoint: "ap_stepsize_symbolpair",
        symbolpair: symbolpair,
        market_name: market_name,
    };
    return await api_get_assetinfo_helper(query_obj);
}

export async function api_get_spotasset_available_balance(symbol, spotsession_pk=null) {
    const query_obj = {
        endpoint: "sa_available_balance",
        symbol: symbol,
        spotsession_pk: spotsession_pk,
    }
    return await api_get_assetinfo_helper(query_obj);
}
