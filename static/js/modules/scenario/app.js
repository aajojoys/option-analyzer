import { init_layout } from "../../base/layout.js";
import { MyPlot, PLOTTYPE_LINE, PLOTTYPE_PAYOFF } from "../../base/plotly_utility.js";
import { addorremove_class_updating, fchar_capitalize, format_name, get_client_element, get_target_elem_vals, round_sig_step } from "../../base/utility.js";
import { ITEMTYPE_VCARD, ITEMTYPE_PLOT, VCard, MyGridItem, PositionSelect, InputSelect, LowerRangeInput, StepRangeInput, UpperRangeInput, OutputSelect, ApplyButton } from "../base/element.js";
import { get_class_color_by_val } from "../base/utility.js";
import { api_get_scenario_payoff_result, api_get_scenario_pricing_input, api_get_scenario_pricing_result, api_get_scenario_sensitivity_input, api_get_scenario_sensitivity_result } from "./utility.js";

const PRICING_INPUT = "Pricing Input";
const PRICING_RESULT = "Pricing Result";
const SENSITIVITY_RESULT = "Sensitivity Result";
const PAYOFF_RESULT = "Payoff Result";
const CUSTOMEVENT_SCENARIO_UPDATE_PRICINGINPUT = "scenario-update-pricinginput";

const SCENARIO_COMPONENTS = [PRICING_INPUT, PRICING_RESULT, PAYOFF_RESULT, SENSITIVITY_RESULT];
const SCENARIO_CONFIG = {
    dimensions: {
        borderWidth: 20,
    },
    content: [{
        type: 'column',
        content: [
            {
                type: 'row',
                width: 100 * 1/2,
                height: 100 * 3/5,
                content: [{
                    type: 'row',
                    content: [{
                        width: 100 * 1/2,
                        type: 'component',
                        componentName: PRICING_INPUT,
                        componentState: {
                            name: format_name(PRICING_INPUT),
                            type: ITEMTYPE_VCARD,
                        }
                    }, {
                        width: 100 * 1/2,
                        type: 'component',
                        componentName: PRICING_RESULT,
                        componentState: {
                            name: format_name(PRICING_RESULT),
                            type: ITEMTYPE_VCARD,
                        },
                    }]
                }, {
                    type: 'row',
                    width: 100 * 1/2,
                    height: 100,
                    content: [{
                        type: 'component',
                        componentName: PAYOFF_RESULT,
                        componentState: {
                            name: format_name(PAYOFF_RESULT),
                            type: ITEMTYPE_PLOT,
                        },
                    }]
                }]
            }, {
                width: 100,
                height: 100 * 2/5,
                type: 'component',
                componentName: SENSITIVITY_RESULT,
                componentState: {
                    name: format_name(SENSITIVITY_RESULT),
                    type: ITEMTYPE_PLOT,
                }
            }]
    }]
};

async function create_pricinginput(master_kwargs, target_val) {
    const modelname_option_obj = {
        'black-scholes': "Black-Scholes",
    }
    const input_pos_obj = {
        0: { attr_obj: { readonly: true }, type: "text" },
        1: { attr_obj: { readonly: true }, type: "text" },
        2: { attr_obj: { readonly: true }, type: "text" },
        3: {},
        4: { attr_obj: { "data-key": "S", "data-target": target_val, step: 0.01}, type: "number"  },
        5: { attr_obj: { "data-key": "T", "data-target": target_val, min: 0, step: 0.001}, type: "number"  },
        6: { attr_obj: { "data-key": "sigma", "data-target": target_val, step: 1}, type: "number" },
        7: { attr_obj: { "data-key": "r", "data-target": target_val, min: 0, max: 1, step: 0.01}, type: "number" },
        8: { attr_obj: { "data-key": "q", "data-target": target_val, min: 0, max: 1, step: 0.01}, type: "number" },
        9: { attr_obj: { "data-key": "model_name", "data-target": target_val, name: `select-${target_val}` }, type: "select-one", options: modelname_option_obj },
    }
    let res_data = await api_get_scenario_pricing_input();
    const apply_attr_obj = {
        "data-target": target_val, 
        value: "Apply",
        title: "Apply Pricing Configuration",
        type: "button",
        class: "basic-input-button flex-row-alignself-flexend grid-title-item",
    }

    const onclick_apply_input = async (input_obj) => {
        const presult_griditem_elem = master_kwargs.layout_map.get('pricing-result');
        addorremove_class_updating(presult_griditem_elem, true);
        let res_data = await api_get_scenario_pricing_result(input_obj);
        document.dispatchEvent(new CustomEvent(CUSTOMEVENT_SCENARIO_UPDATE_PRICINGINPUT, {detail: res_data}));
    }
    const applyelem_obj = {Elem: ApplyButton, args: [apply_attr_obj]}
    const kwargs = {
        key: target_val,
        custom_func: onclick_apply_input,
        titleelem_arr: [applyelem_obj],
        element: VCard,
        extra_elem_kwargs: [[], {}, {}, input_pos_obj],
    }
    return [res_data, kwargs];
}

