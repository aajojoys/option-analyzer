import { istype_object, istype_string } from "./utility.js";

export async function get_json(url, parse=true, data_key="data"){
    console.log("GET: ", url);
    let res = await fetch(url);
    res = await res.json();
    res = data_key ? res[data_key] : res;
    res = (parse && istype_string(res)) ? JSON.parse(res) : res;
    return res
}

export async function fetch_post(url, context, is_formdata=false) {
    // console.log("POST: ", url);
    const headers = { 'X-CSRFToken': CSRF_TOKEN };
    // FormData does not need Content-Type
    if (!is_formdata) { headers['Content-Type'] = 'application/json'; }
    const response = await fetch(url, {
        method: 'POST',
        cache: 'no-cache',
        mode: 'cors',
        credentials: 'same-origin',
        headers: headers,
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: !is_formdata ? JSON.stringify(context) : context,
    });
    const res_json = await response.json();
    return JSON.parse(res_json);
}
