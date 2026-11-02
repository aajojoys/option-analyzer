import { get_client_element, get_dataset_value_base, istype_array, istype_object, set_style_property, show_hide_elem } from "./utility.js";

export const MODELNAME_INNERTEXT_OBJ = { pretext: "model", connector: " - ", posttext: "name", extratext: "" };
export const MODELPKNAME_INNERTEXT_OBJ = { pretext: "model", connector: " - ", posttext: "pk", extratext: "name" };
export const NAME_INNERTEXT_OBJ = { pretext: "", connector: " - ", posttext: "name", extratext: "" };
export const MODELNAMEOUTPUT_INNERTEXT_OBJ = { pretext: "model", connector: " - ", posttext: "name", extratext: "output" };
export const PKNAME_INNERTEXT_OBJ = { pretext: "pk", connector: " - ", posttext: "name", extratext: "" };
export const HINT_SYMBOL = "&#x24d8;";
export const CLOSE_SYMBOL = "&#10005";

export class BaseElement {
    constructor(container, elem, attr_obj) {
        this.container = container;
        this.elem = elem;
        this.attr_obj = attr_obj;
        return this._init();
    }

    _init() {
        const elem_obj = document.createElement(this.elem);
        for (const [attr_key, attr_val] of Object.entries(this.attr_obj)) {
            if (attr_key == 'innerHTML') {
                elem_obj.innerHTML += attr_val;
            } else {
                elem_obj.setAttribute(attr_key, attr_val);
            }
        }
        if (this.container != null) { this.container.appendChild(elem_obj); }
        return elem_obj;
    }
}

function selectelement_addoption_helper(container, option_vals, option_attr_obj, selected_option) {
    /**
     * Helper function for SelectElement to create option elements when empty dataset is given
     *
     * @param { HTML element } container: container of option elements
     * @param { Array } option_vals: array of option values
     * @param { Object } option_attr_obj: object containing attribute of option element
     * @param { String or Array } selected_option: value to be set as selected among option elements in string or array (multiple select)
     *
     **/
    const isarray_optionvals = Array.isArray(option_vals);
    for (const ind in option_vals) {
        const option_val_obj = {
            value: isarray_optionvals ? (option_vals[ind]) : (ind), // if option_vals is array -> ind is index (array); otherwise ind is key of object
            innerHTML: option_vals[ind],
        }
        // use type condition '===' for strict comparison (e.g. 0 == "" -> true; 0 === "" -> false)
        // if ((option_val_obj.value === selected_option) || (Array.isArray(selected_option) && (selected_option.includes(option_val_obj.value)))) { option_val_obj['selected'] = true; }
        let bool_selected = option_val_obj.value === selected_option
        if (!bool_selected && option_val_obj.value && selected_option) { bool_selected = option_val_obj.value.toString() === selected_option.toString() }
        if (!bool_selected && Array.isArray(selected_option)) { bool_selected = selected_option.includes(option_val_obj.value) }
        if (bool_selected) { option_val_obj['selected'] = true; }
        const option_obj = new BaseElement(container, "option", {...option_val_obj, ...option_attr_obj});
    }
}

function set_selected_option_helper(is_pk, option_value, selected_value) {
    /**
     * Compare selected option by given value
     * Convert to String before comparison if is_pk=true
     *
     * Return { boolean }: true if value is equal; false otherwise
     *
     * @param { boolean } is_pk: determine if given value is pk (primary key) to convert to String for comparison (server format: int; frontend format: String)
     * @param { int or String or float or Object } option_value: value of HTML option
     * @param { int or String or float or Object } selected_value: selected value
     *
     */
    return is_pk ? (String(selected_value) == String(option_value)) : (selected_value == option_value);
}

