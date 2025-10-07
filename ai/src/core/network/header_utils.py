"""
Module Name: core.web_client.header_utils

Description: This module contains helper for http
             client.

Author: Jeremy Trips
Date: 2025-02-24
"""


class HeaderUtils:
    """
    Class that holds some specicif headers

    Returns:
        _type_: _description_
    """

    @staticmethod
    def get_head_full_header():
        """
        get_head_full_header Returns a headfull header

        Returns:
            _type_: _description_
        """
        return {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://www.google.com/",
            "Connection": "keep-alive",
        }
