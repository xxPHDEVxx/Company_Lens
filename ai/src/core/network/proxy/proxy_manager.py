"""
Module Name: core.proxy.proxy_manager

Description: This module contains the ProxyManager class, which is used to manage proxies.

"""
from abc import ABC
import random
from loguru import logger

from src.core.network.proxy.proxy import Proxy


class ProxyManager(ABC):
    """
    ProxyManager is used to manage proxies.
    """

    def __init__(self):
        self._proxies: list[Proxy] = []

    def load_proxies(self):
        """
        Load proxies from the local file into the proxy manager.
        """
        logger.info("Loading proxies from proxies_list.txt")
        try:
            with open("proxies_list.txt", "r", encoding="utf-8") as file:
                for line in file:
                    ip, port = line.strip().split(":")
                    self._proxies.append(Proxy(ip, port))
            logger.info(f"Loaded {len(self._proxies)} proxies")
        except FileNotFoundError:
            logger.error("proxies_list.txt not found. Fetch proxies first.")

    def get_random_proxy(self) -> Proxy:
        """
        Get a random proxy from the list, prioritizing the preferred proxy.

        Returns:
            dict: A dictionary with http and https proxies, or None if no proxies are available.
        """
        if not self._proxies:
            logger.warning("No proxies loaded")
            return None

        proxy = random.choice(self._proxies)
        logger.debug(f"Using random proxy: {proxy.build_proxy_address()}")
        return proxy
