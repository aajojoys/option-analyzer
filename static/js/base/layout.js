import { ITEMTYPE_PLOT, ITEMTYPE_TABLE } from "../modules/base/element.js";
import { get_client_element } from "./utility.js";

const ATTR_CONTAINER = "div.main";
const ATTR_GRIDCONTAINER = "div.grid-container";

function resize_all_plots(map_obj) {
    map_obj.plot_map.values().forEach( (state_name) => {
        const griditem_elem = map_obj.layout_map.get(state_name);
        const plot_div = get_client_element(ATTR_GRIDCONTAINER, griditem_elem);
        Plotly.Plots.resize(plot_div)}
    );
}

function resize_all_aggrid(map_obj) {
    map_obj.aggrid_map.values().forEach( (gapi) => {
        // gapi.sizeColumnsToFit();
        gapi.autoSizeAllColumns();
    })
}

function layout_resize(layout, map_obj) {
    window.addEventListener("resize", () => {
        layout.updateSize();
        resize_all_plots(map_obj);
        resize_all_aggrid(map_obj);
    })
}

export function init_layout(map_obj, config, component_arr, element_arr) {
    const container = get_client_element(ATTR_CONTAINER);
    const layout = new GoldenLayout(config, container);

    for (let i=0; i<component_arr.length; i++) {
        layout.registerComponent(`${component_arr[i]}`, function(container, state_obj) {
            if (!element_arr || !element_arr[i]) { return; }
            map_obj.layout_map.set(state_obj.name, element_arr[i]);
            if (state_obj.type == ITEMTYPE_PLOT) { map_obj.plot_map.set(map_obj.plot_map.size+1, state_obj.name)}
            container.getElement().append(element_arr[i]);

            let layoutSettings = container.layoutManager.config.settings;
            // layoutSettings.showMaximiseIcon = false;
            // layoutSettings.showPopoutIcon = false;
            // layoutSettings.showCloseIcon = false;
            // layoutSettings.reorderEnabled = false;
            // // layoutSettings.hasHeaders = false;
            // layoutSettings.closePopoutsOnUnload = false;
        });
    }

    layout.init();
    layout_resize(layout, map_obj);
    resize_all_plots(map_obj);
    resize_all_aggrid(map_obj);
    window.map_obj = map_obj
    return layout;
}
