from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
from app.shared.auth import get_current_user
from app.models.user import User, UserRole
from app.models.order_request import OrderRequest
from app.models.company import Company
from app.models.article import Article
from app.models.project import Project
from app.models.team_member import TeamMember
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

# ---------- Dashboard ----------
@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)
    return DashboardStats(
        total_users=db.query(User).count(),
        total_orders=db.query(OrderRequest).count(),
        total_projects=db.query(Project).count(),
        total_companies=db.query(Company).count(),
        total_articles=db.query(Article).count(),
        total_team_members=db.query(TeamMember).count(),
        orders_this_month=db.query(OrderRequest).filter(OrderRequest.created_at >= month_start).count(),
        projects_by_category={},
    )

# ---------- CRUD: Users ----------
@router.get("/users")
async def list_users(
    skip: int = 0, limit: int = 50, db: Session = Depends(get_db), _: User = Depends(get_admin_user)
):
    return db.query(User).offset(skip).limit(limit).all()

@router.get("/users/{user_id}")
async def get_user(user_id: UUID, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return user

@router.patch("/users/{user_id}")
async def update_user(
    user_id: UUID,
    data: dict,
    db: Session = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    for key, value in data.items():
        if hasattr(user, key):
            setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}")
async def delete_user(user_id: UUID, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    db.delete(user)
    db.commit()
    return {"status": "ok"}

# ---------- CRUD: Order Requests ----------
@router.get("/order-requests")
async def list_order_requests(skip: int = 0, limit: int = 50, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    return db.query(OrderRequest).offset(skip).limit(limit).all()

@router.get("/order-requests/{order_id}")
async def get_order_request(order_id: UUID, db: Session = Depends(get_db), _: User = Depends(get_admin_user)):
    order = db.get(OrderRequest, order_id)
    if not order:
        raise HTTPException(404, "Order not found")
    return order

# ... similarly for companies, articles, projects, team_members (omitted for brevity)
# Full code would include all CRUD operations for each entity.
