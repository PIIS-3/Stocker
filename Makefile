.PHONY: up down restart seed seed-sql

up:
	cd docker && cp -n .env.example .env && docker compose up --build -d

down:
	cd docker && docker compose down

restart:
	cd docker && docker compose down && docker compose up --build -d

seed:
	docker exec stocker_api python -m app.seed

seed-sql:
	docker exec -i stocker_db psql -U postgres -d stocker < database/seed.sql
