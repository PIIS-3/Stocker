# ── Stocker Makefile ──────────────────────────────────────────────────
# Comandos rápidos para desarrollo y mantenimiento.

.PHONY: up down restart logs seed seed-sql test test-backend test-frontend lint lint-frontend format-frontend migration migrate pr-check

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
	docker exec stocker_api python -m app.seed

seed-sql:
	docker exec -i stocker_db psql -U postgres -d stocker < database/seed.sql

# ── TESTING ──────────────────────────────────────────────────────────
# Ejecuta todas las suites de prueba (Backend + Frontend)
test: test-backend test-frontend

# Ejecuta solo los tests del backend usando el entorno virtual local
test-backend:
	cd backend && .venv/bin/python -m pytest

# Ejecuta solo los tests del frontend (Vitest)
test-frontend:
	cd frontend && npm run test -- --run

# ── LINTING & FORMATTING ─────────────────────────────────────────────
# Ejecuta todos los checks de calidad (EditorConfig, ESLint, Prettier)
lint:
	npx editorconfig-checker
	cd frontend && npm run lint
	cd frontend && npm run format:check

# Ejecuta solo el linter del frontend
lint-frontend:
	cd frontend && npm run lint

# Aplica el formato automático de Prettier en el frontend
format-frontend:
	cd frontend && npx prettier --write .

# ── MIGRACIONES ──────────────────────────────────────────────────────
# Crea una nueva migración (ej: make migration m="add products table")
migration:
	docker exec stocker_api alembic revision --autogenerate -m "$(m)"

# Aplica todas las migraciones pendientes a la base de datos
migrate:
	docker exec stocker_api alembic upgrade head

# ── Calidad y Workflow (Pre-PR Check) ─────────────────────────────────

pr-check:
	@echo "🔍 Ejecutando validación global (EditorConfig)..."
	npx editorconfig-checker
	@echo "⚛️ Validando Frontend..."
	cd frontend && npx prettier --write . && npm run lint && npm run test -- --run
	@echo "🐍 Validando Backend..."
	cd backend && PYTHONPATH=. .venv/bin/python -m pytest tests
	@echo "✅ ¡Todo listo para el Pull Request!"
