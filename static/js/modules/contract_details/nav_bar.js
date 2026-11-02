import { MENUNAME_CONTRACTDETAILS, MENUNAME_SCENARIOANALYSIS } from "../../base/app_utility.js";
import { add_options } from "../../base/element.js";
import { get_current_menu, validate_control_vals } from "../../base/nav_bar.js";
import { DATASET_KEY, DATASET_TARGET, get_client_element, get_dataset_value_base, get_target_elem_vals, get_target_elems, int_to_timestamp_utc, istype_object, show_hide_loader, TIMESTAMP_UNIT_MS, ts_convert_s_and_ms } from "../../base/utility.js";
import { BASEFIELD_CSYMBOL, BASEFIELD_EXPIRY, BASEFIELD_OPTIONTYPE, BASEFIELD_SYMBOL, BASEFIELD_TIMESTAMP } from "../../data_collection/enum.js";
import { api_get_scenario_get_ocdata } from "../scenario/utility.js";
import { api_get_contractdetails_get_ocdata } from "./utility.js";

function nav_clear_select(target_val, key) {
    const select_elem = get_client_element(`[data-${DATASET_TARGET}="${target_val}"][data-${DATASET_KEY}="${key}"]`)
    select_elem.innerHTML = "";
}

function nav_update_select(target_val, key, option_arr) {
    const select_elem = get_client_element(`[data-${DATASET_TARGET}="${target_val}"][data-${DATASET_KEY}="${key}"]`)
    let option_vals = [];
    if (key == BASEFIELD_EXPIRY) {
        option_vals = {}
        for (const expiry of Object.keys(option_arr)) {
            option_vals[expiry] = int_to_timestamp_utc(ts_convert_s_and_ms(expiry, TIMESTAMP_UNIT_MS), 10);
        }
    } else {
        option_vals = option_arr;
    }
    const selected_option = istype_object(option_vals) ? Object.keys(option_vals)[0] : option_vals[0]
    // add_options(select_elem, option_vals, {}, null, [], "", "", false);
    add_options(select_elem, option_vals, {}, selected_option, [], "", "", false);
}

async function nav_onchange_select(elem) {
    show_hide_loader(true);
    const sequence = [[BASEFIELD_SYMBOL,BASEFIELD_TIMESTAMP], BASEFIELD_OPTIONTYPE, BASEFIELD_EXPIRY, BASEFIELD_CSYMBOL];
    const key = get_dataset_value_base(elem, DATASET_KEY);
    const target_val = get_dataset_value_base(elem, DATASET_TARGET);
    let target_obj = get_target_elem_vals(target_val);
    if (key == BASEFIELD_CSYMBOL) {
        show_hide_loader(false);
        return;
    }
    const success = await validate_control_vals(target_obj);
    if (!success) { 
        show_hide_loader(false);
        return;
    }
    const target_ind = sequence[0].includes(key) ? 0 : sequence.indexOf(key);
    for (let i=target_ind; i < (sequence.length-1); i++) {
        if (sequence[i+1] == BASEFIELD_OPTIONTYPE) { continue; }
        nav_clear_select(target_val, sequence[i+1]);
    }
    const query_params = {symbol: target_obj.symbol, timestamp: target_obj.timestamp};
    let api_func = null;
    let res_data = null;
    const menu_name = get_current_menu();
    if (menu_name == MENUNAME_CONTRACTDETAILS) {
        res_data = await api_get_contractdetails_get_ocdata(query_params);
    } else if (menu_name == MENUNAME_SCENARIOANALYSIS) {
        res_data = await api_get_scenario_get_ocdata(query_params);
    }
    let curr_data = res_data;
    for (let i=1; i < target_ind; i++) {
        curr_data = curr_data[target_obj[sequence[i]]];
    }
    // for (const curr_key of sequence.slice(target_ind,)) {
    for (let i=target_ind; i < (sequence.length-1); i++) {
        target_obj = get_target_elem_vals(target_val); // updating target_obj if key values change
        if (i > 0) { curr_data = curr_data[target_obj[sequence[i]]]; }
        if (sequence[i+1] == BASEFIELD_OPTIONTYPE) { continue; }
        nav_update_select(target_val, sequence[i+1], curr_data)
    }
    show_hide_loader(false);
}

export function init_nav_contractdetails(target_val) {
    const elems = get_target_elems(target_val);
    for (const elem of elems) {
        // if (elem.type == ELEMTYPE_SELECT_ONE) {
        elem.addEventListener("change", nav_onchange_select.bind(null, elem));
        // }
    }
}