async function create_pricingresult(master_kwargs, target_val) {
    const status_func = (key, val) => {
        return {
            class: (val == "Overvalued") ?  "negative" : "positive",
        }
    }
    const valcolor_func = (key, val) => { return get_class_color_by_val(val); }
    const funcattr_pos_obj = {
        4: valcolor_func,
        5: valcolor_func,
        6: status_func,
        7: valcolor_func,
        8: valcolor_func,
        9: valcolor_func,
        10: valcolor_func,
        11: valcolor_func,
    }

    const input_obj = get_target_elem_vals("pricing-input");
    let res_data = await api_get_scenario_pricing_result(input_obj);
    const kwargs = {
        key: target_val,
        api_func: null,
        titleelem_arr: [],
        element: VCard,
        extra_elem_kwargs: [[], {}, {}, {}, funcattr_pos_obj],
        custom_eventtype: CUSTOMEVENT_SCENARIO_UPDATE_PRICINGINPUT,
    }
    return [res_data, kwargs];
}

async function create_payoffresult(master_kwargs, target_val) {
    const FIELD_POSITION = "position";
    const selected_position = "long";
    const position_obj = {
        long: fchar_capitalize("long"),
        short: fchar_capitalize("short"),
    }
    const query_obj = {[FIELD_POSITION]: selected_position};
    let res_data = await api_get_scenario_payoff_result(query_obj);

    const title_obj = {x: 'range', y: 'pnl'};
    const namekey_obj = {range: "Underlying Price at expiration (USDT)", pnl: "Profit/ Loss (USDT)"};

    const positionselect_key = "position";
    const kwargs = {
        key: target_val,
        api_func: api_get_scenario_payoff_result,
        titleelem_arr: [{Elem: PositionSelect, args: [position_obj, {'data-target': target_val, 'data-key': positionselect_key}]}],
        element: MyPlot,
        extra_elem_kwargs: [PLOTTYPE_PAYOFF, title_obj, false, [], namekey_obj],
    }
    return [res_data, kwargs];
}

function onchange_input_sensitivityresult(input_elem, target_val, default_obj) {
    const control_obj = get_target_elem_vals(target_val);
    if (!input_elem) { input_elem = get_client_element(`[data-target="${target_val}"][data-key="input"]`); }
    const lower_elem = get_client_element(`[data-target="${target_val}"][data-key="lower"]`);
    const upper_elem = get_client_element(`[data-target="${target_val}"][data-key="upper"]`);
    const pct = 20;
    const step = control_obj.step || 10;
    const replace_zero_val = 0.01
    let val = default_obj[input_elem.value] || replace_zero_val;
    val = round_sig_step(val);
    let min_val = val * (1-(pct/100));
    const max_val = val * (1+(pct/100));
    if (min_val < 0) { min_val = 0; }
    if (lower_elem) { lower_elem.value = min_val; }
    if (upper_elem) { upper_elem.value = max_val; }
    return min_val, max_val;
}

