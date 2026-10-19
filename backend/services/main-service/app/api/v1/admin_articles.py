"""Admin-only article management: list with filters, approve, reject."""
from datetime import datetime
import zipfile
import io
import shutil
import os
import json
import uuid
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.models.article import Article
from app.models.project import PublicationStatus
from app.models.team_member import TeamMember
from app.models.user import User, UserRole
from app.schemas.article.responses import AdminArticleListItem
from app.shared.auth import get_current_user
from database.database import get_db
from app.api.v1.admin import get_admin_user
from app.services.tag_service import resolve_tags
from app.models.tag import TagKind
from app.shared.slugify import slugify

router = APIRouter(prefix="/admin/articles", tags=["admin-articles"])


class RejectRequest(BaseModel):
    note: str = Field(..., min_length=1, max_length=1000)



from pydantic import BaseModel
from typing import List

class BulkPayload(BaseModel):
    slugs: List[str]

@router.post("/bulk/delete")
def bulk_delete_articles(
    payload: BulkPayload,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    db.query(Article).filter(Article.slug.in_(payload.slugs)).delete(synchronize_session=False)
    db.commit()
    return {"status": "ok", "deleted": len(payload.slugs)}

@router.post("/bulk/approve")
def bulk_approve_articles(
    payload: BulkPayload,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    from datetime import datetime
    db.query(Article).filter(Article.slug.in_(payload.slugs)).update({
        "publication_status": PublicationStatus.published,
        "reviewed_by_id": admin.id,
        "reviewed_at": datetime.utcnow(),
        "review_note": None
    }, synchronize_session=False)
    db.commit()
    return {"status": "ok", "approved": len(payload.slugs)}

@router.post("/bulk/reject")
def bulk_reject_articles(
    payload: BulkPayload,
    note: str = "Массовое отклонение",
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    from datetime import datetime
    db.query(Article).filter(Article.slug.in_(payload.slugs)).update({
        "publication_status": PublicationStatus.rejected,
        "reviewed_by_id": admin.id,
        "reviewed_at": datetime.utcnow(),
        "review_note": note
    }, synchronize_session=False)
    db.commit()
    return {"status": "ok", "rejected": len(payload.slugs)}

@router.get("", response_model=List[AdminArticleListItem])
def list_admin_articles(
    status: Optional[str] = Query(
        None,
        description="draft | pending_review | published | rejected — omit for all",
    ),
    author_type: Optional[str] = Query(
        None,
        description="team | external — filter by whether the author is an active team member",
    ),
    q: Optional[str] = Query(None, description="Substring match on title"),
    limit: int = Query(200, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    query = db.query(Article)

    if status:
        if status not in {s.value for s in PublicationStatus}:
            raise HTTPException(422, f"Unknown status: {status}")
        query = query.filter(Article.publication_status == PublicationStatus(status))

    if q:
        query = query.filter(Article.title.ilike(f"%{q.strip()}%"))

    # For author_type we need to know which users are active team members.
    # Resolve once, then filter in Python — the set is small and this avoids
    # a correlated subquery in the main SELECT.
    if author_type in ("team", "external"):
        team_user_ids = {
            row[0]
            for row in db.query(TeamMember.user_id)
            .filter(TeamMember.is_active.is_(True), TeamMember.user_id.isnot(None))
            .all()
        }
        if author_type == "team":
            query = query.filter(Article.author_id.in_(team_user_ids))
        else:
            query = query.filter(
                (Article.author_id.is_(None))
                | (Article.author_id.notin_(team_user_ids))
            )

    # Pipeline order: pending first (needs attention), then rejected (author
    # may need to be nudged), then published, then drafts. Within a bucket,
    # newest activity first.
    from sqlalchemy import case

    order = case(
        (Article.publication_status == PublicationStatus.pending_review, 0),
        (Article.publication_status == PublicationStatus.rejected, 1),
        (Article.publication_status == PublicationStatus.published, 2),
        (Article.publication_status == PublicationStatus.draft, 3),
        else_=4,
    )
    articles = (
        query.order_by(order, Article.updated_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    # Annotate is_team_author in one batch — cheap and avoids a property that
    # would trigger N+1.
    author_ids = [a.author_id for a in articles if a.author_id]
    team_ids = (
        {
            row[0]
            for row in db.query(TeamMember.user_id)
            .filter(TeamMember.user_id.in_(author_ids), TeamMember.is_active.is_(True))
            .all()
        }
        if author_ids
        else set()
    )

    out: List[AdminArticleListItem] = []
    for a in articles:
        item = AdminArticleListItem.model_validate(a)
        item.is_team_author = a.author_id in team_ids
        item.is_pending = a.publication_status == PublicationStatus.pending_review
        out.append(item)
    return out



@router.post("/import-zip", status_code=201)
async def import_articles_zip(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Imports 1 or multiple articles from a ZIP.
    ZIP structure can be flat (1 article) or folder-based (N articles).
    Each article is created as a DRAFT.
    """
    if not (current_user.user_role in (UserRole.admin, UserRole.root) or getattr(current_user, 'can_create_articles', False)):
        raise HTTPException(403, "No permission to create articles")

    if not file.filename.endswith('.zip'):
        raise HTTPException(400, "Must be a ZIP file")

    content = await file.read()
    try:
        with zipfile.ZipFile(io.BytesIO(content)) as z:
            # Find all data.json files (ignore Mac meta files)
            json_files = [
                f for f in z.namelist() 
                if f.endswith('data.json') and not f.startswith('__MACOSX') and '__MACOSX' not in f
            ]
            if not json_files:
                raise HTTPException(400, "No data.json found in ZIP")

            UPLOAD_DIR = os.getenv("UPLOADS_DIR", "/app/storage/uploads")
            os.makedirs(UPLOAD_DIR, exist_ok=True)
            
            imported_slugs = []
            
            for json_path in json_files:
                # Determine the base directory for this article
                base_dir = os.path.dirname(json_path)
                prefix = f"{base_dir}/" if base_dir else ""
                
                with z.open(json_path) as f:
                    data = json.load(f)
                    
                # Process media files belonging to this article
                url_map = {}
                for img_path in z.namelist():
                    if img_path.startswith(prefix) and img_path != json_path and not img_path.endswith('/'):
                        if img_path.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.gif', '.mp4', '.webm')):
                            ext = os.path.splitext(img_path)[1].lower()
                            unique_name = f"{uuid.uuid4().hex}{ext}"
                            disk_path = os.path.join(UPLOAD_DIR, unique_name)
                            
                            with z.open(img_path) as src, open(disk_path, "wb") as dst:
                                shutil.copyfileobj(src, dst)
                            
                            # Map relative paths (e.g., 'media/photo.jpg' and 'photo.jpg')
                            rel_path = img_path[len(prefix):]
                            public_url = f"/uploads/images/{unique_name}"
                            url_map[rel_path] = public_url
                            url_map[os.path.basename(img_path)] = public_url

                # Replace references in MDX
                mdx = data.get("mdx_content", "")
                for orig, new_url in url_map.items():
                    mdx = mdx.replace(f"./{orig}", new_url)
                    mdx = mdx.replace(orig, new_url)

                title = data.get("title", "Untitled")
                base_slug = slugify(data.get("slug") or title)
                
                slug = base_slug
                suffix = 2
                while db.query(Article.id).filter(Article.slug == slug).first():
                    slug = f"{base_slug}-{suffix}"
                    suffix += 1
                
                # STRICT REQUIREMENT: All imported articles are drafts
                article = Article(
                    slug=slug,
                    title=title,
                    description=data.get("description", ""),
                    image_url=data.get("image_url", ""),
                    date=datetime.utcnow(),
                    mdx_content=mdx,
                    seo_title=data.get("seo_title"),
                    meta_description=data.get("meta_description"),
                    publication_status=PublicationStatus.draft,
                    author_id=current_user.id
                )
                
                tags = data.get("tags", [])
                if tags:
                    article.tags = resolve_tags(db, tags, TagKind.tag)
                
                db.add(article)
                db.commit()
                db.refresh(article)
                imported_slugs.append(slug)

            return {"status": "ok", "imported_count": len(imported_slugs), "slugs": imported_slugs}
            
    except zipfile.BadZipFile:
        raise HTTPException(400, "Invalid ZIP file")
    except json.JSONDecodeError:
        raise HTTPException(400, "Invalid JSON format in one of the files")
    except Exception as e:
        raise HTTPException(500, f"Import failed: {str(e)}")

@router.patch("/{slug}/approve")
def approve_article(
    slug: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(404, "Article not found")
    if article.publication_status not in (
        PublicationStatus.pending_review,
        PublicationStatus.rejected,
    ):
        raise HTTPException(409, f"Cannot approve an article in status '{article.publication_status.value}'")

    article.publication_status = PublicationStatus.published
    article.review_note = None
    article.reviewed_by_id = admin.id
    from datetime import datetime
    article.reviewed_at = datetime.utcnow()
    db.commit()
    db.refresh(article)
    return AdminArticleListItem.model_validate(article)


@router.patch("/{slug}/reject")
def reject_article(
    slug: str,
    payload: RejectRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user),
):
    article = db.query(Article).filter(Article.slug == slug).first()
    if not article:
        raise HTTPException(404, "Article not found")
    if article.publication_status not in (
        PublicationStatus.pending_review,
        PublicationStatus.published,
    ):
        raise HTTPException(409, f"Cannot reject an article in status '{article.publication_status.value}'")

    article.publication_status = PublicationStatus.rejected
    article.review_note = payload.note.strip()
    article.reviewed_by_id = admin.id
    from datetime import datetime
    article.reviewed_at = datetime.utcnow()
    db.commit()
    db.refresh(article)
    return AdminArticleListItem.model_validate(article)
