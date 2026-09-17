from decimal import Decimal

from http.client import TOO_MANY_REQUESTS
from django.utils.timezone import is_naive, make_naive, is_aware, make_aware

from urllib.parse import urljoin
from datetime import datetime, timedelta
import pandas as pd
from json import JSONEncoder
from asgiref import sync
from collections import defaultdict, deque
import requests, os, sys, csv, zipfile, math, pytz, os, json, asyncio, uuid, geoip2.database
from django.conf import settings

IPAPI_URL = "https://ipapi.co"
IPWHOIS_URL = "https://ipwho.is"
WIREGUARD_IP = "10.100.0.1"
LOCALHOST_IP = "127.0.0.1"
GEOLITE2_CITY_PATH = "others/GeoLite2-City.mmdb"

reader = geoip2.database.Reader(f"{settings.BASE_DIR}/{GEOLITE2_CITY_PATH}")

"""
Solution to Pandas memory leak issue
reference link: https://github.com/pandas-dev/pandas/issues/2659
from ctypes import cdll, CDLL

cdll.LoadLibrary("libc.so.6")
libc = CDLL("libc.so.6")
"""

INTERVAL_1M_STR = "1m"
INTERVAL_5M_STR = "5m"
INTERVAL_1H_STR = "1h"
INTERVAL_1D_STR = "1d"
PERIOD_STR_1D = '1440min'
PERIOD_STR_1M = '1min'
PERIOD_STR_5M = '5min'
PERIOD_STR_1H = '60min'
PERIOD_INT_1M = 1
PERIOD_INT_5M = 5
PERIOD_INT_1H = 60
PERIOD_INT_1D = 1440
UTC = pytz.timezone('UTC')
DATETIME_FORMAT = "%Y-%m-%d %H:%M:%S"
D_INTERVAL_TO_MS = 'D'
H_INTERVAL_TO_MS = 'H'
M_INTERVAL_TO_MS = 'M'
S_INTERVAL_TO_MS = 'S'
MS_INTERVAL_TO_MS = 'MS'
INTERVAL_TO_MS = {D_INTERVAL_TO_MS: 86400000, H_INTERVAL_TO_MS: 3600000, M_INTERVAL_TO_MS: 60000, S_INTERVAL_TO_MS: 1000, MS_INTERVAL_TO_MS: 1}
RES_ERROR = "ERROR"
RES_ERROR_RETRY = "ERROR_RETRY"
TIMESTAMP_UNIT_MS_LENGTH = 13
TIMESTAMP_UNIT_S_LENGTH = 10
TIMESTAMP_UNIT_MS = "ms"
TIMESTAMP_UNIT_S = "s"

HTTPREQUEST_CONTENTTYPE_APPLICATIONJSON = 'application/json'
MAX_CONNECTION_RETRY = 0

# Create your views here.
def absURL_join(base_url, relative_url):
    """ absURL_join function joins base_url with relative_url into absolute url

    Args:
        base_url (str): base url in string
        relative_url (str): relative url in string

    Returns:
        absolute_url (str): absolute url
    """
    return urljoin(base_url, relative_url)

def error_handle(url, err_code="", err_msg={}):
    """ error_handle function handle requests error by rendering requesting url, error code and error message as JsonResponse

    Args:
        url (str): requesting url
        err_code (str): error code from exception
        err_msg (dict): error mesasge in json

    Returns:
        statement (str): print error statement to debugging terminal
    """
    print("Error:\n\tURL: %s;\n\tException: %s;\n\tError Message: %s\n" %(url, err_code, err_msg))

def request_errhandled(url, query_params, headers, method="get"):
    """ request function validates url and then status of response, calls error_handle if exception exists

    Args:
        url (str): requesting url

    Returns:
        res_json (dict): return response in json if no exception
    """
    default_headers = {
        'Accepts': 'application/json',
    }
    default_headers.update(headers)

    if method == "get":
        kwargs = {
            "params": query_params,
            "headers": default_headers,
        }
    elif method == "post":
        kwargs = { "json": query_params }

    try:
        res = getattr(requests, method)(
            url,
            **kwargs,
        )
    except Exception as exc:
        error_handle(url, err_code=str(exc))
        return RES_ERROR

    try:
        res.raise_for_status()
    except Exception as exc:
        error_handle(url, err_code=str(exc), err_msg={"res": res, "headers": res.request.headers})
        if res.status_code == TOO_MANY_REQUESTS:
            raise Exception(f"SYSTEM EXIT:\n\t{res.status_code} encountered.")
        return RES_ERROR

    if method == "get":
        res = res.json()
    return res

