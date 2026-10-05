from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr, Field, field_validator
from app.shared.auth import get_current_user, hash_password
from app.models.user import User, UserRole, UserStatus
from app.models.order_request import OrderRequest, OrderStatus
from app.models.company import Company
from app.models.article import Article
from app.models.project import Project
from app.models.team_member import TeamMember
from app.models.client import Client
from app.models.notification import UserNotificationPreference
from database.database import get_db
from uuid import UUID
router = APIRouter(prefix="/admin", tags=["admin"])
# ---------- Admin dependency ----------
def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.user_role not in (UserRole.admin, UserRole.root):
        raise HTTPException(status_code=403, detail="Admin role required")
    return current_user
# ---------- Schemas ----------
class DashboardStats(BaseModel):
    total_users: int
    total_orders: int
    total_projects: int
    total_companies: int
    total_articles: int
    total_team_members: int
    orders_this_month: int
    projects_by_category: dict[str, int]
class CompanyCreate(BaseModel):
    name: str
    # Optional override. When omitted the endpoint transliterates `name`
    # into a unique ASCII slug — this is what the /companies/<slug>
    # public page hangs off, so it can never be NULL.
    slug: Optional[str] = None
    website: Optional[str] = None
    logotype_url: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None
    lifecycle_stage: Optional[str] = "lead"
class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    website: Optional[str] = None
    logotype_url: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None
    lifecycle_stage: Optional[str] = None
# ---------- User CRUD schemas ----------
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    name: Optional[str] = None
    surname: Optional[str] = None
    phone: Optional[str] = None
    role: UserRole = UserRole.user
    verified: bool = False
    blocked: bool = False
    @field_validator('password')
    @classmethod
    def check_password_strength(cls, v: str) -> str:
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        return v
def _load_prefs_map(db: Session, user_ids: list) -> dict:
    """Batch-load per-user notification preferences keyed by user_id.

    Returns a dict whose values are the UserNotificationPreference rows.
    Callers read the fields they need (telegram_chat_id, email_enabled,
    telegram_enabled) — the row is passed straight through so we only pay
    for one query per request.
    """
    if not user_ids:
        return {}
    return {
        p.user_id: p
        for p in db.query(UserNotificationPreference)
        .filter(UserNotificationPreference.user_id.in_(user_ids))
        .all()
    }


class UserOut(BaseModel):
    """Serialised user shape returned to the admin panel.

    The ORM model stores the role as `user_role` and the frontend expects
    `role`; this schema bridges the two so the JSON is stable regardless of
    the model's internal field name.

    Notification fields (`telegram_chat_id`, `email_enabled`,
    `telegram_enabled`) live on `user_notification_preferences`. Callers
    pass the loaded pref row in; when it isn't supplied, the defaults below
    match a fresh row.
    """
    id: UUID
    email: str
    name: Optional[str] = None
    surname: Optional[str] = None
    phone: Optional[str] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str
    verified: bool = False
    blocked: bool = False
    telegram_chat_id: Optional[str] = None
    email_enabled: bool = True
    telegram_enabled: bool = True
    created_at: Optional[datetime] = None

    @classmethod
    def from_user(cls, u: User, prefs: Optional[UserNotificationPreference] = None) -> "UserOut":
        return cls(
            id=u.id,
            email=u.email,
            name=u.name,
            surname=u.surname,
            phone=u.phone,
            username=u.username,
            avatar_url=u.avatar_url,
            role=(u.user_role.value if u.user_role else "user"),
            verified=bool(u.verified),
            blocked=bool(u.blocked),
            telegram_chat_id=(prefs.telegram_chat_id if prefs else None),
            email_enabled=(prefs.email_enabled if prefs else True),
            telegram_enabled=(prefs.telegram_enabled if prefs else True),
            created_at=u.created_at,
        )


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    surname: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[UserRole] = None
    verified: Optional[bool] = None
    blocked: Optional[bool] = None
    # Optional password reset from the admin dialog. When present it must
    # satisfy the same strength rules as registration; the endpoint hashes
    # it before writing. Leave unset to leave the password untouched.
    password: Optional[str] = Field(None, min_length=8)
    # Set/clear the user's Telegram chat id so they can receive order
    # notifications on Telegram without going through the bot deep link.
    # `None` = leave untouched; empty string = clear.
    telegram_chat_id: Optional[str] = None
    # Per-channel opt-in. `None` = leave untouched. Writes go to
    # user_notification_preferences (created on demand).
    email_enabled: Optional[bool] = None
    telegram_enabled: Optional[bool] = None
    # Avatar URL — managed here so an admin can set it without going
    # through the user's own profile page.
    avatar_url: Optional[str] = None

    @field_validator("password")
    @classmethod
    def check_password_strength(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        return v
# ---------- Dashboard ----------
@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)
    # Projects by category.
    # `Project.category` is a relationship to ProjectCategory now, not a
    # column — grouping on it directly makes SQLAlchemy return odd values.
    # Join through `category_id` and group on the label instead.
    from app.models.project_category import ProjectCategory

    rows = (
        db.query(ProjectCategory.label, func.count(Project.id))
        .select_from(Project)
        .outerjoin(ProjectCategory, Project.category_id == ProjectCategory.id)
        .group_by(ProjectCategory.label)
        .all()
    )
    projects_by_category = {
        (label or "uncategorized"): int(count) for label, count in rows
    }
    return DashboardStats(
        total_users=db.query(User).count(),
        total_orders=db.query(OrderRequest).count(),
        total_projects=db.query(Project).count(),
        total_companies=db.query(Company).count(),
        total_articles=db.query(Article).count(),
        total_team_members=db.query(TeamMember).count(),
        orders_this_month=db.query(OrderRequest).filter(OrderRequest.created_at >= month_start).count(),
        projects_by_category=projects_by_category,
    )
