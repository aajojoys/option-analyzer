import uuid

from utility.cache_utils import MyCacheUtils
from utility.general import generate_uuid

SESSION_INSTANCE_KEY = "instance"
SESSION_INFO_KEY = "info"
SESSION_EXTRA_KEY = "extra"
RESERVED_COUNT = 4

class SessionUtils():
    def __init__(self, name_ids, max_count):
        self.name_ids = name_ids
        self.max_count = max_count
        self.init_ids()

    def init_ids(self):
        self.ids = MyCacheUtils.getorset_keyvalue(self.name_ids, {})
        self.default_id = list(self.ids.keys())[0] if self.ids else None

    def __validate_session(self):
        if len(self.ids) == self.max_count:
            todel_session  = list(self.ids.keys())[RESERVED_COUNT]
            self.__delete_session(todel_session)
            MyCacheUtils.set_keyvalue(self.name_ids, self.ids)

    def __create_session_id(self):
        return generate_uuid()

    def __create_session(self, session_id, Instance, session_kwargs, add_extra_func):
        if not session_id: session_id = self.__create_session_id()
        this_instance = Instance(**session_kwargs[SESSION_INSTANCE_KEY])
        MyCacheUtils.set_keyvalue(session_id, this_instance)
        self.ids[session_id] = add_extra_func(this_instance, session_kwargs) if add_extra_func else session_kwargs
        MyCacheUtils.set_keyvalue(self.name_ids, self.ids)
        return this_instance
    
    def get_session_ids(self):
        return list(self.ids.keys())

    def get_sessioninfo(self, session_id):
        return self.ids[session_id]

    def has_session(self, session_id):
        return (session_id in list(self.ids.keys())) and MyCacheUtils.has_key(session_id)

    def find_session(self, kwargs):
        for id in list(self.ids.keys()):
            has_session = self.has_session(id)
            if (kwargs[SESSION_INFO_KEY] == self.ids[id][SESSION_INFO_KEY]) and has_session:
                return id
            elif not has_session:
                self.__delete_session(id)
        return None

    def __delete_session(self, session_id):
        if MyCacheUtils.has_key(session_id): MyCacheUtils.delete_key(session_id)
        if session_id in list(self.ids.keys()):
            self.ids.pop(session_id)
            MyCacheUtils.set_keyvalue(self.name_ids, self.ids)

    def getorcreate_session(self, session_id, Instance, session_kwargs, add_extra_func):
        if session_id and self.has_session(session_id):
            return MyCacheUtils.get_key(session_id)
        elif Instance and session_kwargs:
            if session_id: self.__delete_session(session_id)
            self.__validate_session()
            return self.__create_session(session_id, Instance, session_kwargs, add_extra_func)
        else:
            return None
