from typing import Optional

from core.models.amqp.cache.base_cached_model import BaseCachedModel
from core.services.cache_storage.cache_storage import CacheStorage


class DictCacheStorage(CacheStorage):

    def __init__(self, key: str = ""):
        self.store = {}
        self.key = key

    def set(self, id: str, value: BaseCachedModel, expire: int = None):
        self.store[self.key + id] = value.to_byte()

    def get(self, id: str) -> Optional[str]:
        serialized = self.store.get(self.key + id)
        return serialized

    def delete(self, id: str):
        if self.key + id in self.store:
            del self.store[self.key + id]

    def clear(self):
        self.store = {}