async def async_request_errhandled_helper(session, url, query_params, headers, method="get"):
    default_headers = {
        'Accepts': 'application/json',
    }
    default_headers.update(headers)

    if method == "get":
        kwargs = {
            "params": query_params,
            "headers": default_headers,
        }
    elif method == "post":
        kwargs = { "json": query_params }

    try:
        res = await getattr(session, method)(
            url,
            **kwargs,
        )
    except Exception as exc:
        error_handle(url, str(exc))
        # raise
        return RES_ERROR

    try:
        res.raise_for_status()
    except Exception as exc:
        error_handle(url, str(exc), {"res": res, "headers": res.headers})
        if res.status == TOO_MANY_REQUESTS:
            raise Exception(f"SYSTEM EXIT:\n\t{res.status} encountered.")
        # raise
        return RES_ERROR
    return await res.json()

def async_bulk_request_errhandled(pairs, common_url, common_query_params, fetch_helper_func, headers, post_fetch_helper_func, semaphore_val=200):
    async def get_all(pairs, common_url, common_query_params, fetch_helper_func, headers):
        # add asyncio.Semaphore to avoid being flagged as ddos attack
        # reference: https://stackoverflow.com/questions/57046073/why-do-i-get-the-error-clientconnectorerror
        sem = asyncio.Semaphore(semaphore_val)
        async with sem:
            async with ClientSession() as session:
                async def fetch(pair, common_url, common_query_params, fetch_helper_func, headers):
                    url, query_params = fetch_helper_func(pair, common_url, common_query_params)
                    res = await async_request_errhandled_helper(session, url, query_params, headers)
                    # TODO: to catch error
                    if res == RES_ERROR: return RES_ERROR
                    return res if (post_fetch_helper_func is None) else post_fetch_helper_func(res)
                return await asyncio.gather(*[fetch(pair, common_url, common_query_params, fetch_helper_func, headers) for pair in pairs])
    return sync.async_to_sync(get_all)(pairs, common_url, common_query_params, fetch_helper_func, headers)

def async_request_errhandled(url, query_params, headers, semaphore_val=200):
    """ request function validates url and then status of response, calls error_handle if exception exists

    Args:
        url (str): requesting url

    Returns:
        res_json (dict): return response in json if no exception
    """
    async def get_single(url, query_params, headers):
        sem = asyncio.Semaphore(semaphore_val)
        async with sem:
            async with ClientSession() as session:
                return await async_request_errhandled_helper(session, url, query_params, headers)
    return sync.async_to_sync(get_single)(url, query_params, headers)

def ts_delta(start_ts, end_ts, interval):
    delta_ms = end_ts - start_ts
    return delta_ms / INTERVAL_TO_MS[interval]

def ts_calc(ts, n, interval, func):
    calc_target = n * INTERVAL_TO_MS[interval]
    return func(ts, calc_target)

def ts_offset(func_name, ts, period_T):
    ''' dt_offset is helper function to dt_ceil & dt_floor
    Caveat: pandas.Timestamp.ceil or floor != round up or round down when it's well-rounded number
    '''
    # set timestamp with only UTC timezone (ceil/floor) for 00:00 (crypto open/close) without offset
    ts = pd.Timestamp(ts, unit='ms', tz='UTC')
    ts = getattr(ts, func_name)(period_T)
    return datetime_to_timestamp(ts)

def ts_ceil(ts, period_T):
    ''' Assuming timestamp least precision unit is ms
    pd.Timestamp of whole minute is ceil to the same minute e.g. (00:00:00).ceil('T') = (00:00:00)
    Hence, ts + 1 (second) to avoid the situation; for case where (00:00:59) + 1 = (00:01:00); (00:01:00).ceil() = 00:01:00; deduct 1 second in the end
    '''
    return ts_offset('ceil', ts + 1, period_T) - 1

