"""Shared CRUD helpers for the two project taxonomies: categories and roles.

Both tables have the same shape — `code` (unique slug) + `labels` (JSON dict)
— so the read/write logic lives here once. Endpoints call these.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.project_category import ProjectCategory
from app.models.project_role import ProjectRole
from app.shared.slugify import slugify


def _normalize_labels(payload: dict | None, fallback: str = "") -> dict:
    """Coerce a labels payload into {lang: non-empty string}.

    - `en` is required; if missing, falls back to `fallback` (typically the
      human-readable name the admin typed).
    - Empty strings are dropped so a client sending {"en": "", "ru": "X"}
      doesn't clobber the fallback.
    """
    labels: dict[str, str] = {}
    for lang, value in (payload or {}).items():
        if not isinstance(lang, str) or not isinstance(value, str):
            continue
        cleaned = value.strip()
        if cleaned:
            labels[lang.strip().lower()] = cleaned
    if "en" not in labels:
        labels["en"] = (fallback or "").strip()
    if not labels["en"]:
        raise HTTPException(422, "labels.en is required")
    return labels


def _unique_code(db: Session, model, base: str, exclude_id=None) -> str:
    code = base or "item"
    n = 2
    while True:
        q = db.query(model.id).filter(model.code == code)
        if exclude_id:
            q = q.filter(model.id != exclude_id)
        if not q.first():
            return code
        code = f"{base}-{n}"
        n += 1


def _serialize(row) -> dict:
    """Common output shape used by both admin and public endpoints."""
    labels = row.labels if isinstance(row.labels, dict) and row.labels else {}
    if not labels.get("en") and getattr(row, "label", None):
        labels = {**labels, "en": row.label}
    return {
        "id": str(row.id),
        "code": row.code,
        "labels": labels,
        # Legacy field kept for old clients.
        "label": labels.get("en") or getattr(row, "label", None) or row.code,
    }


# ── Categories ────────────────────────────────────────────────────────────

def list_categories(db: Session) -> List[dict]:
    rows = db.query(ProjectCategory).order_by(ProjectCategory.label.asc()).all()
    return [_serialize(r) for r in rows]


def create_category(db: Session, payload: dict) -> dict:
    labels = _normalize_labels(payload.get("labels"), payload.get("label", ""))
    base_code = slugify(payload.get("code") or labels["en"], max_len=60, fallback="category")
    code = _unique_code(db, ProjectCategory, base_code)
    cat = ProjectCategory(code=code, label=labels["en"], labels=labels)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return _serialize(cat)


def update_category(db: Session, category_id, payload: dict) -> dict:
    cat = db.get(ProjectCategory, category_id)
    if not cat:
        raise HTTPException(404, "Category not found")
    if "labels" in payload:
        labels = _normalize_labels(payload["labels"], cat.label or cat.code)
        cat.labels = labels
        cat.label = labels["en"]
    if "code" in payload and payload["code"]:
        cat.code = _unique_code(db, ProjectCategory, slugify(payload["code"]), exclude_id=cat.id)
    db.commit()
    db.refresh(cat)
    return _serialize(cat)


def delete_category(db: Session, category_id) -> None:
    cat = db.get(ProjectCategory, category_id)
    if not cat:
        raise HTTPException(404, "Category not found")
    db.delete(cat)
    db.commit()


# ── Roles ─────────────────────────────────────────────────────────────────

def list_roles(db: Session) -> List[dict]:
    rows = db.query(ProjectRole).order_by(ProjectRole.code.asc()).all()
    return [_serialize(r) for r in rows]


def create_role(db: Session, payload: dict) -> dict:
    labels = _normalize_labels(payload.get("labels"), payload.get("label", ""))
    base_code = slugify(payload.get("code") or labels["en"], max_len=60, fallback="role")
    code = _unique_code(db, ProjectRole, base_code)
    role = ProjectRole(code=code, labels=labels)
    db.add(role)
    db.commit()
    db.refresh(role)
    return _serialize(role)


def update_role(db: Session, role_id, payload: dict) -> dict:
    role = db.get(ProjectRole, role_id)
    if not role:
        raise HTTPException(404, "Role not found")
    if "labels" in payload:
        role.labels = _normalize_labels(payload["labels"], (role.labels or {}).get("en") or role.code)
    if "code" in payload and payload["code"]:
        role.code = _unique_code(db, ProjectRole, slugify(payload["code"]), exclude_id=role.id)
    db.commit()
    db.refresh(role)
    return _serialize(role)


def delete_role(db: Session, role_id) -> None:
    role = db.get(ProjectRole, role_id)
    if not role:
        raise HTTPException(404, "Role not found")
    db.delete(role)
    db.commit()
