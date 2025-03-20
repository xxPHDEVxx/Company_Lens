from tools.utils import *
from googlesearch import search
from tools.scraper import CompanyScraper
from concurrent.futures import ThreadPoolExecutor
from tools.format import *
from config.config import *

scraper = CompanyScraper(AsyncHtmlLoader)


def get_urls_from_google(
    company_name: str, adress: str, num_results: int = 5
) -> List[str]:
    """
    Perform a Google search using the company name and its activities and return the URLs.

    :param company_name: The name of the company.
    :param activities: List of activities or keywords related to the company's business.
    :param num_results: The number of search results to return.

    :return List[str]: A list of URLs that match the search query.
    """
    # Combine company name and activities into a single search query
    search_query = f"{company_name} {adress}"
    # Perform the Google search (assuming 'search' is a function to perform the search)
    results = search(search_query, num_results=num_results, region="be")

    # Return the URLs from the search results
    return list(results)


def get_meta_content(soup, *attrs):
    """Extract metadata tag's content."""
    tag = soup.find("meta", attrs=dict(attrs))
    return tag["content"].strip() if tag and "content" in tag.attrs else None


def extract_page_data(url: str, company_name: str) -> dict:
    """
    Extracts key metadata from a web page, including title, description,
    Open Graph (OG) data, and Twitter metadata.

    :param url (str): The URL of the web page to analyze.

    :return dict: A dictionary containing the extracted metadata
    """

    # Fetch the HTML content and parse it with BeautifulSoup
    documents = scraper.run(url)
    if not documents:
        return ""
    html = documents[0].page_content
    if html == "":
        return

    markdown = convert_html_to_markdown(documents)[0].page_content

    soup = BeautifulSoup(html, "html.parser")

    return {
        "data": {
            "url": url,
            "title": soup.title.get_text(strip=True) if soup.title else None,
            "description": get_meta_content(soup, ("name", "description")),
            "og_title": get_meta_content(soup, ("property", "og:title")),
            "og_description": get_meta_content(soup, ("property", "og:description")),
            "og_site_name": get_meta_content(soup, ("property", "og:site_name")),
            "twitter_title": get_meta_content(soup, ("name", "twitter:title")),
            "twitter_description": get_meta_content(
                soup, ("name", "twitter:description")
            ),
            "similarity_name_domain": compare_name_with_domain(company_name, url),
            "website_content": markdown,
        }
    }


def parallel_execution(urls: List[str], company_name: str) -> List[dict]:
    """Process URLs and retrieve the metadata."""
    if not urls or not isinstance(company_name, str):
        return
    max_workers = min(10, len(urls))  # Adjust worker count based on number of URLs
    results = []
    search_data = [(url, company_name) for url in urls]
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        results = list(
            executor.map(lambda data: extract_page_data(data[0], data[1]), search_data)
        )
    return [item for item in results if item is not None]  # None value filter


def find_website(company_schema: CompanySchema):
    """
    Retrieves metadata from the first few search results for a given company name,
    processes the URLs, and selects the most relevant website based on LLM (Large Language Model) output.

    :param company_name: The name of the company for which metadata is being retrieved.
    :param num_results: The number of search results to retrieve from Google (default is 3).

    :return: A dictionary containing the full metadata of the most relevant website, or `None` if no valid result is found.
    """
    # Fetch the URLs related to the company from Google search results
    urls = get_urls_from_google(
        company_schema.name, company_schema.address.full_address
    )
    urls_without_aggregators = remove_aggregators_url(
        urls, company_schema.vat_number, company_schema.name
    )
    print(urls)
    print(urls_without_aggregators)
    if not urls_without_aggregators:
        return

    # Process the URLs to retrieve metadata for each website
    websites_data = parallel_execution(urls_without_aggregators, company_schema.name)
    if not websites_data:
        return

    # Use the LLM to select the most relevant website based on the processed data
    chain = Prompt.FIND_URL | LLM.GPT_4_TURBO
    best_url = chain.invoke(
        {
            "name": company_schema.name,
            "requests": websites_data,
            "activities": company_schema.activities.company_activities,
        }
    ).content
    if not best_url:
        return None

    # Find the complete data entry corresponding to the best URL selected by LLM
    best_netloc = urlparse(best_url).netloc  # Extract domain

    # Compare the domains
    selected_entry = next(
        (
            entry
            for entry in websites_data
            if urlparse(entry["data"]["url"]).netloc == best_netloc
        ),
        None,
    )

    return selected_entry


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
                "description": "Services that offer the company.",
            },
            "description": "List of services that offer the company.",
        },
    },
    "required": ["description", "sectors", "services"],
}


def get_company_description(website_content: str) -> str:
    """
    Generates a company description based on the provided website content using a Large Language Model (LLM).
    """
    chain = Prompt.MAKE_DESCRIPTION | LLM.GPT_4O_MINI.with_structured_output(
        company_description_output
    )

    return chain.invoke({"input": website_content})

@traceable
def complete_schema(company_schema: CompanySchema) -> CompanySchema:
    """
    Completes the provided company schema with additional information fetched from the web.

    :param company_schema: The schema object representing the company that will be updated.
    :param company_name: The name of the company, used to fetch related information from the web.

    :return: The updated company schema with the added website and company description.
    """
    # Retrieve the website data based on the company name
    if company_schema.contact.website:
        content = convert_html_to_markdown(scraper.run(company_schema.contact.website))[
            0
        ].page_content
        website_data = {
            "data": {"url": company_schema.contact.website, "website_content": content}
        }
    else:
        website_data = find_website(company_schema)
    if not website_data:
        return company_schema

    # Update the company schema with the website URL, description and sector
    company_schema.contact.website = website_data["data"]["url"]
    description_data = get_company_description(website_data["data"]["website_content"])
    company_schema.activities.company_description = description_data["description"]
    company_schema.activities.sectors = description_data["sectors"]
    company_schema.activities.services = description_data["services"]

    return company_schema
