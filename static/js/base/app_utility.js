import { contractdetails_init_layout } from "../modules/contract_details/app.js";
import { optionchain_init_layout } from "../modules/option_chain/app.js";
import { scenario_init_layout } from "../modules/scenario/app.js";
import { volatility_init_layout } from "../modules/volatility/app.js";
import { get_active_menu_name } from "../sidebar/sidebar_utility.js";
import { init_layout } from "./layout.js";
import { init_navbar } from "./nav_bar.js";
import { get_computed_style_property_value, set_style_property, show_hide_loader } from "./utility.js"

export const MAIN_VIEW = "#main-view";
export const THEME_TOGGLE = "#theme-toggle";
export const TIMEZONE = "timezone";
const TIMEZONE_UTC = "Etc/UTC";

const THEME_VAR = "dark-mode";
export const STYLE_BACKGROUND = "--background";
export const STYLE_BORDER_PRIMARY = "--border-primary";
export const ICON_COLOR = "--icon-color";
const STYLE_BORDER_SECONDARY = "--border-secondary";
const STYLE_BORDER_SECONDARY_HALF = "--border-secondary-half";
const STYLE_BORDER_THIRDLY = "--border-thirdly";
const STYLE_TEXT = "--text";
const STYLE_THEME_COLOR_SECONDARY = "--theme-secondary";
const STYLE_MENU = "--menu";
export const STYLE_LAYOUT_ROW = "--row-layout";
export const STYLE_LAYOUT_COL = "--col-layout";
const STYLE_ROOT_ARR = [STYLE_BACKGROUND, STYLE_BORDER_PRIMARY, STYLE_BORDER_SECONDARY, STYLE_TEXT, STYLE_MENU, STYLE_THEME_COLOR_SECONDARY, STYLE_BORDER_SECONDARY_HALF, STYLE_BORDER_THIRDLY];
export const STYLE_GRIDITEM_MINWIDTH = "--griditem-minwidth";
export const STYLE_GRIDITEM_MINHEIGHT = "--griditem-minheight";
export const CUSTOMEVENT_ONCHANGE_THEME_TOGGLE = "onchange_theme_toggle";
const FULLSCREEN_CLASS = "full-screen";
const OVERLAY_CLASS = "overlay";
export const HTMLSYMBOL_FULLSCREEN = "&#9974;";
export const MENUNAME_OPTIONCHAIN = "option-chain";
export const MENUNAME_CONTRACTDETAILS = "contract-details";
export const MENUNAME_VOLATILITY = "volatility";
export const MENUNAME_SCENARIOANALYSIS = "scenario-analysis";

function get_localstorage(key) {
    return localStorage.getItem(key);
}

function set_localstorage(key, value) {
    localStorage.setItem(key, value);
}

function update_theme_css_helper(prefix, suffix) {
    const root_var = prefix
    const value = get_computed_style_property_value(prefix + "-" + suffix);
    set_style_property(root_var, value);
}

function update_theme_css(dark_mode) {
    const suffix = (dark_mode) ? ("dark") : ("light");
    for (const style_var of STYLE_ROOT_ARR) {
        update_theme_css_helper(style_var, suffix);
    }
}

export function get_theme_isdark() {
    const theme_toggle_elem = document.querySelector(THEME_TOGGLE);
    return theme_toggle_elem.checked;
}

function update_theme(theme_toggle_elem, dark_mode) {
    update_localstorage_darkmode(dark_mode);
    if (dark_mode) {
        theme_toggle_elem.checked = true;
    } else {
        theme_toggle_elem.classList.remove("checked");
    }
    update_theme_css(dark_mode);
}

function onchange_update_theme(event) {
    const theme_toggle_elem = event.target;
    update_theme(theme_toggle_elem, theme_toggle_elem.checked);
    document.dispatchEvent(new CustomEvent(CUSTOMEVENT_ONCHANGE_THEME_TOGGLE));
}

function event_theme_toggle(theme_toggle_elem) {
    theme_toggle_elem.addEventListener("change", onchange_update_theme);
}

function update_localstorage_darkmode(dark_mode) {
    set_localstorage(THEME_VAR, dark_mode);
}

function update_localstorage_timezone(timezone) {
    set_localstorage(TIMEZONE, timezone);
}

export function get_localstorage_darkmode() {
    return get_localstorage(THEME_VAR) == 'true';
}

export function get_localstorage_timezone() {
    return get_localstorage(TIMEZONE);
}

function set_timezone() {
    const current_timezone = get_localstorage_timezone();
    if (current_timezone != TIMEZONE_UTC) { update_localstorage_timezone(TIMEZONE_UTC); }
}

// SET APP INFO
function set_app_info() {
    set_timezone();
}

// INIT APP
function init_theme_toggle() {
    const dark_mode = get_localstorage_darkmode();
    const theme_toggle_elem = document.querySelector(THEME_TOGGLE);
    update_theme(theme_toggle_elem, dark_mode);
    event_theme_toggle(theme_toggle_elem);
}

async function init_basic() {
    init_theme_toggle();
    // init_timezone_select();
}

async function init_app_helper(init_layout_func) {
    show_hide_loader(true);
    set_app_info();
    await init_basic();
    await init_layout_func();
    init_navbar();
    show_hide_loader(false);
}

// to be replaced & remove
export function make_fullscreen(griditem_elem) {
    /**
     * Make section (grid item) fit to full screen (almost)
     *
     * @param { HTML element } griditem_elem: grid item HTML element 
     *
     */
    const is_full = griditem_elem.classList.contains(FULLSCREEN_CLASS);
    const body_elem = document.querySelector("body");
    const main_elem = body_elem.querySelector("div.main");
    if (is_full) {
        body_elem.classList.remove(OVERLAY_CLASS);
        main_elem.style.removeProperty('visibility');
        griditem_elem.classList.remove(FULLSCREEN_CLASS);
    } else {
        body_elem.classList.add(OVERLAY_CLASS);
        main_elem.style.visibility = "hidden";
        griditem_elem.classList.add(FULLSCREEN_CLASS);
    }
}

export function init_app() {
    const menu_name = get_active_menu_name();
    let init_layout_func = null;
    if (menu_name == MENUNAME_OPTIONCHAIN) {
        init_layout_func = optionchain_init_layout;
    } else if (menu_name == MENUNAME_CONTRACTDETAILS) {
        init_layout_func = contractdetails_init_layout;
    } else if (menu_name == MENUNAME_VOLATILITY) {
        init_layout_func = volatility_init_layout;
    } else if (menu_name == MENUNAME_SCENARIOANALYSIS) {
        init_layout_func = scenario_init_layout;
    }
    init_app_helper(init_layout_func);
}