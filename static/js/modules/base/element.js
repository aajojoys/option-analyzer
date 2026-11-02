import { BaseElement, SelectElement } from "../../base/element.js";
import { add_class_by_objs, addorremove_class_updating, ELEMTYPE_BUTTON, ELEMTYPE_SELECT_ONE, fchar_capitalize, format_name, get_target_elem_vals, int_to_timestamp_utc, int_to_timestamp_utc_short, isobject_empty, TIMESTAMP_UNIT_MS, ts_convert_s_and_ms } from "../../base/utility.js";
import { get_control_kwargs } from "./utility.js";

export const ITEMTYPE_HCARD = "hcard";
export const ITEMTYPE_VCARD = "vcard";
export const ITEMTYPE_PLOT = "plot";
export const ITEMTYPE_TABLE = "table";
export const ITEMTYPE_GCARD = "gcard";
export const VCARD_TITLE_VALUE = "TITLE";
const CLS_GRIDTITLE_ITEM = 'grid-title-item';

class GridTitleItem {
    constructor(container, Element, option_arr=[], attr_obj={}, baseelem_type="", extra_param_args=[]) {
        this.styles = this._init_styles(attr_obj);
        return this._init(container, Element, option_arr, baseelem_type, extra_param_args);
    }
    
    _init_styles(attr_obj) {
        const obj = {
            input_attr_obj: {
                class: CLS_GRIDTITLE_ITEM,
                ...attr_obj,
            },
        }
        if (attr_obj.hasOwnProperty('data-key') && !attr_obj.hasOwnProperty('title')) {
            obj['title'] = fchar_capitalize(attr_obj['data-key']);
        }
        return obj;
    }

    _init(container, Element, option_arr, baseelem_type, extra_param_args) {
        const args = [container]
        if (baseelem_type) { args.push(baseelem_type); }
        args.push(this.styles.input_attr_obj);
        if (option_arr) { args.push(option_arr); }
        return new Element(...args, ...extra_param_args);
    }
}

export class ExpirySelect {
    constructor(container, expiry_arr, attr_obj={}, selected_val="") {
        const defaultattr_obj = { title: "Expiry", 'data-name': "expiry" };
        let expiry_obj = {};
        if (expiry_arr && expiry_arr.length) {
            for (const expiry of expiry_arr) {
                expiry_obj[expiry] = int_to_timestamp_utc_short(ts_convert_s_and_ms(expiry, TIMESTAMP_UNIT_MS));
            }
        }
        return new GridTitleItem(container, SelectElement, expiry_obj, {...defaultattr_obj, ...attr_obj}, "", [{}, selected_val]);
    }
    
}

export class OptionTypeSelect {
    constructor(container, option_obj, attr_obj={}) {
        const defaultattr_obj = { title: "Option Type", 'data-name': "option_type" };
        return new GridTitleItem(container, SelectElement, option_obj, {...defaultattr_obj, ...attr_obj});
    }
}

export class PositionSelect {
    constructor(container, option_obj, attr_obj={}) {
        const defaultattr_obj = { title: "Position", 'data-name': "position" };
        return new GridTitleItem(container, SelectElement, option_obj, {...defaultattr_obj, ...attr_obj});
    }
}

export class InputSelect {
    constructor(container, option_obj, attr_obj={}) {
        const defaultattr_obj = { title: "Sensitivity Target", 'data-name': "input" };
        return new GridTitleItem(container, SelectElement, option_obj, {...defaultattr_obj, ...attr_obj});
    }
}

export class LowerRangeInput {
    constructor(container, attr_obj={}) {
        const defaultattr_obj = { title: "Lower Value", 'data-name': "lower", type: "number", step: 0.01 };
        return new GridTitleItem(container, BaseElement, {}, {...defaultattr_obj, ...attr_obj}, "input");
    }
}

export class UpperRangeInput {
    constructor(container, attr_obj={}) {
        const defaultattr_obj = { title: "Upper Value", 'data-name': "upper", type: "number", step: 0.01 };
        return new GridTitleItem(container, BaseElement, {}, {...defaultattr_obj, ...attr_obj}, "input");
    }
}

