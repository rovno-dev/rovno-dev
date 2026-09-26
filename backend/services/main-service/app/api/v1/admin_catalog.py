"""Unified admin CRUD for every string-keyed catalog in the app.

The catalogs (project categories, project roles, stack items, article
categories, tags) all share the same shape — code/slug + a `labels` dict —
so a single router with a dispatch table is cleaner than five near-identical
handlers. Client uses one API surface; adding a new catalog is one entry in
CATALOGS.
"""
from typing import Any, Callable, Dict, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.v1.admin import get_admin_user
from app.models.article_category import ArticleCategory
from app.models.project_category import ProjectCategory
from app.models.project_role import ProjectRole
from app.models.stack_item import StackItem
from app.models.tag import Tag, TagKind
from app.models.user import User
from app.services import taxonomy_service as svc
from app.shared.slugify import slugify
from database.database import get_db

router = APIRouter(prefix="/admin/catalog", tags=["admin-catalog"])


# ── Generic payload ───────────────────────────────────────────────────────

class CatalogIn(BaseModel):
    code: Optional[str] = None
    label: Optional[str] = None
    labels: Optional[Dict[str, str]] = None
    # Tags use a `kind` discriminator; other catalogs ignore this.
    kind: Optional[str] = None


class CatalogUpdate(BaseModel):
    code: Optional[str] = None
    labels: Optional[Dict[str, str]] = None
    kind: Optional[str] = None


# ── Per-catalog adapters ──────────────────────────────────────────────────

def _serialize_labels(labels, fallback_label=None, fallback_code=None):
    out = labels if isinstance(labels, dict) and labels else {}
    if not out.get("en"):
        out = {**out, "en": fallback_label or fallback_code or ""}
    return out


def _row_out(row) -> dict:
    return {
        "id": str(row.id),
        "code": getattr(row, "code", getattr(row, "slug", "")),
        "labels": _serialize_labels(
            getattr(row, "labels", None),
            getattr(row, "label", None) or getattr(row, "name", None),
            getattr(row, "code", None) or getattr(row, "slug", None),
        ),
        "kind": (
            row.kind.value
            if hasattr(row, "kind") and getattr(row, "kind") is not None
            else None
        ),
    }


def _unique_code(db: Session, model, base: str, exclude_id=None, code_col="code") -> str:
    col = getattr(model, code_col)
    code = base or "item"
    n = 2
    while True:
        q = db.query(model.id).filter(col == code)
        if exclude_id:
            q = q.filter(model.id != exclude_id)
        if not q.first():
            return code
        code = f"{base}-{n}"
        n += 1


def _normalize_labels(payload: dict, fallback: str = "") -> dict:
    labels: Dict[str, str] = {}
    for k, v in (payload or {}).items():
        if isinstance(k, str) and isinstance(v, str) and v.strip():
            labels[k.strip().lower()] = v.strip()
    if not labels.get("en"):
        labels["en"] = (fallback or "").strip()
    if not labels["en"]:
        raise HTTPException(422, "labels.en is required")
    return labels


# ── Catalog registry ──────────────────────────────────────────────────────
# Each entry: (model, code column name, getter, creator, updater, deleter).

def _stack_list(db: Session):
    rows = db.query(StackItem).order_by(StackItem.name.asc()).all()
    return [
        {
            "id": str(r.id),
            "code": r.slug,
            "labels": {"en": r.name},
            "kind": None,
        }
        for r in rows
    ]


def _stack_create(db: Session, payload: dict):
    name = (payload.get("labels") or {}).get("en") or payload.get("label") or ""
    name = name.strip()
    if not name:
        raise HTTPException(422, "Name is required")
    existing = (
        db.query(StackItem)
        .filter(StackItem.name.ilike(name))
        .first()
    )
    if existing:
        raise HTTPException(409, f"«{existing.name}» уже в стеке")
    base = slugify(name, max_len=60, fallback="stack")
    code = _unique_code(db, StackItem, base, code_col="slug")
    row = StackItem(name=name, slug=code)
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"id": str(row.id), "code": row.slug, "labels": {"en": row.name}, "kind": None}


def _stack_update(db: Session, id_: UUID, payload: dict):
    row = db.get(StackItem, id_)
    if not row:
        raise HTTPException(404, "Not found")
    if "labels" in payload:
        name = (payload["labels"] or {}).get("en", "").strip()
        if name:
            row.name = name
    if "code" in payload and payload["code"]:
        row.slug = _unique_code(db, StackItem, slugify(payload["code"]), exclude_id=row.id, code_col="slug")
    db.commit()
    db.refresh(row)
    return {"id": str(row.id), "code": row.slug, "labels": {"en": row.name}, "kind": None}


def _stack_delete(db: Session, id_: UUID):
    row = db.get(StackItem, id_)
    if not row:
        raise HTTPException(404, "Not found")
    db.delete(row)
    db.commit()


def _article_category_list(db: Session):
    rows = db.query(ArticleCategory).order_by(ArticleCategory.label.asc()).all()
    return [
        {
            "id": str(r.id),
            "code": r.code,
            "labels": {"en": r.label},
            "kind": None,
        }
        for r in rows
    ]


def _article_category_create(db: Session, payload: dict):
    label = (payload.get("labels") or {}).get("en") or payload.get("label") or ""
    label = label.strip()
    if not label:
        raise HTTPException(422, "Label is required")
    code = payload.get("code") or slugify(label, max_len=60, fallback="cat")
    code = _unique_code(db, ArticleCategory, code, code_col="code")
    row = ArticleCategory(code=code, label=label)
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"id": str(row.id), "code": row.code, "labels": {"en": row.label}, "kind": None}


