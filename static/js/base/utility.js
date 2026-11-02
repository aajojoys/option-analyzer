import { BASEFIELD_EXPIRY, BASEFIELD_TIMESTAMP } from "../data_collection/enum.js";
import BaseUrl from "./baseurl.js";
import { BaseElement } from "./element.js";

const CSS_SHOW = "show";
const CSS_HIDE = "hide";
const ERROR_CSS_CLASS = "error";
const ERROR_WARNING_CSS_CLASS = "error-warning";
const IMG_SERVER_LOADING_SRC = "/static/img/icons/refresh.gif";
const LOADER_MODAL = "#loader-modal";
const CLASS_NO_POINTER_EVENTS = "no-pointer-events"
export const ELEMTYPE_SELECT_ONE = "select-one";
export const ELEMTYPE_BUTTON = "button";

const TIMESTAMP_UNIT_MS_LENGTH = 13; // timestamp in 'millisecond' unit max length
const TIMESTAMP_UNIT_S_LENGTH = 10; // timestamp in 'second' unit max length
const UTC_FORMATTER = new Intl.DateTimeFormat
export const TIMESTAMP_UNIT_MS = "ms";
export const TIMESTAMP_UNIT_S = "s";
export const DATASET_TARGET = "target";
export const DATASET_KEY = "key";
export const DATASET_VALUE = "value";
export const DATASET_NAME = "name"
const DTLOCAL_TO_TS_ARR = [BASEFIELD_TIMESTAMP];
const TO_INT_ARR = [BASEFIELD_EXPIRY];

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_DAY = 86400000;

export function get_computed_style_property_value(root_var, elem=document.body) {
    return getComputedStyle(elem).getPropertyValue(root_var);
}

export function set_style_property(root_var, value, elem=document.body) {
    elem.style.setProperty(root_var, value);
}

export function replace_url_filename(url, new_filename) {
    let url_arr = url.split("/");
    url_arr[url.length-1] = new_filename;
    return url_arr.join("/");
}

export function get_client_element(attr, container=document) {
    return container.querySelector(attr);
}

export function get_client_element_value(attr, container=document) {
    const elem = container.querySelector(attr);
    if (elem) { return elem.value; }
    return null;
}

export function get_client_element_attr_value(elem, key) {
    if (elem) { return elem.getAttribute(key) }
    return null;
}

export function get_dataset_value_base(elem, attr_str) {
    /*
     * Get dataset value by given target element and attr_str (exclude prefix 'data-')
     * e.g. data-name="xxx" get_dataset_value_base(elem, attr_str="name")="xxx"
     *
     * @param { HTML element } elem: target underlying HTML element
     * @param { attr_str } str: dataset attr_str (exclude prefix 'data-') (if attr_str == "dataset", returns dataset object)
     *
     * returns { * }: Object if attr_str == "dataset"; if value exists, underlying value; otherwise null
     *
     */
    if (!elem) { return null; }
    const dataset_obj = { ...elem.dataset };
    if (attr_str == "dataset") { return dataset_obj; }
    return (Object.keys(dataset_obj).length) ? (dataset_obj[attr_str]) : (null);
}

export function get_all_dataset_base(elem) {
    /*
     * Get all dataset key values in Object
     *
     * @param { HTML element } elem: underlying HTML element
     *
     * returns { Object }: Object containing dataset key values
     *
     */
    if (!elem) { return null; }
    return { ...elem.dataset };
}

export function add_dataset_elem(elem, attr_str, value) {
    elem.setAttribute(`data-${attr_str}`, value);
}

export function get_select_option(elem) {
    return elem.options[elem.selectedIndex];
}

