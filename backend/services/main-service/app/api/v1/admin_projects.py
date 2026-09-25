"""Admin CRUD for projects + GitHub README proxy."""
import os
import time
from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.v1.admin import get_admin_user
from app.models.project import Project, PublicationStatus
from app.models.project_media import ProjectMedia, ProjectMediaType
from app.models.project_tag import ProjectTag, ProjectTagKind
from app.models.user import User
from app.schemas.project.requests import ProjectCreate, ProjectUpdate
from app.schemas.project.responses import ProjectDetail, ProjectListItem
from database.database import get_db

router = APIRouter(prefix="/admin/projects", tags=["admin-projects"])


# ---------- Slug helper --------------------------------------------------
# Shared, transliterating, ASCII-only. See app/shared/slugify.py.
from app.shared.slugify import slugify


def _unique_slug(db: Session, base: str, exclude_id: Optional[str] = None) -> str:
    slug = base
    suffix = 2
    while True:
        q = db.query(Project.id).filter(Project.slug == slug)
        if exclude_id:
            q = q.filter(Project.id != exclude_id)
        if not q.first():
            return slug
        slug = f"{base}-{suffix}"
        suffix += 1


# ---------- Project picker (used by team-member editor) ------------------
class ProjectPickerItem(BaseModel):
    id: str
    slug: str
    title: str
    period: Optional[str] = None


