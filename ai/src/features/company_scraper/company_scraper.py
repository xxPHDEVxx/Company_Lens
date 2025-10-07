# code liaison front via rabbit mq -> à implémtenter

# import os
# import enum
# from langsmith import traceable
# from core.amqp.reply_consumer import ReplyProvider
# from core.models.scrape.scrape_company_dto import ScrapeCompanyDto
# from core.parser.amqp_body_parser import AmqpBodyParser
# from core.worker.ada_worker_with_reply_queue import AdaworkerWithReplyQueue
# from core.orm.models.enum_mapper import EnumMapper
# from core.log import DEBUG
# from src.company_scraper.runnable.company_scraper import run


# # Retrieve the AMQP broker URL from environment variables
# AMQP_BROKER_URL = os.getenv("AMQP_BROKER_URL")


# class CompanyDataConsumer(AdaworkerWithReplyQueue):
#     """
#     Consumer class for handling company data scraping requests.

#     This class listens for AMQP messages containing company information requests,
#     processes the requests using data extractors, and returns the structured company data.
#     """

#     def __init__(self):
#         """
#         Initializes the consumer by setting up an AMQP reply provider and necessary parsers.
#         """
#         super().__init__(ReplyProvider(AMQP_BROKER_URL, "scrape_company_response"))
#         self.__company_parser = AmqpBodyParser(ScrapeCompanyDto)
#         self.__enum_mapper = EnumMapper()

#     @traceable
#     def work(self, body: bytes):
#         """
#         Handles a new AMQP request to scrape company data.

#         This method:
#         1. Parses the incoming AMQP message.
#         2. Extracts legal data of the company.
#         3. Completes the data with website information.
#         4. Returns a structured dictionary of the company details.

#         :param body: AMQP message body in bytes format.
#         :return: Dictionary containing the extracted company data.
#         """
#         DEBUG(f"New scrape company request with body: {body}")

#         # Parse the AMQP message to retrieve company details
#         dto: ScrapeCompanyDto = self.__company_parser.parse(body=body)
#         fields = dto.to_dict()

#         company_schema = run(fields)

#         # Convert Enums to serializable values before returning
#         return self.parse_enum(company_schema.model_dump())

#     def parse_enum(self, data: dict):
#         """
#         Converts Enum values into strings for serialization.

#         Since Enums cannot be directly serialized into JSON, this method ensures
#         that all Enum values in the company schema are properly converted.

#         :param data: Dictionary containing company data.
#         :return: Dictionary with Enums converted to string values.
#         """
#         for attr_name, value in data.items():
#             # Convert lists of Enums into lists of string values
#             if isinstance(value, list) and len(value) > 0 and isinstance(value[0], enum.Enum):
#                 value = [self.__enum_mapper.map(type(v)).from_string(v).value for v in value]
#             # Convert single Enum values into strings
#             elif isinstance(value, enum.Enum):
#                 value = self.__enum_mapper.map(type(value)).from_string(value).value
#             data[attr_name] = value
#         return data
