from runnable.legal_data import get_company_schema
from runnable.company_description import complete_schema
from config.config import *

# Configuration du logging
logging.basicConfig(
    level=logging.ERROR,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

@traceable
def run(fields: dict):
    company_schema = get_company_schema(fields)
    complete_schema(company_schema)
    return company_schema

if __name__ == "__main__":
    fields = [
        {"vat_number": "0423369762"},
        {"vat_number": "1004905845"},
        {"vat_number": "0439340516"},
        {"vat_number": "0453914864"},
        {"vat_number": "0439988337"},
        {"vat_number": "0416398630"},
        {"vat_number": "0416205323"},
        {"vat_number": "0684997172"},
        {"vat_number": "0684997172"},
        {"vat_number": "0423768452"},
        {"vat_number": "0403228109"},
        {"vat_number": "0831407784"},
        {"vat_number": "0810307316"},
        {"vat_number": "0448540668"},
    ]

    # run(fields[0])  # Brico P. I.
    # run(fields[1])  # Ada I. T.
    # run(fields[2])  # ACA IT - SOLUTIONS
    # run(fields[3])  # Communication - GEAR -> validé si activité bien présente
    # run(fields[4])  # ALPHAA COMMUNICATION
    # run(fields[5])  # PETRA
    # run(fields[6]) # Association pour la Défense des Droits de Locataires du Brussels International Trade Mart ...
    # run(fields[7])  # Utile Games
    # run(fields[8])  # Genius Kids
    # run(fields[9])  # A&P DECO
    # run(fields[10])  # Arcofin
    # run(fields[11])  # Makisu
    # run(fields[12])  # Pain quotidien
    # run(fields[13])  # StartLAB