function set_selected_option(multi_comp_key, select_comp_key, option_val, selected_val) {
    /**
     * Compare selected option by given info
     *
     * Return { boolean }: true if value is equal; false otherwise
     *
     * @param { boolean } multi_comp_key: true to compare multiple keys e.g. model, pk
     * @param { String } select_comp_key: key/s in STring (multiple keys are joined with comma (,))
     * @param { int or String or float or Object } option_value: value of HTML option
     * @param { int or String or float or Object } selected_value: selected value
     *
     */
    //if selected_val is an object assuming option_val to be object as well to compare with object key pk
    let object_comp = false;
    if (multi_comp_key) {
        const keys = select_comp_key.split(',');
        object_comp = true; // object's key logical comparison boolean
        for (const key of keys) {
            const is_pk = key == "pk";
            object_comp &= set_selected_option_helper(is_pk, option_val[key], selected_val[key]);
        }
    } else {
        const is_pk = select_comp_key == "pk";
        object_comp = set_selected_option_helper(is_pk, option_val[select_comp_key], selected_val[select_comp_key]);
    }
    return object_comp
}

export function add_options(container, option_vals, option_attr_obj={}, selected_val=null, dataset=['model', 'pk', 'name'], innertext_obj=NAME_INNERTEXT_OBJ, select_comp_key="pk", multi_comp_key=false) {
    /**
     * Return { None }: Add html 'option' element with given information (arguments) into select element (container)
     *
     * @param { HTML_element } container: Contains HTML select element as parent container of option creation 
     * @param { array or array_of_object or object } option_vals: Contains values for options
     * @param { object } option_attr_obj: Contains element styles which will be broadcast to all option element
     * @param { string or number or object } selected_val: Contains value to make respective option as selected (could be in the form of object contains more than one key to be compared as selected with parameter 'select_comp_key' & 'multi_comp_key')
     * @param { array } dataset: Contains key values to be set in dataset (data-[key]) and assuming option_vals' item to be passed in the form of object for value extracting by key
     * @param { object } innertext_obj: Contains structure of innertext/ innerHTML (supplemented by variables 'NAME_INNERTEXT_OBJ' & 'MODELNAME_INNERTEXT_OBJ')
     * @param { string } select_comp_key: Contains string value of key value to identify as selected option (assuming 'option_vals' item & 'selected_val' passed in the form of object)
     * @param { boolean } multi_comp_key: Determine if there are more than one comparing key to set as selected option 
     *
     * if option_vals are array of values (not array of object): dataset can be passed as [] & innertext_obj can be passed as {}
     */
    if ((option_vals instanceof Object) && (!Array.isArray(option_vals))) {
        for (const key of Object.keys(option_vals)) {
            const option_val_obj = {
                'value': key,
                'innerHTML': option_vals[key],
            };
            if (selected_val == key) {
                option_val_obj.selected = true;
            }
            const option_elem = new BaseElement(container, "option", { ...option_val_obj, ...option_attr_obj });
        }
    } else {
        const innertext_hasobj = Object.keys(innertext_obj).length > 0
        for (const option_val of option_vals) {
            let innertext = option_val;
            // if innertext_hasobj == true -> generate innertext from given structure in 'innertext_obj'
            if (innertext_hasobj) {
                innertext = ((innertext_obj.pretext.length) ? option_val[innertext_obj.pretext] : "") + ((innertext_obj.pretext.length && innertext_obj.posttext.length && option_val[innertext_obj.pretext]) ? innertext_obj.connector : "") + ((option_val[innertext_obj.posttext]) + ((innertext_obj.hasOwnProperty('extratext') && innertext_obj['extratext'] && option_val.hasOwnProperty(innertext_obj.extratext) && option_val[innertext_obj.extratext]) ? (' - ' + option_val[innertext_obj.extratext]) : ''));
            }
            const option_val_obj = {
                'innerHTML': innertext,
                'value': innertext,
            };
            for (const key of dataset) { option_val_obj[`data-${key}`] = option_val.hasOwnProperty(key) ? option_val[key] : ''; }
            let object_comp = false;
            if ((istype_object(selected_val)) && (!istype_array(option_val))) { 
                object_comp = set_selected_option(multi_comp_key, select_comp_key, option_val, selected_val);
            } else if ((istype_array(selected_val)) && (!istype_array(option_val))) {
                for (const selected_option of selected_val) {
                    object_comp = set_selected_option(multi_comp_key, select_comp_key, option_val, selected_option);
                    if (object_comp) { break; }
                }
            }
            // condition 'selected_val' && ('selected_val' == 'option_val') for case when selected_val is just value (not in the form of object)
            // or object_comp == true when 'selected_val' is an object & logical compare check out
            if ((selected_val && (selected_val == option_val)) || object_comp) { option_val_obj['selected'] = true; }
            const option_obj = new BaseElement(container, "option", {...option_val_obj, ...option_attr_obj});
        }
    }
}

