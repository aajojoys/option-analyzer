export default class BaseUrl {
    constructor(pathname=null) {
        this.origin = window.location.origin;
        this.pathname = (pathname == null) ? window.location.pathname : pathname;
    }

    get_base_url() {
        return this.origin + this.pathname;
    }

    get_query_url(objs, url=null, window_search=false, clear=true) {
        const target_url = (clear) ? "" : (window_search || window.location.search);
        const queryParams = new URLSearchParams(target_url);
        Object.keys(objs).forEach(key => {
            queryParams.set(key, objs[key]);
        });
        url = url || this.get_base_url();
        const query_url = url + "?" + queryParams.toString();
        return query_url;
    }

    get_query_params() {
        const params = new URLSearchParams(window.location.search);
        return Object.fromEntries(params);
    }
}