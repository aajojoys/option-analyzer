import { BaseElement, SelectElement } from "../../base/element.js";
import { init_layout } from "../../base/layout.js";
import { MyPlot, PLOTTYPE_BAR, PLOTTYPE_CANDLESTICK, PLOTTYPE_LINE, PLOTTYPE_OHLCV, PLOTTYPE_PAYOFF, PLOTTYPE_SURFACE } from "../../base/plotly_utility.js";
import { addorremove_class_updating, fchar_capitalize, format_name } from "../../base/utility.js";
import { BASEFIELD_ASK, BASEFIELD_BID, BASEFIELD_DELTA, BASEFIELD_EXPIRY, BASEFIELD_GAMMA, BASEFIELD_MARK, BASEFIELD_MARKIV, BASEFIELD_OPENINTEREST, BASEFIELD_OPTIONTYPE, BASEFIELD_STRIKE, BASEFIELD_VOLUME } from "../../data_collection/enum.js";
import { ITEMTYPE_HCARD, ITEMTYPE_VCARD, ITEMTYPE_TABLE, ITEMTYPE_PLOT, GridItem, GridContainer, VCard, GridTitle, ExpirySelect, HCard, AGTable, MyGridItem, GreekCard, ITEMTYPE_GCARD } from "../base/element.js";
import { get_class_color_by_val } from "../base/utility.js";
import { api_get_contractdetails_get_generalinfo, api_get_contractdetails_get_greeksinfo, api_get_contractdetails_get_histdata, api_get_contractdetails_get_marketprices, api_get_contractdetails_get_pricing_input, api_get_contractdetails_get_pricing_result } from "./utility.js";

const GENERAL_INFO = "General Info";
const GREEKS_INFO = "Greeks Info";
const MARKET_PRICES = "Market Prices";
const PRICING_INPUT = "Pricing Input";
const PRICING_RESULT = "Pricing Result";
const PRICING_GREEKS = "Pricing Greeks";
const HiSTORY_DATA = "History Data";
const CUSTOMEVENT_CONTRACTDETAILS_UPDATE_PRICINGINPUT = "contractdetails-update-pricinginput";

const CONTRACTDETAILS_COMPONENTS = [GENERAL_INFO, GREEKS_INFO, MARKET_PRICES, PRICING_INPUT, PRICING_RESULT, PRICING_GREEKS, HiSTORY_DATA];
const CONTRACTDETAILS_CONFIG = {
    dimensions: {
        borderWidth: 20,
    },
    content: [{
        type: 'row',
        content: [
            {
                type: 'row',
                width: 100 * 3/4,
                height: 100,
                content: [{
                    type: 'column',
                    height: 100 * 4/6,
                    content: [{
                        type: 'row',
                        content: [{
                            width: 100 * 1/3,
                            type: 'component',
                            componentName: GENERAL_INFO,
                            componentState: {
                                name: format_name(GENERAL_INFO),
                                type: ITEMTYPE_VCARD,
                            },
                        }, {
                            type: 'column',
                            width: 100 * 1/3,
                            content: [{
                                height: 45,
                                type: 'component',
                                componentName: MARKET_PRICES,
                                componentState: {
                                    name: format_name(MARKET_PRICES),
                                    type: ITEMTYPE_VCARD,
                                },
                            }, {
                                type: 'component',
                                height: 55,
                                componentName: GREEKS_INFO,
                                componentState: {
                                    name: format_name(GREEKS_INFO),
                                    type: ITEMTYPE_GCARD,
                                },
                            }]
                        }, {
                            width: 100 * 1/3,
                            type: 'component',
                            componentName: PRICING_INPUT,
                            componentState: {
                                name: format_name(PRICING_INPUT),
                                type: ITEMTYPE_VCARD,
                            },
                        }]
                    // }]
                    }, {
                        type: 'column',
                        height: 100 * 2/6,
                        content: [{
                            type: 'component',
                            componentName: HiSTORY_DATA,
                            componentState: {
                                name: format_name(HiSTORY_DATA),
                                type: ITEMTYPE_PLOT,
                            },
                            width: 100,
                        }],
                    }]
            }, {
                type: 'column',
                width: 100 * 1/4,
                height: 100,
                content: [
                    {
                        height: 50,
                        type: 'component',
                        componentName: PRICING_RESULT,
                        componentState: {
                            name: format_name(PRICING_RESULT),
                            type: ITEMTYPE_VCARD,
                        }
                    }, {
                        type: 'component',
                        height: 50,
                        componentName: PRICING_GREEKS,
                        componentState: {
                            name: format_name(PRICING_GREEKS),
                            type: ITEMTYPE_GCARD,
                        },
                    },
                ],
            }]
        }],
    }]
};
// */

