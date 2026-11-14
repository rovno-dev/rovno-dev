"""Real view counters for public content pages.

GET  /views/{type}/{id}        → current count, never creates a row
POST /views/{type}/{id}/hit    → increments once per IP per 24h, returns count

Dedupe lives in Valkey, not in Postgres: a reload loop would otherwise
serialise on the counter row. The key is set with NX semantics, so the
first request from an IP wins and every later one is a no-op read - the
counter itself is only written when the key was actually created.
"""
from typing import Optional, Tuple
import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.models.page_view import PageView
from config.rate_limiter import get_client_ip
from database.cache import cache_client
from database.database import get_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/views", tags=["views"])

ALLOWED_TYPES = {"project", "article", "event"}
DEDUPE_TTL_SECONDS = 60 * 60 * 24


class ViewsOut(BaseModel):
    entity_type: str
    entity_id: str
    view_count: int


def _normalize(entity_type: str, entity_id: str) -> Tuple[str, str]:
    t = (entity_type or "").strip().lower()
    if t not in ALLOWED_TYPES:
        raise HTTPException(
            422, f"entity_type must be one of {sorted(ALLOWED_TYPES)}"
        )
    eid = (entity_id or "").strip()
    if not eid or len(eid) > 120:
        raise HTTPException(422, "entity_id must be 1-120 characters")
    return t, eid


def _get_or_create(
    db: Session, entity_type: str, entity_id: str, create: bool
) -> Tuple[Optional[PageView], bool]:
    row = (
        db.query(PageView)
        .filter(
            PageView.entity_type == entity_type,
            PageView.entity_id == entity_id,
        )
        .first()
    )
    if row is not None:
        return row, False
    if not create:
        return None, False
    row = PageView(entity_type=entity_type, entity_id=entity_id, view_count=0)
    db.add(row)
    db.flush()
    return row, True


@router.get("/{entity_type}/{entity_id}", response_model=ViewsOut)
def get_views(
    entity_type: str,
    entity_id: str,
    db: Session = Depends(get_db),
):
    t, eid = _normalize(entity_type, entity_id)
    row, _ = _get_or_create(db, t, eid, create=False)
    return ViewsOut(
        entity_type=t, entity_id=eid, view_count=(row.view_count if row else 0)
    )


@router.post("/{entity_type}/{entity_id}/hit", response_model=ViewsOut)
def hit_view(
    entity_type: str,
    entity_id: str,
    request: Request,
    db: Session = Depends(get_db),
):
    t, eid = _normalize(entity_type, entity_id)
    ip = get_client_ip(request)
    viewer_id = request.headers.get("x-viewer-id", "").strip()

    # Prefer viewer_id for dedupe because it is stable across IP changes
    # (e.g., mobile networks that rotate IPs on every reload).
    identifier = viewer_id if viewer_id else ip
    dedupe_key = f"view:{t}:{eid}:{identifier}"

    try:
        counted = bool(
            cache_client.set(dedupe_key, "1", nx=True, ex=DEDUPE_TTL_SECONDS)
        )
    except Exception as e:
        logger.error("View dedupe Redis error: %s", e)
        # Fail closed: never over-count if we cannot verify the cache.
        counted = False

    row, created = _get_or_create(db, t, eid, create=True)

    if created or counted:
        if row is not None:
            row.view_count = (row.view_count or 0) + 1
        db.commit()
        if row is not None:
            db.refresh(row)

    return ViewsOut(
        entity_type=t, entity_id=eid, view_count=(row.view_count if row else 0)
    )
