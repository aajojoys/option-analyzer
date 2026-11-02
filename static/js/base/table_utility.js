import { datetime_to_str_poststr } from "../market/base/utility.js";
import { get_localstorage_timezone } from "./app_utility.js";
import { get_client_element } from "./utility.js";

export class BaseDataTable {
    _get_table_id(layout_i) {
        return "#table-" + layout_i;
    }

    update_result(res_json) {
        this.res_data = res_json;
    }

    _get_column_title() {
        const column_name = this.res_data.columns;
        const column_data = this.res_data.column_data || [];
        const column_render = this.res_data.column_render || {};
        const column_title = []
        let column_render_ref = null;
        if (Object.keys(column_render).length) {
            column_render_ref = (column_render.key == "data") ? column_data : column_name;
        }
        for (const i in column_name) {
            const context = {};
            // convert column title to string to avoid throwing error from DataTables
            context.title = column_name[i].toString();
            if (column_data.length) { context.data = column_data[i]; }
            if (column_render_ref && column_render.hasOwnProperty(column_render_ref[i])) { context.render = column_render[column_render_ref[i]]; }
            column_title.push(context);
        }
        return column_title;
    }

    _get_row_values() {
        return this.res_data.data;
    }

    _init_data_helper(data, kwargs) {
        for (const key in kwargs) {
            if ((key == 'order_col_n') || (key == 'order_type')) {
                if (kwargs.hasOwnProperty('order_col_n') && kwargs.hasOwnProperty('order_type')) {
                    data["order"] = [[ kwargs.order_col_n, kwargs.order_type ]];
                }
            } else {
                data[key] = kwargs.key;
            }
        }
        return data;
    }

    _init_data_paging(layout_i) {
        return {
            "paging": true,
            "pageLength": 30,
            "lengthMenu": [10, 20, 30, 50, 100],
            "pagingType": "full",
            "lengthChange": true,
            "deferRender": true,
            "initComplete": (settings, json) => {
                $(`select[name="table-${layout_i}_length"]`).appendTo(`div.pagination-content[data-layout="${layout_i}"]`); // append lengthMenu (only select)
                $(`#table-${layout_i}_paginate`).appendTo(`div.pagination-content[data-layout="${layout_i}"]`);  // append pagination
                $(`#table-${layout_i}_length`).remove(); // discard unwanted elemnt of lengthMenu to prevent showing header for lengthMenu
            },
            "sDom": "ltp",
        }
    }

    _init_data(layout_i, kwargs) {
        const colname_title = this._get_column_title();
        const row_values = this._get_row_values();
        let data = {
            "destroy": true, // to reinitialise table
            "info": false, // to remove footer info (exclude showing n results)
            "autoWidth": true,
            "scrollResize": true,
            // "scrollY": `${height}px`, // deduct table header height
            "scrollX": true,
            "sScrollXInner": "100%", // aligned header with body
            "scrollCollapse": true,
            "searching": true,
            "paging": false,
            "fixedHeader": true,
            "columns": colname_title,
            // "order": [[1, "desc"]],
            "data": row_values,
            "colReorder": false,
            "sDom": "ltipr",
        };

        data = this._init_data_helper(data, kwargs);
        const paging_data = this._init_data_paging(layout_i);
        data = {...data, ...paging_data};

        return data;
    }

    _create_table_helper(layout_i, table_id, kwargs) {
        const data = this._init_data(layout_i, kwargs);
        // get timezone abbreviation for supplementing datetime display
        const tz_abbr = datetime_to_str_poststr(get_localstorage_timezone());
        /*
         * Datetime sorting issue with DataTable
         * Reference: https://datatables.net/blog/2014/ultimate-datetime-sorting
         * moment uses '[]' square bracket to escape
         */
        $.fn.dataTable.moment(`DD/MM/YYYY HH:mm:ss [(${tz_abbr})]`);
        return new DataTable(table_id, data);
    }

    create_table(layout_i, kwargs={}) {
        // remove_table before table creation to avoid stacking up of addition element added by DataTables (e.g. 'div.dtfh-floatingparent.dtfh-floatingparenthead', 'div.dtfc-right-top-blocker')
        this.remove_table(layout_i);
        const table_id = this._get_table_id(layout_i);
        return this._create_table_helper(layout_i, table_id, kwargs);
    }

    remove_table(layout_i) {
        const table_id = this._get_table_id(layout_i);
        const table_exist = DataTable.isDataTable(table_id);
        // throw error when table_id doesn't exists (e.g. Subgroup is None)
        if (table_exist) {
            const table = new DataTable(table_id);
            const table_elem = get_client_element(table_id);
            table.destroy();
            table_elem.innerHTML = "";
        }
        return table_id;
    }

    recreate_table(layout_i, res_json, kwargs={}) {
        this.update_result(res_json);
        this.create_table(layout_i, kwargs);
    }

    append_table(layout_i, data) {
        const table_id = this._get_table_id(layout_i);
        const table = new DataTable(table_id);
        table.rows.add(data).draw();
    }
}
