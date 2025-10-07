import markdownify
from langsmith import traceable
from src.features.company_scraper.config.prompts import Prompt
from src.core.factory.chat_model_factory import ChatModelFactory
from src.core.web_loader.headfull_web_loader import HeadfullWebLoader
from src.features.company_scraper.schema.company_description import CompanyDescription
from loguru import logger as logging

class CompanyWebsiteExtractor:
    """
    A class responsible for extracting a company's official website
    and metadata based on a Google search and web scraping.
    """

    def __init__(self):
        self.scraper = HeadfullWebLoader()

    def get_company_description(self, website_content: str) -> CompanyDescription:
        """
        Generates a company description based on website content using an LLM.

        :param website_content: The company's website content.

        :return: A structured dictionary containing the company description, sectors, and services.
        """
        model = ChatModelFactory().create_factory().get_llm("company_scrapper")[0]
        model = model.with_structured_output(CompanyDescription)
        chain = Prompt.MAKE_DESCRIPTION | model
        return chain.invoke({"input": website_content})

    @traceable
    def complete_schema(self, website_url: str) -> CompanyDescription:
        """
        Completes the company schema with additional information retrieved from the web.

        :param company_schema: The company schema to update.

        :return: The updated company schema.
        """
        logging.info("website company retrieval started")

        web_page = self.scraper.load(website_url)
        md_content = markdownify.markdownify(str(web_page))
        description_data = self.get_company_description(md_content)
        return description_data
