# Makefile
.PHONY: up build build-nc restart logs down down-v bash \
fixtures samples \
cov mypy-ingestion sync

DC=docker compose -f docker-compose.dev.yml

up:
	$(DC) up

build:
	$(DC) build

build-nc:
	$(DC) build --no-cache

restart:
	$(DC) restart

logs:
	$(DC) logs

down:
	$(DC) down --remove-orphans

down-v:
	$(DC) down -v --remove-orphans

APP ?= job-ingestion
bash:
	$(DC) exec $(APP) bash

# --- job-ingestion (FastAPI) ---
fixtures:
	PYTHONPATH=. python3 -m scripts.python.generate_fixtures

samples:
	PYTHONPATH=. python3 -m scripts.python.generate_samples

# ---  Extra ---
cov:
	pytest --cov=app --cov-report=term-missing

mypy-ingestion:
	$(DC) exec -w /app/job_ingestion job-ingestion mypy \
	--config-file mypy.ini .

sync:
	uv sync --all-groups
