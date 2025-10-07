from langchain.prompts import PromptTemplate


"""A class to encapsulate various prompts used for LLMs."""
class Prompt:
    FIND_URL = PromptTemplate.from_template(
        """
        You are an expert in data validation and web scraping. Your task is to identify the most relevant URL that corresponds to the official website of the company "{name}".  

        ### **Input Information:**  
        - You are given a list of URLs with metadata (**{requests}**).  
        - You also have information about the company's activities (**{activities}**).  

        ### **Rules to Identify the Correct URL:**  
        #### **Step 1: Domain Name Matching (Highest Priority)**  
        - **Check if the company's name (or a close variant) is present in the domain name**.  
        - If yes, this URL is a strong candidate.  

        #### **Step 2: Path Verification (To Detect Aggregators or Unrelated Sites)**  
        - If the domain name does **not** match the company name, **check if the company name appears in the path**.  
        - If the name appears **only in the path**, then this is likely an aggregator or a directory listing (not an official website).  

        #### **Step 3: Metadata and Context Validation**  
        - Look at the metadata (title, description, OpenGraph, Twitter metadata).  
        - If the metadata does **not** describe the company’s activities, **discard the URL**.  

        #### **Step 4: Industry and Activity Matching (Final Validation)**  
        - **Compare the website’s content with the company’s activities** (**{activities}**).  
        - If the website does **not** relate to any of the given activities, it is not a match.  

        ### **Final Output:**  
        Return only the URL. Do not provide any explanation, reasoning, or additional text. If no URL match, return an empty string `""`.  
        """
    )

    MAKE_DESCRIPTION = PromptTemplate.from_template(
        """
        Make a concise summary (up to 5 lines) about the company's activities based on the following content: {input}. 
        Focus on the core business, products, and services of the company.
        Exclude any irrelevant details such as promotions, loyalty programs, or non-business-related information.
        """
    )

    EXTRACT_LEGAL_DATA = PromptTemplate.from_template(
        """
    Extract structured company data from the following raw text.

    **Rules:**
    - If a field is absent, set it to `""` (empty string) or `[]` (empty list).
    - Ensure all extracted values are **exactly as stated** in the text.

    *address pattern* :

    street(only letters, no numbers) street_number, postal_code(only numbers 1000 to 9992) city

    ### **Raw Text:**
    {input}
    """
    )
