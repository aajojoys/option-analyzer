import { BASEFIELD_EXPIRY, BASEFIELD_HIGH, BASEFIELD_OPENTIME, BASEFIELD_OPEN, BASEFIELD_VOLUME, BASEFIELD_LOW, BASEFIELD_CLOSE } from "../data_collection/enum.js";
import { CUSTOMEVENT_ONCHANGE_THEME_TOGGLE, get_theme_isdark } from "./app_utility.js";
import { int_to_timestamp_utc, int_to_timestamp_utc_short, isobject_empty, istype_object } from "./utility.js";

const PLOTLY_DARK = {"layout":{"autotypenumbers":"strict","colorway":["#636efa","#EF553B","#00cc96","#ab63fa","#FFA15A","#19d3f3","#FF6692","#B6E880","#FF97FF","#FECB52"],"font":{"color":"#f2f5fa"},"hoverlabel":{"align":"left"},"paper_bgcolor":"#121721","plot_bgcolor":"#121721","polar":{"bgcolor":"#121721","angularaxis":{"gridcolor":"#506784","linecolor":"#506784","ticks":""},"radialaxis":{"gridcolor":"#506784","linecolor":"#506784","ticks":""}},"ternary":{"bgcolor":"#121721","aaxis":{"gridcolor":"#506784","linecolor":"#506784","ticks":""},"baxis":{"gridcolor":"#506784","linecolor":"#506784","ticks":""},"caxis":{"gridcolor":"#506784","linecolor":"#506784","ticks":""}},"coloraxis":{"colorbar":{"outlinewidth":0,"ticks":""}},"colorscale":{"sequential":[[0.0,"#0d0887"],[0.1111111111111111,"#46039f"],[0.2222222222222222,"#7201a8"],[0.3333333333333333,"#9c179e"],[0.4444444444444444,"#bd3786"],[0.5555555555555556,"#d8576b"],[0.6666666666666666,"#ed7953"],[0.7777777777777778,"#fb9f3a"],[0.8888888888888888,"#fdca26"],[1.0,"#f0f921"]],"sequentialminus":[[0.0,"#0d0887"],[0.1111111111111111,"#46039f"],[0.2222222222222222,"#7201a8"],[0.3333333333333333,"#9c179e"],[0.4444444444444444,"#bd3786"],[0.5555555555555556,"#d8576b"],[0.6666666666666666,"#ed7953"],[0.7777777777777778,"#fb9f3a"],[0.8888888888888888,"#fdca26"],[1.0,"#f0f921"]],"diverging":[[0,"#8e0152"],[0.1,"#c51b7d"],[0.2,"#de77ae"],[0.3,"#f1b6da"],[0.4,"#fde0ef"],[0.5,"#f7f7f7"],[0.6,"#e6f5d0"],[0.7,"#b8e186"],[0.8,"#7fbc41"],[0.9,"#4d9221"],[1,"#276419"]]},"scene":{"xaxis":{"backgroundcolor":"#121721","gridcolor":"#506784","showbackground":true,"ticks":"","zerolinecolor":"#C8D4E3","gridwidth":2},"yaxis":{"backgroundcolor":"#121721","gridcolor":"#506784","linecolor":"#506784","showbackground":true,"ticks":"","zerolinecolor":"#C8D4E3","gridwidth":2},"zaxis":{"backgroundcolor":"#121721","gridcolor":"#506784","linecolor":"#506784","showbackground":true,"ticks":"","zerolinecolor":"#C8D4E3","gridwidth":2}},"shapedefaults":{"line":{"color":"#f2f5fa"}},"annotationdefaults":{"arrowcolor":"#f2f5fa","arrowhead":0,"arrowwidth":1},"geo":{"bgcolor":"#121721","landcolor":"#121721","subunitcolor":"#506784","showland":true,"showlakes":true,"lakecolor":"#121721"},"title":{"x":0.05},"updatemenudefaults":{"bgcolor":"#506784","borderwidth":0},"sliderdefaults":{"bgcolor":"#C8D4E3","borderwidth":1,"bordercolor":"#121721","tickwidth":0},"mapbox":{"style":"dark"}}}
const PLOTLY_LIGHT = {"layout":{"autotypenumbers":"strict","colorway":["#636efa","#EF553B","#00cc96","#ab63fa","#FFA15A","#19d3f3","#FF6692","#B6E880","#FF97FF","#FECB52"],"font":{"color":"#2a3f5f"},"hoverlabel":{"align":"left"},"paper_bgcolor":"white","plot_bgcolor":"white","polar":{"bgcolor":"white","angularaxis":{"gridcolor":"#EBF0F8","linecolor":"#EBF0F8","ticks":""},"radialaxis":{"gridcolor":"#EBF0F8","linecolor":"#EBF0F8","ticks":""}},"ternary":{"bgcolor":"white","aaxis":{"gridcolor":"#DFE8F3","linecolor":"#A2B1C6","ticks":""},"baxis":{"gridcolor":"#DFE8F3","linecolor":"#A2B1C6","ticks":""},"caxis":{"gridcolor":"#DFE8F3","linecolor":"#A2B1C6","ticks":""}},"coloraxis":{"colorbar":{"outlinewidth":0,"ticks":""}},"colorscale":{"sequential":[[0.0,"#0d0887"],[0.1111111111111111,"#46039f"],[0.2222222222222222,"#7201a8"],[0.3333333333333333,"#9c179e"],[0.4444444444444444,"#bd3786"],[0.5555555555555556,"#d8576b"],[0.6666666666666666,"#ed7953"],[0.7777777777777778,"#fb9f3a"],[0.8888888888888888,"#fdca26"],[1.0,"#f0f921"]],"sequentialminus":[[0.0,"#0d0887"],[0.1111111111111111,"#46039f"],[0.2222222222222222,"#7201a8"],[0.3333333333333333,"#9c179e"],[0.4444444444444444,"#bd3786"],[0.5555555555555556,"#d8576b"],[0.6666666666666666,"#ed7953"],[0.7777777777777778,"#fb9f3a"],[0.8888888888888888,"#fdca26"],[1.0,"#f0f921"]],"diverging":[[0,"#8e0152"],[0.1,"#c51b7d"],[0.2,"#de77ae"],[0.3,"#f1b6da"],[0.4,"#fde0ef"],[0.5,"#f7f7f7"],[0.6,"#e6f5d0"],[0.7,"#b8e186"],[0.8,"#7fbc41"],[0.9,"#4d9221"],[1,"#276419"]]},"scene":{"xaxis":{"backgroundcolor":"white","gridcolor":"#DFE8F3","linecolor":"#EBF0F8","showbackground":true,"ticks":"","zerolinecolor":"#EBF0F8","gridwidth":2},"yaxis":{"backgroundcolor":"white","gridcolor":"#DFE8F3","linecolor":"#EBF0F8","showbackground":true,"ticks":"","zerolinecolor":"#EBF0F8","gridwidth":2},"zaxis":{"backgroundcolor":"white","gridcolor":"#DFE8F3","linecolor":"#EBF0F8","showbackground":true,"ticks":"","zerolinecolor":"#EBF0F8","gridwidth":2}},"shapedefaults":{"line":{"color":"#2a3f5f"}},"annotationdefaults":{"arrowcolor":"#2a3f5f","arrowhead":0,"arrowwidth":1},"geo":{"bgcolor":"white","landcolor":"white","subunitcolor":"#C8D4E3","showland":true,"showlakes":true,"lakecolor":"white"},"title":{"x":0.05},"mapbox":{"style":"light"}}}
const PLOT_CONTAINER_CLASS = ".plot-container";
const GRIDCOLOR_RGBA = "rgba(121,124,135,0.2)"
// const ZEROLINECOLOR_RGBA = "rgba(121,124,135,0.4)"
const ZEROLINECOLOR_RGBA = "var(--background)"
const RGB_GREEN_CANDLE = "#00CB85";
const RGB_RED_CANDLE = "#FF4860";
const DEFAULT_CONFIG_MODEBARBUTTONSTOADD = [
    // 'eraseshape',
    'drawline',
    // 'drawcircle',
    // 'drawrect',
]; 
export const PLOTTYPE_BAR = "bar";
export const PLOTTYPE_LINE = "line";
export const PLOTTYPE_OHLCV = "ohlcv";
export const PLOTTYPE_CANDLESTICK = "candlestick";
export const PLOTTYPE_SURFACE = "surface";
export const PLOTTYPE_PAYOFF = "payoff";