def ts_floor(ts, period_T):
    return ts_offset('floor', ts, period_T)

def ts_isunit(ts, unit_str):
    """
    Validate given timestamp unit (by length)

    Args:
        ts (int): timestamp in int
        unit_str (str): unit in str (TIMESTAMP_UNIT_MS, TIMESTAMP_UNIT_S)
    Returns:
        (bool): boolean value indicating validation result (true: correct; false: incorrect)

    """
    if unit_str == TIMESTAMP_UNIT_MS:
        length = TIMESTAMP_UNIT_MS_LENGTH
    elif unit_str == TIMESTAMP_UNIT_S:
        length = TIMESTAMP_UNIT_S_LENGTH
    else:
        length = None
    return (len(str(ts)) == length) if (ts and length) else False

def ts_convert_s_and_ms(ts, to_unit_str):
    """
    Convert given timestamp to unit of interested

    Args:
        ts (int): given timestamp in int
        to_unit_str (str): unit in str (TIMESTAMP_UNIT_MS, TIMESTAMP_UNIT_S)
    Returns:
        (int): formatted timestamp

    """
    length = len(str(ts))
    if (to_unit_str == TIMESTAMP_UNIT_MS) and (length == TIMESTAMP_UNIT_S_LENGTH):
        ts *= 1000
    elif (to_unit_str == TIMESTAMP_UNIT_S) and (length == TIMESTAMP_UNIT_MS_LENGTH):
        ts = int(ts / 1000)
    return ts

def dt_calc(dt, func, **kwargs):
    return func(dt, timedelta(**kwargs))

def dt_offset(func_name, dt, period_T):
    ''' dt_offset is helper function to dt_ceil & dt_floor
    Caveat: pandas.Timestamp.ceil or floor != round up or round down when it's well-rounded number
    '''
    if not is_aware(dt):
        # make naive datetime aware
        dt = make_aware(dt)
    # set timestamp with only UTC timezone (ceil/floor) for 00:00 (crypto open/close) without offset
    dt = pd.Timestamp(dt).astimezone(UTC)
    dt = getattr(dt, func_name)(period_T)
    return dt.to_pydatetime()

def dt_ceil(dt, period_T):
    ''' Assumption: least precision for kline model is in minutes (plus timedelta(seconds=1)) '''
    return dt_offset('ceil', dt + timedelta(microseconds=1), period_T) - timedelta(microseconds=1)

def dt_floor(dt, period_T):
    return dt_offset('floor', dt, period_T)

def pdts_to_pydatetime(dt):
    if type(dt) == pd.Timestamp:
        dt = dt.to_pydatetime()
    return dt

def datetime_to_timestamp(dt):
    """ datetime_to_timestamp converts python datetime type to int timestamp
    Args:
        dt (datetime): python datetime type

    Returns:
        ts (int): timestamp in int 
    Caveat:
        pd.Timestamp uses tz=None by default but datetime library uses settings.TIME_ZONE by default
    """
    dt = pdts_to_pydatetime(dt)
    return int(dt.timestamp() * 1000)

def timestamp_to_datetime(ts, tzinfo=UTC):
    """ timestamp_to_datetime converts timestamp in int to python datetime
    Args:
        ts (int): timestamp in int

    Returns:
        dt (datetime): python datetime type
    """
    return datetime.fromtimestamp(int(ts/1000), tz=tzinfo)

def datetime_isaware(dt):
    return is_aware(dt)

def get_timedelta(dt_end, dt_start, interval):
    interval_to_seconds = {'H': 3600, 'M': 60, 'S': 1}
    timedelta = dt_end - dt_start
    total_seconds = timedelta.total_seconds()
    return total_seconds / interval_to_seconds[interval]

def make_datetime_naive(dt):
    ''' make_datetime_naive makes django return datetime field object in naive format as USE_TZ = True (time aware of UTC by default)'''
    if not is_naive(dt):
        return make_naive(dt)

def get_datetime_now(tzinfo=UTC):
    return datetime.now(tz=tzinfo)

def get_timestamp_now():
    dt = get_datetime_now()
    return datetime_to_timestamp(dt)

