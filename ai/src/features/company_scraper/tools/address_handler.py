import re
from src.features.company_scraper.tools.address_resolver import AddressResolver
from src.features.company_scraper.tools.utils import get_full_address
from loguru import logger as logging


class AddressHandler:
    """
    A helper class for managing and enriching address data within a company schema.

    This class is responsible for extracting, cleaning, and enriching address fields
    from a raw company data dictionary. It uses the `AddressResolver` to transform
    unstructured address strings into structured and normalized address objects.

    Core responsibilities include:
    - Extracting the headquarters and establishment unit addresses.
    - Cleaning and comparing addresses using standardized formats.
    - Enriching raw addresses with structured data (e.g., components like street, city, postal code).
    - Updating the company schema with enriched address data for both the headquarters
      and all establishment units.

    Attributes:
        company_schema_raw_data (dict): The raw dictionary containing all company-related
        data, including address fields that need enrichment.
    """

    def __init__(self, company_schema_raw_data: dict):
        self.company_schema_raw_data = company_schema_raw_data

    def _collect_existing_full_addresses(self) -> list[str]:
        """
        Gathers all raw address strings from the company data schema.

        This method extracts the headquarters address and all establishment unit addresses
        into a list of strings. These raw addresses will be used later for enrichment.

        Returns:
            list[str]: A list containing the headquarters address and all establishment unit
            addresses. Returns an empty list if none are found.
        """
        full_addresses = []
        hq_address = get_full_address(self.company_schema_raw_data.get("address"))
        if hq_address:
            full_addresses.append(hq_address)
        units = self.company_schema_raw_data.get("establishment_units", [])
        for unit in units:
            (
                full_addresses.append(unit.get("address"))  # get the address string
                if isinstance(unit.get("address"), str)
                else get_full_address(
                    unit.get("address")
                )  # get the address dict formated into string
            )
        return full_addresses

    def _enrich_addresses(self, full_addresses: list[str]) -> dict[str, dict] | None:
        """
        Uses the AddressResolver to enrich a list of raw address strings.

        Args:
            full_addresses (list[str]): A list of unstructured address strings to enrich.

        Returns:
            dict[str, dict] | None: A mapping from original address strings to structured
            address dictionaries. Returns None if the enrichment fails or encounters an error.
        """
        try:
            result = AddressResolver(full_addresses).resolve()
            if result:
                enriched_addresses = result
                return enriched_addresses
            logging.error("Error during address resolution for result is None")
        except Exception as e:
            logging.error(
                f"Error during address resolution for '{full_addresses}': {e}"
            )
            return None

    def clean_address(self, address: str) -> str:
        """
        Cleans the address by removing special characters (underscore, hyphens, etc.)
        and normalizing spaces, making it easier to compare addresses.

        Args:
            address (str): The raw address string to clean.

        Returns:
            str: The cleaned address, normalized for comparison.
        """
        # Replace underscores, hyphens, etc. with spaces
        address = re.sub(r"[_\-]", " ", address)
        # Remove any characters that are not letters, digits, or spaces
        address = re.sub(r"[^\w\s]", "", address)
        # Replace multiple spaces with a single space and trim the result
        address = re.sub(r"\s+", " ", address).strip()
        # Convert to lowercase to make the comparison case-insensitive
        return address.lower()

    def _update_hq_address(self, enriched_address_map: dict[str, dict]):
        """
        Updates the headquarters address in the company schema using the enriched address map.

        It searches for the enriched version of the current HQ address and replaces
        the raw data with the enriched structure if found.

        Args:
            enriched_address_map (dict[str, dict]): A mapping from raw address strings
            to structured enriched address data.
        """
        hq_address = get_full_address(self.company_schema_raw_data.get("address"))
        enriched_hq_address = None

        if hq_address:
            for key, value in enriched_address_map.items():
                if key in hq_address:
                    enriched_hq_address = value
                    break
            if enriched_hq_address:
                self.company_schema_raw_data["address"] = (
                    enriched_hq_address.model_dump()
                )

    def _update_establishment_units(self, enriched_address_map: dict[str, dict]):
        """
        Updates the 'enriched_address' field for all establishment units.

        For each unit, it attempts to match its raw address with an enriched address
        from the provided map. If matched, it assigns the enriched version; otherwise,
        sets the field to None.

        Args:
            enriched_address_map (dict[str, dict]): A mapping from raw address strings
            to enriched address objects.
        """
        units = (
            self.company_schema_raw_data["establishment_units"]
            if "establishment_units" in self.company_schema_raw_data
            else []
        )
        for unit in units:
            full_address = (
                unit.get("address")
                if isinstance(unit.get("address"), str)
                else get_full_address(unit.get("address"))
            )
            enriched_address = None

            if full_address:
                for key, value in enriched_address_map.items():
                    if key in full_address:
                        enriched_address = value
                        break

                if enriched_address:
                    unit["address"] = (
                        enriched_address.model_dump()
                    )  # update the address (string) with the enriched version (Address dict)
                else:
                    unit["address"] = None

    def match_and_update_addresses(self):
        """
        Coordinates the entire process of enriching and updating company addresses.

        It collects all address strings from the company schema, attempts to enrich them,
        and then updates both the HQ and establishment units with the enriched versions.

        Logs warnings and errors if the enrichment fails or no addresses are found.
        """
        full_addresses = self._collect_existing_full_addresses()
        if not full_addresses:
            logging.warning("No full addresses found to resolve.")
            return

        enriched_addresses = self._enrich_addresses(full_addresses)
        if not enriched_addresses:
            logging.error("Failed to enrich addresses.")
            return

        self._update_hq_address(enriched_addresses)
        self._update_establishment_units(enriched_addresses)

    def resolve(self) -> dict:
        """
        Main method to resolve and enrich addresses in the company schema.

        This method is the entry point for address enrichment. It orchestrates the
        collection, enrichment, and updating of addresses in the company schema.

        Returns:
            dict: The updated company schema with enriched addresses.
        """
        
        return self.company_schema_raw_data