export function get_select_multiple_options(elem, attr) {
    /*
     * Get selected options attribute's values
     *
     * @param { HTML element } elem: select element
     * @param { str or Array } attr: target attribute (multiple dataset attributes if attr is Object) e.g. attr={dataset: [pk, model]}
     *  - if istype_object(attr) == true, assuming dataset attributes (given array keys are included in dataset)
     *
     * returns { Array }: array consists of values
     *
     */
    const options = elem.selectedOptions;
    const value_arr = [];
    let validate_dataset = false; // validate_dataset == true when (istype_object(attr) == true) && (Object.keys(attr) == 'dataset')
    let attr_arr = []; 
    let attr_key = "";
    if (istype_object(attr)) {
        attr_arr = Object.values(attr)[0];
        attr_key = Object.keys(attr)[0];
        if (attr_key == "dataset") { validate_dataset = true; }
    }
    for (const option of options) {
        let value;
        if (validate_dataset) {
            // NOTE: copy by value not reference to not remove dataset key value from underlying option element 
            value = { ...option[attr_key] };
            for (const key of Object.keys(value)) { if (!attr_arr.includes(key)) { delete value[key]; } }
        } else {
            value = option[attr];
        }
        value_arr.push(value);
    }
    return value_arr;
}

export function get_dataset_value_parent(parent_elem, attr_str) {
    const base_elem = get_select_option(parent_elem);
    return get_dataset_value_base(base_elem, attr_str);
}

export function make_sortable(container, sortable_attr_obj={}) {
    const default_attr_obj = {
        animation: 150,
        ghostClass: 'blue-background-class',
    }
    const sortable = new Sortable(container, {
        ...default_attr_obj,
        ...sortable_attr_obj,
    })
}

export function hide_elem(elem, cls_hide=CSS_HIDE, cls_show=CSS_SHOW) {
    if (cls_hide) { elem.classList.add(cls_hide); }
    elem.classList.remove(cls_show);
}

export function show_elem(elem, cls_show=CSS_SHOW, cls_hide=CSS_HIDE) {
    if (cls_show) { elem.classList.add(cls_show); }
    elem.classList.remove(cls_hide);
}

export function show_hide_elem(show_this_elem, hide_this_elem, cls_hide=CSS_HIDE, cls_show=CSS_SHOW) {
    if (show_this_elem) { show_elem(show_this_elem, cls_show, cls_hide); }
    if (hide_this_elem) { hide_elem(hide_this_elem, cls_hide, cls_show); }
}

export function hide_modal(selector) {
    const modal_elem = get_client_element(selector);
    hide_elem(modal_elem);
}

export function show_modal(selector) {
    const modal_elem = get_client_element(selector);
    show_elem(modal_elem);
}

function create_tooltip(elem, msg) {
    tippy(elem, {
        content: msg,
        theme: 'tooltip-theme',
        placement: 'bottom',
    });
}

function remove_tooltip(elem) {
    const instance = elem._tippy;
    if (instance) { instance.destroy(); }
}

export function make_error(elem, msg) {
    elem.classList.add(ERROR_CSS_CLASS);
    create_tooltip(elem, msg);
    elem.focus();
}

export function remove_error(elem) {
    elem.classList.remove(ERROR_CSS_CLASS);
    remove_tooltip(elem);
}

export function fchar_capitalize(str) {
    // capitalizing first character
    return str[0].toUpperCase() + str.slice(1);
}

export function object_zip(key_arr, value_arr) {
    return Object.fromEntries(key_arr.map((key, i) => [key, value_arr[i]]));
}

/* timestamp manipulation utility functions */

const INTERVAL_TO_MS = {'D': 86400000, 'H': 3600000, 'M': 60000, 'S': 1000, 'MS': 1}

export function ts_calc(ts, n, interval, func) {
    const calc_target = n * INTERVAL_TO_MS[interval];
    return func(ts, calc_target);
}

export function ts_delta(start_ts, end_ts, interval) {
    const delta_ms = end_ts - start_ts;
    return delta_ms / INTERVAL_TO_MS[interval];
}

export function get_timestamp_now() {
    return new Date().getTime();
}

export function naive_round(num, decimals=0) {
    const p = Math.pow(10, decimals);
    return Math.round(num * p) / p;
}

export function url_remove_lastpath(url) {
    let new_url = url;
    let is_sliced = false
    if (new_url.slice(-1) == "/") {
        new_url = new_url.slice(0, -1); 
        is_sliced = true
    }
    new_url = new_url.split("/").slice(0, -1).join("/");
    if (is_sliced) { new_url += "/"; }
    return new_url
}

