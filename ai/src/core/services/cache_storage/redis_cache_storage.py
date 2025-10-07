import os
from urllib.parse import urlparse
from redis import Redis

from core.log import DEBUG
from core.models.amqp.cache.base_cached_model import BaseCachedModel
from core.services.cache_storage.cache_storage import CacheStorage

REDIS_URL = os.getenv("REDIS_URL")


class RedisCacheStorage(CacheStorage):

    def __init__(self, key: str):
        DEBUG(
            "Redis cache storage initialized with key: ",
            key,
            " and redis url: ",
            REDIS_URL,
        )
        url = urlparse(REDIS_URL)
        self.redis_client = Redis(host=url.hostname, port=url.port)
        self.key = key

    def set(self, id: str, value: BaseCachedModel, expire: int = None):
        self.redis_client.set(self.key + id, value.to_byte(), expire)

    def get(self, id: str) -> str | bytearray:
        serialized = self.redis_client.get(self.key + id)
        return serialized

    def delete(self, id: str):
        self.redis_client.delete(self.key + id)

    def clear(self):
        keys = self.redis_client.keys(f"{self.key}*")
        for key in keys:
            self.redis_client.delete(key)
