

class Proxy:
    """
    Store the state of a proxy.
    """

    def __init__(self, ip, port, protocol="http"):
        self._ip: str = ip
        self._port: str = port
        self._protocol: str = protocol.lower()  # Default to HTTP

    def build_proxy_address(self):
        """
        Build the proxy address.

        Returns:
            str: Proxy address
        """
        return f"{self._protocol}://{self._ip}:{self._port}"
