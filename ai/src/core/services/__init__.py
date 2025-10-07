import os
from langchain_community.utilities.redis import get_client
from loguru import logger

REDIS_URL = os.getenv("REDIS_URL")


class RedisService:
    def __init__(self, host=REDIS_URL):
        try:
            self.client = get_client(host)
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise

    def set(self, key, value):
        self.client.set(key, value)

    def get(self, key):
        return self.client.get(key)

    def delete(self, key):
        self.client.delete(key)