export class StepRangeInput {
    constructor(container, attr_obj={}) {
        const defaultattr_obj = { title: "Step Range", 'data-name': "step", type: "number", step: 1, min: 1 };
        return new GridTitleItem(container, BaseElement, {}, {...defaultattr_obj, ...attr_obj}, "input");
    }
}

export class OutputSelect {
    constructor(container, option_obj, attr_obj={}) {
        const defaultattr_obj = { title: "Output", 'data-name': "output" };
        return new GridTitleItem(container, SelectElement, option_obj, {...defaultattr_obj, ...attr_obj});
    }
}

export class ContractSelect {
    constructor(container, state_obj, contract_arr) {
        const attr_obj = { title: "Contract", 'data-name': "contract_symbol" };
        return new GridTitleItem(container, SelectElement, state_obj, attr_obj, contract_arr);
    }
}

export class ApplyButton {
    constructor(container, attr_obj={}) {
        const defaultattr_obj = { title: "Step Range", 'data-name': "step", type: "button" };
        const apply_elem = new GridTitleItem(container, BaseElement, {}, {...defaultattr_obj, ...attr_obj}, "input");
        apply_elem.classList.add("flex-row-alignself-flexend");
        return apply_elem;
    }
}

export class GridTitle {
    constructor(container) {
        this.styles = this._init_styles();
        return this._init(container);
    }
    
    _init_styles() {
        return {
            outdiv_attr_obj: {
                class: "grid-title",
            }
        }
    }

    _init(container) {
        const outerdiv_elem = new BaseElement(container, "div", this.styles.outdiv_attr_obj);
        return outerdiv_elem;
    }
}

export class VCard {
    constructor(container, res_obj={}, divider_pos_arr=[], title_pos_obj={}, attr_pos_obj={}, input_pos_obj={}, funcattr_pos_obj={}) {
        this.styles = this._init_styles();
        return this._init(container, res_obj, divider_pos_arr, title_pos_obj, attr_pos_obj, input_pos_obj, funcattr_pos_obj);

    }

    _init_styles() {
        return {
            ul_attr_obj: {
                class: "vcard-ul hide-list-point",
            }, li_attr_obj: {
                class: "vcard-li",
            }, span_attr_obj: {
                class: "vcard-li-item",
            }, divider_attr_obj: {
                class: "vcard-li-divider",
            }, title_attr_obj: {
                class: "vcard-li-title",
            }, itemtitle_attr_obj: {
                class: "vcard-li-item vcard-li-item-title",
            }
        }
    }