export function add_optgroup_options(container, option_vals, option_attr_obj={}, selected_val=null, dataset=['model', 'pk', 'name'], innertext_obj=NAME_INNERTEXT_OBJ, select_comp_key="pk", multi_comp_key=false) {
    /**
     * Return { null }
     * add element 'optgroup' & element 'option' under optgroup element
     *
     * @param { HTML element } container: select element that holds optgroup element
     * @param { object or array } option_vals: Object or Array containing option value or corresponding optgroup value if exists
     * @param { object } option_attr_obj: object containing option attributes
     * @param { object or string } selected_val: select value as default
     * @param { array } dataset: array containing dataset key
     * @param { object } innertext_obj: object containing title format
     * @param { string } select_comp_key: string containg comparing key for option value
     * @param { bool } multi_comp_key: determine if there are multiple comparing key 
     *
     */
    if ((option_vals instanceof Object) && (!Array.isArray(option_vals))) {
        for (const label in option_vals) {
            const optgroup_elem = new BaseElement(container, "optgroup", { label: label });
            add_options(optgroup_elem, option_vals[label], option_attr_obj, selected_val, dataset, innertext_obj, select_comp_key, multi_comp_key);

        }
    } else {
        add_options(container, option_vals, option_attr_obj, selected_val, dataset, innertext_obj, select_comp_key, multi_comp_key);
    }
}

function init_selectelement_options(container, label_option_vals, option_attr_obj, selected_option, dataset, innertext_obj, select_comp_key, multi_comp_key) {
    /**
     * Return { null }
     * Helper function to add option element for refactoring purpose
     *
     * @param { HTML element } container: select element or optgroup element
     * @param { array } label_option_vals: array containing option value of current label
     * @param { object } option_attr_obj: object containing option attribute
     * @param { string or object } selected_option: object or string containing selected value
     * @param { array } dataset: array containing dataset key
     * @param { object } innertext_obj: object containing title format
     * @param { string } select_comp_key: string containg comparing key for option value
     * @param { bool } multi_comp_key: determine if there are multiple comparing key 
     *
     */
    if (dataset.length) {
        add_options(container, label_option_vals, option_attr_obj, selected_option, dataset, innertext_obj, select_comp_key, multi_comp_key);
    } else {
        selectelement_addoption_helper(container, label_option_vals, option_attr_obj, selected_option);
    }
}

export class SelectElement {
    constructor(container, select_attr_obj, option_vals, option_attr_obj={}, selected_option="", dataset=[], innertext_obj=NAME_INNERTEXT_OBJ, select_comp_key="pk", include_optgroup=false, multi_comp_key=false) {
        return this._init(container, select_attr_obj, option_vals, option_attr_obj, selected_option, dataset, innertext_obj, select_comp_key, include_optgroup, multi_comp_key);
    }

    _init(container, select_attr_obj, option_vals, option_attr_obj, selected_option, dataset, innertext_obj, select_comp_key, include_optgroup, multi_comp_key) {
        const select_elem = new BaseElement(container, "select", select_attr_obj);
        if (include_optgroup && (option_vals instanceof Object) && (!Array.isArray(option_vals))) {
            for (const label in option_vals) {
                const optgroup_elem = new BaseElement(select_elem, "optgroup", {"label": label});
                init_selectelement_options(optgroup_elem, option_vals[label], option_attr_obj, selected_option, dataset, innertext_obj, select_comp_key, multi_comp_key);
            }
        } else {
            init_selectelement_options(select_elem, option_vals, option_attr_obj, selected_option, dataset, innertext_obj, select_comp_key, multi_comp_key);
        }
        return select_elem;
    }
}

