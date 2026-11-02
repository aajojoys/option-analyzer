import { init_layout } from "../../base/layout.js";
import { MyPlot, PLOTTYPE_BAR, PLOTTYPE_LINE } from "../../base/plotly_utility.js";
import { fchar_capitalize, format_name } from "../../base/utility.js";
import { BASEFIELD_ASK, BASEFIELD_BID, BASEFIELD_DELTA, BASEFIELD_EXPIRY, BASEFIELD_MARK, BASEFIELD_MARKIV, BASEFIELD_OPENINTEREST, BASEFIELD_OPTIONTYPE, BASEFIELD_STRIKE, BASEFIELD_VOLUME } from "../../data_collection/enum.js";
import { ITEMTYPE_VCARD, ITEMTYPE_TABLE, ITEMTYPE_PLOT, VCard, ExpirySelect, AGTable, MyGridItem } from "../base/element.js";
import { get_sessioninfo_kwargs } from "../base/utility.js";
import { api_get_optionchain_chain_table, api_get_optionchain_filter_query, api_get_optionchain_list_expiry, api_get_optionchain_market_summary } from "./utility.js";

const MARKET_SUMMARY = "Market Summary";
const OPTIONCHAIN_TABLE = "Option Chain Table";
const OI_BY_STRIKE = "Open Interest by Strike";
const VOL_BY_STRIKE = "Volume by Strike";
const IV_BY_STRIKE = "Implied Volatility by Strike";

const OPTIONCHAIN_COMPONENTS = [MARKET_SUMMARY, OPTIONCHAIN_TABLE, OI_BY_STRIKE, VOL_BY_STRIKE, IV_BY_STRIKE]
const OPTIONCHAIN_CONFIG = {
    dimensions: {
        borderWidth: 20,
    },
    content: [{
        type: 'column',
        content: [
            {
                type: 'row',
                height: 50,
                content: [{
                    width: 100 * 1/4,
                    type: 'component',
                    componentName: MARKET_SUMMARY,
                    componentState: {
                        name: format_name(MARKET_SUMMARY),
                        type: ITEMTYPE_VCARD,
                    },
                }, {
                    width: 100 * 3/4,
                    type: 'component',
                    componentName: OPTIONCHAIN_TABLE,
                    componentState: {
                        name: format_name(OPTIONCHAIN_TABLE),
                        type: ITEMTYPE_TABLE,
                    },
                }]
            }, {
                type: 'row',
                height: 50,
                content: [{
                    type: 'component',
                    componentName: OI_BY_STRIKE,
                    componentState: {
                        name: format_name(OI_BY_STRIKE),
                        type: ITEMTYPE_PLOT,
                    },
                    width: 100/3,
                }, {
                    type: 'component',
                    componentName: VOL_BY_STRIKE,
                    componentState: {
                        name: format_name(VOL_BY_STRIKE),
                        type: ITEMTYPE_PLOT,
                    },
                    width: 100/3,
                }, {
                    type: 'component',
                    componentName: IV_BY_STRIKE,
                    componentState: {
                        name: format_name(IV_BY_STRIKE),
                        type: ITEMTYPE_PLOT,
                    },
                    width: 100/3,
                }]
            }
        ],
    }]
};

async function create_marketsummary(master_kwargs, target_val) {
    let res_data = await api_get_optionchain_market_summary();
    const kwargs = {
        key: target_val,
        api_func: api_get_optionchain_market_summary,
        titleelem_arr: [],
        element: VCard,
        extra_elem_kwargs: [],
    }
    return [res_data, kwargs];
}