async function create_generalinfo(master_kwargs, target_val) {
    let res_data = await api_get_contractdetails_get_generalinfo();
    const kwargs = {
        key: target_val,
        api_func: api_get_contractdetails_get_generalinfo,
        titleelem_arr: [],
        element: VCard,
        extra_elem_kwargs: [],
    }
    return [res_data, kwargs];
}

async function create_greeksinfo(master_kwargs, target_val) {
    let res_data = await api_get_contractdetails_get_greeksinfo();
    const kwargs = {
        key: target_val,
        api_func: api_get_contractdetails_get_greeksinfo,
        titleelem_arr: [],
        element: GreekCard,
        extra_elem_kwargs: [],
    }
    return [res_data, kwargs];
}

async function create_marketprices(master_kwargs, target_val) {
    let res_data = await api_get_contractdetails_get_marketprices();
    const kwargs = {
        key: target_val,
        api_func: api_get_contractdetails_get_marketprices,
        titleelem_arr: [],
        element: VCard,
        extra_elem_kwargs: [],
    }
    return [res_data, kwargs];
}

async function create_pricinginput(master_kwargs, target_val) {
    const modelname_option_obj = {
        'black-scholes': "Black-Scholes",
    }
    const input_pos_obj = {
        0: { attr_obj: { readonly: true }, type: "text" },
        1: { attr_obj: { readonly: true }, type: "text" },
        2: { attr_obj: { readonly: true }, type: "text" },
        3: { attr_obj: { readonly: true }, type: "text" },
        5: { attr_obj: { "data-key": "r", "data-target": target_val, min: 0, max: 1, step: 0.01}, type: "number"  },
        6: { attr_obj: { "data-key": "q", "data-target": target_val, min: 0, max: 1, step: 0.01}, type: "number" },
        7: { attr_obj: { "data-key": "model_name", "data-target": target_val, name: `select-${target_val}` }, type: "select-one", options: modelname_option_obj },
    }
    let res_data = await api_get_contractdetails_get_pricing_input();
    const apply_attr_obj = {
        "data-target": target_val, 
        value: "Apply",
        title: "Apply Pricing Configuration",
        type: "button",
        class: "basic-input-button flex-row-alignself-flexend grid-title-item",
    }

    const onclick_apply_input = async (input_obj) => {
        const presult_griditem_elem = master_kwargs.layout_map.get('pricing-result');
        const pgreeks_griditem_elem = master_kwargs.layout_map.get('pricing-greeks');
        addorremove_class_updating(presult_griditem_elem, true);
        addorremove_class_updating(pgreeks_griditem_elem, true);
        let res_data = await api_get_contractdetails_get_pricing_result(input_obj);
        document.dispatchEvent(new CustomEvent(CUSTOMEVENT_CONTRACTDETAILS_UPDATE_PRICINGINPUT, {detail: res_data}));
    }
    const kwargs = {
        key: target_val,
        custom_func: onclick_apply_input,
        titleelem_arr: [{Elem: BaseElement, args: ["input", apply_attr_obj]}],
        element: VCard,
        extra_elem_kwargs: [[], {}, {}, input_pos_obj],
    }
    return [res_data, kwargs];
}

async function create_all_pricingresult(master_kwargs, target_val_result, target_val_greeks, params={r: 0.04, q: 0.0, model_name: "black-scholes"}) {
    let res_data = await api_get_contractdetails_get_pricing_result(params);
    const res = {};
    res['result'] = [res_data.result, create_pricingresult(master_kwargs, target_val_result, params)]
    res['greeks'] = [res_data.greeks, create_pricinggreeks(master_kwargs, target_val_greeks, params)]
    return res;
}

function create_pricingresult(master_kwargs, target_val, params) {
    const status_func = (key, val) => {
        return {
            class: (val == "Overvalued") ?  "negative" : "positive",
        }
    }
    const valcolor_func = (key, val) => { return get_class_color_by_val(val); }
    const funcattr_pos_obj = {
        3: valcolor_func,
        4: valcolor_func,
        5: status_func,
    }
    const kwargs = {
        key: target_val,
        api_func: null,
        titleelem_arr: [],
        element: VCard,
        extra_elem_kwargs: [[], {}, {}, {}, funcattr_pos_obj],
        custom_eventtype: CUSTOMEVENT_CONTRACTDETAILS_UPDATE_PRICINGINPUT,
        detail_key: 'result',
    }
    return kwargs;
}

