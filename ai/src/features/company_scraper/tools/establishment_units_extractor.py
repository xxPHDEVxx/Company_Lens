import re
from typing import List
from bs4 import BeautifulSoup
from requests import HTTPError
from loguru import logger
from src.core.network.header_utils import HeaderUtils
from src.core.network.web_client import WebClient
from src.features.company_scraper.config.urls import URL
from src.features.company_scraper.schema.data_process import EstablishmentUnitData
from src.features.company_scraper.schema.raw_establishment import RawEstablishmentUnit
from src.features.company_scraper.tools.format import kbo_establishment_units_format


class EstablishmentUnitExtractor:
    """
    A class to handle extraction of establishment units data from the KBO website for a given VAT number.
    """

    def __init__(self, vat_number: str):
        self.__webclient = WebClient(headers=HeaderUtils.get_head_full_header())
        self.vat_number = vat_number

    def extract(self) -> EstablishmentUnitData:
        """
        Fetches the establishment units associated with a specific VAT number.

        Args:
            vat_number (str): The VAT number for which to fetch the units.

        Returns:
            EstablishmentUnitData: Object containing parsed unit details or raw HTML.
        """
        try:
            documents = self.__webclient.get(
                URL.ESTABLISHMENTS_LIST.format(vat_number=self.vat_number)
            )
        except HTTPError as e:
            logger.error(f"HTTP error while fetching establishment units: {e}")
            return EstablishmentUnitData(units=[])
        return self.handle_units(BeautifulSoup(documents, "html.parser"))

    def extract_address(self, text: str) -> str:
        """
        Extracts the address from the given text, excluding the "Depuis ..." part.

        Args:
            text (str): The raw text containing the address.

        Returns:
            str: The cleaned address.
        """
        address = re.sub(r"Depuis.*", "", text).strip()
        address = re.sub(r"\s+", " ", address).strip()
        return address

    def parse_etablissement_units(self, soup: BeautifulSoup) -> List[RawEstablishmentUnit]:
        """
        Parses the HTML content and extracts establishment unit details.

        Args:
            html (str): The raw HTML content.

        Returns:
            List[dict]: List of parsed unit dictionaries.
        """
        units: list[RawEstablishmentUnit] = []
        table = soup.find("table", id="vestiginglist") or soup.find("table")

        if not table:
            logger.error("No establishment unit table found in HTML.")
            return []

        tbody = table.find("tbody")
        if not tbody:
            logger.error("Table found but missing <tbody>.")
            return []

        rows = tbody.find_all("tr")
        for row in rows:
            cells = row.find_all("td")
            if len(cells) >= 6:
                establishment_number_tag = cells[2].find("a")
                establishment_number = (
                    establishment_number_tag.get_text(strip=True)
                    .replace(".", "")
                    .replace(" ", "")
                    if establishment_number_tag
                    else ""
                )
                unit = RawEstablishmentUnit(
                    statut=cells[1].get_text(strip=True),
                    establishment_number=establishment_number,
                    date=cells[3].get_text(strip=True) or None,
                    denomination=cells[4].get_text(strip=True),
                    address=self.extract_address(
                        cells[5].get_text(separator=" ", strip=True)
                    )   
                )
                units.append(unit)

        return units

    def handle_units(self, soup: BeautifulSoup) -> EstablishmentUnitData:
        """
        Extracts the units from the HTML documents or returns the cleaned HTML if parsing fails.

        Args:
            documents (List[Document]): HTML documents containing unit info.

        Returns:
            EstablishmentUnitData: Parsed data or raw HTML.
        """
        for tag in soup.find_all(["header", "footer"]):
            tag.decompose()

        units = self.parse_etablissement_units(soup)
        return (
            EstablishmentUnitData(units=units)
            if units
            else EstablishmentUnitData(html_content=str(soup))
        )