export class LabelInputElement {
    constructor(container, label_attr_obj, input_attr_obj, div_attr_obj) {
        this.container = container;
        this.label_attr_obj = label_attr_obj;
        this.input_attr_obj = input_attr_obj;
        this.div_attr_obj = div_attr_obj;
        return this._init();
    }

    _init() {
        const label_obj = new BaseElement(this.container, "label", this.label_attr_obj);
        const div_obj = new BaseElement(this.container, "div", this.div_attr_obj);
        const input_obj = new BaseElement(div_obj, "input", this.input_attr_obj);
        return input_obj;
    }
}

export class HiddenInputElement {
    constructor(container, input_val_obj) {
        this.container = container;
        this.input_val_obj = input_val_obj;
        this.input_attr_obj = {
            'type': 'hidden',
        };
        return this._init();
    }

    _init() {
        const hiddeninput_obj = new BaseElement(this.container, "input", {...this.input_attr_obj, ...this.input_val_obj});
        return hiddeninput_obj;
    }
}

export class Layout {
    constructor(container, layout, outerdiv_attr_obj={}) {
        this.container = container;
        this.layout = layout;
        this.outerdiv_attr_obj = outerdiv_attr_obj;
        this.styles = this._init_styles();
        this._add_value();
        return this._init();
    }

    _init_styles() {
        const style_variables = {
            outerdiv_attr_obj: {
                'class': 'screener-form-item screener-form-item-layout',
                ...this.outerdiv_attr_obj,
            },
            label_attr_obj: {
                'innerHTML': "Layout",
                'class': 'screener-form-item-input-label',
            },
            row_attr_obj: {
                'type': 'number',
                'name': 'layout_row',
                'placeholder': 'Row',
                'min': "1",
                'max': "9",
            },
            x_attr_obj: {
                'innerHTML': '&#10005;',
            },
            col_attr_obj: {
                'type': 'number',
                'name': 'layout_col',
                'placeholder': 'Col',
                'min': "1",
                'max': "9",
            },
            div_attr_obj: {
                'class': 'screener-form-item-input-container',
            }
        }
        return style_variables;
    }

    _add_value() {
        if (this.layout != null) {
            this.styles.row_attr_obj['value'] = this.layout.layout_row;
            this.styles.col_attr_obj['value'] = this.layout.layout_col;
        }
    }
    _init() {
        const outerdiv_obj = new BaseElement(this.container, "div", this.styles.outerdiv_attr_obj);
        const label_obj = new BaseElement(outerdiv_obj, "label", this.styles.label_attr_obj);
        const div_obj = new BaseElement(outerdiv_obj, "div", this.styles.div_attr_obj);
        const row_obj = new BaseElement(div_obj, "input", this.styles.row_attr_obj);
        const x_obj = new BaseElement(div_obj, "span", this.styles.x_attr_obj);
        const col_obj = new BaseElement(div_obj, "input", this.styles.col_attr_obj);
        return outerdiv_obj;
    }
}