    _init(container, res_obj, divider_pos_arr, title_pos_obj, attr_pos_obj, input_pos_obj, funcattr_pos_obj) {
        if (!res_obj || !Object.keys(res_obj).length) { return; }
        const ul_elem = new BaseElement(container, "ul", this.styles.ul_attr_obj);
        const keys = Object.keys(res_obj);
        const title_pos_keys = Object.keys(title_pos_obj);
        for (let i=0; i < keys.length; i++) {
            const key = keys[i];
            let val = res_obj[key];
            let li_elem = null;
            if (val == VCARD_TITLE_VALUE) {
                const title_elem = new BaseElement(ul_elem, "li", {...this.styles.title_attr_obj, innerHTML: key});
                title_elem.classList.add(this.styles.divider_attr_obj['class']);
                continue;
            } else {
                li_elem = new BaseElement(ul_elem, "li", this.styles.li_attr_obj);
                const span_key_elem = new BaseElement(li_elem, "span", {...this.styles.itemtitle_attr_obj, innerHTML: key});
                let extra_attr_obj = {};
                if (attr_pos_obj && attr_pos_obj.hasOwnProperty(i)) { extra_attr_obj = attr_pos_obj[i]; }
                if (Array.isArray(val)) {
                    li_elem.classList.add("vcard-li-grid")
                    for (let cval of val) {
                        if (funcattr_pos_obj && funcattr_pos_obj.hasOwnProperty(i)) {
                            extra_attr_obj = { ...extra_attr_obj, ...funcattr_pos_obj[i](key, cval) }
                        }
                        let val_elem = null;
                        if (input_pos_obj && input_pos_obj.hasOwnProperty(i)) {
                            if (input_pos_obj[i].type == ELEMTYPE_SELECT_ONE) {
                                val_elem = new SelectElement(li_elem, {...this.styles.span_attr_obj, ...extra_attr_obj, ...input_pos_obj[i].attr_obj }, input_pos_obj[i].options, {}, "", []);
                            } else {
                                if (input_pos_obj[i].type == "number") { cval = parseFloat(cval); }
                                val_elem = new BaseElement(li_elem, "input", { type: input_pos_obj[i].type, ...this.styles.span_attr_obj, ...extra_attr_obj, value: cval, ...input_pos_obj[i].attr_obj})
                            }
                            add_class_by_objs(val_elem, [this.styles.span_attr_obj, extra_attr_obj, input_pos_obj[i].attr_obj])
                        } else {
                            const span_val_elem = new BaseElement(li_elem, "span", {...this.styles.span_attr_obj, ...extra_attr_obj, innerHTML: cval});
                            add_class_by_objs(span_val_elem, [this.styles.span_attr_obj, extra_attr_obj]);
                        }
                    }

                } else {
                    if (funcattr_pos_obj && funcattr_pos_obj.hasOwnProperty(i)) {
                        extra_attr_obj = { ...extra_attr_obj, ...funcattr_pos_obj[i](key, val) }
                    }
                    let val_elem = null;
                    if (input_pos_obj && input_pos_obj.hasOwnProperty(i)) {
                        if (input_pos_obj[i].type == ELEMTYPE_SELECT_ONE) {
                            val_elem = new SelectElement(li_elem, {...this.styles.span_attr_obj, ...extra_attr_obj, ...input_pos_obj[i].attr_obj }, input_pos_obj[i].options, {}, "", []);
                        } else {
                            if (input_pos_obj[i].type == "number") { val = parseFloat(val); }
                            val_elem = new BaseElement(li_elem, "input", { type: input_pos_obj[i].type, ...this.styles.span_attr_obj, ...extra_attr_obj, value: val, ...input_pos_obj[i].attr_obj})
                        }
                        add_class_by_objs(val_elem, [this.styles.span_attr_obj, extra_attr_obj, input_pos_obj[i].attr_obj])
                    } else {
                        const span_val_elem = new BaseElement(li_elem, "span", {...this.styles.span_attr_obj, ...extra_attr_obj, innerHTML: val});
                        add_class_by_objs(span_val_elem, [this.styles.span_attr_obj, extra_attr_obj]);
                    }
                }
            }
            if (divider_pos_arr.includes(i)) { li_elem.classList.add(this.styles.divider_attr_obj['class']); }
            if (title_pos_keys.includes(i)) {
                const title_elem = new BaseElement(ul_elem, "li", {...this.styles.title_attr_obj, innerHTML: title_pos_obj[i]});
            }
        }
        return ul_elem;
    }
}

export class HCard {
    constructor(container, res_obj, divider_pos_arr=[]) {
        this.styles = this._init_styles();
        return this._init(container, res_obj, divider_pos_arr);
    }

    _init_styles() {
        return {
            outdiv_attr_obj: {
                class: "hcard-div",
            }, div_attr_obj: {
                class: "hcard-div-item",
            }, label_attr_obj: {
                class: "hcard-div-item-label",
            }, value_attr_obj: {
                class: "hcard-div-item-value",
            }, divider_attr_obj: {
                class: "hcard-div-item-divider",
            }
        }
    }
    
    _init(container, res_obj, divider_pos_arr) {
        const outdiv_elem = new BaseElement(container, "div", this.styles.outdiv_attr_obj);
        const keys = Object.keys(res_obj)
        for (let i=0; i < keys.length; i++) {
            const key = keys[i];
            const val = res_obj[key];
            const div_elem = new BaseElement(outdiv_elem, "div", { ...this.styles.div_attr_obj, });
            if (divider_pos_arr.includes(i)) { div_elem.classList.add(this.styles.divider_attr_obj['class']); }
            const label_elem = new BaseElement(div_elem, "div", {...this.styles.label_attr_obj, innerHTML: key});
            const value_elem = new BaseElement(div_elem, "div", {...this.styles.value_attr_obj, innerHTML: val});
            if (typeof val == 'string') {
                if (val[0] == "-") {
                    value_elem.classList.add("negative");
                } else if (val[0] == "+") {
                    value_elem.classList.add("positive");
                }
            }  
        }
    }
}

