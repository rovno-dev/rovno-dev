"""add expert fields to team_members and seed

Revision ID: m2n3o4p5q6r7
Revises: l1k2j3a4b5c6
Create Date: 2026-10-26 00:00:00
"""
import json
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "m2n3o4p5q6r7"
down_revision: Union[str, None] = "l1k2j3a4b5c6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_SEED = {
    "niyazgim": {
        "location": "Казань",
        "stats": [{"value": "8+", "label": "лет в разработке"}, {"value": "40+", "label": "проектов"}, {"value": "3", "label": "продукта с нуля"}],
        "skills": [{"label": "Backend (Python, FastAPI)", "level": 95}, {"label": "Frontend (React, Next.js)", "level": 85}, {"label": "Infrastructure / DevOps", "level": 80}, {"label": "Архитектура данных", "level": 90}, {"label": "Design Systems", "level": 75}],
        "milestones": [{"year": "2024", "title": "Rovno.dev - со-основатель", "body": "Запуск агентства полного цикла. Ответственность за технологический стек, инфраструктуру и продуктовую стратегию."}, {"year": "2023", "title": "Amorfa - автор фреймворка", "body": "Полностековый шаблон для быстрого запуска продуктовых команд. Открытый исходный код."}, {"year": "2021", "title": "Unidoka - основатель", "body": "Продуктовая студия с фокусом на внутренние инструменты и дизайн-системы."}],
        "tags": [{"label": "Со-основатель и Техдир", "icon_key": "rovno"}, {"label": "Автор тех самых стихов", "icon_key": None}, {"label": "Создатель Amorfa", "icon_key": "amorfa"}, {"label": "Основатель Вершин", "icon_key": "vershiny"}, {"label": "Основатель Unidoka", "icon_key": "unidoka"}],
        "socials": [{"kind": "vk", "href": "https://vk.com/niyazgim"}, {"kind": "telegram", "href": "https://t.me/niyazgim"}, {"kind": "github", "href": "https://github.com/niyazgim"}],
    },
    "rovnomikhail": {
        "location": "Москва",
        "stats": [{"value": "6+", "label": "лет в продукте"}, {"value": "30+", "label": "клиентов"}, {"value": "12", "label": "отраслей"}],
        "skills": [{"label": "Product Management", "level": 90}, {"label": "UX Research", "level": 85}, {"label": "Client Relationships", "level": 95}, {"label": "Analytics", "level": 70}],
        "milestones": [{"year": "2024", "title": "Rovno.dev - со-основатель", "body": "Отвечает за работу с клиентами и продуктовую стратегию агентства."}],
        "tags": [{"label": "Со-основатель и Директор по работе с клиентами и продукту", "icon_key": "rovno"}],
        "socials": [{"kind": "telegram", "href": "https://t.me/RovnoMikhail"}],
    },
    "rovnodanil": {
        "location": "Казань",
        "stats": [{"value": "5+", "label": "лет в 3D"}, {"value": "20+", "label": "роликов"}, {"value": "50+", "label": "3D-сцен"}],
        "skills": [{"label": "3D Modeling (Blender)", "level": 95}, {"label": "Motion Design", "level": 90}, {"label": "Art Direction", "level": 85}, {"label": "Color & Grading", "level": 80}],
        "milestones": [{"year": "2026", "title": "Хлебная Страна - промо-ролик", "body": "Полный цикл: концепт, 3D-сцены, съёмка, монтаж. Победитель отраслевого конкурса."}, {"year": "2024", "title": "ALX-9 - 3D-модель Чужого", "body": "Разработка концепт-арта и финальной 3D-модели для крупнейшей выставки роботостроения."}],
        "tags": [{"label": "Со-основатель и Арт-директор", "icon_key": "rovno"}],
        "socials": [{"kind": "telegram", "href": "https://t.me/RovnoDanil"}],
    },
    "web_senior": {
        "location": "Москва",
        "stats": [{"value": "10+", "label": "лет в индустрии"}, {"value": "+40%", "label": "скорость разработки"}, {"value": "0", "label": "инцидентов за год"}],
        "skills": [{"label": "Backend (Python, Go)", "level": 90}, {"label": "DevOps / Kubernetes", "level": 95}, {"label": "Security", "level": 85}, {"label": "Performance Tuning", "level": 90}],
        "milestones": [{"year": "2024", "title": "Rovno.dev - технологический партнёр", "body": "Отвечает за инфраструктуру, CI/CD и безопасность всех проектов агентства."}],
        "tags": [{"label": "Senior FullStack/DevSecOps", "icon_key": "rovno"}],
        "socials": [],
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
    for username, data in _SEED.items():
        row = conn.execute(sa.text("SELECT tm.id FROM team_members tm JOIN users u ON u.id = tm.user_id WHERE lower(u.username) = :u AND tm.expert_stats IS NULL"), {"u": username.lower()}).scalar()
        if row:
            conn.execute(sa.text("UPDATE team_members SET location=:loc, expert_tags=CAST(:tags AS JSON), expert_socials=CAST(:socials AS JSON), expert_stats=CAST(:stats AS JSON), expert_skills=CAST(:skills AS JSON), expert_milestones=CAST(:miles AS JSON) WHERE id=:id"), {
                "id": row, "loc": data.get("location"), "tags": json.dumps(data.get("tags") or []), "socials": json.dumps(data.get("socials") or []), "stats": json.dumps(data.get("stats") or []), "skills": json.dumps(data.get("skills") or []), "miles": json.dumps(data.get("milestones") or [])
            })

def downgrade() -> None:
    pass