def _article_category_update(db: Session, id_: UUID, payload: dict):
    row = db.get(ArticleCategory, id_)
    if not row:
        raise HTTPException(404, "Not found")
    if "labels" in payload:
        label = (payload["labels"] or {}).get("en", "").strip()
        if label:
            row.label = label
    if "code" in payload and payload["code"]:
        row.code = _unique_code(db, ArticleCategory, slugify(payload["code"]), exclude_id=row.id, code_col="code")
    db.commit()
    db.refresh(row)
    return {"id": str(row.id), "code": row.code, "labels": {"en": row.label}, "kind": None}


def _article_category_delete(db: Session, id_: UUID):
    row = db.get(ArticleCategory, id_)
    if not row:
        raise HTTPException(404, "Not found")
    db.delete(row)
    db.commit()


# Tags already have a dedicated endpoint set; wire the same operations here
# so the catalog page has one API surface.
def _tag_list(db: Session):
    rows = db.query(Tag).order_by(Tag.name.asc()).all()
    return [
        {
            "id": str(r.id),
            "code": r.slug,
            "labels": {"en": r.name},
            "kind": r.kind.value if r.kind else "tag",
        }
        for r in rows
    ]


def _tag_create(db: Session, payload: dict):
    name = (payload.get("labels") or {}).get("en") or payload.get("label") or ""
    name = name.strip()
    if not name:
        raise HTTPException(422, "Name is required")
    kind_raw = (payload.get("kind") or "tag").strip().lower()
    try:
        kind = TagKind(kind_raw)
    except ValueError:
        raise HTTPException(422, f"Unknown tag kind: {kind_raw}")
    existing = (
        db.query(Tag)
        .filter(Tag.kind == kind, Tag.name.ilike(name))
        .first()
    )
    if existing:
        raise HTTPException(409, f"«{existing.name}» уже есть в этой категории")
    base = slugify(name, max_len=60, fallback="tag")
    code = _unique_code(db, Tag, base, code_col="slug")
    row = Tag(name=name, slug=code, kind=kind)
    db.add(row)
    db.commit()
    db.refresh(row)
    return {
        "id": str(row.id),
        "code": row.slug,
        "labels": {"en": row.name},
        "kind": row.kind.value,
    }


def _tag_update(db: Session, id_: UUID, payload: dict):
    row = db.get(Tag, id_)
    if not row:
        raise HTTPException(404, "Not found")
    if "labels" in payload:
        name = (payload["labels"] or {}).get("en", "").strip()
        if name:
            row.name = name
    if "kind" in payload and payload["kind"]:
        try:
            row.kind = TagKind(payload["kind"])
        except ValueError:
            raise HTTPException(422, f"Unknown tag kind: {payload['kind']}")
    if "code" in payload and payload["code"]:
        row.slug = _unique_code(db, Tag, slugify(payload["code"]), exclude_id=row.id, code_col="slug")
    db.commit()
    db.refresh(row)
    return {
        "id": str(row.id),
        "code": row.slug,
        "labels": {"en": row.name},
        "kind": row.kind.value,
    }


def _tag_delete(db: Session, id_: UUID):
    row = db.get(Tag, id_)
    if not row:
        raise HTTPException(404, "Not found")
    db.delete(row)
    db.commit()


CATALOGS: Dict[str, Dict[str, Any]] = {
    "project-categories": {
        "list":   svc.list_categories,
        "create": svc.create_category,
        "update": svc.update_category,
        "delete": svc.delete_category,
        "model":  ProjectCategory,
        "code_col": "code",
    },
    "project-roles": {
        "list":   svc.list_roles,
        "create": svc.create_role,
        "update": svc.update_role,
        "delete": svc.delete_role,
        "model":  ProjectRole,
        "code_col": "code",
    },
    "stack": {
        "list":   _stack_list,
        "create": _stack_create,
        "update": _stack_update,
        "delete": _stack_delete,
        "model":  StackItem,
        "code_col": "slug",
    },
    "article-categories": {
        "list":   _article_category_list,
        "create": _article_category_create,
        "update": _article_category_update,
        "delete": _article_category_delete,
        "model":  ArticleCategory,
        "code_col": "code",
    },
    "tags": {
        "list":   _tag_list,
        "create": _tag_create,
        "update": _tag_update,
        "delete": _tag_delete,
        "model":  Tag,
        "code_col": "slug",
    },
}


def _adapter(name: str) -> Dict[str, Any]:
    if name not in CATALOGS:
        raise HTTPException(404, f"Unknown catalog: {name}")
    return CATALOGS[name]


# ── Routes ────────────────────────────────────────────────────────────────

@router.get("/{catalog}")
def list_catalog(
    catalog: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return _adapter(catalog)["list"](db)


@router.post("/{catalog}", status_code=201)
def create_catalog_item(
    catalog: str,
    payload: CatalogIn,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    data = payload.model_dump(exclude_none=True)
    return _adapter(catalog)["create"](db, data)


@router.patch("/{catalog}/{item_id}")
def update_catalog_item(
    catalog: str,
    item_id: UUID,
    payload: CatalogUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return _adapter(catalog)["update"](db, item_id, payload.model_dump(exclude_unset=True))


@router.delete("/{catalog}/{item_id}", status_code=204)
def delete_catalog_item(
    catalog: str,
    item_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    _adapter(catalog)["delete"](db, item_id)
    return None