def get_period_str_interval(activity_interval):
    """
    Transform activity interval into period str
    e.g. "1m" -> PERIOD_STR_1M ('1T')
    supporting condition has to be added manually depending on available activity interval (data_collection.models.DatabaseInfo.basefield_options.*.min_period)
    e.g. binanceLinear metrics has min_period of INTERVAL_5M_STR ('5m') 

    Args:
        activity_interval (str): activity interval in string
    Returns:
        (str): period in string

    """
    if activity_interval == INTERVAL_1M_STR:
        return PERIOD_STR_1M
    elif activity_interval == INTERVAL_5M_STR:
        return PERIOD_STR_5M
    elif activity_interval == INTERVAL_1H_STR:
        return PERIOD_STR_1H
    elif activity_interval == INTERVAL_1D_STR:
        return PERIOD_STR_1D

def get_period_int_interval(activity_interval):
    """
    Transform activity interval into period int
    e.g. "1m" -> PERIOD_INT_1M (1) or "1d" -> PERIOD_INT_1D (1440)
    supporting condition has to be added manually depending on available activity interval (data_collection.models.DatabaseInfo.basefield_options.*.min_period)
    e.g. binanceLinear metrics has min_period of INTERVAL_5M_STR ('5m') 

    Args:
        activity_interval (str): activity interval in string
    Returns:
        (int): period in int

    """
    if activity_interval == INTERVAL_1M_STR:
        return PERIOD_INT_1M
    elif activity_interval == INTERVAL_5M_STR:
        return PERIOD_INT_5M
    elif activity_interval == INTERVAL_1H_STR:
        return PERIOD_INT_1H
    elif activity_interval == INTERVAL_1D_STR:
        return PERIOD_INT_1D

def get_period_str_period(period_int):
    """
    Transform period int into period str for pd.Timestamp manipulation
    e.g. 5 -> '5T', 1440 -> '1440T'

    Args:
        period_int (int): integer period in unit of minute e.g. 1440 (1d)
    Returns:
        (str): period in string

    """
    return f"{period_int}T"

def get_intervaltoms_interval(activity_interval):
    if activity_interval in [INTERVAL_1M_STR, INTERVAL_5M_STR]:
        return M_INTERVAL_TO_MS
    elif activity_interval == INTERVAL_1D_STR:
        return D_INTERVAL_TO_MS

def is_m_interval(activity_interval):
    """
    Determine if given activity_interval is minute frequency

    Args:
        activity_interval (str): one of INTERVAL_1M_STR, INTERVAL_5M_STR, INTERVAL_1D_STR
    Returns:
        (boolean): true if given interval is minute frequency

    """
    return activity_interval in [INTERVAL_1M_STR, INTERVAL_5M_STR]

def str_to_datetime(dt_str, format_str=DATETIME_FORMAT):
    return datetime.strptime(dt_str, format_str)

def str_to_datetime_aware(dt_str, format_str=DATETIME_FORMAT, timezone=None):
    return make_aware(datetime.strptime(dt_str, format_str), timezone=timezone)

def str_to_datetime_utc(dt_str):
    """
    Convert datetime string into datetime in utc timezone by datetime.fromisoformat
    Assuming format_str is "%Y-%m-%d %H:%M:%S" or "%Y-%m-%dT%H:%M:%S" (without timezone e.g. +08:00)

    Args:
        dt_str (str): datetime in string format (%Y-%m-%d %H:%M:%S or %Y-%m-%dT%H:%M:%S)
    Returns:
        (datetime): python datetime object

    """
    if dt_str.find('+') > -1: raise Exception("Assuming format_str is 'hY-%m-%d %H:%M:%S' or '%Y-%m-%dT%H:%M:%S' (without timezone e.g. +08:00)")
    return datetime.fromisoformat(f"{dt_str}+00:00")

def datetime_to_str(dt, format_str=DATETIME_FORMAT):
    """
        convert pandas.timestamp type to pydatetime cause make_datetime_naive only apply to pydatetime
        then make datetime localize and convert to string
    """
    dt = make_datetime_naive(pdts_to_pydatetime(dt))
    return dt.strftime(format_str)

