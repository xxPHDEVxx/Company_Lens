class URL:
    """
    A class that centralizes various URLs used for retrieving company data.

    This class serves as a reference for URLs involved in web scraping and data extraction.
    Some URLs contain placeholders like `{vat_number}` or `{deposit_id}`, which should be
    replaced with the appropriate values before use.

    Attributes:
        ENTITY_DETAILS (str): URL to retrieve general company information using its VAT number.
        ESTABLISHMENTS_LIST (str): URL to obtain the list of establishment units associated with a company.
        GEOAPIFY_API (str): URL for the Geoapify API, used for geocoding and retrieving address details.
        NBB_DEPOSITS_LIST (str): URL to list financial deposits of a company at the National Bank of Belgium (NBB).
        NBB_CSV_DEPOSIT (str): URL to download a specific financial deposit as a CSV file.
        NBB_PDF_DEPOSIT (str): URL to download a specific financial deposit as a PDF file.
    """

    ENTITY_DETAILS = "https://kbopub.economie.fgov.be/kbopub/zoeknummerform.html?lang=fr&nummer={vat_number}"
    ESTABLISHMENTS_LIST = "https://kbopub.economie.fgov.be/kbopub/vestiginglijst.html?lang=fr&ondernemingsnummer={vat_number}"
    GEOAPIFY_API = "https://api.geoapify.com/v1/batch/geocode/search"
    NBB_DEPOSITS_LIST = "https://consult.cbso.nbb.be/api/rs-consult/published-deposits?page=0&size=10&enterpriseNumber={vat_number}&sort=periodEndDate,desc&sort=depositDate,desc"
    NBB_CSV_DEPOSIT = "https://consult.cbso.nbb.be/api/external/broker/public/deposits/consult/csv/{deposit_id}"
    NBB_PDF_DEPOSIT = "https://consult.cbso.nbb.be/api/external/broker/public/deposits/pdf/{deposit_id}"
