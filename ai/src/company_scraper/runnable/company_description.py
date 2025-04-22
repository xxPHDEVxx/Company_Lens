from src.company_scraper.tools.utils import *
from googlesearch import search
from src.company_scraper.tools.scraper import CompanyScraper
from concurrent.futures import ThreadPoolExecutor
from src.company_scraper.tools.format import *
from src.company_scraper.config.config import *
from urllib.parse import urlparse
from typing import List, Dict


class CompanyWebsiteExtractor:
    """
    A class responsible for extracting a company's official website
    and metadata based on a Google search and web scraping.
    """

    def __init__(self, company_schema: CompanySchemaWrapper):
        if not company_schema:
            logging.error("WebsiteExtractor: company_schema cannot be None or empty.")
            self.company_schema = None
            self.scraper = None
            self.initialized = False
            return

        self.company_schema = company_schema
        self.scraper = CompanyScraper(WebBaseLoader)
        self.initialized = True

    def get_urls_from_google(
        self, company_name: str, address: str, num_results: int = 5
    ) -> List[str]:
        """
        Perform a Google search using the company name and its address, and return the URLs.

        :param company_name: The name of the company.
        :param address: The company's address.
        :param num_results: The number of search results to return.

        :return List[str]: A list of URLs matching the search query.
        """
        search_query = f"{company_name} {address}"
        results = search(search_query, num_results=num_results, region="be")
        return list(results)

    def get_meta_content(self, soup, *attrs) -> str:
        """Extract metadata tag's content."""
        tag = soup.find("meta", attrs=dict(attrs))
        return tag["content"].strip() if tag and "content" in tag.attrs else None

    def extract_page_data(self, url: str, company_name: str) -> Dict:
        """
        Extracts metadata from a webpage, including title, description, Open Graph, and Twitter metadata.

        :param url: The webpage URL.
        :param company_name: The name of the company.

        :return Dict: A dictionary containing extracted metadata.
        """
        documents = self.scraper.run(url)
        if not documents:
            logging.info("extract_page_data : page not found")
            return None

        html = documents[0].page_content
        if not html:
            logging.info("extract_page_data : page content not found ")
            return None

        markdown = convert_html_to_markdown(documents)[0].page_content
        soup = BeautifulSoup(html, "html.parser")

        return {
            "data": {
                "url": url,
                "title": soup.title.get_text(strip=True) if soup.title else None,
                "description": self.get_meta_content(soup, ("name", "description")),
                "og_title": self.get_meta_content(soup, ("property", "og:title")),
                "og_description": self.get_meta_content(
                    soup, ("property", "og:description")
                ),
                "og_site_name": self.get_meta_content(
                    soup, ("property", "og:site_name")
                ),
                "twitter_title": self.get_meta_content(soup, ("name", "twitter:title")),
                "twitter_description": self.get_meta_content(
                    soup, ("name", "twitter:description")
                ),
                "similarity_name_domain": compare_name_with_domain(company_name, url),
                "website_content": markdown,
            }
        }

    def parallel_execution(self, urls: List[str], company_name: str) -> List[Dict]:
        """
        Processes URLs and retrieves metadata in parallel.

        :param urls: List of URLs.
        :param company_name: The company name.

        :return: List of dictionaries containing metadata.
        """
        if not urls or not isinstance(company_name, str):
            return []

        max_workers = min(10, len(urls))
        results = []
        search_data = [(url, company_name) for url in urls]

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            results = list(
                executor.map(
                    lambda data: self.extract_page_data(data[0], data[1]), search_data
                )
            )

        return [item for item in results if item is not None]

    def find_website(self) -> Dict:
        """
        Retrieves metadata from search results, processes the URLs, and selects the most relevant website.

        :param company_schema: The company schema object.

        :return: The most relevant website metadata, or None if no valid result is found.
        """
        urls = self.get_urls_from_google(
            self.company_schema.raw_data["name"],
            self.company_schema.raw_data["address"]["full_address"],
        )
        urls_without_aggregators = remove_aggregators_url(
            urls,
            self.company_schema.raw_data["vat_number"],
            self.company_schema.raw_data["name"],
        )

        logging.info(urls_without_aggregators)

        if not urls_without_aggregators:
            logging.info("find_websites : there are no valids urls to scrape")
            return None

        websites_data = self.parallel_execution(
            urls_without_aggregators, self.company_schema.raw_data["name"]
        )
        if not websites_data:
            logging.info("find_websites : website data not found")
            return None

        chain = Prompt.FIND_URL | LLM.GPT_4_TURBO
        best_url = chain.invoke(
            {
                "name": self.company_schema.raw_data["name"],
                "requests": websites_data,
                "activities": self.company_schema.raw_data.get("activity").get(
                    "company_activities"
                ),
            }
        ).content

        if not best_url:
            logging.info("find_websites : No url match")
            return None

        best_netloc = urlparse(best_url).netloc
        selected_entry = next(
            (
                entry
                for entry in websites_data
                if urlparse(entry["data"]["url"]).netloc == best_netloc
            ),
            None,
        )

        return selected_entry

    def get_company_description(self, website_content: str) -> Dict:
        """
        Generates a company description based on website content using an LLM.

        :param website_content: The company's website content.

        :return: A structured dictionary containing the company description, sectors, and services.
        """
        company_description_output = {
            "title": "CompanyDescription",
            "description": "Extracts the company description and sectors based on its activities.",
            "type": "object",
            "properties": {
                "description": {
                    "type": "string",
                    "description": "Detailed description of the company.",
                },
                "sectors": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "description": "A sector in which the company operates.",
                    },
                    "description": "List of sectors inferred from company activities.",
                },
                "services": {
                    "type": "array",
                    "items": {
                        "type": "string",
                        "description": "Services that the company offers.",
                    },
                    "description": "List of services offered by the company.",
                },
            },
            "required": ["description", "sectors", "services"],
        }

        chain = Prompt.MAKE_DESCRIPTION | LLM.GPT_4O_MINI.with_structured_output(
            company_description_output
        )
        return chain.invoke({"input": website_content})

    @traceable
    def complete_schema(self) -> dict:
        """
        Completes the company schema with additional information retrieved from the web.

        :param company_schema: The company schema to update.

        :return: The updated company schema.
        """
        contact_info = self.company_schema.raw_data.get("contact", {})
        website_url = contact_info.get("website")

        if website_url:
            website_html = self.scraper.run(website_url)
            content = convert_html_to_markdown(website_html)[0].page_content
            website_data = {"data": {"url": website_url, "website_content": content}}
        else:
            website_data = self.find_website()

        if not website_data:
            return self.company_schema

        description_data = self.get_company_description(
            website_data["data"]["website_content"]
        )

        self.company_schema.raw_data["company_description"] = description_data.get(
            "description"
        )

        if not contact_info:
            self.company_schema.raw_data["contact"] = {}
        self.company_schema.raw_data["contact"]["website"] = website_data.get(
            "data"
        ).get("url")

        if "activity" not in self.company_schema.raw_data:
            self.company_schema.raw_data["activity"] = {}

        self.company_schema.raw_data["activity"]["sectors"] = description_data.get(
            "sectors", []
        )
        self.company_schema.raw_data["activity"]["services"] = description_data.get(
            "services", []
        )
        return self.company_schema
