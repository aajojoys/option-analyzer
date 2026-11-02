import { init_layout } from "../../base/layout.js";
import { MyPlot, PLOTTYPE_LINE, PLOTTYPE_SURFACE } from "../../base/plotly_utility.js";
import { format_name, int_to_timestamp_utc_short } from "../../base/utility.js";
import {  BASEFIELD_EXPIRY, BASEFIELD_OPTIONTYPE, OPTIONTYPE_CALL, OPTIONTYPE_KEYNAME_OBJ } from "../../data_collection/enum.js";
import { ITEMTYPE_TABLE, ITEMTYPE_PLOT, ExpirySelect, AGTable, MyGridItem, OptionTypeSelect } from "../base/element.js";
import { preset_expiry } from "../option_chain/app.js";
import { api_get_volatility_ivsmile, api_get_volatility_ivsurface, api_get_volatility_termstructure, api_get_volatility_atmivhist, api_get_volatility_voltable, api_get_volatility_list_expiry } from "./utility.js";

const IV_SMILE = "IV Smile";
const TERM_STRUCUTRE = "Term Structure";
const IV_SURFACE = "IV Surface";
const ATMIV_HIST = "ATM-IV History";
const VOL_TABLE = "Volatility Table";

const VOLATILITY_COMPONENTS = [IV_SMILE, TERM_STRUCUTRE, ATMIV_HIST, IV_SURFACE, VOL_TABLE];
const VOLATILITY_CONFIG = {
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
                    width: 100 * 2/5,
                    type: 'component',
                    componentName: IV_SURFACE,
                    componentState: {
                        name: format_name(IV_SURFACE),
                        type: ITEMTYPE_PLOT,
                    },
                }, {
                    width: 100 * 3/5,
                    type: 'component',
                    componentName: VOL_TABLE,
                    componentState: {
                        name: format_name(VOL_TABLE),
                        type: ITEMTYPE_TABLE,
                    },
                }]
            }, {
                type: 'row',
                height: 50,
                content: [{
                    width: 100 * 1/3,
                    type: 'component',
                    componentName: IV_SMILE,
                    componentState: {
                        name: format_name(IV_SMILE),
                        type: ITEMTYPE_PLOT,
                    },
                }, {
                    width: 100 * 1/3,
                    type: 'component',
                    componentName: TERM_STRUCUTRE,
                    componentState: {
                        name: format_name(TERM_STRUCUTRE),
                        type: ITEMTYPE_PLOT,
                    },
                }, {
                    width: 100 * 1/3,
                    type: 'component',
                    componentName: ATMIV_HIST,
                    componentState: {
                        name: format_name(ATMIV_HIST),
                        type: ITEMTYPE_PLOT,
                    },
                }]
            }
        ],
    }]
};

async function create_ivsmile(master_kwargs, target_val) {
    const query_obj = { [BASEFIELD_EXPIRY]: master_kwargs.selected_expiry };
    let res_data = await api_get_volatility_ivsmile(query_obj);

    const title_obj = {x: 'strike', y: 'mark_iv'};
    const namekey_obj = {C: "Call", P: "Put", mark_iv: "Implied Volatility (%)", strike: "Strike"};

    const expiryselect_key = "expiry";
    const kwargs = {
        key: target_val,
        api_func: api_get_volatility_ivsmile,
        titleelem_arr: [{Elem: ExpirySelect, args: [master_kwargs.expiry_arr, {'data-target': target_val, 'data-key': expiryselect_key}, master_kwargs.selected_expiry]}],
        element: MyPlot,
        extra_elem_kwargs: [PLOTTYPE_LINE, title_obj, true, [], namekey_obj],
    }
    return [res_data, kwargs];
}

async function create_ivsurface(master_kwargs, target_val) {
    const query_obj = { [BASEFIELD_OPTIONTYPE]: OPTIONTYPE_CALL };
    let res_data = await api_get_volatility_ivsurface(query_obj);

    const title_obj = {x: 'strike', y: 'tte', z: 'mark_iv'};
    const namekey_obj = {C: "Call", P: "Put", mark_iv: "Implied Volatility (%)", strike: "Strike", tte: "Time to expiry (days)"};

    const optiontypeselect_key = "option_type";
    const kwargs = {
        key: target_val,
        api_func: api_get_volatility_ivsurface,
        titleelem_arr: [{Elem: OptionTypeSelect, args: [OPTIONTYPE_KEYNAME_OBJ, {'data-target': target_val, 'data-key': optiontypeselect_key}]}],
        element: MyPlot,
        extra_elem_kwargs: [PLOTTYPE_SURFACE, title_obj, false, [], namekey_obj],
    }
    return [res_data, kwargs];
}

async function create_termstructure(master_kwargs, target_val) {
    let res_data = await api_get_volatility_termstructure();

    const title_obj = {x: 'tte', y: 'mark_iv'};
    const namekey_obj = {C: "Call", P: "Put", mark_iv: "ATM IV (%)", strike: "Strike", tte: "Time to expiry (days)"};

    const kwargs = {
        key: target_val,
        api_func: api_get_volatility_termstructure,
        titleelem_arr: [],
        element: MyPlot,
        extra_elem_kwargs: [PLOTTYPE_LINE, title_obj, true, [], namekey_obj],
    }
    return [res_data, kwargs];
}