@router.get("/picker", response_model=List[ProjectPickerItem])
def list_projects_for_picker(
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    rows = db.query(Project).order_by(Project.title.asc()).all()
    return [
        ProjectPickerItem(id=p.id, slug=p.slug, title=p.title, period=p.period)
        for p in rows
    ]


# ---------- Full admin list ---------------------------------------------
class AdminProjectListItem(ProjectListItem):
    has_media: bool = False
    media_count: int = 0
    is_admin_created: bool = False


@router.get("", response_model=List[AdminProjectListItem])
def list_admin_projects(
    q: Optional[str] = Query(None, description="Substring match on title"),
    status: Optional[str] = Query(None),
    limit: int = Query(200, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    query = db.query(Project)
    if q:
        query = query.filter(Project.title.ilike(f"%{q.strip()}%"))
    if status:
        if status not in {s.value for s in PublicationStatus}:
            raise HTTPException(422, f"Unknown status: {status}")
        query = query.filter(Project.publication_status == PublicationStatus(status))

    rows = (
        query.order_by(Project.updated_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    out: List[AdminProjectListItem] = []
    for p in rows:
        item = AdminProjectListItem.model_validate(p)
        item.media_count = len(p.media)
        item.has_media = item.media_count > 0
        # Heuristic: admin-created projects live in the DB with an id that
        # isn't a short code. Anything created after the migration has a
        # UUID-shaped id; the pre-existing fixtures have short ids.
        item.is_admin_created = len(p.id) > 20
        out.append(item)
    return out


# ---------- Get one ------------------------------------------------------
@router.get("/{slug}", response_model=ProjectDetail)
def get_admin_project(
    slug: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    p = db.query(Project).filter(Project.slug == slug).first()
    if not p:
        raise HTTPException(404, "Project not found")
    return ProjectDetail.model_validate(p)


# ---------- Create -------------------------------------------------------
def _apply_tags(db: Session, project: Project, tags_in):
    project.tag_records.clear()
    for idx, t in enumerate(tags_in or []):
        try:
            kind = ProjectTagKind(t.kind)
        except ValueError:
            raise HTTPException(422, f"Unknown tag kind: {t.kind}")
        project.tag_records.append(
            ProjectTag(
                kind=kind,
                label=t.label.strip(),
                value=t.value,
                sort_order=t.sort_order if t.sort_order is not None else idx,
            )
        )


def _apply_media(db: Session, project: Project, media_in):
    project.media.clear()
    for idx, m in enumerate(media_in or []):
        try:
            mtype = ProjectMediaType(m.type)
        except ValueError:
            raise HTTPException(422, f"Unknown media type: {m.type}")
        project.media.append(
            ProjectMedia(
                type=mtype,
                url=m.url,
                thumbnail_url=m.thumbnail_url,
                caption=m.caption,
                sort_order=m.sort_order if m.sort_order is not None else idx,
            )
        )


@router.post("", response_model=ProjectDetail, status_code=201)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    status_val = payload.publication_status or "draft"
    if status_val not in {"draft", "published"}:
        raise HTTPException(422, "publication_status must be 'draft' or 'published'")

    base_slug = slugify(payload.slug or payload.title)
    slug = _unique_slug(db, base_slug)

    project = Project(
        id=str(uuid4()),
        slug=slug,
        title=payload.title,
        description=payload.description or "",
        short_description=payload.short_description or "",
        cover_image_src=payload.cover_image_src or "",
        cover_video_src=payload.cover_video_src or "",
        href=payload.href,
        category_id=payload.category_id,
        client_id=payload.client_id,
        platform=payload.platform,
        period=payload.period,
        tech_stack=payload.tech_stack or [],
        mdx_content=payload.mdx_content or "",
        seo_title=payload.seo_title,
        meta_description=payload.meta_description,
        is_featured=payload.is_featured or False,
        publication_status=PublicationStatus(status_val),
    )
    _apply_tags(db, project, payload.tags)
    _apply_media(db, project, payload.media)
    from app.services.stack_service import resolve_stack
    project.stack_items = resolve_stack(db, payload.stack)

    db.add(project)
    db.commit()
    db.refresh(project)
    return ProjectDetail.model_validate(project)


@router.patch("/{slug}", response_model=ProjectDetail)
def update_project(
    slug: str,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    p = db.query(Project).filter(Project.slug == slug).first()
    if not p:
        raise HTTPException(404, "Project not found")

    update = payload.model_dump(exclude_unset=True)

    if "slug" in update and update["slug"] and update["slug"] != p.slug:
        update["slug"] = _unique_slug(db, slugify(update["slug"]), exclude_id=p.id)

    if "publication_status" in update and update["publication_status"] is not None:
        if update["publication_status"] not in {"draft", "published"}:
            raise HTTPException(422, "publication_status must be 'draft' or 'published'")
        update["publication_status"] = PublicationStatus(update["publication_status"])

    tags_in = update.pop("tags", None)
    media_in = update.pop("media", None)
    stack_in = update.pop("stack", None)

    for key, value in update.items():
        setattr(p, key, value)

    if stack_in is not None:
        from app.services.stack_service import resolve_stack
        p.stack_items = resolve_stack(db, stack_in)

    if tags_in is not None:
        _apply_tags(db, p, [type("T", (), {**t}) for t in tags_in] if False else [_wrap_tag(t) for t in tags_in])
    if media_in is not None:
        _apply_media(db, p, [_wrap_media(m) for m in media_in])

    db.commit()
    db.refresh(p)
    return ProjectDetail.model_validate(p)


def _wrap_tag(d: dict):
    return type("TagIn", (), d)


def _wrap_media(d: dict):
    return type("MediaIn", (), d)


@router.delete("/{slug}", status_code=204)
def delete_project(
    slug: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    p = db.query(Project).filter(Project.slug == slug).first()
    if not p:
        raise HTTPException(404, "Project not found")
    db.delete(p)
    db.commit()
    return None


# ---------- GitHub README proxy -----------------------------------------
# Small in-process cache so repeated views of the same project don't hammer
# raw.githubusercontent.com. Key: "owner/repo@branch". TTL 5 min.
_README_CACHE: dict[str, tuple[float, str]] = {}
_README_TTL = 300


def _parse_repo(value: dict) -> tuple[str, str]:
    repo = (value or {}).get("repo", "").strip()
    branch = (value or {}).get("branch") or None
    if not repo or "/" not in repo:
        raise HTTPException(422, "Tag value must include repo as 'owner/name'")
    owner, name = repo.split("/", 1)
    return f"{owner.strip()}/{name.strip()}", branch or ""


@router.get("/github-readme")
async def github_readme(
    repo: str = Query(..., description="owner/name"),
    branch: Optional[str] = Query(None),
    _: User = Depends(get_admin_user),
):
    owner, name = _parse_repo({"repo": repo, "branch": branch})
    cache_key = f"{owner}/{name}@{branch or 'default'}"
    now = time.time()
    hit = _README_CACHE.get(cache_key)
    if hit and now - hit[0] < _README_TTL:
        return {"readme": hit[1], "source": "cache"}

    candidates = [branch] if branch else ["main", "master"]
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        for b in candidates:
            if not b:
                continue
            url = f"https://raw.githubusercontent.com/{owner}/{name}/{b}/README.md"
            try:
                r = await client.get(url)
            except Exception:
                continue
            if r.status_code == 200 and r.text:
                _README_CACHE[cache_key] = (now, r.text)
                return {"readme": r.text, "source": url}

    raise HTTPException(404, "README.md not found on main or master")


# ---------------------------------------------------------------------------
# Project category creation — used by the admin project editor's category
# picker so admins can add a new category inline without leaving the form.
# ---------------------------------------------------------------------------

from app.models.project_category import ProjectCategory
from app.shared.slugify import slugify as _slugify_shared


class CategoryIn(BaseModel):
    label: str


class CategoryOut(BaseModel):
    model_config = {"from_attributes": True}
    id: UUID
    code: str
    label: str


@router.get("/categories", response_model=list[CategoryOut])
def list_project_categories(
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return db.query(ProjectCategory).order_by(ProjectCategory.label.asc()).all()


@router.post("/categories", response_model=CategoryOut, status_code=201)
def create_project_category(
    payload: CategoryIn,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    label = payload.label.strip()
    if not label:
        raise HTTPException(422, "Label cannot be empty")

    code = _slugify_shared(label, max_len=60, fallback="category")
    # Ensure unique code — codes are the stable identifier the public site
    # filters by, so a collision has to be resolved here.
    existing_code = db.query(ProjectCategory.id).filter(ProjectCategory.code == code).first()
    suffix = 2
    base = code
    while existing_code:
        code = f"{base}-{suffix}"
        suffix += 1
        existing_code = db.query(ProjectCategory.id).filter(ProjectCategory.code == code).first()

    # Guard against label-level duplicates too (case-insensitive).
    same_label = (
        db.query(ProjectCategory)
        .filter(func.lower(ProjectCategory.label) == label.lower())
        .first()
    )
    if same_label:
        raise HTTPException(409, f"Категория «{same_label.label}» уже существует")

    cat = ProjectCategory(code=code, label=label)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat
