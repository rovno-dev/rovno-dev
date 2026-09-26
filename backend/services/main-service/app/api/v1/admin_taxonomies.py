"""Admin CRUD for project categories and roles.

Both endpoints use the shared taxonomy_service so behaviour is identical
across the two tables. The payload shape is the same: either pass a `label`
(legacy single-language string, treated as labels.en) or a `labels` dict.
"""
from typing import Any, Dict, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.v1.admin import get_admin_user
from app.models.user import User
from app.services import taxonomy_service as svc
from database.database import get_db

router = APIRouter(prefix="/admin", tags=["admin-taxonomies"])


class TaxonomyIn(BaseModel):
    # Either supply `labels` (preferred) or the legacy `label` string.
    code: Optional[str] = None
    label: Optional[str] = None
    labels: Optional[Dict[str, str]] = None


class TaxonomyUpdate(BaseModel):
    code: Optional[str] = None
    labels: Optional[Dict[str, str]] = None


# ── Categories ────────────────────────────────────────────────────────────

@router.get("/project-categories")
def admin_list_categories(
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return svc.list_categories(db)


@router.post("/project-categories", status_code=201)
def admin_create_category(
    payload: TaxonomyIn,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return svc.create_category(db, payload.model_dump(exclude_none=True))


@router.patch("/project-categories/{category_id}")
def admin_update_category(
    category_id: UUID,
    payload: TaxonomyUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return svc.update_category(db, category_id, payload.model_dump(exclude_unset=True))


@router.delete("/project-categories/{category_id}", status_code=204)
def admin_delete_category(
    category_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    svc.delete_category(db, category_id)
    return None


# ── Roles ─────────────────────────────────────────────────────────────────

@router.get("/project-roles")
def admin_list_roles(
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return svc.list_roles(db)


@router.post("/project-roles", status_code=201)
def admin_create_role(
    payload: TaxonomyIn,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return svc.create_role(db, payload.model_dump(exclude_none=True))


@router.patch("/project-roles/{role_id}")
def admin_update_role(
    role_id: UUID,
    payload: TaxonomyUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return svc.update_role(db, role_id, payload.model_dump(exclude_unset=True))


@router.delete("/project-roles/{role_id}", status_code=204)
def admin_delete_role(
    role_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    svc.delete_role(db, role_id)
    return None