export function reload_url(query_params={}) {
    const url = new BaseUrl();
    window.location.href = (Object.keys(query_params).length) ? url.get_query_url(query_params) : url.get_base_url();
}

export function redirect_url(url) {
    window.location.href = url;
}

export function display_server_loading(server_loading_div, to_show=true) {
    (to_show) ? show_elem(server_loading_div) : hide_elem(server_loading_div);
}

export function add_server_loading_elem(container, to_show, outerdiv_attr_obj={}) {
    const outerdiv_elem = new BaseElement(container, "div", outerdiv_attr_obj);
    const img_attr_obj = {
        class: "icon",
        title: "Loading data...",
        src: IMG_SERVER_LOADING_SRC,
    }
    const img_elem = new BaseElement(outerdiv_elem, "img", img_attr_obj);
    display_server_loading(outerdiv_elem, to_show);
}

export function count_decimal_places(real) {
    const real_str = real.toString();
    const ind = real_str.indexOf('.')
    return (ind == -1) ? 0 : (real_str.length - (ind + 1));
}

export function truncate_real(real, n_decimal_places) {
    let real_str = real.toString();
    const ind = real_str.indexOf('.');
    real_str = real_str.slice(0, ind+n_decimal_places+1);
    return parseFloat(real_str);
}

export function number_format(real) {
    return new Intl.NumberFormat('en', {maximumFractionDigits: 8}).format(real);
}

export function range(start, end, step) {
    /**
     * Returns range of number to emulate python function 'range'
     *
     * @param start (int or float): start number (inclusive)
     * @param end (int or float): end number (inclusive)
     * @param step (int or float): increment or decrement step
     *
     */
    const arr = [];
    for (let i=start; i<=end; i+=step||1) { arr.push(i); }
    return arr;
}

export function ts_convert_s_and_ms(ts, to_unit_str) {
    /**
     * convert unix timestamp from 'second' to 'millisecond' by condition length of given timestamp
     * skip converting if timestamp is not in 'second' unit
     *
     * @param { int } ts: timestamp in 'second' unit
     *
     */
    length = ts.toString().length;
    if ((to_unit_str == TIMESTAMP_UNIT_MS) && (length == TIMESTAMP_UNIT_S_LENGTH)) {
        ts *= 1000;
    } else if ((to_unit_str == TIMESTAMP_UNIT_S) && (length == TIMESTAMP_UNIT_MS_LENGTH)) {
        ts = parseInt(ts / 1000);
    }
    return ts;
}

export function istype_object(obj) {
    /**
     * Validate if passing argument is type of Object
     *
     * @param { any } obj: validating target
     *
     * return { bool }: true if passing argument is type of Object; false otherwise
     *
     */
    // return (typeof obj === "object") && !Array.isArray(obj) && (obj !== null);
    return (obj instanceof Object) && !Array.isArray(obj);
}

export function isobject_empty(obj) {
    /**
     * Validate if passing argument is type of Object
     *
     * @param { any } obj: validating target
     *
     * return { bool }: true if passing argument is type of Object and is empty; false otherwise
     *
     */
    return istype_object(obj) && (Object.keys(obj).length == 0);

}

export function istype_array(obj) {
    /**
     * Validate if passing argument is type of Array
     *
     * @param { any } obj: validating target
     *
     * return { bool }: true if passing argument is type of Array; false otherwise
     *
     */
    // return (typeof obj === "object") && Array.isArray(obj) && (obj !== null);
    return (obj instanceof Object) && Array.isArray(obj);
}

export function istype_string(data) {
    return typeof data === "string";
}

export function contains_alphabet(text) {
    /**
     * Validate if text contains alphabet
     *
     * @param { string } text: validating target
     *
     * return { boolean }: true if given value contains alphabet; false otherwise
     *
     */
    return /[a-z]/i.test(text)
}

function show_hide_all_pointers(to_show) {
    /**
     * show or hide pointer events (none) of HTML body element
     *
     * @param { bool } to_show: true to show pointer events; hide otherwise
     *
     */
    const body_elem = get_client_element('body');
    const is_present = body_elem.classList.contains(CLASS_NO_POINTER_EVENTS);
    if (to_show && is_present) {
        body_elem.classList.remove(CLASS_NO_POINTER_EVENTS);
    } else if ((!to_show) && (!is_present)) {
        body_elem.classList.add(CLASS_NO_POINTER_EVENTS);
    }
}