export class AGTable {
    constructor(container, res_obj, kwargs, colname_obj={}, structure_obj={}, attr_obj={}, tattr_obj={}) {
        this.styles = this._init_styles();
        this.kwargs = kwargs;
        return this._init(container, res_obj, colname_obj, structure_obj, attr_obj, tattr_obj);
    }

    _init_styles() {
        return {
            default_option: {
                sortable: true,
                resizable: true,
                editable: false,
                flex: 1,
                filter: false,
                enableRowGroup: false,
                enablePivot: false,
                enableValue: false,
            },
            theme_option: {
                theme: agGrid.themeBalham,
            },
            other_option: {
                autoSizeStrategy: {
                    type: 'fitCellContents',
                },
            }
        }
    }

    _get_rowdata(res_obj) {
        return res_obj;
    }
    
    _get_coldata(res_obj, colname_obj, structure_obj, attr_obj, tattr_obj) {
    /*
        colname_obj { Object }: consists of key of field name (database) to value (str) of display column name (BaseField)
        structure_obj { Object }: (nested implementation: title of title) consists of key of top-level name to value (array) of field names;
        attr_obj { Object }: consists of key of field name to value (str) of class attr (concatenate if multiple exists)
        tattr_obj { Object }: consists of key of field name to value (obj) of table specific attribute e.g. {pinned: "left", type: "numericColumn"}
    */
        const config = [];
        const has_colname = !isobject_empty(colname_obj);
        const has_structure = !isobject_empty(structure_obj);
        const has_attr = !isobject_empty(attr_obj);
        const has_tattr = !isobject_empty(tattr_obj);
        if (has_structure) {
            for (const [key, ckeys] of Object.entries(structure_obj)) {
                let curr_obj = { headerName: key };
                if (has_tattr && (key in tattr_obj)) { curr_obj = {...curr_obj,...tattr_obj[key]}; }
                if (has_attr && (key in attr_obj)) { curr_obj['headerClass'] = attr_obj[key]; }
                curr_obj['children'] = [];
                for (const name of ckeys) {
                    let curr_cobj = { field: name };
                    if (has_tattr && (name in tattr_obj)) { curr_cobj = {...curr_cobj,...tattr_obj[name]}; }
                    if (has_colname && (name in colname_obj)) { curr_cobj['headerName'] = colname_obj[name]; }
                    if (has_attr && (name in attr_obj)) { curr_cobj['cellClass'] = attr_obj[name]; }
                    curr_obj['children'].push(curr_cobj);
                }
                config.push(curr_obj);
            }
        } else {
            const field_keys = Object.keys(res_obj[0]) // res_obj in this case is array
            for (const key of field_keys) {
                let curr_obj = { field: key };
                if (has_tattr && (key in tattr_obj)) { curr_obj = {...curr_obj,...tattr_obj[key]}; }
                if (has_attr && (key in attr_obj)) { curr_obj['cellClass'] = attr_obj[key]; }
                if (has_colname && (key in colname_obj)) { curr_obj['headerName'] = colname_obj[key]; }
                config.push(curr_obj);
            }
        }
        return config;
    }

    _init_options(res_obj, colname_obj, structure_obj, attr_obj, tattr_obj) {
        return {
            ...this.styles.theme_option,
            rowData: this._get_rowdata(res_obj),
            columnDefs: this._get_coldata(res_obj, colname_obj, structure_obj, attr_obj, tattr_obj),
            ...this.styles.default_option,
            ...this.styles.other_option,
        }
    }

    _init(container, res_obj, colname_obj, structure_obj, attr_obj, tattr_obj) {
        container.classList.add("ag-table");
        const options = this._init_options(res_obj, colname_obj, structure_obj, attr_obj, tattr_obj);
        const gapi = agGrid.createGrid(container, options);
        this.kwargs.aggrid_map.set(this.kwargs.target_val, gapi);
        // gapi.sizeColumnsToFit();
        gapi.autoSizeAllColumns();
    }
}

