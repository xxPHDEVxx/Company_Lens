from parameterized import parameterized
from src.company_scraper.tools.financial_data_extractor import *
import unittest
import tracemalloc


tracemalloc.start()


class TestCompanySize(unittest.TestCase):
    @parameterized.expand(
        [
            # ("micro_company", "0439988337", "micro"),
            # ("micro_company_2", "0416398630", "micro"),
            # ("micro_company_3", "0684997172", "micro"),
            # ("micro_company_4", "0750931042", "micro"),
            # ("micro_company_5", "0448540668", "micro"),
            # ("micro_company_6", "0453914864", "micro"),
            # ("micro_company_7", "0712626138", "micro"),
            # ("micro_company_8", "0737779822", "micro"),
            # ("small_company", "0423768452", "micro"), #small on companyweb (group ?)
            # ("small_company_2", "0882383858", "small"),
            # ("small_company_2", "0769300367", "small"),
            # ("medium_company", "0439340516", "medium"),
            # ("medium_company_2", "0831407784", "medium"),
            # ("medium_company_3", "0403228109", "medium"), #large on companyweb (group ?)
            # ("large_company", "0423369762", "large"),
            # ("large_company_2", "0810307316", "large"),
            # ("large_company_3", "0477472701", "large"),
            # ("large_company_4", "0406798006", "large"),
            # ("Wrong_vat", "1234567890", None),
            # ("no_data_company", "0416205323", None),
        ]
    )
    def test_company_size(self, name, vat_number, expected_size):
        size, financial_data = get_size_and_financial_data(vat_number)
        self.assertEqual(size, expected_size)
