"""move hardcoded expert profile data onto team_members + seed

Revision ID: m2n3o4p5q6r7
Revises: l1k2j3a4b5c6
Create Date: 2026-10-26 00:00:00

The expert page (/<username>) currently reads stats, skills, milestones,
tags, socials, and location from a hardcoded TS map. This moves them onto
`team_members` as JSON columns so admins and the members themselves can
edit them without a deploy.

Every list is a small ordered array - no joins, no separate CRUD, no
per-row permissions. The `icon` / `kind` values are string KEYS the
frontend maps to React components; never store rendered markup or
component names.

Seeding: the four experts that already exist in EXPERTS_DATA are copied
in so their profiles don't blank out on the deploy that ships this.
Rows that already have expert_stats set are skipped, so a re-run after
someone edits their profile is a no-op.
"""
import json
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "m2n3o4p5q6r7"
down_revision: Union[str, None] = "l1k2j3a4b5c6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Snapshot of EXPERTS_DATA at the time this migration shipped. Keyed by
# user.username (lowercase). Only the fields being migrated are captured.
_SEED: dict[str, dict] = {
    "niyazgim": {
        "location": "Казань",
        "expert_stats": [
            {"value": "8+", "label": "лет в разработке"},
            {"value": "40+", "label": "проектов"},
            {"value": "3", "label": "продукта с нуля"},
        ],
        "expert_skills": [
            {"label": "Backend (Python, FastAPI)", "level": 95},
            {"label": "Frontend (React, Next.js)", "level": 85},
            {"label": "Infrastructure / DevOps", "level": 80},
            {"label": "Архитектура данных", "level": 90},
            {"label": "Design Systems", "level": 75},
        ],
        "expert_milestones": [
            {"year": "2024", "title": "Rovno.dev - со-основатель", "body": "Запуск агентства полного цикла. Ответственность за технологический стек, инфраструктуру и продуктовую стратегию."},
            {"year": "2023", "title": "Amorfa - автор фреймворка", "body": "Полностековый шаблон для быстрого запуска продуктовых команд. Открытый исходный код."},
            {"year": "2021", "title": "Unidoka - основатель", "body": "Продуктовая студия с фокусом на внутренние инструменты и дизайн-системы."},
        ],
        "expert_tags": [
            {"label": "Со-основатель и Техдир", "icon_key": "rovno"},
            {"label": "Автор тех самых стихов", "icon_key": None},
            {"label": "Создатель Amorfa", "icon_key": "amorfa"},
            {"label": "Основатель Вершин", "icon_key": "vershiny"},
            {"label": "Основатель Unidoka", "icon_key": "unidoka"},
        ],
        "expert_socials": [
            {"kind": "vk", "href": "https://vk.com/niyazgim"},
            {"kind": "telegram", "href": "https://t.me/niyazgim"},
            {"kind": "github", "href": "https://github.com/niyazgim"},
        ],
    },
    "rovnomikhail": {
        "location": "Москва",
        "expert_stats": [
            {"value": "6+", "label": "лет в продукте"},
            {"value": "30+", "label": "клиентов"},
            {"value": "12", "label": "отраслей"},
        ],
        "expert_skills": [
            {"label": "Product Management", "level": 90},
            {"label": "UX Research", "level": 85},
            {"label": "Client Relationships", "level": 95},
            {"label": "Analytics", "level": 70},
        ],
        "expert_milestones": [
            {"year": "2024", "title": "Rovno.dev - со-основатель", "body": "Отвечает за работу с клиентами и продуктовую стратегию агентства."},
        ],
        "expert_tags": [
            {"label": "Со-основатель и Директор по работе с клиентами и продукту", "icon_key": "rovno"},
        ],
        "expert_socials": [
            {"kind": "telegram", "href": "https://t.me/RovnoMikhail"},
        ],
    },
    "rovnodanil": {
        "location": "Казань",
        "expert_stats": [
            {"value": "5+", "label": "лет в 3D"},
            {"value": "20+", "label": "роликов"},
            {"value": "50+", "label": "3D-сцен"},
        ],
        "expert_skills": [
            {"label": "3D Modeling (Blender)", "level": 95},
            {"label": "Motion Design", "level": 90},
            {"label": "Art Direction", "level": 85},
            {"label": "Color & Grading", "level": 80},
        ],
        "expert_milestones": [
            {"year": "2026", "title": "Хлебная Страна - промо-ролик", "body": "Полный цикл: концепт, 3D-сцены, съёмка, монтаж. Победитель отраслевого конкурса."},
            {"year": "2024", "title": "ALX-9 - 3D-модель Чужого", "body": "Разработка концепт-арта и финальной 3D-модели для крупнейшей выставки роботостроения."},
        ],
        "expert_tags": [
            {"label": "Со-основатель и Арт-директор", "icon_key": "rovno"},
        ],
        "expert_socials": [
            {"kind": "telegram", "href": "https://t.me/RovnoDanil"},
        ],
    },
    "web_senior": {
        "location": "Москва",
        "expert_stats": [
            {"value": "10+", "label": "лет в индустрии"},
            {"value": "+40%", "label": "скорость разработки"},
            {"value": "0", "label": "инцидентов за год"},
        ],
        "expert_skills": [
            {"label": "Backend (Python, Go)", "level": 90},
            {"label": "DevOps / Kubernetes", "level": 95},
            {"label": "Security", "level": 85},
            {"label": "Performance Tuning", "level": 90},
        ],
        "expert_milestones": [
            {"year": "2024", "title": "Rovno.dev - технологический партнёр", "body": "Отвечает за инфраструктуру, CI/CD и безопасность всех проектов агентства."},
        ],
        "expert_tags": [
            {"label": "Senior FullStack/DevSecOps", "icon_key": "rovno"},
        ],
        "expert_socials": [],
    },
}


