import codecs
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "scripts"))
import geocode  # noqa: E402
import textsafety  # noqa: E402
import validate_data  # noqa: E402


class TextSafetyTests(unittest.TestCase):
    def test_ordinary_text_passes(self):
        self.assertFalse(textsafety.contains_slur("A raccoon in a cocoon on N. Border St."))

    def test_blocklisted_word_is_detected_and_masked(self):
        word = codecs.decode("pbba", "rot13")
        self.assertTrue(textsafety.contains_slur(f"a {word} here"))
        self.assertEqual(textsafety.mask(f"a {word} here"), "a [slur] here")

    def test_dash_obfuscated_form_is_detected(self):
        self.assertTrue(textsafety.contains_slur("N" + chr(0x2014) * 4))


class GeocodeMatchingTests(unittest.TestCase):
    def test_partial_street_name_is_rejected(self):
        self.assertFalse(geocode.same_street("214 Long", "214 LONGBRANCH LN, DALLAS, TX, 75217"))

    def test_abbreviation_and_ordinal_are_normalized(self):
        self.assertTrue(geocode.same_street("1839 Ft. Worth Ave.", "1839 FORT WORTH AVE, DALLAS, TX"))
        self.assertTrue(geocode.same_street("413-15 E. Fifth St.", "413 E 5TH ST, FORT WORTH, TX"))

    def test_suffix_swap_is_rejected(self):
        self.assertFalse(geocode.same_street("1507 Wyoming St.", "1507 WYOMING AVE, EL PASO, TX"))

    def test_intersections_are_not_street_addresses(self):
        self.assertFalse(geocode.is_street_address("Conti & Jenson"))
        self.assertFalse(geocode.is_street_address("Highways 90A & 59"))
        self.assertTrue(geocode.is_street_address("1103 Navasota St."))


class ProjectDataTests(unittest.TestCase):
    def test_project_data_validates(self):
        self.assertEqual(validate_data.validate(), [])


if __name__ == "__main__":
    unittest.main()