export function show_hide_loader(to_show) {
    /**
     * show or hide loader modal
     *
     * @param { bool } to_show: true to show modal loader; hide otherwise
     *
     */
    to_show ? show_modal(LOADER_MODAL) : hide_modal(LOADER_MODAL);
    // showing loader pairs with pointer events hiding; hiding loader pairs with showing pointer events showing (Hence, !to_show)
    show_hide_all_pointers(!to_show);
}

export function validate_res_success(res_json) {
    /**
     * Universal response validating function to determine if request is successful
     * Assuming given res_json object has key 'success' with boolean value indicating if status is successful
     *
     * @param { Object } res_json: response
     *
     * return { bool }: return success status; false if 'success' key is undefined
     *
     */
    return res_json.success || false;
}

export function arr_to_obj(arr_of_objs, key) {
    /**
     * Converting array of object into object of value in object with underlying chosen inner object key as key for ease of reference
     *
     * >>> arr_of_objs = [{pk: "5", name: "test"}, {pk: "6", name: "test"}];
     * >>> arr_to_obj(arr_of_objs, 'pk') = {5: {pk: "5", name: "test"}, 6: {pk: "6", name: "test"}};
     * *** selected key value will always transform to string (in this case value of pk)
     *
     * @param { array } arr_of_objs: array containing objects
     *
     * return { Object }: object containing selected key value as key & object as value
     *
     */
    const key_obj = {};
    arr_of_objs.forEach(obj => { key_obj[obj[key].toString()] = obj; });
    return key_obj;
}

export function deep_copy(target_obj) {
    /*
     * Deep copy target object to avoid copy by reference
     *
     * @param { Object } target_obj: underlying Object to copy by value
     *
     * returns { * }: returns Object if istype_object(target_obj)==true; returns target_obj otherwise
     *
     */
    if (istype_object(target_obj)) {
        return JSON.parse(JSON.stringify(target_obj));
    } else {
        console.log(`Expecting 'Object' type to deep copy. Given type '${typeof target_obj}'`);
        return target_obj;
    }
}

export function json_parsable(json_str) {
    /*
     * Determine if underlying stringified json is parsable (by no means a perfect checker, only check first & last character)
     *
     * @param { str } json_str: stringified json
     *
     * returns { boolean }: true if parsable; false otherwise
     *
     */
    return ((json_str[0] == "{") && (json_str[json_str.length - 1] == "}")) ? true : false;
}

export function format_name(name, to_replace = ' ', replace_by = '-') {
    return name.toLowerCase().replaceAll(to_replace, replace_by);
}

export function int_to_timestamp_utc(ts_int, end_ind=19) {
    return new Date(ts_int).toISOString().replace("T", " ").slice(0, end_ind) + " (UTC)";
}