async function create_chaintable(master_kwargs, target_val) {
    // const colname_obj = {"strike": "Strike", cb: "Bid", ca: "Ask", cm: "Mark", ci: "IV", cd: "Delta", cg: "Gamma", ct: "Theta", cv: "Vega", coi: "Open Interest", cvol: "Volume", pb: "Bid", pa: "Ask", pm: "Mark", pi: "IV", pd: "Delta", pg: "Gamma", pt: "Theta", pv: "Vega", poi: "Open Interest", pvol: "Volume"};
    // const structure_obj = {CALLS: ['cb', 'ca', 'cm', 'ci', 'cd', 'cg', 'ct', 'cv', 'coi', 'cvol'], STRIKE: ['K'], PUTS: ['pb', 'pa', 'pm', 'pi', 'pd', 'pg', 'pt', 'pv', 'poi', 'pvol']}
    // const attr_obj = {cb: "positive", ca: "positive", ci: "positive", pb: "negative", pa: "negative", pi: "negative"}
    // const tattr_obj = {K: {pinned: "left"}}
    // const colname_arr = [BASEFIELD_MARKIV, BASEFIELD_OPENINTEREST, BASEFIELD_MARK, BASEFIELD_VOLUME, BASEFIELD_BID, BASEFIELD_ASK, BASEFIELD_DELTA, BASEFIELD_GAMMA]
    const colname_arr = [BASEFIELD_BID, BASEFIELD_ASK, BASEFIELD_MARK, BASEFIELD_OPENINTEREST, BASEFIELD_MARKIV, BASEFIELD_VOLUME, BASEFIELD_DELTA]
    const colname_obj = { BASEFIELD_STRIKE: fchar_capitalize(BASEFIELD_STRIKE) };
    const call_prefix = "c_";
    const put_prefix = "p_";
    for (const name of colname_arr) {
        for (const type of [call_prefix, put_prefix]) {
            colname_obj[`${type}${name}`] = fchar_capitalize(name);
        }
    }
    const structure_obj = {CALLS: [...colname_arr].reverse().map(item => `${call_prefix}${item}`), STRIKE: [BASEFIELD_STRIKE], PUTS: colname_arr.map(item => `${put_prefix}${item}`)};
    const attr_obj = {[`${call_prefix}${BASEFIELD_BID}`]: "positive", [`${call_prefix}${BASEFIELD_ASK}`]: "positive", [`${put_prefix}${BASEFIELD_BID}`]: "negative", [`${put_prefix}${BASEFIELD_ASK}`]: "negative", [`${call_prefix}${BASEFIELD_MARK}`]: "positive", [`${put_prefix}${BASEFIELD_MARK}`]: "negative"} 
    // const table = new AGTable(gridcontainer_elem, row_data, colname_obj, structure_obj, attr_obj);

    const query_obj = {[BASEFIELD_EXPIRY]: master_kwargs.selected_expiry};
    const api_func = (query_obj) => { return api_get_optionchain_chain_table(query_obj); }
    let res_data = await api_func(query_obj);

    const expiryselect_key = "expiry";
    const kwargs = {
        key: target_val,
        api_func: api_func,
        titleelem_arr: [{Elem: ExpirySelect, args: [master_kwargs.expiry_arr, {'data-target': target_val, 'data-key': expiryselect_key}, master_kwargs.selected_expiry]}],
        element: AGTable,
        extra_elem_kwargs: [{aggrid_map: master_kwargs.aggrid_map, target_val: target_val}, colname_obj, structure_obj, attr_obj],
    }
    return [res_data, kwargs];
}

async function create_oibystrike(master_kwargs, target_val) {
    const query_obj = {[BASEFIELD_EXPIRY]: master_kwargs.selected_expiry};
    const field_arr = [BASEFIELD_OPENINTEREST, BASEFIELD_STRIKE];
    const groupby_key = BASEFIELD_OPTIONTYPE;
    const api_func = (query_obj) => { return api_get_optionchain_filter_query({query_obj: query_obj, field_arr: field_arr, group_by: groupby_key}); }
    let res_data = await api_func(query_obj);

    const title_obj = {x: 'strike', y: 'oi_contract'};
    const namekey_obj = {C: "Call", P: "Put", oi_contract: "Open Interest", strike: "Strike"};

    const expiryselect_key = "expiry";
    const kwargs = {
        key: target_val,
        api_func: api_func,
        titleelem_arr: [{Elem: ExpirySelect, args: [master_kwargs.expiry_arr, {'data-target': target_val, 'data-key': expiryselect_key}, master_kwargs.selected_expiry]}],
        element: MyPlot,
        extra_elem_kwargs: [PLOTTYPE_BAR, title_obj, true, [], namekey_obj],
    }
    return [res_data, kwargs];
}

