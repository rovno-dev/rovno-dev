from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr, Field, field_validator
from app.shared.auth import get_current_user, hash_password
from app.models.user import User, UserRole, UserStatus
from app.models.order_request import OrderRequest
from app.models.company import Company
from app.models.article import Article
from app.models.project import Project
from app.models.team_member import TeamMember
from app.models.contact import Contact
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
    website: Optional[str] = None
    logotype_url: Optional[str] = None
    industry: Optional[str] = None
    lifecycle_stage: Optional[str] = "lead"
class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    website: Optional[str] = None
    logotype_url: Optional[str] = None
    industry: Optional[str] = None
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
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    surname: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[UserRole] = None
    verified: Optional[bool] = None
    blocked: Optional[bool] = None
# ---------- Dashboard ----------
@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)
    # Projects by category
    projects = db.query(Project.category, func.count(Project.id)).group_by(Project.category).all()
    projects_by_category = {cat or "uncategorized": count for cat, count in projects}
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
@router.get("/users")
async def list_users(
    skip: int = 0, limit: int = 50, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)
):
    # If current user is admin (not root), exclude other admins from the list
    query = db.query(User)
    if current_user.user_role == UserRole.admin:
        query = query.filter(User.user_role != UserRole.admin)
    return query.offset(skip).limit(limit).all()
@router.get("/users/{user_id}")
async def get_user(user_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    # Admin cannot view other admins
    if current_user.user_role == UserRole.admin and user.user_role == UserRole.admin:
        raise HTTPException(403, "Admins cannot view other admins")
    return user
@router.post("/users")
async def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    # Only root can create admin users
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
    return user
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
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user
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
    company = Company(**data.dict())
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
    company = db.get(Company, company_id)
    if not company:
        raise HTTPException(404, "Company not found")
    for key, value in data.dict(exclude_unset=True).items():
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

class ContactResponse(BaseModel):
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
    contact_id: Optional[UUID]
    service_types_json: Optional[List[str]]
    about: Optional[str]
    estimate_deadline: Optional[str]
    estimate_budget: Optional[str]
    naming_help: Optional[str]
    created_at: datetime
    files: List[OrderRequestFileResponse]
    contact: Optional[ContactResponse]
    class Config:
        from_attributes = True

@router.get("/order-requests", response_model=List[OrderRequestWithFiles])
async def list_order_requests(skip: int = 0, limit: int = 50, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    orders = db.query(OrderRequest).options(
        joinedload(OrderRequest.files),
        joinedload(OrderRequest.contact)
    ).offset(skip).limit(limit).all()
    return orders