export class MyPlot {
    constructor(container, data, plot_type, title_obj, is_groupby=false, stack_arr=[], namekey_obj={}) {
        this.plot_type = plot_type;
        this.title_obj = title_obj;
        this.namekey_obj = namekey_obj;
        this.styles = this._init_styles(data);
        this.namekey_isempty = isobject_empty(namekey_obj);
        return this.init(container, data, title_obj, is_groupby, stack_arr, namekey_obj);
    }

    _get_info(layout_obj) {
        const obj = {};
        if (layout_obj.hasOwnProperty('title')) {
            obj.title = { ...layout_obj.title };
        }
        if (layout_obj.hasOwnProperty('scene')) {
            obj.scene = {};
            for (const key of ['xaxis', 'yaxis', 'zaxis']) {
                if (layout_obj.scene.hasOwnProperty(key)) {
                    obj.scene[key] = {};
                    for (const inner_key of ['title', 'type']) {
                        if (layout_obj.scene[key].hasOwnProperty(inner_key)) {
                            obj.scene[key][inner_key] = { ...layout_obj.scene[key][inner_key] };
                        }
                    }
                }
            }
        }
        return obj;
    }

    apply_theme(container, original_layout_obj=null) {
        const is_dark = get_theme_isdark();
        if (original_layout_obj === null) { original_layout_obj = this._get_info(container.layout); }
        const theme_layout_obj = { ...((is_dark) ? PLOTLY_DARK.layout : PLOTLY_LIGHT.layout) }
        for (const key of Object.keys(original_layout_obj)) {
            if (key == "scene") {
                for (const inner_key of Object.keys(original_layout_obj[key])) {
                    theme_layout_obj[key][inner_key] = { ...theme_layout_obj[key][inner_key], ...original_layout_obj[key][inner_key] };
                }
            } else {
                theme_layout_obj[key] = { ...theme_layout_obj[key], ...original_layout_obj[key] };
            }
        }
        Plotly.relayout(container, theme_layout_obj);
    }

