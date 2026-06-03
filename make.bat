@echo off
REM ── Stocker Task Runner (Windows) ──────────────────────────────────
REM Equivalente al Makefile para sistemas sin 'make'.
REM Uso: .\make <comando>    Ejemplo: .\make test-backend

set API=stocker_api
set WEB=stocker_web
set DB=stocker_db
set DC=docker compose -f docker/docker-compose.yml --env-file docker/.env

if "%1"=="" goto help
goto %1

:up
if not exist docker\.env copy docker\.env.example docker\.env
%DC% up --build -d
goto end

:down
%DC% down
goto end

:restart
%DC% down
%DC% up --build -d
goto end

:logs
%DC% logs -f
goto end

:seed
docker exec %API% python -m app.seed
goto end

:seed-sql
docker exec -i %DB% psql -U postgres -d stocker < database/seed.sql
goto end

:test
call .\make.bat test-backend
call .\make.bat test-frontend
goto end

:test-backend
docker exec %API% python -m pytest tests
goto end

:test-frontend
docker exec %WEB% npm run test -- --run
goto end

:lint
call .\make.bat lint-editorconfig
call .\make.bat lint-frontend
call .\make.bat format-check
call .\make.bat lint-backend
goto end

:lint-editorconfig
docker exec %WEB% npx editorconfig-checker -exclude "node_modules"
goto end

:lint-editorconfig-local
npx editorconfig-checker -exclude "node_modules"
goto end

:lint-frontend
docker exec %WEB% npm run lint
goto end

:format-check
docker exec %WEB% npm run format:check
goto end

:format-frontend
docker exec %WEB% npx prettier --write .
goto end

:lint-backend
docker exec %API% ruff check .
docker exec %API% ruff format --check .
docker exec %API% mypy .
goto end

:migration
docker exec %API% alembic revision --autogenerate -m "%~2"
goto end

:migrate
docker exec %API% alembic upgrade head
goto end

:test-backend-local
cd backend && pytest tests & cd ..
goto end

:test-frontend-local
cd frontend && npm run test -- --run & cd ..
goto end

:test-frontend-watch
cd frontend && npm run test & cd ..
goto end

:coverage-frontend
cd frontend && npm run test -- --coverage & cd ..
goto end

:coverage-backend
cd backend && pytest --cov=app tests & cd ..
goto end

:lint-backend-local
cd backend && ruff check . && ruff format --check . && mypy . & cd ..
goto end

:lint-frontend-local
cd frontend && npm run lint & cd ..
goto end

:format-frontend-local
cd frontend && npx prettier --write . & cd ..
goto end

:pr-check
echo 🔍 Ejecutando validación EditorConfig...
call .\make.bat lint-editorconfig
echo ⚛️ Ejecutando ESLint...
call .\make.bat lint-frontend
echo 🎨 Verificando formato Prettier...
call .\make.bat format-check
echo 🐍 Validando Backend (Ruff + MyPy)...
call .\make.bat lint-backend
echo 🧪 Tests Frontend...
call .\make.bat test-frontend
echo 🐍 Tests Backend...
call .\make.bat test-backend
echo ✅ ¡Todo listo para el Pull Request!
goto end

:help
echo Uso: .\make ^<comando^>
echo.
echo Comandos disponibles:
echo   up                      Arranca todos los contenedores
echo   down                    Para todos los contenedores
echo   restart                 Reinicia todos los contenedores
echo   logs                    Muestra los logs en tiempo real
echo   seed                    Ejecuta el seeder de Python
echo   seed-sql                Carga seed.sql en la base de datos
echo   test                    Ejecuta todos los tests
echo   test-backend            Tests del backend (pytest)
echo   test-frontend           Tests del frontend (vitest)
echo   lint                    Todos los checks de calidad
echo   lint-editorconfig       EditorConfig (en contenedor)
echo   lint-editorconfig-local  EditorConfig (local, todo el repo)
echo   lint-frontend           ESLint
echo   lint-backend            Ruff + MyPy (backend)
echo   format-check            Prettier (verificar)
echo   format-frontend         Prettier (aplicar)
echo   migration               Nueva migración (.\make migration "nombre")
echo   migrate                 Aplica migraciones pendientes
echo   test-backend-local      Tests del backend (local, sin docker)
echo   test-frontend-local     Tests del frontend (local, sin docker)
echo   test-frontend-watch     Tests del frontend en modo interactivo (local)
echo   coverage-frontend       Reporte de cobertura del frontend (local)
echo   coverage-backend        Reporte de cobertura del backend (local)
echo   lint-backend-local      Linter y formato de Python (local)
echo   lint-frontend-local     ESLint (local)
echo   format-frontend-local   Formatear frontend con Prettier (local)
echo   pr-check                Validación completa pre-PR
goto end

:end
