import unittest
from tools.utils import *  # Importez vos méthodes réelles


# Méthode à tester
def get_size(vat_number: str):
    if vat_number:
        financial_data = get_financial_data(vat_number)
        if not financial_data:
            return None
        size = determine_company_size(vat_number, financial_data)
        return size
    return None


# Tests unitaires
class TestGetSize(unittest.TestCase):

    # Test avec un numéro de TVA vide
    def test_empty_vat_number(self):
        self.assertIsNone(get_size(""))

    # Test avec un numéro de TVA invalide
    def test_invalid_vat_number(self):
        vat_number = "INVALID_VAT"
        financial_data = get_financial_data(vat_number)
        self.assertIsNone(
            financial_data
        )  # Vérifie qu'il n'y a pas de données financières

        size = get_size(vat_number)
        self.assertIsNone(
            size
        )  # La taille devrait être None si les données sont inexistantes

    # Test avec un numéro de TVA valide, mais sans données financières
    def test_no_financial_data(self):
        vat_number = "1235765879"  # Utilisez un numéro de TVA pour lequel il n'y a pas de données
        financial_data = get_financial_data(vat_number)
        self.assertIsNone(financial_data)  # Vérifiez qu'aucune donnée n'est renvoyée

        size = get_size(vat_number)
        self.assertIsNone(
            size
        )  # La taille devrait être None si les données sont absentes

    # Test avec des données financières valides, mais une taille non définie
    def test_no_size_determined(self):
        vat_number = "1004905845"
        financial_data = get_financial_data(vat_number)

        # Supposez que determine_company_size renvoie None dans ce cas
        size = determine_company_size(vat_number, financial_data)
        self.assertIsNone(
            size
        )  # La taille devrait être None si aucune taille n'est définie

        result = get_size(vat_number)
        self.assertIsNone(result)  # La fonction entière doit retourner None

    # Test avec une petite entreprise
    def test_small_company(self):
        vat_number = "0831407784"
        financial_data = get_financial_data(vat_number)
        self.assertIsNotNone(
            financial_data
        )  # Vérifie que les données financières existent

        size = determine_company_size(vat_number, financial_data)
        self.assertEqual(
            size, "small"
        )  # Vérifie que la taille de l'entreprise est petite

        result = get_size(vat_number)
        self.assertEqual(
            result, "small"
        )  # Vérifie que la fonction retourne bien "small"

    # Test avec une grande entreprise
    def test_large_company(self):
        vat_number = "0810307316"
        financial_data = get_financial_data(vat_number)
        self.assertIsNotNone(
            financial_data
        )  # Vérifie que les données financières existent

        size = determine_company_size(vat_number, financial_data)
        self.assertEqual(
            size, "large"
        )  # Vérifie que la taille de l'entreprise est grande

        result = get_size(vat_number)
        self.assertEqual(
            result, "large"
        )  # Vérifie que la fonction retourne bien "large"

    # Test avec une entreprise de taille moyenne (si nécessaire)
    def test_medium_company(self):
        vat_number = "0831407784"
        financial_data = get_financial_data(vat_number)
        self.assertIsNotNone(
            financial_data
        )  # Vérifie que les données financières existent

        size = determine_company_size(vat_number, financial_data)
        self.assertEqual(
            size, "medium"
        )  # Vérifie que la taille de l'entreprise est moyenne

        result = get_size(vat_number)
        self.assertEqual(
            result, "medium"
        )  # Vérifie que la fonction retourne bien "medium"


# Lancer les tests
if __name__ == "__main__":
    unittest.main()
