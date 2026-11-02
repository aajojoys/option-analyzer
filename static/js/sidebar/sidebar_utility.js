import { get_client_element, show_elem, hide_elem, get_dataset_value_base, DATASET_NAME } from "../base/utility.js";
import { BaseElement } from "../base/element.js";

export const COLLAPSE = "collapse";
export const SIDEBAR = "#sidebar"
export const SIDEBAR_WINDOW = "#sidebar-window";
export const SIDEBAR_CHAIN = "#sidebar-a-chain";
export const SIDEBAR_CONTRACT = "#sidebar-a-contract";
export const SIDEBAR_VOLATILITY = "#sidebar-a-volatility";
export const SIDEBAR_SCENARIO = "#sidebar-a-scenario";
const CSS_SIDEBAR_LINK = ".sidebar-link";
const CSS_ACTIVE = ".active";

class WindowItemTitle {
    constructor(container, menu) {
        this.styles = this._init_styles(menu);
        return this._init(container);
    }

    _init_styles(menu) {
        return {
            div_attr_obj: {
                class: "sidebar-window-title",
            },
            span_attr_obj: {
                class: "sidebar-window-title-name",
                innerHTML: menu,
            }
        }
    }

    _init(container) {
        const div_elem = new BaseElement(container, "div", this.styles.div_attr_obj);
        const span_elem = new BaseElement(div_elem, "span", this.styles.span_attr_obj);
        return div_elem
    }
}

class WindowItemContainer {
    constructor(container) {
        this.styles = this._init_styles();
        return this._init(container);
    }

    _init_styles() {
        return {
            div_attr_obj: {
                class: "sidebar-window-container",
            },
        }
    }

    _init(container) {
        return new BaseElement(container, "div", this.styles.div_attr_obj);
    }
}

export class WindowItem {
    constructor(window_title, height, empty_msg=null) {
        this.styles = this._init_styles(height);
        return empty_msg ? this._init_empty(window_title, empty_msg) : this._init(window_title);
    }

    _init_styles(height) {
        return {
            div_attr_obj: {
                style: `height: ${height}`,
                class: "sidebar-window-item",
            },
        }
    }

    _init(window_title) {
        const container = get_client_element(SIDEBAR_WINDOW);
        const window_item_elem = new BaseElement(container, "div", this.styles.div_attr_obj);
        const window_title_elem = new WindowItemTitle(window_item_elem, window_title);
        const window_container_elem = new WindowItemContainer(window_item_elem);
        return window_item_elem;
    }
    
    _init_empty(window_title, msg) {
        const container = get_client_element(SIDEBAR_WINDOW);
        const window_item_elem = new BaseElement(container, "div", this.styles.div_attr_obj);
        const window_title_elem = new WindowItemTitle(window_item_elem, window_title);
        const window_container_elem = new WindowItemContainer(window_item_elem);
        window_container_elem.classList.add("div-center-content");
        const span_elem = new BaseElement(window_container_elem, "span", {innerHTML: msg});
    }
}

function get_active_menu_elem() {
    return get_client_element(`${CSS_SIDEBAR_LINK}${CSS_ACTIVE}`);
}

export function get_active_menu_name() {
    const elem = get_active_menu_elem();
    return (elem) ? get_dataset_value_base(elem, DATASET_NAME) : "";
}

function toggle_sidebar_view() {
    const sidebar_elem = get_client_element(SIDEBAR);
    sidebar_elem.classList.toggle(COLLAPSE)
    const sidebar_window_elem = get_client_element(SIDEBAR_WINDOW);
    const is_collapse = sidebar_elem.classList.contains(COLLAPSE);
    is_collapse ? hide_elem(sidebar_window_elem) : show_elem(sidebar_window_elem);
}

export function onclick_sidebar_menu(curr_active_menu, no_toggle) {
    const prev_active_menu = get_active_menu();
    if (prev_active_menu) { prev_active_menu.classList.remove(CSS_ACTIVE.slice(1)); } 
    if (prev_active_menu != curr_active_menu) {
        curr_active_menu.classList.add(CSS_ACTIVE.slice(1));
        // create WindowItem
        if (prev_active_menu) { return; }
    } else if (prev_active_menu && (prev_active_menu == curr_active_menu) && no_toggle) {
        curr_active_menu.classList.add(CSS_ACTIVE.slice(1));
        return;
    }
    toggle_sidebar_view();
}

function event_sidebar_menu(menu) {
    const a_elem = get_client_element(menu);
    a_elem.addEventListener("click", onclick_sidebar_menu.bind(null, a_elem, false), false);
}

export function event_sidebar_toggle_view() {
    const toggle_menu = [SIDEBAR_DETAILS, SIDEBAR_SPOT, SIDEBAR_NEWS, SIDEBAR_ALERT, SIDEBAR_NOTIFICATION];
    toggle_menu.forEach(menu => { event_sidebar_menu(menu) })
}

export function sidebar_clear_window() {
    const sidebar_window_elem = get_client_element(SIDEBAR_WINDOW);
    sidebar_window_elem.innerHTML = "";
}
