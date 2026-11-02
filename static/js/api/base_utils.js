export default class ApiURL {
    constructor(base_url) {
        this.url = new URL(base_url);
    }

    join_relative_url(relative_url) {
        this.url = new URL(relative_url, this.url);
    }

    get_url_string() {
        return this.url.toString();
    }

    add_query_params(query_params) {
        let params = new URLSearchParams(this.url.search);
        for (const [key, val] of Object.entries(query_params)) {
            params.set(key, val);
        }
        this.url.search = params.toString();
    }
}