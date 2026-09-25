from typing import Iterable, List
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.stack_item import StackItem
from app.shared.slugify import slugify


def resolve_stack(db: Session, names: Iterable[str] | None) -> List[StackItem]:
    """Upsert each name into stack_items and return the rows in order."""
    if not names:
        return []
    out: List[StackItem] = []
    seen: set[str] = set()
    for raw in names:
        name = (raw or "").strip()
        if not name or name.lower() in seen:
            continue
        seen.add(name.lower())

        existing = (
            db.query(StackItem).filter(func.lower(StackItem.name) == name.lower()).first()
        )
        if existing:
            out.append(existing)
            continue

        base = slugify(name, max_len=60, fallback="stack")
        slug, n = base, 2
        while db.query(StackItem.id).filter(StackItem.slug == slug).first():
            slug = f"{base}-{n}"
            n += 1

        item = StackItem(name=name, slug=slug)
        db.add(item)
        db.flush()
        out.append(item)
    return out