export class GaugeItem {
    constructor(container, greek_val, option_obj) {
        this.styles = this._init_styles();
        this.tick_title_obj = {
            '-1': "Negative One",
            '0': "Zero",
            '1': "Positive One",
            '+∞': "Positive Infinity",
            '-∞': "Negative Infinity",
        }
        this._init(container, greek_val, option_obj)
    }

    _init_styles() {
        return {
            gauge_attr_obj: {
                class: "gauge-div",
            }, track_attr_obj: {
                class: "gauge-div-track",
            }, marker_attr_obj: {
                class: "gauge-div-marker",
            }, tick_attr_obj: {
                class: "gauge-div-tick",
            }, span_attr_obj: {
            }
        }
    }

    _calc_percent(greek_val, option_obj) {
        const formatted_gval = (typeof greek_val == "number") ? greek_val : parseFloat(greek_val);
        let percent = 0;
        if (formatted_gval <= option_obj.min) {
            percent = 0;
        } else if (formatted_gval >= option_obj.max) {
            percent = 1
        } else {
            percent = (formatted_gval - option_obj.min) / (option_obj.max + Math.abs(option_obj.min));
        }
        return percent * 100
    }

    _init(container, greek_val, option_obj) {
        const div_elem = new BaseElement(container, "div", this.styles.gauge_attr_obj);
        const track_elem = new BaseElement(div_elem, "div", this.styles.track_attr_obj);
        const marker_elem = new BaseElement(track_elem, "div", this.styles.marker_attr_obj);
        const greek_pct = this._calc_percent(greek_val, option_obj);
        marker_elem.style.left = `${greek_pct}%`;
        const tick_elem = new BaseElement(div_elem, "div", this.styles.tick_attr_obj);
        for (let i=-0; i<option_obj.arr.length; i++) {
            const span_elem = new BaseElement(tick_elem, "span", { ...this.styles.span_attr_obj, innerHTML: option_obj.arr[i], title: this.tick_title_obj[option_obj.arr[i]] });
        }
    }
}

export class GreekCard {
    constructor(container, res_obj) {
        this.styles = this._init_styles();
        return this._init(container, res_obj);
    }

    _init_greek_gauge_option(greek_key) {
        const option_obj = {
            del: {min: -1, mid: 0, max: 1, arr: ['-1', '0', '1'] },
            gam: {min: 0, mid: 0.01, max: 0.02, arr: ['0', '+∞'] },
            the: {min: -500, mid: 0, max: 500, arr: ['-∞', '0', '+∞'] },
            veg: {min: 0, mid: 250, max: 500, arr: ['0', '+∞'] },
            rho: {min: -100, mid: 0, max: 100, arr: ['-∞', '0', '+∞'] },
        }
        return option_obj[greek_key];
    }

    _init_styles() {
        return {
            outdiv_attr_obj: {
                class: "gcard-div",
            }, div_attr_obj: {
                class: "gcard-div-item",
            }, label_attr_obj: {
                class: "gcard-div-item-label",
            }, content_attr_obj: {
                class: "gcard-div-item-content",
            }, value_attr_obj: {
                class: "gcard-div-item-content-value",
            }, gauge_attr_obj: {
                class: "gcard-div-item-content-gauge",
            }, description_attr_obj: {
                class: "gcard-div-item-content-description",
            }, divider_attr_obj: {
                class: "gcard-div-item-divider",
            }
        }
    }
    
    _init(container, res_obj) {
        const outdiv_elem = new BaseElement(container, "div", this.styles.outdiv_attr_obj);
        const keys = Object.keys(res_obj)
        for (let i=0; i < keys.length; i++) {
            const key = keys[i];
            const option_obj = this._init_greek_gauge_option(key.slice(0,3).toLowerCase());
            const val = res_obj[key];
            const div_elem = new BaseElement(outdiv_elem, "div", { ...this.styles.div_attr_obj, });
            const label_elem = new BaseElement(div_elem, "div", {...this.styles.label_attr_obj, innerHTML: key});
            const content_elem = new BaseElement(div_elem, "div", this.styles.content_attr_obj);
            const value_elem = new BaseElement(content_elem, "div", {...this.styles.value_attr_obj, innerHTML: val});
            const formatted_val = (typeof val == "number") ? greek_val : parseFloat(val);
            if (formatted_val < 0) {
                value_elem.classList.add("negative");
            } else if (formatted_val > 0) {
                value_elem.classList.add("positive");
            }
            const gauge_elem = new GaugeItem(content_elem, val, option_obj);
            content_elem.classList.add(this.styles.divider_attr_obj['class']);
        }
    }
}