# ---------- CRUD: Users ----------
@router.get("/users", response_model=list[UserOut])
async def list_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    # If current user is admin (not root), exclude other admins from the list.
    query = db.query(User)
    if current_user.user_role == UserRole.admin:
        query = query.filter(User.user_role != UserRole.admin)
    rows = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    prefs_by_id = _load_prefs_map(db, [u.id for u in rows])
    return [UserOut.from_user(u, prefs_by_id.get(u.id)) for u in rows]
@router.get("/users/{user_id}", response_model=UserOut)
async def get_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    if current_user.user_role == UserRole.admin and user.user_role == UserRole.admin:
        raise HTTPException(403, "Admins cannot view other admins")
    prefs = db.get(UserNotificationPreference, user.id)
    return UserOut.from_user(user, prefs)
@router.post("/users", response_model=UserOut, status_code=201)
async def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    if data.role == UserRole.admin and current_user.user_role != UserRole.root:
        raise HTTPException(403, "Only root can create admin users")
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(422, "Email already registered")
    user = User(
        email=data.email,
        password=hash_password(data.password),
        name=data.name,
        surname=data.surname,
        phone=data.phone,
        user_role=data.role,
        verified=data.verified,
        blocked=data.blocked,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserOut.from_user(user)
@router.patch("/users/{user_id}")
async def update_user(
    user_id: UUID,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    # Admin cannot modify other admins
    if current_user.user_role == UserRole.admin and user.user_role == UserRole.admin:
        raise HTTPException(403, "Admins cannot modify other admins")
    # Only root can change role to admin or from admin
    if data.role is not None and data.role == UserRole.admin and current_user.user_role != UserRole.root:
        raise HTTPException(403, "Only root can set admin role")
    if data.role is not None and user.user_role == UserRole.admin and current_user.user_role != UserRole.root:
        raise HTTPException(403, "Only root can change admin role")
    # Prevent self-demotion from root to admin
    if user.id == current_user.id and data.role is not None and data.role != UserRole.root and current_user.user_role == UserRole.root:
        raise HTTPException(403, "Root cannot demote themselves")
    update = data.model_dump(exclude_unset=True)

    # --- Split out fields that don't live on the User row ---
    new_password = update.pop("password", None)

    # Notification fields live on user_notification_preferences.
    # `exclude_unset` means we only touch them when the client sent the key.
    telegram_chat_id_was_sent = "telegram_chat_id" in update
    telegram_chat_id = update.pop("telegram_chat_id", None)
    email_enabled_was_sent = "email_enabled" in update
    email_enabled = update.pop("email_enabled", None)
    telegram_enabled_was_sent = "telegram_enabled" in update
    telegram_enabled = update.pop("telegram_enabled", None)

    # Everything left (name, surname, email, phone, role, verified,
    # blocked, avatar_url, ...) is a plain User column — with one
    # exception: the API schema calls the field `role`, but the ORM
    # column is `user_role`. Map the name so setattr writes the attribute
    # SQLAlchemy actually persists; without this, role changes were
    # silently no-ops because Python happily created a phantom
    # `user.role` instance attribute that the DB never saw.
    FIELD_MAP = {"role": "user_role"}
    for key, value in update.items():
        attr = FIELD_MAP.get(key, key)
        if hasattr(user, attr):
            setattr(user, attr, value)
    if new_password:
        user.password = hash_password(new_password)

    # --- Apply notification prefs (create the row lazily) ---
    # Order-notification preferences are only meaningful for admin/root
    # users — root curates the recipient list on /admin/notification-settings.
    # Allowing this endpoint to flip prefs for a plain user would silently
    # enroll them as a potential order recipient, bypassing that page.
    if telegram_chat_id_was_sent or email_enabled_was_sent or telegram_enabled_was_sent:
        if user.user_role not in (UserRole.admin, UserRole.root):
            raise HTTPException(
                status_code=422,
                detail=(
                    "Уведомления о заказах настраиваются только для "
                    "администраторов и root-пользователей. Используйте "
                    "раздел «Уведомления о заказах» в админ-панели."
                ),
            )
        prefs = db.get(UserNotificationPreference, user.id)
        if not prefs:
            prefs = UserNotificationPreference(user_id=user.id)
            db.add(prefs)

        if telegram_chat_id_was_sent:
            cleaned = (telegram_chat_id or "").strip() or None
            prefs.telegram_chat_id = cleaned
            if cleaned and not prefs.linked_at:
                prefs.linked_at = datetime.utcnow()
            if not cleaned:
                prefs.telegram_username = None
                prefs.linked_at = None

        if email_enabled_was_sent and email_enabled is not None:
            prefs.email_enabled = bool(email_enabled)
        if telegram_enabled_was_sent and telegram_enabled is not None:
            prefs.telegram_enabled = bool(telegram_enabled)

    db.commit()
    db.refresh(user)
    prefs = db.get(UserNotificationPreference, user.id)
    return UserOut.from_user(user, prefs)
@router.delete("/users/{user_id}")
async def delete_user(user_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    # Admin cannot delete other admins
    if current_user.user_role == UserRole.admin and user.user_role == UserRole.admin:
        raise HTTPException(403, "Admins cannot delete other admins")
    # Root cannot delete themselves
    if user.id == current_user.id:
        raise HTTPException(403, "Root cannot delete themselves")
    db.delete(user)
    db.commit()
    return {"status": "ok"}
# ---------- CRUD: Order Requests ----------
@router.get("/order-requests/{order_id}")
async def get_order_request(order_id: UUID, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    order = db.get(OrderRequest, order_id)
    if not order:
        raise HTTPException(404, "Order not found")
    return order
# ---------- CRUD: Companies ----------
@router.get("/companies")
async def list_companies(skip: int = 0, limit: int = 50, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    return db.query(Company).offset(skip).limit(limit).all()
@router.get("/companies/{company_id}")
async def get_company(company_id: UUID, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    company = db.get(Company, company_id)
    if not company:
        raise HTTPException(404, "Company not found")
    return company
@router.post("/companies")
async def create_company(data: CompanyCreate, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    from app.shared.slugify import slugify

    base = slugify(data.slug or data.name, max_len=60, fallback="client")
    slug, n = base, 2
    while db.query(Company.id).filter(Company.slug == slug).first():
        slug = f"{base}-{n}"
        n += 1

    # Duplicate-name guard: two companies with the same name would appear
    # twice in the clients list and confuse the mention picker.
    existing = (
        db.query(Company)
        .filter(func.lower(Company.name) == data.name.strip().lower())
        .first()
    )
    if existing:
        raise HTTPException(409, f"Клиент «{existing.name}» уже существует")

    company = Company(
        name=data.name.strip(),
        slug=slug,
        website=data.website,
        logotype_url=data.logotype_url,
        industry=data.industry,
        description=data.description,
        lifecycle_stage=data.lifecycle_stage or "lead",
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    return company
@router.patch("/companies/{company_id}")
async def update_company(
    company_id: UUID,
    data: CompanyUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    from app.shared.slugify import slugify

    company = db.get(Company, company_id)
    if not company:
        raise HTTPException(404, "Company not found")

    update = data.model_dump(exclude_unset=True)

    # Slug uniqueness — only re-slugify when the caller passed a raw value.
    if "slug" in update and update["slug"]:
        new_base = slugify(update["slug"], max_len=60, fallback="client")
        if new_base != company.slug:
            candidate = new_base
            n = 2
            while (
                db.query(Company.id)
                .filter(Company.slug == candidate, Company.id != company.id)
                .first()
            ):
                candidate = f"{new_base}-{n}"
                n += 1
            update["slug"] = candidate

    # Name uniqueness on change.
    if "name" in update and update["name"]:
        clash = (
            db.query(Company)
            .filter(
                func.lower(Company.name) == update["name"].strip().lower(),
                Company.id != company.id,
            )
            .first()
        )
        if clash:
            raise HTTPException(409, f"Клиент «{clash.name}» уже существует")

    for key, value in update.items():
        setattr(company, key, value)

    db.commit()
    db.refresh(company)
    return company
@router.delete("/companies/{company_id}")
async def delete_company(company_id: UUID, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    company = db.get(Company, company_id)
    if not company:
        raise HTTPException(404, "Company not found")
    db.delete(company)
    db.commit()
    return {"status": "ok"}
# ---------- CRUD: Articles, Projects, Team Members (similar, omitted for brevity) ----------
# Full code would include all CRUD operations for each entity.
# For simplicity, we assume the existing endpoints are sufficient.
# ---------- Order Requests with files and contact ----------
from app.models.order_request_file import OrderRequestFile
from sqlalchemy.orm import joinedload

class ClientResponse(BaseModel):
    id: UUID
    name: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    telegram_username: Optional[str]
    class Config:
        from_attributes = True

class OrderRequestFileResponse(BaseModel):
    id: UUID
    filename: str
    file_path: str

class OrderRequestWithFiles(BaseModel):
    id: UUID
    client_id: Optional[UUID]
    service_types_json: Optional[List[str]]
    about: Optional[str]
    estimate_deadline: Optional[str]
    estimate_budget: Optional[str]
    naming_help: Optional[str]
    status: OrderStatus
    cancellation_reason: Optional[str] = None
    created_at: datetime
    files: List[OrderRequestFileResponse]
    # JSON key stays "contact" for the frontend, but the ORM
    # relationship was renamed to `client` in migration b5e0f1a2c3d4.
    contact: Optional[ClientResponse] = Field(None, validation_alias="client")
    class Config:
        from_attributes = True

# ponytail: pipeline ordering — new leads on top, dead deals at the bottom.
# Within a bucket, newest first so today's submissions surface immediately.
STATUS_PRIORITY = case(
    (OrderRequest.status == OrderStatus.new, 0),
    (OrderRequest.status == OrderStatus.negotiating, 1),
    (OrderRequest.status == OrderStatus.work, 2),
    (OrderRequest.status == OrderStatus.done, 3),
    (OrderRequest.status == OrderStatus.canceled, 4),
    else_=5,
)


@router.get("/order-requests", response_model=List[OrderRequestWithFiles])
async def list_order_requests(
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    return (
        db.query(OrderRequest)
        .options(joinedload(OrderRequest.files), joinedload(OrderRequest.client))
        .order_by(STATUS_PRIORITY, OrderRequest.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    cancellation_reason: Optional[str] = None


@router.patch("/order-requests/{order_id}", response_model=OrderRequestWithFiles)
async def update_order_status(
    order_id: UUID,
    data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    order = db.get(OrderRequest, order_id)
    if not order:
        raise HTTPException(404, "Order not found")
    order.status = data.status
    # ponytail: cancellation_reason only means something for canceled orders;
    # clear it whenever the order moves to any other status so the UI never
    # shows a stale "why did we kill this" line on a live deal.
    order.cancellation_reason = (
        data.cancellation_reason if data.status == OrderStatus.canceled else None
    )
    db.commit()
    db.refresh(order)
    return order
