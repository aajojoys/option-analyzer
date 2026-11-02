import { get_json } from "../base/fetch.js";
import BaseUrl from "../base/baseurl.js";

const datacollection_api_url = new BaseUrl("/data_collection/api/")
const ENDPOINT_MGOPTION_MINMAX_T = "mongod_option_minmaxt";

async function api_get_datacollection(query_params) {
    const query_url = datacollection_api_url.get_query_url(query_params);
    return await get_json(query_url, false);
}

export async function api_datacollection_minmax_t() {
    const query_params = {
        endpoint: ENDPOINT_MGOPTION_MINMAX_T,
    }
    const res = await api_get_datacollection(query_params);
    return res
}