"""
def dt_offset(func_name, dt, period_T, offset_hour):
    ''' dt_offset is helper function to dt_ceil & dt_floor
    Caveat: pandas.Timestamp.ceil or floor != round up or round down when it's well-rounded number
    '''
    dt = pd.Timestamp(dt) - timedelta(hours=offset_hour)
    return getattr(dt, func_name)(period_T) + timedelta(hours=offset_hour)
    # return dt.to_pydatetime()

def dt_ceil(dt, period_T, offset_hour=settings.LOCALTIME_OFFSET):
    ''' Assumption: least precision for kline model is in minutes (plus timedelta(seconds=1)) '''
    return dt_offset('ceil', dt + timedelta(microseconds=1), period_T, offset_hour) - timedelta(microseconds=1)

def dt_floor(dt, period_T, offset_hour=settings.LOCALTIME_OFFSET):
    return dt_offset('floor', dt, period_T, offset_hour)
"""
    
class DateTimeEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (datetime)):
            return int(obj.timestamp() * 1000)

class CustomEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (datetime)):
            return int(obj.timestamp() * 1000)
        elif isinstance(obj, (Decimal)):
            return float(obj)

def ping(ip):
    res = os.system(f'ping -c 1 {ip}')
    return res == 0

def res_js_to_py_dict_helper(val):
    if val in ['true', 'false', 'null']: val = json.loads(val)
    return val
    
def res_js_to_py_dict(res_dict):
    return {key: res_js_to_py_dict_helper(value) for key, value in res_dict.items()}

def create_message(sender, message):
    """
    Creating message in predetermined template

    Args:
        sender (str): sender function in string
        message (str): message details

    Returns:
        (str): string containing prep message
    """
    return f"Sender: {sender}\nMessage: {message}"

def send_message(content):
    """
    Sending message

    Args:
        content (str): message content in string
    """
    print(content)

def is_digit_str(digit_str):
    """
    Validate if given str value is digit (int, float, scientific notation) with python default function isdigit
    isdigit does not accept str value of float, decimal, scientific notation, or signed integer

    >>> "1.0".isdigit = False
    >>> "1e5".isdigit = False
    >>> "-1".isdigit = False
    >>> "1".isdigit = True

    Args:
        digit_str (str): str value
    Returns:
        (boolean): given str value is str (previously) wtih underlying digit

    """
    # validate given value is str
    # return False if int, float, decimal, boolean is given
    if not isinstance(digit_str, str): return False
    # remove sign if exists
    has_symbol = True if digit_str[0] in ['-', '+'] else False
    digit_str =  digit_str[1 if has_symbol else 0:]
    # remove decimal point, scientific notation & its sign
    digit_str = digit_str.replace('.', '').replace('e', '').replace('-', '').replace('+', '')
    return digit_str.isdigit()

def str_to_digit(digit_str):
    """
    Convert digit value in str format to digit with help of is_digit_str

    Args:
        digit_str (str): str value
    Returns:
        (int or float): formatted value if is_digit_str == True; otherwise return digit_str
        
    """
    if is_digit_str(digit_str):
        if (digit_str.find('e') > -1) or (digit_str.find('.') > -1):
            return float(digit_str)
        else:
            return int(digit_str)
    return digit_str

def hex_to_rgba(hex_color, alpha=1.0):
    """
    Convert hex_color to rgba with supplementary alpha value

    Args:
        hex_color (str): str containing hex_color e.g. '#000000'
        alpha (float): alpha value (float value from 0 to 1); defaults to 1 (full opacity)
    Returns:
        (tuple): tuple containing (r, g, b, a) values

    """
    hex_color = hex_color.lstrip("#")
    if len(hex_color) == 3:
        hex_color = hex_color * 2
    return int(hex_color[0:2], 16), int(hex_color[2:4], 16), int(hex_color[4:6], 16), alpha