export class GridContainer {
    constructor(container, attr_obj) {
        this.styles = this._init_styles();
        return this._init(container, attr_obj);
    }
    
    _init_styles() {
        return {
            outdiv_attr_obj: {
                class: "grid-container",
            }
        }
    }

    _init(container, attr_obj) {
        const outerdiv_elem = new BaseElement(container, "div", {...this.styles.outdiv_attr_obj, ...attr_obj});
        return outerdiv_elem;
    }
}

export class GridItem {
    constructor() {
        this.styles = this._init_styles();
        return this._init();
    }

    _init_styles() {
        const style_variables = {
            outerdiv_attr_obj: {
                class: "grid-item",
            },
        }
        return style_variables;
    }

    _init() {
        const outerdiv_elem = new BaseElement(null, "div", this.styles.outerdiv_attr_obj);
        return outerdiv_elem;
    }
}

export class MyGridItem {
    constructor(res_data, kwargs={}) {
        // this.state_obj = state_obj;
        this.kwargs = kwargs;
        this.target_val = this.kwargs.key;
        return this._init(res_data);
    }

    _clear_container() {
        this.gridcontainer_elem.remove();
    }

    _init_titleelem() {
        for (const obj of this.kwargs.titleelem_arr) {
            const elem = new obj.Elem(this.gridtitle_elem, ...obj.args);
            if (!obj.no_default_event) {
                let event_type = "change";
                if (elem.type == ELEMTYPE_BUTTON) {
                    event_type = "click";
                }
                elem.addEventListener(event_type, this._onevent_title_elem.bind(this));
            }
            if (obj.hasOwnProperty('event_kwargs') && !isobject_empty(obj.event_kwargs)) {
                elem.addEventListener(obj.event_kwargs.type, obj.event_kwargs.func.bind(null, elem));
                if (obj.event_kwargs.to_init) { obj.event_kwargs.func(elem); }
            } 
        }
    }

    _init(res_data) {
        this.griditem_elem = new GridItem();
        if (this.kwargs.titleelem_arr && this.kwargs.titleelem_arr.length) {
            this.gridtitle_elem = new GridTitle(this.griditem_elem);
            this._init_titleelem();
        }
        this._init_container(res_data);
        if (this.kwargs.hasOwnProperty('custom_eventtype')) {
            document.addEventListener(this.kwargs.custom_eventtype, this._onevent_title_elem.bind(this))
        }
        return this.griditem_elem;
    }

    async _init_container(res_data=null) {
        this.gridcontainer_elem = new GridContainer(this.griditem_elem, { 'data-name': this.target_val });
        if (this.gridtitle_elem) { this.gridcontainer_elem.style.height = "89%"; }
        let control_obj = {};
        if (!res_data) {
            control_obj = get_control_kwargs(this.target_val);
            res_data = await this.kwargs.api_func(control_obj);
        }
        if (!isobject_empty(control_obj) && this.kwargs.hasOwnProperty('extra_elem_kwargs_func')) {
            this.kwargs.extra_elem_kwargs = this.kwargs.extra_elem_kwargs_func(control_obj, res_data);
        }
        const elem = new this.kwargs.element(this.gridcontainer_elem, res_data, ...this.kwargs.extra_elem_kwargs)
        addorremove_class_updating(this.griditem_elem, false);
        return elem;
    }

    async _onevent_title_elem(event) {
        if (this.kwargs.hasOwnProperty('custom_func')) {
            const control_obj = get_control_kwargs(this.target_val);
            this.kwargs.custom_func(control_obj);
        } else {
            this._clear_container();
            let res_data = null;
            if (this.kwargs.hasOwnProperty("custom_eventtype") && ("detail" in event)) {
                res_data = event.detail;
                if (this.kwargs.hasOwnProperty('detail_key')) {
                    res_data = res_data[this.kwargs['detail_key']];
                }
            }
            await this._init_container(res_data);
        }
    }
}
