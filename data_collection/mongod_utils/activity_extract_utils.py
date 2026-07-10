from data_collection.model_utils import databaseinfo_get_basefield_objs_dbname, databaseinfo_get_basefield_options
from data_collection.mongod_utils.model_utils import mongod_get_activity_res
from data_collection.enums import ACTIVITYINFONAME_INTERVALS, COLNAME_OPENTIME, COLNAME_SYMBOL
from utility.general import get_period_str_interval, ts_ceil, ts_floor

class ActivityExtractUtils:
    """
    Contains utility function to extract desired database activity data e.g. kline, metrics
    """
    def __init__(self, db_name, is_realtime):
        self.db_name = db_name
        self.is_realtime = is_realtime
        self.__init_activity_basefields()

    def __init_activity_basefields(self):
        """
        Get underlying activity data_collection.BaseField based on given info (is_realtime & db_name)
        """
        self.basefield_objs = list(databaseinfo_get_basefield_objs_dbname(self.db_name))
        self.basefield_options = databaseinfo_get_basefield_options(self.db_name)
        self.activityinfo_basefields_dict = {}
        for basefield_obj in self.basefield_objs.copy():
            # skip if basefield.pk is not present in basefield_options (insufficient info)
            # if basefield_obj.pk not in self.basefield_options: continue
            # update if basefield.pk is not present assuming normal condition e.g. OHLCV
            # skip if basefield_options[basefield.pk]["has_realtime"] == False while self.is_realtime == True
            # meaning underlying basefield is not supported in realtime
            basefield_pk = str(basefield_obj.pk)
            if (basefield_pk in self.basefield_options) and self.is_realtime and (not self.basefield_options[basefield_pk]["has_realtime"]):
                self.basefield_objs.remove(basefield_obj)
                continue 
            self.activityinfo_basefields_dict.setdefault(basefield_obj.activityinfo_name.name, [])
            self.activityinfo_basefields_dict[basefield_obj.activityinfo_name.name].append(basefield_obj)

    def __get_activity_res(self, activityinfo_name, activity_interval, start_ts, end_ts, symbol, include_listfields):
        """
        Get requesting record by given info

        Args:
            activityinfo_name (str): data_collection.ActivityInfo.name
            activity_interval (str): INTERVAL_1D_STR, INTERVAL_1M_STR, etc
            start_ts (int): starting unix timestamp in ms unit
            end_ts (int): ending unix timestamp in ms unit
            symbol (None or str): None for all symbols; selected symbol otherwise
            include_listfields (list): including field name include in requested data from mongod database
        Returns:
            (iters): selected activity data

        """
        # if activity_interval not in [INTERVAL_1M_STR, INTERVAL_1D_STR]:
        period_str = get_period_str_interval(activity_interval)
        floor_startts = ts_floor(start_ts, period_str)
        floor_endts = ts_floor(end_ts, period_str)
        ceil_endts = ts_ceil(end_ts, period_str)
        if (start_ts > floor_startts) and (floor_startts == floor_endts) and (end_ts < ceil_endts): return []
        return mongod_get_activity_res(self.db_name, activityinfo_name, activity_interval, start_ts, end_ts, symbol, include_listfields=include_listfields)

    def __get_all_activity_interval_helper(self, activityinfo_interval_res, activityinfo_name, activity_interval, start_ts, end_ts, symbol, to_cutoff=False):
        """
        Validate data availability & update activity basefield related class global variables if necessary
        For cases where requested timeline data is unavailable but underlying basefields are generally supported
        e.g. Binance only provides data of activity info 'metric' starting from 2023 (no data available before 2023)

        Args:
            activityinfo_interval_res (iters): result from function 'mongod_get_activity_res'
            activityinfo_name (str): data_collection.ActivityInfo.name
            activity_interval (str): INTERVAL_1D_STR, INTERVAL_1M_STR, etc
            start_ts (int): starting unix timestamp in ms unit
            end_ts (int): ending unix timestamp in ms unit
            symbol (None or str): None for all symbols; selected symbol otherwise
            to_cutoff (bool): to remove underlying basefields in the event of data absence if to_cutoff=True

        """
        include_listfields = [ obj.symbol for obj in self.activityinfo_basefields_dict[activityinfo_name] ]
        include_listfields += [ COLNAME_OPENTIME, COLNAME_SYMBOL ]
        # not lazy load for empty list condition checking
        res = list(self.__get_activity_res(activityinfo_name, activity_interval, start_ts, end_ts, symbol, include_listfields))
        if not res:
            if to_cutoff: self.update_activity_basefields(activityinfo_name)
            return
        activityinfo_interval_res[activityinfo_name] = res

    def update_activity_basefields(self, remove_name):
        """
        Update ActivityExtractUtils class global variables (especially basefields related)

        Args:
            remove_name (str): activityinfo name to be remove

        """
        del self.activityinfo_basefields_dict[remove_name]
        self.basefield_objs = [ obj for obj in self.basefield_objs if obj.activityinfo_name.name != remove_name ]

    def get_all_activity_interval(self, start_ts, end_ts, symbol, to_cutoff=False):
        """
        Get activity info records by corresponding interval (compare with given is_mfreq) in ACTIVITYINFONAME_INTERVALS

        Args:
            start_ts (int): starting unix timestamp in ms unit
            end_ts (int): ending unix timestamp in ms unit
            symbol (None or str): None for all symbols; selected symbol otherwise
            is_mfreq (bool): selected frequency is minute interval e.g. INTERVAL_1M_STR or INTERVAL_5M_STR if is_mfreq=True; INTERVAL_1D_STR otherwise
            to_cutoff (bool): (default: False) to remove underlying basefields in the event of data absence if to_cutoff=True
        Returns:
            (list): selected activity info records

        """
        activityinfo_interval_res = {}
        for name in self.activityinfo_basefields_dict.copy():
            for interval in ACTIVITYINFONAME_INTERVALS[name]:
                self.__get_all_activity_interval_helper(activityinfo_interval_res, name, interval, start_ts, end_ts, symbol, to_cutoff=to_cutoff)
        return activityinfo_interval_res