def topological_sort(pk_list, dependent_pk_dict):
    """
    To generate the result, we need to determine the correct order in which the items in pk_list should be processed based on their dependencies. This is a typical problem of topological sorting, where we need to find a valid ordering of the items, respecting the dependency constraints.

    Steps:
        Create a graph representation of the dependencies.
        Track in-degrees (how many dependencies each item has).
        Process the items with no dependencies (in-degree 0) and keep reducing the in-degrees as we process each item.
        Build the result by adding items to the output as we resolve their dependencies.

    Explanation:
        Graph and In-degree: We create a graph from the dependent_pk dictionary, where each key points to the items that depend on it. We also track the in-degrees, i.e., how many dependencies each item has.
        Queue Initialization: We initialize a queue with all items having an in-degree of zero, as these items have no prerequisites and can be processed immediately.
        Topological Sorting: We process each item in the queue, reduce the in-degrees of its dependents, and add any dependent items whose in-degree becomes zero to the queue.
        Output: Once all items have been processed, we have the topologically sorted list of items

    Incorrect (Does not handle multiple dependent levels):
        >>> def test(pk_list, dependent_pk_list):
        >>>     new_pk_list = pk_list.copy()
        >>>     for key_pk, val in dependent_pk_list.items():
        >>>         new_pk_list.remove(key_pk)
        >>>         max_index = 0
        >>>         for val_pk in val:
        >>>             curr_index = new_pk_list.index(val_pk)
        >>>             if curr_index > max_index: max_index = curr_index
        >>>         new_pk_list.insert(max_index + 1, key_pk)
        >>>     return new_pk_list

    Tests:
        >>> pk_list = [1, 2, 3, 4, 5]
        >>> dependent_pks = { 2: [1], 3: [5, 4], 4: [5], 1: [3] }
        >>> (Correct) topological_sort(pk_list) = [5, 4, 3, 1, 2]
        >>> (Incorrect) test(pk_list) = [2, 5, 4, 3, 1]

    """
    # Step 1: Initialize in-degrees and graph.
    in_degree = defaultdict(int)  # Keep track of the in-degree of each item.
    graph = defaultdict(list)  # Adjacency list for the graph.

    # Step 2: Populate the graph and in-degrees based on the dependencies.
    for key, values in dependent_pk_dict.items():
        for value in values:
            graph[value].append(key)
            in_degree[key] += 1

    # Step 3: Initialize the queue with all nodes having in-degree 0.
    queue = deque([node for node in pk_list if in_degree[node] == 0])
    
    result = []
    
    # Step 4: Perform topological sorting.
    while queue:
        node = queue.popleft()
        result.append(node)

        # Reduce the in-degree of all dependent nodes.
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    # Step 5: Return the sorted result.
    return result

def fetch_errhandle_helper(url, notify_msg, test_retry=False):
    """
    Args:
        url (str): request url
        notify_msg (str): msg to send to server
        test_retry (bool): determine to test retry

    Returns:
        (tuple or Response or str):
            - (tuple) if test_retry & exception caught -> return tuple (RES_ERROR_RETRY, response)
            - (str) if not test_retry & exception caught -> return RES_ERROR
            - (Response) if no exception caught -> return Response
    """
    res = None
    try:
        res = requests.get(url)
    except Exception as exc:
        if test_retry: return RES_ERROR_RETRY, res
        err_code = str(exc)
        error_handle(url, err_code=err_code)
        notify_msg += f"\nError: {err_code}"
        return RES_ERROR

    try:
        res.raise_for_status()
    except Exception as exc:
        if test_retry: return RES_ERROR_RETRY, res
        err_code = str(exc)
        error_handle(url, err_code=err_code, err_msg={"res": res})
        notify_msg += f"\nError: {err_code}"
        return RES_ERROR

    return res

def fetch_errhandle(url, notify_msg="", to_retry_func=None):
    """
        Add error handle & retry implementation upon failing request 
        Sleep for RESET_SLEEP_DELAY for every retries
        Notify upon every retries & eventual failure

        Args:
            url (str): request url
            notify_msg (str): message to send to server
            to_retry_func (function): function to determine if error should be retried
                - take one argument (Response)
                - if (to_retry_func is presence) & (exception is caught) & (to_retry_func returns False): return RES_ERROR (Not to retry) 
    """
    n_try = 0
    while True:
        if n_try > MAX_CONNECTION_RETRY:
            notify_msg += f"\nRetry: {n_try}/{MAX_CONNECTION_RETRY} attempts"
            send_message(notify_msg)
            # raise Exception(notify_msg)
            return RES_ERROR

        res = fetch_errhandle_helper(url, notify_msg, to_retry_func != None)
        if to_retry_func and (type(res) == tuple):
            if (res[0] == RES_ERROR_RETRY) and (not to_retry_func(res[1])):
                return RES_ERROR
        elif (type(res) != tuple) and (res != RES_ERROR):
            return res
        n_try += 1
        send_message(notify_msg + f"\nRetry: {n_try}/{MAX_CONNECTION_RETRY} attempts")
        # time.sleep(RESET_SLEEP_DELAY)