async function create_atmivhist(master_kwargs, target_val) {
    let res_data = await api_get_volatility_atmivhist();

    const title_obj = {x: 'open_time', y: 'mark_iv'};
    const namekey_obj = {C: "Call", P: "Put", mark_iv: "ATM IV (%)", strike: "Strike", open_time: "Open Time"};

    const kwargs = {
        key: target_val,
        api_func: api_get_volatility_atmivhist,
        titleelem_arr: [],
        element: MyPlot,
        extra_elem_kwargs: [PLOTTYPE_LINE, title_obj, true, [], namekey_obj],
    }
    return [res_data, kwargs];
}

async function create_voltable(master_kwargs, target_val) {
    // const colname_obj = {"strike": "Strike", cb: "Bid", ca: "Ask", cm: "Mark", ci: "IV", cd: "Delta", cg: "Gamma", ct: "Theta", cv: "Vega", coi: "Open Interest", cvol: "Volume", pb: "Bid", pa: "Ask", pm: "Mark", pi: "IV", pd: "Delta", pg: "Gamma", pt: "Theta", pv: "Vega", poi: "Open Interest", pvol: "Volume"};
    // const structure_obj = {CALLS: ['cb', 'ca', 'cm', 'ci', 'cd', 'cg', 'ct', 'cv', 'coi', 'cvol'], STRIKE: ['K'], PUTS: ['pb', 'pa', 'pm', 'pi', 'pd', 'pg', 'pt', 'pv', 'poi', 'pvol']}
    // const attr_obj = {cb: "positive", ca: "positive", ci: "positive", pb: "negative", pa: "negative", pi: "negative"}
    // const tattr_obj = {K: {pinned: "left"}}
    // const colname_arr = [BASEFIELD_MARKIV, BASEFIELD_OPENINTEREST, BASEFIELD_MARK, BASEFIELD_VOLUME, BASEFIELD_BID, BASEFIELD_ASK, BASEFIELD_DELTA, BASEFIELD_GAMMA]
    const COLNAME_TIMETOEXP = "tte";
    const COLNAME_ATMSTRIKE = "atm_strike";
    const COLNAME_CALLIV = "call_iv";
    const COLNAME_PUTIV = "put_iv";
    const COLNAME_AVGIV = "avg_iv";
    const COLNAME_SKEW = "skew";
    const COLNAME_CONTRACTS = "contracts";
    const COLNAME_IVRANK = "iv_rank";
    const COLNAME_IVPERCENTILE = "iv_pct";
    // const colname_arr = [BASEFIELD_EXPIRY, COLNAME_TIMETOEXP, COLNAME_ATMSTRIKE, COLNAME_CALLIV, COLNAME_PUTIV, COLNAME_AVGIV, COLNAME_SKEW, COLNAME_CONTRACTS];
    const colname_obj = {[BASEFIELD_EXPIRY]: "Expiry", [COLNAME_TIMETOEXP]: "Time to Expiry (days)", [COLNAME_ATMSTRIKE]: "ATM Strike", [COLNAME_CALLIV]: "Call IV (%)", [COLNAME_PUTIV]: "Put IV (%)", [COLNAME_AVGIV]: "Avg IV (%)", [COLNAME_IVPERCENTILE]: "IV Percentile (%)", [COLNAME_IVRANK]: "IV Rank (%)", [COLNAME_SKEW]: "Skew", [COLNAME_CONTRACTS]: "Contracts"};
    const attr_obj = {[COLNAME_CALLIV]: "positive", [COLNAME_PUTIV]: "negative"}; 
    const dt_formatter = ({value}) => { return int_to_timestamp_utc_short(value * 1000 ); }
    const tattr_obj = {[BASEFIELD_EXPIRY]: {valueFormatter: dt_formatter} };
    // const table = new AGTable(gridcontainer_elem, row_data, colname_obj, structure_obj, attr_obj);

    let res_data = await api_get_volatility_voltable();

    const kwargs = {
        key: target_val,
        api_func: api_get_volatility_voltable,
        titleelem_arr: [],
        element: AGTable,
        extra_elem_kwargs: [{aggrid_map: master_kwargs.aggrid_map, target_val: target_val}, colname_obj, {}, attr_obj, tattr_obj],
    }
    return [res_data, kwargs];
}

async function volatility_init_components(map_obj) {
    const expiry_arr = await api_get_volatility_list_expiry();
    const selected_expiry = preset_expiry(expiry_arr)
    const master_kwargs = {
        ...map_obj,
        expiry_arr: expiry_arr,
        selected_expiry: selected_expiry || "",
    }
    const submodule_func_obj = {
        "iv-smile": create_ivsmile,
        "term-structure": create_termstructure,
        "atmiv-hist": create_atmivhist,
        "iv-surface": create_ivsurface,
        "vol-table": create_voltable,
    }
    const element_arr = [];
    for (const [key, func] of Object.entries(submodule_func_obj)) {
        const [res_data, kwargs] = await func(master_kwargs, key);
        const griditem_elem = new MyGridItem(res_data, kwargs);
        element_arr.push(griditem_elem);
    }
    return element_arr;
}

export async function volatility_init_layout() {
    const map_obj = {
        layout_map: new Map(),
        aggrid_map: new Map(),
        plot_map: new Map(),
    }
    const element_arr = await volatility_init_components(map_obj);
    init_layout(map_obj, VOLATILITY_CONFIG, VOLATILITY_COMPONENTS, element_arr);
}