def upgrade() -> None:
    op.execute("ALTER TABLE team_members ADD COLUMN IF NOT EXISTS location VARCHAR")
    op.execute("ALTER TABLE team_members ADD COLUMN IF NOT EXISTS expert_tags JSON")
    op.execute("ALTER TABLE team_members ADD COLUMN IF NOT EXISTS expert_socials JSON")
    op.execute("ALTER TABLE team_members ADD COLUMN IF NOT EXISTS expert_stats JSON")
    op.execute("ALTER TABLE team_members ADD COLUMN IF NOT EXISTS expert_skills JSON")
    op.execute("ALTER TABLE team_members ADD COLUMN IF NOT EXISTS expert_milestones JSON")

    conn = op.get_bind()
    seeded = 0
    for username, data in _SEED.items():
        row = conn.execute(
            sa.text(
                "SELECT tm.id FROM team_members tm "
                "JOIN users u ON u.id = tm.user_id "
                "WHERE lower(u.username) = :u "
                "  AND tm.expert_stats IS NULL"
            ),
            {"u": username.lower()},
        ).scalar()
        if not row:
            continue
        conn.execute(
            sa.text(
                "UPDATE team_members SET "
                "  location = :loc, "
                "  expert_tags = CAST(:tags AS JSON), "
                "  expert_socials = CAST(:socials AS JSON), "
                "  expert_stats = CAST(:stats AS JSON), "
                "  expert_skills = CAST(:skills AS JSON), "
                "  expert_milestones = CAST(:miles AS JSON) "
                "WHERE id = :id"
            ),
            {
                "id": row,
                "loc": data.get("location"),
                "tags": json.dumps(data.get("expert_tags") or []),
                "socials": json.dumps(data.get("expert_socials") or []),
                "stats": json.dumps(data.get("expert_stats") or []),
                "skills": json.dumps(data.get("expert_skills") or []),
                "miles": json.dumps(data.get("expert_milestones") or []),
            },
        )
        seeded += 1
    if seeded:
        print(f"[add_team_member_expert_fields] seeded {seeded} expert profile(s)")


def downgrade() -> None:
    op.execute("ALTER TABLE team_members DROP COLUMN IF EXISTS expert_milestones")
    op.execute("ALTER TABLE team_members DROP COLUMN IF EXISTS expert_skills")
    op.execute("ALTER TABLE team_members DROP COLUMN IF EXISTS expert_stats")
    op.execute("ALTER TABLE team_members DROP COLUMN IF EXISTS expert_socials")
    op.execute("ALTER TABLE team_members DROP COLUMN IF EXISTS expert_tags")
    op.execute("ALTER TABLE team_members DROP COLUMN IF EXISTS location")
