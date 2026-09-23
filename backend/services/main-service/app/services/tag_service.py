import re
from typing import Iterable, List

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.tag import Tag

_SLUG_RE = re.compile(r"[^\w\s-]+", re.UNICODE)
_SLUG_WS = re.compile(r"[\s_]+", re.UNICODE)


def slugify_tag(text: str) -> str:
    text = text.strip().lower()
    text = _SLUG_RE.sub("", text)
    text = _SLUG_WS.sub("-", text)
    text = re.sub(r"-+", "-", text).strip("-")
    return text[:60] or "tag"


def resolve_tags(db: Session, names: Iterable[str] | None) -> List[Tag]:
    """Upsert each name into the tags table and return the Tag objects.

    - Case-insensitive dedupe within a single call.
    - When a tag already exists we reuse its row and preserve its casing,
      so "design" and "Design" can't fork into two tags.
    - New tags get a unique slug (appending -2, -3, ... on collision).
    """
    if not names:
        return []
    result: List[Tag] = []
    seen: set[str] = set()

    for raw in names:
        name = (raw or "").strip()
        if not name:
            continue
        key = name.lower()
        if key in seen:
            continue
        seen.add(key)

        existing = db.query(Tag).filter(func.lower(Tag.name) == key).first()
        if existing:
            result.append(existing)
            continue

        base_slug = slugify_tag(name)
        slug, n = base_slug, 2
        while db.query(Tag.id).filter(Tag.slug == slug).first():
            slug = f"{base_slug}-{n}"
            n += 1

        tag = Tag(name=name, slug=slug)
        db.add(tag)
        db.flush()
        result.append(tag)

    return result
