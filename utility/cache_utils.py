from django.core.cache import cache

class CacheUtils:
    def get_all_keys(self):
        return cache.keys("*")

    def has_key(self, key):
        return cache.has_key(key)

    def get_key(self, key):
        return cache.get(key)
    
    def set_keyvalue(self, key, value, timeout=None):
        return cache.set(key, value, timeout=timeout)

    def getorset_keyvalue(self, key, value, timeout=None):
        return cache.get_or_set(key, value, timeout=timeout)

    def delete_key(self, key):
        return cache.delete(key)

MyCacheUtils = CacheUtils()