export class MultiSelect {
    constructor(container, option_arr, id, selectbox_option_obj={}, select_attr_obj={}, option_attr_obj={}, selected_option_arr=[], selectelement_optional_args=[], btn_attr_obj={}, btncontainer_attr_obj={}) {
        /**
         * Create MultiSelect element & its underlying Select element with vanillaSelectBox
         *
         * @param { HTML element } container: container containing select element
         * @param { Array or Object } option_arr: array containing option values
         * @param { string } id: id for select element (SAME id with select element)
         * @param { Object } selectbox_option_obj: addition vanillaSelectBox related option styles
         * @param { Object } select_attr_obj: select attribute styles
         * @param { Object } option_attr_obj: addition select option attribute
         * @param { Array } selected_option_arr: selected options (default)
         * @param { Array } selectelement_optional_args: addition passing arguments to class SelectElement, if any
         * @param { Object } btn_attr_obj: customized vanillaSelectBox button attribute
         * @param { Object } btncontainer_attr_obj: customized vanillaSelectBox button container attribute
         *
         */
        this.styles = this._init_styles(select_attr_obj, option_attr_obj);
        return this._init(container, id, option_arr, selectbox_option_obj, selected_option_arr, selectelement_optional_args, btn_attr_obj, btncontainer_attr_obj);
    }

    _init_styles(select_attr_obj, option_attr_obj) {
        return {
            select_attr_obj: {
                size: "1",
                ...select_attr_obj,
                // to not overwrite given class for select element
                class: (select_attr_obj.hasOwnProperty('class') ? `${select_attr_obj.class} ` : '') + 'multiselect',
                multiple: "",
            },
            option_attr_obj: {
                ...option_attr_obj,
            },
            selectbox_option_obj: {
                placeHolder: "Selection/s",
                search: true,
                maxHeight: 300,
                maxWidth: 200,
                translations: {"all": "All", "items": "items"},
            },
        }
    }

    _init(container, id, option_arr, selectbox_option_obj, selected_option_arr, selectelement_optional_args, btn_attr_obj, btncontainer_attr_obj) {
        // validate if given id contains hash '#'; prepend if absence
        let new_id = id;
        if (new_id[0] != "#") { new_id = "#" + id; }
        const select_elem = new SelectElement(container, this.styles.select_attr_obj, option_arr, {}, selected_option_arr, ...selectelement_optional_args);
        const multiselect = new vanillaSelectBox(new_id, { ...this.styles.selectbox_option_obj, ...selectbox_option_obj});
        const btn_attr_keys = Object.keys(btn_attr_obj);
        const btncontainer_attr_keys = Object.keys(btncontainer_attr_obj);
        if (btn_attr_keys.length || btncontainer_attr_keys.length) {
            // HARD CODED (Might cause future complication if changes)
            const button_container_id = "#btn-group-" + select_elem.id;
            const button_container_elem = get_client_element(button_container_id);
            if (btncontainer_attr_keys.length) {
                btncontainer_attr_keys.forEach(attr_key => set_style_property(attr_key, btncontainer_attr_obj[attr_key], button_container_elem));
            }
            if (btn_attr_keys.length) {
                const button_elem = get_client_element("button", button_container_elem);
                btn_attr_keys.forEach(attr_key => set_style_property(attr_key, btn_attr_obj[attr_key], button_elem));
            }
        }
        return multiselect;
    }
}

export function multiselect_get_selected_options(attr_str, container=document, elem=null, dataset_str="") {
    /**
     * Return selected option value by given info
     *
     * @parma { string } attr_str: attribute of select elment in string
     * @param { HTML element } container: container holding desired select element
     * @param { HTML element or null } elem: given element will be used for selected option selection
     * @param { string } dataset_str: dataset attribute key
     *
     * Returns { Array }: Array of selected values (Array of values)
     *
     **/
    let select_elem = elem;
    if (!elem) { select_elem = get_client_element(attr_str, container); }
    const option_value_arr = [];
    for (const option_elem of select_elem.selectedOptions) {
        option_value_arr.push(dataset_str ? get_dataset_value_base(option_elem, dataset_str) : option_elem.value);
    }
    return option_value_arr;
}

