import os
from urllib.parse import quote
from loguru import logger as logging
import requests

from src.features.company_scraper.config.urls import URL
from src.features.company_scraper.schema.company_schema import AddressSchema
from src.features.company_scraper.tools.utils import safe_request, find_region

import re

AZURE_MAP_KEY = os.getenv("AZURE_MAPS_SUBSCRIPTION_KEY")
if AZURE_MAP_KEY is None:
    raise ValueError(
        "AZURE_MAPS_SUBSCRIPTION_KEY is not set in environment variables. "
        "Please set it to use the AddressResolver."
    )


class AddressResolver:
    """
    The AddressResolver class performs batch geocoding of addresses using the Azure Maps API.

    It provides methods to format, send, and parse geolocation requests efficiently, with built-in
    error handling and support for parallel processing.

    Core Responsibilities:
    -----------------------
    - Formats address strings into valid batch queries for the Azure Maps API.
    - Sends batched geocoding requests using a safe HTTP wrapper.
    - Parses responses and extracts structured address data (e.g., street, number, city, region).
    - Handles edge cases such as malformed or ambiguous addresses.
    - Provides an optional parallelized version for handling large address sets.

    Main Methods:
    -------------
    - `build_batch_items`: Prepares query items in a URL-encoded format for the batch API.
    - `send_batch_request`: Sends a batch of addresses to the Azure Maps API.
    - `parse_single_result`: Extracts structured data from a single geocoded result.
    - `parse_address`: Orchestrates the geocoding of a batch and maps results to original inputs.
    - `extract_last_postal_code`: Handles cases where multiple postal codes are returned.
    - `resolve`: Entry point for resolving a list of addresses.

    Usage Example:
    --------------
    >>> resolver = AddressResolver(["Avenue Louise 251, 1050 Brussels, Belgium"])
    >>> results = resolver.resolve()

    Requirements:
    -------------
    - An Azure Maps API subscription key set in the environment variable `AZURE_MAPS_SUBSCRIPTION_KEY`.
    - Utility methods: `safe_request`, `find_region`, and a valid `AddressSchema`.

    Notes:
    ------
    This class is designed for resilience and performance when working with geocoding APIs,
    making it suitable for use cases involving large volumes of address data.

    Official API Reference:
    -----------------------
    https://learn.microsoft.com/en-us/rest/api/maps/search/get-search-address-batch?view=rest-maps-1.0&tabs=HTTP
    """

    def __init__(self, addresses: list[str]):
        """_summary_

        Args:
            addresses (list[str]): A list of address strings to be geocoded.

        Raises:
            ValueError: _description_
        """

        self.address = [address for address in addresses if address.strip() != "" ]

    def send_batch_request(self, addresses: list[str]) -> requests.Response:
        """
        Sends a batch geocoding request to the Azure Maps API.

        Constructs the request headers, parameters, and body from the provided address list,
        then sends the request using a safe wrapper around the HTTP client.

        Args:
            addresses (list[str]): A list of address strings to be geocoded.

        Returns:
            requests.Response: The raw HTTP response returned by the Azure Maps API.
        """
        # Prepare request headers and parameters
        headers = {"Content-Type": "application/json"}
        params = {"api-version": "1.0", "subscription-key": AZURE_MAP_KEY}

        # Build the batch request body from the list of addresses
        body = {"batchItems": self.build_batch_items(addresses)}

        # Send the request using a safe wrapper and return the response
        return safe_request(
            URL.AZURE_MAP_API, headers=headers, json=body, params=params
        )

    def parse_single_result(
        self, batch_results: list[dict], index: int, original_address: str
    ) -> AddressSchema | None:
        """
        Parses and validates a single geocoding result from the Azure Maps batch response.

        Extracts the relevant address data from the given index, validates the postal code and region,
        and builds a structured AddressSchema object if all required fields are valid.

        Args:
            batch_results (list[dict]): The full list of results from the Azure Maps API.
            index (int): The index corresponding to the current address in the batch.
            original_address (str): The original address string (used for logging purposes).

        Returns:
            AddressSchema | None: A structured address object or None if parsing or validation fails.
        """
        try:
            # Extract the individual result from the batch by index
            result_item = batch_results[index]
            
            # Retrieve the "results" field from the "response" dictionary. 
            # If "response" or "results" is missing, default to an empty list.
            results: list = result_item.get("response", {}).get("results", [])
            results.sort(key=lambda x: x.get("score", 0), reverse=True)
            # If the "results" list is empty (no geocoding results found), log a warning and return None.
            if not results:
                logging.warning(f"No results found for address: {original_address}")
                return None

            address_data = None
            # If results exist, extract the address data from the first result (index 0).
            for result in results:
                if result.get("type") == "Street" or result.get("type") == "Point Address" or result.get("type") == "Address Range":
                    # Use the first valid address result
                    address_data = result.get("address", {})
                    break

            if address_data is None:
                logging.warning(f"No address data found for address: {original_address}")
                return None


            # Extract and validate the postal code
            postal_code = self.extract_last_postal_code(address_data.get("postalCode"))
            if not postal_code:
                logging.warning(f"Invalid postal code for address: {original_address}")
                return None

            # Determine the region from the postal code
            region = find_region(postal_code)
            if not region:
                logging.warning(f"Region not found for postal code: {postal_code}")
                return None

            # Build and return the structured address
            return AddressSchema(
                street=address_data.get("streetName"),
                street_number=str(address_data.get("streetNumber")),
                postal_code=postal_code,
                city=address_data.get("municipality"),
                region=region,
                province=address_data.get("countrySecondarySubdivision"),
                country=address_data.get("country"),
            )

        except Exception as e:
            # Log any unexpected errors during parsing
            logging.exception(
                f"[Batch {index}] Error parsing address: {original_address} → {str(e)}"
            )
            return None

    def parse_address(self, addresses: list[str]) -> dict[str, AddressSchema]:
        """
        Orchestrates the geocoding of a list of addresses using Azure Maps.

        Sends the list in a batch request, processes each result,
        and returns a dictionary mapping the original address to its parsed and validated schema.

        Args:
            addresses (list[str]): A list of address strings to process.

        Returns:
            dict[str, AddressSchema]: A mapping of original addresses to parsed address objects,
                                    excluding addresses that failed validation.
        """
        result_map = {}

        try:
            # Send batch request to Azure Maps
            response = self.send_batch_request(addresses)

            # Check for valid HTTP response
            if response.status_code != 200:
                logging.error(
                    f"[Azure Maps] Status {response.status_code} : {response.text}"
                )
                return result_map

            # Extract and parse each result individually
            batch_results = response.json().get("batchItems", [])
            for i, address in enumerate(addresses):
                parsed = self.parse_single_result(batch_results, i, address)
                if parsed:
                    result_map[address] = parsed

        except Exception as e:
            # Log unexpected processing errors
            logging.exception(f"[Azure Maps] Unexpected error: {str(e)}")

        return result_map

    @staticmethod
    def _regex_update(inital_address):
        return quote(re.sub(r"(?i)(\S)(laan\b)", r"\1 laan", inital_address.strip()))
        
    
    def build_batch_items(self, address_list: list[str]) -> list[dict]:
        """
        Builds a list of batch query items formatted for the Azure Maps batch geocoding API.

        Example: [{"query": "?query=Chaussée de Mons 1301 1070 Anderlecht Belgium"}, ...]
        """
        return [
            {"query": f"?query={AddressResolver._regex_update(address)}"}
            for address in address_list
            if isinstance(address, str) and address.strip()
        ]

    def extract_last_postal_code(self, postal_code_str: str) -> str:
        """
        Extracts the last postal code from a string.

        This method is particularly useful when working with the Azure Maps API, which may return
        multiple postal codes for a single address — especially for addresses located in Brussels,
        where several overlapping postal zones can be associated with one location. In such cases,
        the API response often includes a comma-separated list of postal codes (e.g., "1000, 1040"),
        and the last one in the list typically corresponds to the most specific or relevant area
        for the given address.

        The function returns the last postal code in the list after stripping extra spaces.
        If the input does not contain commas, it simply trims the whitespace and returns the string.
        If the final result is not a valid integer, it logs an error and returns None.

        Args:
            postal_code_str (str): A string representing one or multiple postal codes.

        Returns:
            str: The last cleaned postal code, or None if the input is invalid.
        """

        try:
            # Case where multiple postal codes are separated by commas
            if "," in postal_code_str:
                last_postal = postal_code_str.split(",")[-1].strip()
            else:
                # Only one postal code in the string
                last_postal = postal_code_str.strip()

            # Optional check: make sure the result is a number (valid postal code)
            _ = int(last_postal)
            return last_postal

        except (ValueError, AttributeError):
            logging.error(f"Invalid or malformed postal code: {postal_code_str}")
            return None

    def resolve(self) -> dict[str, AddressSchema]:
        return self.parse_address(self.address)

    def resolve_single(self, address: str) -> AddressSchema:
        """
        Resolves a single address string into a structured AddressSchema object.

        Args:
            address (str): The address string to be resolved.

        Returns:
            AddressSchema: A structured address object or None if resolution fails.
        """
        return self.parse_address([address]).get(address)
