import json as jsonLib
from typing import Dict, Optional
from loguru import logger
import requests
from src.core.network.proxy.proxy_manager import ProxyManager


class WebClient:
    """
    WebClient is a class used to get the content of a page.
    It may use a proxy manager to get the content.
    """

    def __init__(
        self, proxy_manager: ProxyManager | None = None, headers: Dict | None = None
    ):
        logger.debug("Creating a new WebClient")
        self._proxy_manager = proxy_manager
        self._headers = headers

        if self._proxy_manager is not None:
            logger.debug("Setting up the proxy manager for web client")
            self._proxy_manager.load_proxies()
        else:
            logger.debug("No proxy manager set up for web client")

    def _ensure_url_scheme(self, url: str) -> str:
        if not url.startswith(("http://", "https://")):
            logger.warning(f"URL missing scheme, prepending 'http://': {url}")
            return "http://" + url
        return url

    def get(self, url: str) -> Optional[bytes]:
        """
        get This method is used to get the content of the page.

        Args:
            url (_type_): _description_

        Returns:
            _type_: _description_
        """
        url = self._ensure_url_scheme(url)
        try:
            proxies = (
                self._proxy_manager.get_random_proxy() if self._proxy_manager else None
            )
            res = requests.get(
                url,
                timeout=5,
                headers=self._headers,
                proxies={
                    "http": proxies.build_proxy_address() if proxies else None,
                    "https": proxies.build_proxy_address() if proxies else None,
                },
            )
            res.raise_for_status()
            logger.trace(f"Successfully fetched {url} using proxy {proxies}")
            return res.content
        except requests.exceptions.SSLError:
            logger.error(
                f"Failed to fetch {url}: Connection pool error. Retrying with a new proxy."
            )
            return None
        except requests.exceptions.ProxyError as e:
            logger.error(f"Failed to fetch {url}: {e}. Retrying with a new proxy.")
            return self.get(url)
        except TimeoutError as e:
            logger.error(f"Failed to fetch {url}: {e}. Retrying with a new proxy.")
            return self.get(url)
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch {url}: {e}")
            raise

    def post(
        self,
        url: str,
        data: Dict | None = None,
        json: Dict | None = None,
        params: Dict | None = None,
        files: Dict | None = None,
    ) -> Optional[bytes]:
        """
        post This method is used to post the content of the page.

        Args:
            url (_type_): _description_
            data (_type_, optional): _description_. Defaults to None.
            json (_type_, optional): _description_. Defaults to None.

        Returns:
            _type_: _description_
        """
        try:
            proxies = (
                self._proxy_manager.get_random_proxy() if self._proxy_manager else None
            )
            res = requests.post(
                url,
                timeout=5,
                headers=self._headers,
                data=data,
                json=json,
                params=params,
                files=files,
                proxies={
                    "http": proxies.build_proxy_address() if proxies else None,
                    "https": proxies.build_proxy_address() if proxies else None,
                },
            )
            if res.status_code != 200:
                logger.error(
                    f"Failed to post to {url}: {res.status_code} - {jsonLib.dumps(res.json())}"
                )
                return
            res.raise_for_status()
            logger.trace(f"Successfully posted to {url} using proxy {proxies}")
            return res.content
        except requests.exceptions.SSLError:
            logger.error(
                f"Failed to post to {url}: Connection pool error. Retrying with a new proxy."
            )
            return None
        except requests.exceptions.ProxyError as e:
            logger.error(f"Failed to post to {url}: {e}. Retrying with a new proxy.")
            return self.post(url, data, json)
        except TimeoutError as e:
            logger.error(f"Failed to post to {url}: {e}. Retrying with a new proxy.")
            return self.post(url, data, json)
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to post to {url}: {e}")
            raise
