from typing import Iterable, List
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.tag import Tag, TagKind
from app.shared.slugify import slugify as _slugify_shared


def slugify_tag(text: str) -> str:
    """Thin wrapper so the call sites don't have to know about max_len."""
    return _slugify_shared(text, max_len=60, fallback="tag")


def resolve_tags(db: Session, names: Iterable[str] | None, kind: TagKind = TagKind.tag) -> List[Tag]:
    """Upsert each name into the tags table and return the Tag objects.

    Uniqueness is `(kind, lower(name))`, so a category called "Design" and a
    tag called "Design" can coexist as separate rows.
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

        existing = (
            db.query(Tag)
            .filter(Tag.kind == kind, func.lower(Tag.name) == key)
            .first()
        )
        if existing:
            result.append(existing)
            continue

        base_slug = slugify_tag(name)
        slug, n = base_slug, 2
        while db.query(Tag.id).filter(Tag.slug == slug).first():
            slug = f"{base_slug}-{n}"
            n += 1

        tag = Tag(name=name, slug=slug, kind=kind)
        db.add(tag)
        db.flush()
        result.append(tag)

    return result