    _event_doubleclick_customsize(container, fix_height) {
        container.on('plotly_doubleclick', fix_height ? this._retain_customsize.bind(this, container) : this._autosize.bind(this, container));
    }

    _autosize(container) {
        Plotly.relayout(container, {autosize: true});
    }

    _retain_customsize(container) {
        const height = container.querySelector(PLOT_CONTAINER_CLASS).offsetHeight;
        Plotly.relayout(container, {autosize: true});
        Plotly.relayout(container, {height: height});
    }

    _get_custom_config(fix_height) {
        return {
            modeBarButtonsToRemove: [ 'autoscale' ],
            modeBarButtonsToAdd: [
                ...DEFAULT_CONFIG_MODEBARBUTTONSTOADD,
                {
                    name: 'Custom autoscale or double click',
                    icon: Plotly.Icons.autoscale,
                    click: fix_height ? this._retain_customsize : this._autosize,
                }
            ]
        }
    }

    _get_general_config() {
        return {
            displaylogo: false,
            scrollZoom: true,
            displayModeBar: true,
            modeBarButtonsToAdd: DEFAULT_CONFIG_MODEBARBUTTONSTOADD,
        }
    }

    _init_styles(data) {
        return {
            default: {
                margin: {
                    l: 30, r: 30, t: 30, b: 30,
                    pad: 10, autoexpand: true,
                },
                autosize: true,
                xaxis: {
                    automargin: true,
                    title: { text: this._get_namekey(this.title_obj.x) },
                    showgrid: false,
                    zeroline: false,
                    // gridcolor: ZEROLINECOLOR_RGBA,
                    // zerolinecolor: ZEROLINECOLOR_RGBA,
                },
                yaxis: {
                    automargin: true,
                    title: { text: this._get_namekey(this.title_obj.y) },
                    showgrid: false,
                    zeroline: false,
                    // gridcolor: ZEROLINECOLOR_RGBA,
                    // zerolinecolor: ZEROLINECOLOR_RGBA,
                },
                hovermode: "x unified",
            }, [PLOTTYPE_OHLCV]: {
                showlegend: false,
                /*
                xaxis: {
                    anchor: "y2",
                    showticklabels: true,
                    rangeslider: {visible: false},
                    title: { text: "" },
                    tickformat: "%d-%b %H:%M",
                    hoverformat: "%d %b %Y %H:%M UTC"
                },
                */
                xaxis: {
                    // domain: [0, 1],
                    anchor: "y",
                    showticklabels: false,
                    matches: "x2",
                    title: { text: "" },
                    rangeslider: { visible: false },
                },
                xaxis2: {
                    // domain: [0, 1],
                    anchor: "y2",
                    showticklabels: true,
                    title: { text: "" },
                    // tickformat: "%d-%b %H:%M",
                    hoverformat: "%d %b %Y %H:%M"
                },
                yaxis: {
                    domain: [0.3, 1],
                    title: { text: "OHLC" },
                },
                yaxis2: {
                    domain: [0, 0.2],
                    title: { text: "Volume" },
                }
            }, [PLOTTYPE_SURFACE]: {
                margin: {
                    l: 0, r: 0, t: 0, b: 10,
                    pad: 0,
                },
                scene: {
                    xaxis: {
                        title: { text: this._get_namekey(this.title_obj.x )},
                        showgrid: true,
                        zeroline: false,
                    },

                    yaxis: {
                        title: { text: this._get_namekey(this.title_obj.y )},
                        showgrid: true,
                        zeroline: false,
                    },

                    zaxis: {
                        title: { text: this._get_namekey(this.title_obj.z )},
                        // tickformat: ".1%",
                        showgrid: true,
                        zeroline: false,
                    },
                    aspectmode: "cube",
                    camera: {
                        eye: {
                            x: 1.6,
                            y: 1.6,
                            z: 0.9,
                        }
                    }
                },
            }, [PLOTTYPE_PAYOFF]: {
                showlegend: false,
            }
        }
    }

