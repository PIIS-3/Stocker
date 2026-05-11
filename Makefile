# ── Stocker Makefile ──────────────────────────────────────────────────
# Comandos rápidos para desarrollo y mantenimiento.

# ── Variables ─────────────────────────────────────────────────────────
API   := stocker_api
WEB   := stocker_web
DB    := stocker_db
DC    := cd docker && docker compose

.PHONY: up down restart logs seed seed-sql test test-backend test-frontend lint lint-editorconfig lint-editorconfig-local lint-frontend format-check format-frontend migration migrate pr-check

# ── Docker y Servicios ────────────────────────────────────────────────

up:
	cd docker && cp -n .env.example .env && docker compose up --build -d

down:
	cd docker && docker compose down

restart:
	cd docker && docker compose down && docker compose up --build -d

logs:
	cd docker && docker compose logs -f

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
lint: lint-editorconfig lint-frontend format-check

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

# ── Calidad y Workflow (Pre-PR Check) ─────────────────────────────────

pr-check: lint-editorconfig lint-frontend format-check test-frontend test-backend
	@echo "✅ ¡Todo listo para el Pull Request!"