function create_pricinggreeks(master_kwargs, target_val, params) {
    const kwargs = {
        key: target_val,
        api_func: null,
        titleelem_arr: [],
        element: GreekCard,
        extra_elem_kwargs: [],
        custom_eventtype: CUSTOMEVENT_CONTRACTDETAILS_UPDATE_PRICINGINPUT,
        detail_key: 'greeks',
    }
    return kwargs;
}

async function create_history(master_kwargs, target_val) {
    const selected_field = "bam";
    const selected_stack = ["bid", "ask", "mark"];
    let res_data = await api_get_contractdetails_get_histdata({field_key: selected_field});

    const title_obj = {x: 'open_time', y: selected_field};
    const field_obj = {bam: "Bid, Ask, Mark Price", ohlcv: "OHLCV", greeks: "Greeks", miv: "Implied Volatility", oi: "Open Interest"}
    const namekey_obj = {ohlcv: "OHLCV", greeks: "Greeks", miv: "Implied Volatility", bid: "Bid Price", ask: "Ask Price", mark: "Mark Price", oi: "Open Interest", bam: "Bid, Ask, Mark", open_time: "Open Time", delta: "Detla", gamma: "Gamma", theta: "Theta", vega: "Vega"};
    const get_extra_elem_kwargs_func = (control_obj, res_data) => {
        const field_key = control_obj.field_key;
        let stack_arr = [];
        // if (["greeks", "bam"].includes(field_key)) {
        if (!["ohlcv"].includes(field_key)) {
            stack_arr = Object.keys(res_data);
            const opentime_ind = stack_arr.indexOf("open_time");
            if (opentime_ind !== -1) { stack_arr.splice(opentime_ind, 1); }
        }
        return [
            field_key == "ohlcv" ? PLOTTYPE_OHLCV : PLOTTYPE_LINE,
            {x: "open_time", y: field_key},
            false,
            stack_arr,
            namekey_obj
        ];
    }

    const kwargs = {
        key: target_val,
        api_func: api_get_contractdetails_get_histdata,
        titleelem_arr: [{Elem: SelectElement, args: [{class: "grid-title-item", name: `select-${target_val}`,'data-target': target_val, 'data-key': "field_key", title: "History Field"}, field_obj]}],
        element: MyPlot,
        extra_elem_kwargs: [(selected_field == "ohlcv") ? PLOTTYPE_OHLCV : PLOTTYPE_LINE, title_obj, false, selected_stack, namekey_obj],
        extra_elem_kwargs_func: get_extra_elem_kwargs_func,
    }
    return [res_data, kwargs];
}

function contractdetails_init_components_helper(res_data, kwargs) {
    return new MyGridItem(res_data, kwargs);
}

async function fullcreate_all_pricingresult(master_kwargs, params={r: 0.04, q: 0.0, model_name: "black-scholes"}) {
    const res_obj = await create_all_pricingresult(master_kwargs, "pricing-result", "pricing-greeks", params);
    contractdetails_init_components_helper(...res_obj.result);
    contractdetails_init_components_helper(...res_obj.greeks);
}

async function contractdetails_init_components(map_obj) {
    // const expiry_arr = await api_get_contractdetails_list_expiry();
    const master_kwargs = {
        ...map_obj
        // expiry_arr: expiry_arr,
        // first_expiry: expiry_arr[0] || "",
    }
    const submodule_func_obj = {
        "general-info": create_generalinfo,
        "greeks-info": create_greeksinfo,
        "market-prices": create_marketprices,
        "pricing-input": create_pricinginput,
        "all-pricingresult": create_all_pricingresult,
        "history-data": create_history,
    }
    const element_arr = [];
    const pricing_result_params = {r: 0.04, q: 0.0, model_name: "black-scholes"};
    for (const [key, func] of Object.entries(submodule_func_obj)) {
        if (key == "all-pricingresult") {
            const res_obj = await func(master_kwargs, "pricing-result", "pricing-greeks");
            const result_griditem_elem = contractdetails_init_components_helper(...res_obj.result);
            const greeks_griditem_elem = contractdetails_init_components_helper(...res_obj.greeks);
            element_arr.push(result_griditem_elem)
            element_arr.push(greeks_griditem_elem);
        } else {
            const [res_data, kwargs] = await func(master_kwargs, key);
            const griditem_elem = contractdetails_init_components_helper(res_data, kwargs);
            element_arr.push(griditem_elem)
        }
    }
    return element_arr;
}

export async function contractdetails_init_layout() {
    const map_obj = {
        layout_map: new Map(),
        aggrid_map: new Map(),
        plot_map: new Map(),
    }
    const element_arr = await contractdetails_init_components(map_obj);
    init_layout(map_obj, CONTRACTDETAILS_CONFIG, CONTRACTDETAILS_COMPONENTS, element_arr);
}