    _get_namekey(key) {
        return (this.namekey_isempty || !(key in this.namekey_obj)) ? key : this.namekey_obj[key];
    }

    _format_ts(ts_int) {
        // s to ms
        return ts_int * 1000
    }

    _preprocess_col(data, key) {
        if ([BASEFIELD_OPENTIME, BASEFIELD_EXPIRY].includes(key)) {
            return data[key].map(ts_int => new Date(int_to_timestamp_utc(this._format_ts(ts_int))) );
        } else {
            return data[key];
        }
    }

    _is_timestamp_title(key) {
        return [BASEFIELD_EXPIRY, BASEFIELD_OPENTIME].includes(key)
    }

    _init_trace(data, x, y, name="", z="", extra_obj={}) {
        const x_val = this._preprocess_col(data, x);
        const y_val = this._preprocess_col(data, y);
        // let y_title = `${this._get_namekey(this.title_obj.y)}`;
        // let x_title = `${this._get_namekey(this.title_obj.x)}`;
        // if (this._is_timestamp_title(this.title_obj.y)) { y_title += ': %{y:,.4f}'; }
        // if (this._is_timestamp_title(this.title_obj.x)) { x_title += ': %{x:,.4f}'; }
        // const template = `${x_title}<br>${y_title}<extra></extra>`;
        let trace = {
            type: this.plot_type,
            x: x_val,
            y: y_val,
            // hovertemplate: template,
        }
        if (name) { trace['name'] = this._get_namekey(name); }
        if (z) { trace['z'] = this._preprocess_col(data, z); }
        if (!isobject_empty(extra_obj)) { trace = {...trace, ...extra_obj}; }
        return trace;
    }

    _init_layout(is_groupby) {
        const layout = {};
        if ((this.plot_type == PLOTTYPE_BAR) && is_groupby) {
            layout['barmode'] = 'group';
        }
    }

    _init_ohlcv(data) {
        const candle = {
            type: PLOTTYPE_CANDLESTICK,
            open: data[BASEFIELD_OPEN],
            high: data[BASEFIELD_HIGH],
            low: data[BASEFIELD_LOW],
            close: data[BASEFIELD_CLOSE],
            x: this._preprocess_col(data, this.title_obj.x),
            xaxis: "x",
            yaxis: "y",
            name: "OHLCV"
        }
        const volume = {
            type: PLOTTYPE_BAR,
            x: this._preprocess_col(data, this.title_obj.x),
            y: data[BASEFIELD_VOLUME],
            xaxis: "x2",
            yaxis: "y2",
            name: "Volume",
            marker: {
                color: data[BASEFIELD_CLOSE].map((c, i) => c >= data[BASEFIELD_OPEN][i] ? RGB_GREEN_CANDLE : RGB_RED_CANDLE)
            }
        }
        return [candle, volume];
    }

    _stack_traces(data, stack_arr) {
        const traces = [];
        for (const y_name of stack_arr) {
            const curr_trace = this._init_trace(data, this.title_obj.x, y_name, y_name);
            traces.push(curr_trace);
        }
        return traces;
    }

    _groupby_traces(data) {
        const traces = [];
        const keys = Object.keys(data);
        for (const key of keys) {
            // assuming group value will never be values of expiry or open_time
            // data[key] to get values by group by
            const curr_trace = this._init_trace(data[key], this.title_obj.x, this.title_obj.y, key);
            traces.push(curr_trace);
        }
        return traces;
    }

