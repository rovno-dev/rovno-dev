import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Boolean, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from database.database import Base


class TeamMember(Base):
    __tablename__ = "team_members"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    # Short internal label ("Co-founder & CTO"). Shown on the expert page
    # under the name, and next to the user in admin listings.
    role = Column(String, nullable=False)
    # Long-form bio for the expert profile page. Markdown-free plain text,
    # rendered as-is. Distinct from users.bio (64-char tagline).
    bio = Column(Text, nullable=True)
    # 21:8 wide banner used as the expert-page hero background. If unset, the
    # page falls back to the user's 1:1 avatar.
    cover_url = Column(String, nullable=True)
    # Expert-profile fields, editable via /app/profile (self) or
    # /admin/team (admin). Stored as JSON because each is a small ordered
    # list - no joins, no separate CRUD. Icon/social "kind" is a string
    # KEY the frontend maps to a component; never store rendered markup.
    location = Column(String, nullable=True)
    expert_tags = Column(JSON, nullable=True)
    expert_socials = Column(JSON, nullable=True)
    expert_stats = Column(JSON, nullable=True)
    expert_skills = Column(JSON, nullable=True)
    expert_milestones = Column(JSON, nullable=True)
    sort_order = Column(Integer, default=0)
    # Soft-remove: an admin can take someone off the team without deleting
    # the row, so their published articles keep pointing at a team record.
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
