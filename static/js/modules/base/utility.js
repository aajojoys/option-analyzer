import { get_dataset_value_base, get_target_elem_vals } from "../../base/utility.js";

const TARGET_SESSIONINFO = "session-info"
const ID_NAV_INPUT_SESSIONID = "nav-input-sessionid"
const DATASET_SESSIONID = "sessionid"

export function get_sessioninfo_kwargs() {
    return get_target_elem_vals(TARGET_SESSIONINFO)
}

export function get_control_kwargs(target_val, with_sessioninfo=false) {
    const res = (with_sessioninfo) ? get_sessioninfo_kwargs() : {}
    return { ...res, ...get_target_elem_vals(target_val) }
}

export function get_input_sessionid() {
    const input_elem = document.getElementById(ID_NAV_INPUT_SESSIONID);
    return get_dataset_value_base(input_elem, DATASET_SESSIONID);
}

export const get_class_color_by_val = (val) => {
    let class_val = "";
    if (typeof val == "number") {
        class_val = (val < 0) ? "negative" : "positive";
    } else if (typeof val == "string") {
        class_val = (val[0] == "-") ? "negative" : "positive";
    }
    return { class: class_val };
}