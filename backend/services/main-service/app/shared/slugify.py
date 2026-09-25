"""
Slug generation. Always ASCII, always lowercase, always hyphenated.

Cyrillic (and a handful of other non-Latin scripts) are transliterated
before the ASCII filter runs, so "Привет мир" becomes "privet-mir" instead
of "привет-мир". Once a slug is ASCII, URLs are stable across every layer
that might touch them: the browser, CDN caches, Postgres collations, the
Next.js router, and file-based tooling.
"""
import re

# Transliteration table. Longest sequences first so multi-char mappings win
# before single-char ones fire. This is GOST 7.79-2000 System B, the variant
# most CMSes and search engines expect.
_TRANSLIT: list[tuple[str, str]] = [
    # Russian Cyrillic — multi-char first.
    ("щ", "shch"), ("ш", "sh"), ("ч", "ch"), ("ц", "ts"),
    ("ю", "yu"), ("я", "ya"), ("ё", "yo"), ("ж", "zh"), ("х", "kh"),
    # Russian Cyrillic — single-char.
    ("а", "a"), ("б", "b"), ("в", "v"), ("г", "g"), ("д", "d"),
    ("е", "e"), ("з", "z"), ("и", "i"), ("й", "y"), ("к", "k"),
    ("л", "l"), ("м", "m"), ("н", "n"), ("о", "o"), ("п", "p"),
    ("р", "r"), ("с", "s"), ("т", "t"), ("у", "u"), ("ф", "f"),
    ("ы", "y"), ("э", "e"),
    ("ъ", ""), ("ь", ""),
    # Ukrainian / Belarusian extras.
    ("є", "ye"), ("і", "i"), ("ї", "yi"), ("ґ", "g"), ("ў", "u"),
]


def _transliterate(text: str) -> str:
    """Map each character through the table; leave unmapped chars as-is."""
    lower = text.lower()
    out: list[str] = []
    for ch in lower:
        for src, dst in _TRANSLIT:
            if ch == src:
                out.append(dst)
                break
        else:
            out.append(ch)
    return "".join(out)


# After transliteration: keep only a-z, 0-9, spaces, hyphens, underscores.
_SLUG_STRIP = re.compile(r"[^a-z0-9\s_-]+")
# Collapse any run of whitespace / underscore / hyphen into a single hyphen.
_SLUG_WS = re.compile(r"[\s_-]+")


def slugify(text: str, max_len: int = 80, fallback: str = "item") -> str:
    """Convert arbitrary text to a URL-safe ASCII slug.

    ``slugify("Привет мир! 2024")`` → ``"privet-mir-2024"``
    ``slugify("")`` → ``"item"`` (the fallback)
    """
    text = _transliterate((text or "").strip())
    text = _SLUG_STRIP.sub("", text)
    text = _SLUG_WS.sub("-", text).strip("-")
    return text[:max_len] or fallback
