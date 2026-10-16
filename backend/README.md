# Backend — FastAPI services

[English](#english) | [Русская версия](#russian)

## English Version

### Project Concept

Scalable microservices on **FastAPI**, backed by PostgreSQL and Valkey
(Redis-compatible), fronted by Traefik in prod. The architecture supports
polyglot services but is currently optimised for Python.

### Tech Stack

- **Framework:** FastAPI
- **Database:** PostgreSQL
- **Cache / Queue:** Valkey
- **ORM:** SQLAlchemy 2.0
- **Migrations:** Alembic
- **Proxy:** Traefik (prod only)
- **Containerisation:** Docker & Docker Compose

## Quick Start

### Clone

```bash
git clone git@github.com:unidoka/simplebase.git
cd simplebase
```

### Configure environment

```bash
cp .env.example .env
```

Fill in the secrets (JWT keys, DB password, SMTP credentials).

### Run — dev (hot reload)

Runs `main-service` with `--reload`, source bind-mounted, port 8000 exposed
directly. Includes `main-db` and `valkey` with isolated volumes and network
(`main-network-dev`). The frontend is not part of this stack — run it
separately with `npm run dev` (see `../website/README.md`).

```bash
docker compose -f docker-compose.dev.yml up -d
```

- Swagger: http://localhost:8000/docs
- Health: http://localhost:8000/health
- Main Service: http://localhost:8000/api/v1

Tear down:

```bash
docker compose -f docker-compose.dev.yml down
```

Add `-v` to also remove the dev database volume.

### Run — production-parity

Everything runs in Docker, including the frontend. Traefik routes on port 80.

```bash
docker compose up -d --build
```

- Swagger: http://localhost/docs
- Health: http://localhost/health
- Main Service: http://localhost/api/main/v1

### Running from the repo root

Both files are included by the root compose:

```bash
docker compose up -d --build                          # prod
docker compose -f docker-compose.dev.yml up -d        # dev
```

---

# Шаблон бэкенда (микросервисы на FastAPI)

[English](#english) | [Русская версия](#russian)

## Русская версия

### Концепция проекта

Масштабируемые микросервисы на **FastAPI** с PostgreSQL и Valkey
(совместим с Redis), в проде — за Traefik. Архитектура поддерживает
полиглотную разработку, но сейчас оптимизирована под Python.

### Технологический стек

- **Фреймворк:** FastAPI
- **БД:** PostgreSQL
- **Кэш / Очереди:** Valkey
- **ORM:** SQLAlchemy 2.0
- **Миграции:** Alembic
- **Прокси:** Traefik (только в проде)
- **Контейнеризация:** Docker & Docker Compose

## Быстрый старт

### Клонирование

```bash
git clone git@github.com:unidoka/simplebase.git
cd simplebase
```

### Настройка окружения

```bash
cp .env.example .env
```

Заполните секреты (JWT-ключи, пароль БД, SMTP).

### Запуск — dev (hot reload)

`main-service` запускается с `--reload`, исходники монтируются, порт 8000
публикуется напрямую. Включены `main-db` и `valkey` с изолированными
volume и сетью (`main-network-dev`). Фронтенд в этот стек не входит —
запускайте отдельно командой `npm run dev` (см. `../website/README.md`).

```bash
docker compose -f docker-compose.dev.yml up -d
```

- Swagger: http://localhost:8000/docs
- Health: http://localhost:8000/health
- Main Service: http://localhost:8000/api/v1

Остановить:

```bash
docker compose -f docker-compose.dev.yml down
```

Флаг `-v` дополнительно удалит volume с dev-базой.

### Запуск — прод-режим

Всё работает в Docker, включая фронтенд. Traefik слушает 80-й порт.

```bash
docker compose up -d --build
```

- Swagger: http://localhost/docs
- Health: http://localhost/health
- Main Service: http://localhost/api/main/v1

### Запуск из корня репозитория

Оба файла подключены в корневом compose:

```bash
docker compose up -d --build                          # прод
docker compose -f docker-compose.dev.yml up -d        # dev
```
