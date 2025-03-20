import requests
import logging


def test_api_with_tva(tva_number: str, token: str):
    """
    Test the API by making a request with the provided TVA number and token.

    :param tva_number: The TVA number of the company to query (e.g., '0423369762').
    :param token: The API Bearer token for authentication.
    """
    url = f"https://cbeapi.be/api/v1/company/{tva_number}"
    headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}

    try:
        # Make the GET request to the API
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            print("Company Info Retrieved Successfully:")
            print(response.json())  # Print the JSON response with company info
        else:
            logging.error(
                f"Error: Received status code {response.status_code} from the API."
            )
            print(f"Error: {response.status_code}")

    except requests.exceptions.RequestException as e:
        logging.error(f"Request failed: {str(e)}")
        print(f"Request failed: {str(e)}")


# Test the function
if __name__ == "__main__":
    tva_number = "0423369762"  # TVA number to test
    token = "WNugaW0SGNz4KR4oFFQQwH8SCAP8BLSM"  # Replace with your actual Bearer token

    test_api_with_tva(tva_number, token)