async function create_volumebystrike_expiry(master_kwargs, target_val) {
    const query_obj = {[BASEFIELD_EXPIRY]: master_kwargs.selected_expiry};
    const field_arr = [BASEFIELD_VOLUME, BASEFIELD_STRIKE];
    const groupby_key = BASEFIELD_OPTIONTYPE;
    const api_func = (query_obj) => { return api_get_optionchain_filter_query({query_obj: query_obj, field_arr: field_arr, group_by: groupby_key}); }
    let res_data = await api_func(query_obj);

    const title_obj = {x: 'strike', y: 'volume'};
    const namekey_obj = {C: "Call", P: "Put", strike: "Strike", volume: "Volume"};

    const expiryselect_key = "expiry";
    const kwargs = {
        key: target_val,
        api_func: api_func,
        titleelem_arr: [{Elem: ExpirySelect, args: [master_kwargs.expiry_arr, {'data-target': target_val, 'data-key': expiryselect_key}, master_kwargs.selected_expiry]}],
        element: MyPlot,
        extra_elem_kwargs: [PLOTTYPE_BAR, title_obj, true, [], namekey_obj],
    }
    return [res_data, kwargs];

}

async function create_ivbystrike_expiry(master_kwargs, target_val) {
    const query_obj = {[BASEFIELD_EXPIRY]: master_kwargs.selected_expiry};
    const field_arr = [BASEFIELD_MARKIV, BASEFIELD_STRIKE];
    const groupby_key = BASEFIELD_OPTIONTYPE;
    const api_func = (query_obj) => { return api_get_optionchain_filter_query({query_obj: query_obj, field_arr: field_arr, group_by: groupby_key}); }
    let res_data = await api_func(query_obj);

    const title_obj = {x: 'strike', y: 'mark_iv'};
    const namekey_obj = {C: "Call", P: "Put", strike: "Strike", mark_iv: "Implied Volatility"};

    const expiryselect_key = "expiry";
    const kwargs = {
        key: target_val,
        api_func: api_func,
        titleelem_arr: [{Elem: ExpirySelect, args: [master_kwargs.expiry_arr, {'data-target': target_val, 'data-key': expiryselect_key}, master_kwargs.selected_expiry]}],
        element: MyPlot,
        extra_elem_kwargs: [PLOTTYPE_LINE, title_obj, true, [], namekey_obj],
    }
    return [res_data, kwargs];
}

export function preset_expiry(expiry_arr) {
    const sessioninfo_obj = get_sessioninfo_kwargs();
    let status = true;
    if (sessioninfo_obj.symbol != "BTCUSDT") { status &= false; }
    if (![1686787200000, 1686844800000, 1686931200000, 1687276800000].includes(parseInt(sessioninfo_obj.timestamp))) { status &= false; }
    const expirement_exp = 1687478400;
    return (status && expiry_arr.includes(expirement_exp)) ? expirement_exp : expiry_arr[0];

}

async function optionchain_init_components(map_obj) {
    const expiry_arr = await api_get_optionchain_list_expiry()
    const selected_expiry = preset_expiry(expiry_arr)
    const master_kwargs = {
        ...map_obj,
        expiry_arr: expiry_arr,
        selected_expiry: selected_expiry || "",
    }
    const submodule_func_obj = {
        "market-summary": create_marketsummary,
        "chain-table": create_chaintable,
        "oi-by-strike": create_oibystrike,
        "volume-by-strike": create_volumebystrike_expiry,
        "markiv-by-strike": create_ivbystrike_expiry,
    }
    const element_arr = [];
    for (const [key, func] of Object.entries(submodule_func_obj)) {
        const [res_data, kwargs] = await func(master_kwargs, key);
        const griditem_elem = new MyGridItem(res_data, kwargs);
        element_arr.push(griditem_elem);
    }
    return element_arr;
}

export async function optionchain_init_layout() {
    const map_obj = {
        layout_map: new Map(),
        aggrid_map: new Map(),
        plot_map: new Map(),
    }
    const element_arr = await optionchain_init_components(map_obj);
    init_layout(map_obj, OPTIONCHAIN_CONFIG, OPTIONCHAIN_COMPONENTS, element_arr);
}
