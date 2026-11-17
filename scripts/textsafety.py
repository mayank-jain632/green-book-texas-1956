"""Slur detection and masking for project text.

The blocklist is stored ROT13-encoded so that the repository never contains these
words in plain text. It is used to (1) mask text while reading source material and
(2) fail validation if any slur reaches a data file, the UI source, or the docs.
"""
import codecs
import re
from typing import List

_ENCODED_TERMS = (
    "avtt", "avten", "pbba", "qnexvr", "qnexl", "wvtnobb", "cvpxnavaal", "fnzob",
    "fcvp", "jrgonpx", "tbbx", "puvax", "xvxr", "erqfxva", "fdhnj",
)
MASK = "[slur]"


def _compile() -> re.Pattern:
    terms = [codecs.decode(term, "rot13") for term in _ENCODED_TERMS]
    # Stems match as prefixes (so plurals and variants are caught); others as whole words.
    stems = {codecs.decode(t, "rot13") for t in ("avtt", "avten")}
    parts = [rf"\b{re.escape(t)}\w*" if t in stems else rf"\b{re.escape(t)}s?\b" for t in terms]
    # Dash- or asterisk-obfuscated forms such as an initial letter followed by dashes.
    parts.append(r"\bn[-\u2013\u2014_*]{2,}")
    return re.compile("|".join(parts), re.IGNORECASE)


_PATTERN = _compile()


def contains_slur(text: str) -> bool:
    return _PATTERN.search(text) is not None


def find_slurs(text: str) -> List[str]:
    return [match.group(0) for match in _PATTERN.finditer(text)]


def mask(text: str) -> str:
    return _PATTERN.sub(MASK, text)
