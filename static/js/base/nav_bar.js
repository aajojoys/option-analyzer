import { BASEFIELD_TIMESTAMP } from "../data_collection/enum.js";
import { api_datacollection_minmax_t } from "../data_collection/utility.js";
import { init_nav_contractdetails } from "../modules/contract_details/nav_bar.js";
import { get_active_menu_name } from "../sidebar/sidebar_utility.js";
import { MENUNAME_CONTRACTDETAILS, MENUNAME_SCENARIOANALYSIS } from "./app_utility.js";
import BaseUrl from "./baseurl.js";
import { DATASET_TARGET, datetime_add_day, datetime_sub_day, get_client_element, get_dataset_value_base, get_elem_targetkey, get_target_elem_vals, int_to_timestamp_utc, make_error, reload_url, remove_error, show_hide_loader, url_remove_lastpath } from "./utility.js";

const CLS_NAV_TOP_TITLE = ".nav-top-title";
const CLS_NAV_APPLY = "nav-apply";
const DATASET_KEY = "key";
const DATASET_TARGET_SESSIONINFO = "session-info";

export function get_current_menu() {
    /**
     * {string} Returns current active menu name:
     * Available value as follows:
     *  - screener
     *  - chart
     *  - market_backtest
     *  - strategy_backtest
     * 
     * @param None 
     */
    const nav_title_elem = get_client_element(CLS_NAV_TOP_TITLE);
    return get_dataset_value_base(nav_title_elem, DATASET_KEY);
}

async function validate_nav_input_datetime(val) {
    const grace_period = 7; // introduce grace period to make sure there's enough data to analyze
    const minmax_obj = await api_datacollection_minmax_t();
    const min_ts_int = datetime_add_day(minmax_obj.min, grace_period);
    const max_ts_int = datetime_sub_day(minmax_obj.max, grace_period);
    const min_ts = int_to_timestamp_utc(min_ts_int);
    const max_ts = int_to_timestamp_utc(max_ts_int);
    let err_msg = `Currently only support datetime period from ${min_ts} to ${max_ts}\n\nPlease try again!`
    let success = true;
    if ((val <= minmax_obj.min) || (val >= minmax_obj.max)) {
        success = false;
        err_msg = `Selected datetime ${int_to_timestamp_utc(val)} is out of range\n\n` + err_msg;
    }
    return [success, err_msg];
}

function get_nav_input_datetime_elem() {
    const attr_str = `[data-target=${DATASET_TARGET_SESSIONINFO}][data-key="${BASEFIELD_TIMESTAMP}"]`;
    return get_client_element(attr_str);

}
export async function validate_control_vals(target_obj) {
    let success = true;
    if (target_obj || (BASEFIELD_TIMESTAMP in target_obj)) {
        const [this_success, this_msg] = await validate_nav_input_datetime(target_obj[BASEFIELD_TIMESTAMP]);
        const dt_elem = get_nav_input_datetime_elem();
        remove_error(dt_elem);
        if (!this_success) {
            make_error(dt_elem, this_msg);
            success &= this_success;
        }
    }

    return success
}

async function onclick_nav_apply(apply_elem, func=null) {
    show_hide_loader(true);
    const target_val = get_elem_targetkey(apply_elem);
    const target_obj = get_target_elem_vals(target_val);
    const success = await validate_control_vals(target_obj);
    if (!success) { 
        show_hide_loader(false);
        return;
    }
    let url = window.location.href;
    url = url_remove_lastpath(url);
    const query_params = (func) ? func(target_obj) : target_obj;
    const url_ins = new BaseUrl();
    url = (Object.keys(target_obj).length) ? url_ins.get_query_url(target_obj, url) : url;
    window.location.href = url;
}

function inite_nav_apply(apply_elem) {
    apply_elem.addEventListener("click", onclick_nav_apply.bind(null, apply_elem, null));
}

export function init_navbar() {
    const apply_elem = document.getElementById(CLS_NAV_APPLY);
    // const menu_name = get_active_menu_name();
    const menu_name = get_current_menu();
    const target_val = get_dataset_value_base(apply_elem, DATASET_TARGET);
    if ([MENUNAME_CONTRACTDETAILS, MENUNAME_SCENARIOANALYSIS].includes(menu_name)) {
        init_nav_contractdetails(target_val)
    }
    inite_nav_apply(apply_elem);
}