    _init_payoff(data) {
        const positive = this._preprocess_col(data, this.title_obj.y).map(v => Math.max(v, 0));
        const negative = this._preprocess_col(data, this.title_obj.y).map(v => Math.min(v, 0));
        const y_min = Math.min(...negative);
        const y_max = Math.max(...positive);
        const offset = (y_max - y_min) * 0.1;
        const pos_trace = {
            x: this._preprocess_col(data, this.title_obj.x),
            y: positive,
            type: "scatter",
            mode: "none",
            fill: "tozeroy",
            fillcolor: "rgba(34,197,94,0.2)",
            hoverinfo: "skip",
        };
        const neg_trace = {
            x: this._preprocess_col(data, this.title_obj.x),
            y: negative,
            type: "scatter",
            mode: "none",
            fill: "tozeroy",
            fillcolor: "rgba(239,68,68,0.2)",
            hoverinfo: "skip",
        };
        const line_trace = {
            x: this._preprocess_col(data, this.title_obj.x),
            y: this._preprocess_col(data, this.title_obj.y),
            name: "Payoff",
            type: "scatter",
            mode: "lines",
            line: {
                color: "#3B82F6",
                width: 2,
            }
        };
        const current_trace = {
            x: [data.current, data.current],
            y: [y_min, y_max],
            type: "scatter",
            // mode: "lines",
            name: `Current: (${parseFloat(data.current).toFixed(2)})`,
            line: {
                color: "#1362f9",
                dash: "dot",
                width: 2
            },
            mode: "lines+text",
            text: ["", `Current: ${parseFloat(data.current).toFixed(2)}`],
            textposition: "top center",
            textfont: {
                color: "#1362f9",
            },
            yshift: -10,
            hovertemplate: "Current: %{x:.2f}<extra></extra>"
        };

        const breakeven_trace = {
            x: [data.breakeven, data.breakeven],
            y: [y_min, y_max - offset],
            type: "scatter",
            yshift: 10,
            mode: "lines+text",
            text: ["", `Breakeven: ${parseFloat(data.breakeven).toFixed(2)}`],
            textposition: "top center",
            textfont: {
                dash: "dash",
                color: "#787c87"
            },
            hovertemplate: "Breakeven: %{x:.2f}<extra></extra>"
        };
        return [pos_trace, neg_trace, line_trace, current_trace, breakeven_trace];
    }

    _set_layout(default_obj, layout_obj) {
        const res = default_obj;
        if (isobject_empty(layout_obj)) { return res; }
        for (const [key, val] of Object.entries(layout_obj)) {
            if (!(key in res)) {
                res[key] = val;
            } else if (istype_object(val)) {
                for (const [ikey, ival] of Object.entries(val)) {
                    res[key][ikey] = ival;
                }
            }
        }
        return res;
    }

    init(container, data, title_obj, is_groupby, stack_arr, namekey_obj) {
        let traces = [];
        if (this.plot_type == PLOTTYPE_OHLCV) {
            traces = this._init_ohlcv(data);
        } else if (is_groupby) {
            traces = this._groupby_traces(data);
        } else if (stack_arr.length) {
            traces = this._stack_traces(data, stack_arr);
        } else if (this.plot_type == PLOTTYPE_SURFACE) {
            const extra_obj = {showscale: true, connectgaps: true, contours: { z: { show: true, usecolormap: true, highlightwidth: 1}, }};
            traces = [this._init_trace(data, this.title_obj.x, this.title_obj.y, "", this.title_obj.z, extra_obj)];
        } else if (this.plot_type == PLOTTYPE_PAYOFF) {
            traces = this._init_payoff(data);
        } else {
            traces = [this._init_trace(data, this.title_obj.x, this.title_obj.y, this.title_obj.y)];
        }
        const layout_obj = this._set_layout(this.styles.default, this.styles[this.plot_type] || {});
        const addition_config = this._get_custom_config(false);
        let config = {...this._get_general_config(), ...addition_config};
        const plot = Plotly.newPlot(container, traces, layout_obj, config).then((container) => {
            this._autosize(container);
        });
        const original_layout_obj = this._get_info(layout_obj);
        this.apply_theme(container, original_layout_obj);
        document.addEventListener(CUSTOMEVENT_ONCHANGE_THEME_TOGGLE, this.apply_theme.bind(null, container, original_layout_obj));
        return plot
    }
}

class MyPlotly {
    constructor() {
        this._get_custom_config = this._get_custom_config.bind(this);
    }

