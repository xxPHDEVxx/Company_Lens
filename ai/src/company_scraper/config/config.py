from src.company_scraper.config.urls import URL
from src.company_scraper.config.prompts import Prompt
from src.company_scraper.config.aggregators import AGGREGATORS_DOMAINS
from src.company_scraper.config.models import LLM
from src.company_scraper.config.belgian_annual_account_models import *
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from typing import List
from langsmith import traceable
from concurrent.futures import ThreadPoolExecutor
from langchain_community.document_loaders import WebBaseLoader
import json, urllib.parse, logging, string, requests, csv, os, re
from datetime import datetime
from src.company_scraper.schema.company_schema import *
from src.company_scraper.schema.schema_wrapper import CompanySchemaWrapper
from src.company_scraper.schema.data_process import *
from src.company_scraper.tools.scraper import get_random_header

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