export function int_to_timestamp_utc_short(ts_int) {
    // return new Intl.DateTimeFormat("en", {
    //     day: "2-digit",
    //     month: "short",
    //     hour: "2-digit",
    //     timeZone: "UTC",
    //     hour12: false,
    // }).format(new Date(ts_int));
    return new Intl.DateTimeFormat("en-GB", {
        timeZone: "UTC",
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(ts_int));
}

export function formatDate(ts) {
    return new Intl.DateTimeFormat("en-GB", {
        timeZone: "UTC",
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(ts * 1000));
}

function datetime_calc_period(datetime_int, min, calc_fn, period) {
    const dt = new Date(datetime_int);
    // const new_dt = new Date(dt.getTime() + parseInt(min) * MS_PER_MINUTE);
    return calc_fn(dt.getTime(), parseInt(min) * period)
    // const new_dt = new Date(calc_fn(dt.getTime(), parseInt(min) * MS_PER_MINUTE));
    // new_dt.getTime()
}

export function datetime_add_minute(datetime_int, min) {
    const add = (a, b) => { return a + b; };
    return datetime_calc_period(datetime_int, min, add, MS_PER_MINUTE);
}

export function datetime_sub_minute(datetime_int, min) {
    const sub = (a,b) => {return a - b;};
    return datetime_calc_period(datetime_int, min, sub, MS_PER_MINUTE);
}

export function datetime_add_day(datetime_int, day) {
    const add = (a, b) => { return a + b; };
    return datetime_calc_period(datetime_int, day, add, MS_PER_DAY);
}

export function datetime_sub_day(datetime_int, day) {
    const sub = (a,b) => {return a - b;};
    return datetime_calc_period(datetime_int, day, sub, MS_PER_DAY);
}

export function input_datetimelocal_to_int(datetimelocal_str, offset_min=0) {
    const dt = new Date(datetimelocal_str);
    const new_dt = (offset_min) ? new Date(dt - offset_min * MS_PER_MINUTE) : (dt);
    return new_dt.getTime();
}

export function input_datetimeutc_to_int(datetimeutc_str) {
    const dt = new Date(datetimeutc_str + "Z");
    return dt.getTime();
}

export function delta_ms_to_str(delta_int) {
    let days = Math.floor(delta_int / MS_PER_DAY);
    days = (days > 0) ? days.toString() + " day/s " : "";
    let time_str = new Date(delta_int).toISOString();
    time_str = time_str.substring(11, time_str.length - 5);
    return days + time_str;
}

export function get_elem_targetkey(target_elem) {
    return get_dataset_value_base(target_elem, DATASET_TARGET);
}

export function get_target_elem_vals(target_val) {
    // const target_val = get_dataset_value_base(target_elem, DATASET_TARGET);
    const val_obj = {};
    const elems = document.querySelectorAll(`[data-${DATASET_TARGET}="${target_val}"]`);
    for (const elem of elems) {
        if (elem.type == ELEMTYPE_BUTTON) { continue; }
        const key = get_dataset_value_base(elem, DATASET_KEY);
        const get_func = (elem.type == ELEMTYPE_SELECT_ONE) ? get_dataset_value_parent : get_dataset_value_base;
        let val = elem.value;
        if (DTLOCAL_TO_TS_ARR.includes(key)) {
            val = input_datetimeutc_to_int(val);
        } else if (TO_INT_ARR.includes(key)) {
            val = parseInt(val);
        }
        val_obj[key] = val;
    }
    return val_obj;
}

export function get_target_elems(target_val) {
    // const target_val = get_dataset_value_base(target_elem, DATASET_TARGET);
    const elem_arr = [];
    const elems = document.querySelectorAll(`[data-${DATASET_TARGET}="${target_val}"]`);
    for (const elem of elems) {
        if (elem.type == ELEMTYPE_BUTTON) { continue; }
        elem_arr.push(elem);
    }
    return elem_arr;
}

export function add_class_by_objs(elem, attrobj_arr) {
    let class_val = "";
    for (const attr_obj of attrobj_arr) {
        if (attr_obj.hasOwnProperty('class')) {
            class_val += attr_obj.class;
        }
    }
    if (class_val) { elem.classList.add(class_val); }
}

export function addorremove_class_updating(elem, to_add) {
    to_add ? elem.classList.add("updating") : elem.classList.remove("updating");
}

export function round_sig_step(x, sig = 2) {
    if (x === 0) return 0;

    const decimals = sig - 1 - Math.floor(Math.log10(Math.abs(x)));
    if (decimals >= 0) {
        return Number(x.toFixed(decimals));
    } else {
        const factor = Math.pow(10, -decimals);
        return Math.round(x / factor) * factor;
    }
}

export function make_ts_int(ts_str) {
    return new Date(ts_str).getTime();
}

export function make_ts_dceil(ts) {
    const dt = new Date(ts);
    return dt.setUTCHours(23, 59, 59, 999);
}

export function make_ts_dfloor(ts) {
    const dt = new Date(ts);
    return dt.setUTCHours(0, 0, 0, 0);
}

export function make_ts_mceil(ts) {
    const dt = new Date(ts);
    return dt.setUTCSeconds(59, 999);
}

export function make_ts_mfloor(ts) {
    const dt = new Date(ts);
    return dt.setUTCSeconds(0, 0);
}
