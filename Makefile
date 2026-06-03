# ── Stocker Makefile ──────────────────────────────────────────────────
# Comandos rápidos para desarrollo y mantenimiento.

# ── Variables ─────────────────────────────────────────────────────────
API   := stocker_api
WEB   := stocker_web
DB    := stocker_db
DC    := docker compose -f docker/docker-compose.yml --env-file docker/.env

.PHONY: up down restart logs seed seed-sql test test-backend test-frontend lint lint-editorconfig lint-editorconfig-local lint-frontend lint-backend format-check format-frontend migration migrate pr-check test-backend-local test-frontend-local test-frontend-watch coverage-frontend coverage-backend lint-backend-local lint-frontend-local format-frontend-local

# ── Docker y Servicios ────────────────────────────────────────────────

up:
	@if [ ! -f docker/.env ]; then cp docker/.env.example docker/.env; fi
	$(DC) up --build -d

down:
	$(DC) down

restart:
	$(DC) down
	$(DC) up --build -d

logs:
	$(DC) logs -f

# ── Base de Datos y Semillas ──────────────────────────────────────────

seed:
	docker exec $(API) python -m app.seed

seed-sql:
	docker exec -i $(DB) psql -U postgres -d stocker < database/seed.sql

# ── TESTING ──────────────────────────────────────────────────────────
# Ejecuta todas las suites de prueba (Backend + Frontend) en contenedores
test: test-backend test-frontend

# Ejecuta tests del backend dentro del contenedor
test-backend:
	docker exec $(API) python -m pytest tests

# Ejecuta tests del frontend dentro del contenedor
test-frontend:
	docker exec $(WEB) npm run test -- --run

# ── LINTING & FORMATTING ─────────────────────────────────────────────
# Ejecuta todos los checks de calidad en contenedores
lint: lint-editorconfig lint-frontend format-check lint-backend

# EditorConfig — ejecutado dentro del contenedor frontend (solo /app)
lint-editorconfig:
	docker exec $(WEB) npx editorconfig-checker -exclude "node_modules"

# EditorConfig — ejecutado localmente sobre TODO el repo (requiere npx local)
lint-editorconfig-local:
	npx editorconfig-checker -exclude "node_modules"

# ESLint (frontend) dentro del contenedor
lint-frontend:
	docker exec $(WEB) npm run lint

# Prettier check (frontend) dentro del contenedor
format-check:
	docker exec $(WEB) npm run format:check

# Ruff + MyPy (backend) dentro del contenedor
lint-backend:
	docker exec $(API) ruff check .
	docker exec $(API) ruff format --check .
	docker exec $(API) mypy .

# Prettier write (frontend) dentro del contenedor
format-frontend:
	docker exec $(WEB) npx prettier --write .

# ── MIGRACIONES ──────────────────────────────────────────────────────
# Crea una nueva migración (ej: make migration m="add products table")
migration:
	docker exec $(API) alembic revision --autogenerate -m "$(m)"

# Aplica todas las migraciones pendientes a la base de datos
migrate:
	docker exec $(API) alembic upgrade head

# ── Desarrollo Local (Sin Docker) ─────────────────────────────────────
# Comandos para ejecutar localmente en la máquina del desarrollador

test-backend-local:
	cd backend && pytest tests

test-frontend-local:
	cd frontend && npm run test -- --run

test-frontend-watch:
	cd frontend && npm run test

coverage-frontend:
	cd frontend && npm run test -- --coverage

coverage-backend:
	cd backend && pytest --cov=app tests

lint-backend-local:
	cd backend && ruff check .
	cd backend && ruff format --check .
	cd backend && mypy .

lint-frontend-local:
	cd frontend && npm run lint

format-frontend-local:
	cd frontend && npx prettier --write .

# ── Calidad y Workflow (Pre-PR Check) ─────────────────────────────────

pr-check: lint-editorconfig lint-frontend format-check lint-backend test-frontend test-backend
	@echo "✅ ¡Todo listo para el Pull Request!"