async function create_sensitivityresult(master_kwargs, target_val) {
    const input_obj = {S: "Spot Price", sigma: "Implied Volativlity", T: "Time to Expiry (year)", r: "Risk-free rate", q: "Dividend"}
    const output_obj = {fair_value: "Fair Value (USDT)", delta: "Greeks: Delta", gamma: "Greeks: Gamma", theta: "Greeks: Theta (per day)", vega: "Greeks: Vega (per 1% IV)", rho: "Greeks: Rho (per 1% r)"};
    const default_obj = await api_get_scenario_sensitivity_input();
    const pricing_obj = default_obj.values
    delete default_obj.values;
    let res_data = await api_get_scenario_sensitivity_result(default_obj);

    const apply_attr_obj = {
        "data-target": target_val, 
        value: "Apply",
        title: "Apply Pricing Configuration",
        type: "button",
        class: "basic-input-button flex-row-alignself-flexend grid-title-item",
    }

    const title_obj = { x: default_obj.input, y: default_obj.output };
    const namekey_obj = {...input_obj, ...output_obj};
    const control_obj = get_target_elem_vals(target_val);
    const onchange_input = (input_elem) => { return onchange_input_sensitivityresult(input_elem, target_val, pricing_obj); }
    const input_event_kwargs = { type: "change", func: onchange_input, to_init: true };

    const inputelem_obj = {Elem: InputSelect, args: [input_obj, {'data-target': target_val, 'data-key': "input"}], no_default_event: true, event_kwargs: input_event_kwargs};
    const lowerelem_obj = {Elem: LowerRangeInput, args: [{'data-target': target_val, 'data-key': "lower", value: default_obj.lower}], no_default_event: true};
    const upperelem_obj = {Elem: UpperRangeInput, args: [{'data-target': target_val, 'data-key': "upper", value: default_obj.upper}], no_default_event: true};
    const stepelem_obj = {Elem: StepRangeInput, args: [{'data-target': target_val, 'data-key': "step", value: 10}], no_default_event: true};
    const outputelem_obj = {Elem: OutputSelect, args: [output_obj, {'data-target': target_val, 'data-key': "output"}], no_default_event: true};
    const applyelem_obj = {Elem: ApplyButton, args: [{...apply_attr_obj, 'data-target': target_val}]}
    const extra_elem_kwargs_func = (control_obj, res_data) => {
        const input_key = control_obj.input;
        const output_key = control_obj.output;
        const title_obj = {x: input_key, y: output_key};
        return [PLOTTYPE_LINE, title_obj, false, [], namekey_obj];
    }
    const kwargs = {
        key: target_val,
        api_func: api_get_scenario_sensitivity_result,
        titleelem_arr: [inputelem_obj, lowerelem_obj, upperelem_obj, stepelem_obj, outputelem_obj, applyelem_obj],
        element: MyPlot,
        extra_elem_kwargs: [PLOTTYPE_LINE, title_obj, false, [], namekey_obj],
        extra_elem_kwargs_func: extra_elem_kwargs_func,
    }
    return [res_data, kwargs];
}

function scenario_init_components_helper(res_data, kwargs) {
    return new MyGridItem(res_data, kwargs);
}

async function scenario_init_components(map_obj) {
    // const expiry_arr = await api_get_scenario_list_expiry();
    const master_kwargs = {
        ...map_obj
        // expiry_arr: expiry_arr,
        // first_expiry: expiry_arr[0] || "",
    }
    const submodule_func_obj = {
        "pricing-input": create_pricinginput,
        "pricing-result": create_pricingresult,
        "payoff-result": create_payoffresult,
        "sensitivity-result": create_sensitivityresult,
        // "history-data": create_history,
    }
    const element_arr = [];
    for (const [key, func] of Object.entries(submodule_func_obj)) {
        const [res_data, kwargs] = await func(master_kwargs, key);
        const griditem_elem = scenario_init_components_helper(res_data, kwargs);
        element_arr.push(griditem_elem)
    }
    return element_arr;
}

export async function scenario_init_layout() {
    const map_obj = {
        layout_map: new Map(),
        aggrid_map: new Map(),
        plot_map: new Map(),
    }
    const element_arr = await scenario_init_components(map_obj);
    init_layout(map_obj, SCENARIO_CONFIG, SCENARIO_COMPONENTS, element_arr);
}