    apply_theme(container_elem, is_dark, original_layout_obj=null) {
        if (original_layout_obj === null) { original_layout_obj = this._get_info(container_elem.layout); }
        const theme_layout_obj = { ...((is_dark) ? PLOTLY_DARK.layout : PLOTLY_LIGHT.layout) }
        for (const key of Object.keys(original_layout_obj)) {
            if (key == "scene") {
                for (const inner_key of Object.keys(original_layout_obj[key])) {
                    theme_layout_obj[key][inner_key] = { ...theme_layout_obj[key][inner_key], ...original_layout_obj[key][inner_key] };
                }
            } else {
                theme_layout_obj[key] = { ...theme_layout_obj[key], ...original_layout_obj[key] };
            }
        }
        Plotly.relayout(container_elem, theme_layout_obj);
    }

    _style_default(container, layout_obj) {
        const layout_obj_mod = {
            yaxis: {
                ...layout_obj.yaxis,
                gridcolor: GRIDCOLOR_RGBA,
                zerolinecolor: ZEROLINECOLOR_RGBA,
            }, xaxis: {
                ...layout_obj.xaxis,
                gridcolor: GRIDCOLOR_RGBA,
                zerolinecolor: ZEROLINECOLOR_RGBA,
            },
            // autosize: true,
            hovermode: "x unified",
        };
        // for. stack bar plot which hovermode should not be unified (pass from server)
        if (layout_obj.hovermode) { layout_obj_mod.hovermode = layout_obj.hovermode; }
        Plotly.relayout(container, layout_obj_mod);
    }

    _event_doubleclick_customsize(container, fix_height) {
        container.on('plotly_doubleclick', fix_height ? this._retain_customsize.bind(this, container) : this._autosize.bind(this, container));
    }

    _autosize(container) {
        Plotly.relayout(container, {autosize: true});
    }

    _retain_customsize(container) {
        const height = container.querySelector(PLOT_CONTAINER_CLASS).offsetHeight;
        Plotly.relayout(container, {autosize: true});
        Plotly.relayout(container, {height: height});
    }

    _get_custom_config(fix_height) {
        return {
            modeBarButtonsToRemove: [ 'autoscale' ],
            modeBarButtonsToAdd: [
                ...DEFAULT_CONFIG_MODEBARBUTTONSTOADD,
                {
                    name: 'Custom autoscale or double click',
                    icon: Plotly.Icons.autoscale,
                    click: fix_height ? this._retain_customsize : this._autosize,
                }
            ]
        }
    }

    _get_general_config() {
        return {
            displaylogo: false,
            scrollZoom: true,
            displayModeBar: true,
            modeBarButtonsToAdd: DEFAULT_CONFIG_MODEBARBUTTONSTOADD,
        }
    }

    _get_nocustom_config() {
        return {
            responsive: true,
        }
    }

    remove_plot(container_elem) {
        Plotly.purge(container_elem);
    }

    _get_info(layout_obj) {
        const obj = {};
        if (layout_obj.hasOwnProperty('title')) {
            obj.title = { ...layout_obj.title };
        }
        if (layout_obj.hasOwnProperty('scene')) {
            obj.scene = {};
            for (const key of ['xaxis', 'yaxis', 'zaxis']) {
                if (layout_obj.scene.hasOwnProperty(key)) {
                    obj.scene[key] = {};
                    for (const inner_key of ['title', 'type']) {
                        if (layout_obj.scene[key].hasOwnProperty(inner_key)) {
                            obj.scene[key][inner_key] = { ...layout_obj.scene[key][inner_key] };
                        }
                    }
                }
            }
        }
        return obj;
    }

    from_json(container_elem, is_dark, plot_json, is_custom=false) {
        const original_layout_obj = this._get_info(plot_json.layout);
        const to_custom = (is_custom) && (plot_json.layout.height)
        const addition_config = is_custom ? this._get_custom_config(to_custom) : this._get_nocustom_config();
        let config = {...this._get_general_config(), ...addition_config};
        if (plot_json.hasOwnProperty('config')) { config = {...config, ...plot_json.config} };
        Plotly.newPlot(container_elem, plot_json.data, plot_json.layout, config);
        this.apply_theme(container_elem, is_dark, original_layout_obj);
        if (is_custom) {
            if (to_custom) { this._event_doubleclick_customsize(container_elem, to_custom); }
        } else {
            this._style_default(container_elem, plot_json.layout);
        }
    }
}

export const ThisPlotly = new MyPlotly();