export function multiselect_get_selected_options_dataset(attr_str, container=document, elem=null, dataset=[]) {
    /**
     * Return selected option MULTIPLE dataset values by given dataset keys
     *
     * @parma { string } attr_str: attribute of select elment in string
     * @param { HTML element } container: container holding desired select element
     * @param { HTML element or null } elem: given element will be used for selected option selection
     * @param { Array } dataset: Array containing retrieving dataset attribute
     *
     * Returns { Array }: Array of dataset object ()
     *
     **/
    let select_elem = elem;
    if (!elem) { select_elem = get_client_element(attr_str, container); }
    const option_dataset_arr = [];
    for (const option_elem of select_elem.selectedOptions) {
        const option_obj = {};
        dataset.forEach(key => option_obj[key] = get_dataset_value_base(option_elem, key));
        option_dataset_arr.push(option_obj);
    }
    return option_dataset_arr;
}

export function multiselect_is_selected_all(attr_str, container=document, elem=null) {
    /**
     * { bool } Returns status to indicate if all options of select element are selected
     *
     * @param { str } attr_str: attribute in string
     * @param { HTML element } container: parent element of select element
     * @param { HTML element } select element: underlying select element (no query from container if provided)
     *
     **/
    let select_elem = elem;
    if (!elem) { select_elem = get_client_element(attr_str, container); }
    const is_multi = select_elem.multiple;
    const has_all = select_elem.options[0].value == "all";
    if (is_multi && has_all && (select_elem.selectedOptions.length == (select_elem.options.length - 1))) { return true; }
    return false;
}

export function multiselect_single_fake_new_click(id, value) {
    /**
    * Emulate clicking style change without event trigger (if any) of MultiSelect
    * Action involves: unclick existing selected value & click selected value
    * Assuming single click
    *
    * @param { str } id: id of target MultiSelect element
    * @param { str } value: chosen value as selected
    * 
    **/
    const cls_active = "active";
    const cls_inactive = "overflow";
    const btn_group_elem = get_client_element(`#btn-group-${id.slice(1)}`);
    if (!btn_group_elem) { return; }
    // make previous active element inactive ('overflow')
    const previous_elem = get_client_element('li.active', btn_group_elem);
    // make select element active ('active')
    const target_elem = get_client_element(`li[data-value="${value}"]`, btn_group_elem);
    show_hide_elem(target_elem, previous_elem, cls_inactive, cls_active);
    const btn_elem = get_client_element('button', btn_group_elem);
    if (btn_elem) {
        // change text display to select text
        const title_elem = get_client_element('span.title', btn_elem);
        title_elem.innerHTML = value;
    }
}

export function multiselect_select_all(id) {
    const btn_group_elem = get_client_element(`#btn-group-${id.slice(1)}`);
    if (!btn_group_elem) { return; }
    const selectall_elem = get_client_element('li[data-value="all"]', btn_group_elem);
    if (!selectall_elem) { return; }
    const is_selected = get_dataset_value_base(selectall_elem, "selected");
    // double click if selectall_elem is true to avoid error where Clear All = Select All even when all entries are not entirely selected
    if (is_selected == "true") { selectall_elem.click(); }
    // to emulate user clicking on select all checkbox
    selectall_elem.click();
}

export function multiselect_recreate(id, option_arr, multiselect_attr_obj={}, select_all=true) {
    /**
     * Destroy & recreate MultiSelect element for when options are changed
     *
     * @param { string } id: underlying id
     * @param { Array } option_arr: Array containing option values
     * @param { Object } multiselect_attr_obj: addition vanillaSelectBox attribute
     * @param { boolean } select_all: determine if select all should be the default
     * Return { vanillaSelectBox }: vanillaSelectBox element
     *
     */
    let new_id = id;
    if (new_id[0] != "#") { new_id = "#" + id }
    const select_elem = get_client_element(new_id);
    if (!select_elem) { return; }
    const multiselect_elem = new vanillaSelectBox(new_id);
    multiselect_elem.destroy();
    select_elem.innerHTML = "";
    option_arr.forEach(val => { 
        const attr_obj = { innerHTML: val, value: val };
        if (select_all) { attr_obj["selected"] = true; }
        const option_elem = new BaseElement(select_elem, "option", attr_obj);
    })
    const new_multiselect_elem = new vanillaSelectBox(new_id, multiselect_attr_obj);
    return new_multiselect_elem
}