def download_file_helper(download_url, save_path, notify_msg, to_retry_func):
    """
    Download file by requests.get

    Args:
        download_url (str): downloading url of file 
        save_path (str): file destination path
        notify_msg (str): notification message in case request failure
    """
    res = fetch_errhandle(download_url, notify_msg, to_retry_func=to_retry_func)
    if (res == None) or (res == RES_ERROR): return False

    length = res.headers['Content-Length']
    if length:
        length = int(length)
        blocksize = max(4096,length//100)

    with open(save_path, 'wb') as out_file:
        dl_progress = 0
        print("\nFile Download: {}".format(save_path))
        for chunk in res.iter_content(blocksize):
            out_file.write(chunk)
            dl_progress += len(chunk)
            done = int(50 * dl_progress / length)
            sys.stdout.write("\r[%s%s]" % ('#' * done, '.' * (50-done)) )
            sys.stdout.flush()
    print("\n")
    return True

def download_file(download_url, save_path, to_retry_func=None):
    """
        download file with self.__download_file_helper
    """
    notify_msg = f"Request url {download_url} failed."
    dest_path = os.path.dirname(save_path)
    if not os.path.exists(dest_path):
        os.makedirs(dest_path)
    return download_file_helper(download_url, save_path, notify_msg, to_retry_func=to_retry_func)

def write_to_csv(path, list_dictfield, list_column):
    if os.path.exists(path):
        file_type = 'a'
    else:
        file_type = 'w'
        list_dictfield = [list_column] + list_dictfield
    with open(path, file_type, newline='') as f:
        csv_writer = csv.writer(f, delimiter=',')
        for field in list_dictfield:
            csv_writer.writerow(field)

def write_csv_to_zip(csv_path, zip_path=None):
    if not zip_path: zip_path = csv_path.replace('.csv', '.zip')
    csv_filename = os.path.basename(csv_path)
    print(f"Zipping {csv_filename} to {zip_path}")
    with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as handle:
        handle.write(csv_path, csv_filename)

def append_to_log(file_path, line):
    ts_now = get_timestamp_now()
    line = f"{ts_now}: {line}\n"
    with open(file_path, "a") as f:
        f.writelines(line)
        f.close

def dataframe_to_json(df: pd.DataFrame, index: bool) -> str:
    return df.to_json(orient="columns") if index else json.dumps(df.to_dict(orient="list"))

def round_sig_step(x):
    if x == 0:
        return 0

    magnitude = math.floor(math.log10(abs(x)))
    decimals = -(magnitude - 1)

    return round(x, decimals)

def generate_uuid(n=16):
    return f"{uuid.uuid4().hex[:n]}"

def get_client_ip(request):
    # if using cloudflare challenge
    cf_ip = request.META.get("HTTP_CF_CONNECTING_IP")

    if cf_ip: return cf_ip

    # no cloudflare routing
    xff = request.META.get("HTTP_X_FORWARDED_FOR")

    if xff: return xff.split(",")[0].strip()

    return request.META.get("REMOTE_ADDR")

def get_ip_info(ip_addr):
    res = requests.get(f"{IPAPI_URL}/{ip_addr}/json/")
    if res.status_code == requests.codes.ok:
        return { "success": True, **res.json() }
    else:
        res = requests.get(f"{IPWHOIS_URL}/{ip_addr}")
        if res.status_code == requests.codes.ok:
            return { "success": True, **res.json() }
        else:
            response = reader.city(ip_addr)
        return dict(ip=ip_addr, country=response.country.name, city=response.city.name, latitude=response.location.latitude, longitude=response.location.longitude, success=False)

def is_localhost(ip_addr):
    return ip_addr in [LOCALHOST_IP, WIREGUARD_IP]
