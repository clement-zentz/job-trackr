# Makefile
.PHONY: up build build-nc restart logs down down-v bash psql \
manage migrations migrate superuser django-check ingest-jobs process-jobs \
fixtures samples \
cov mypy

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
	$(DC) down

down-v:
	$(DC) down -v --remove-orphans

bash:
	$(DC) exec job-trackr bash

USER_DB ?= job_trackr
DATABASE ?= job_trackr
psql:
	$(DC) exec postgres psql -U $(USER_DB) -d $(DATABASE)

# --- job-trackr (Django) ---
DJANGO_VENV := /app/.venv/bin/python
MANAGE := job_trackr/manage.py

# make manage CMD="<command> <args>"
manage:
	$(DC) exec job-trackr $(DJANGO_VENV) $(MANAGE) $(CMD)

migrations:
	$(DC) exec job-trackr $(DJANGO_VENV) $(MANAGE) makemigrations

migrate:
	$(DC) exec job-trackr $(DJANGO_VENV) $(MANAGE) migrate

superuser:
	$(DC) exec job-trackr $(DJANGO_VENV) $(MANAGE) createsuperuser

django-check:
	$(DC) exec job-trackr $(DJANGO_VENV) -c "import django; print(django.get_version())"

ingest-jobs:
	$(DC) exec job-trackr $(DJANGO_VENV) $(MANAGE) ingest_jobs

process-jobs:
	$(DC) exec job-trackr $(DJANGO_VENV) $(MANAGE) process_jobs

# --- job-extraction (FastAPI) ---
fixtures:
	cd backend && PYTHONPATH=. python3 -m scripts.python.generate_fixtures

samples:
	cd backend && PYTHONPATH=. python3 -m scripts.python.generate_samples

cov:
	pytest --cov=app --cov-report=term-missing

mypy:
	$(DC) exec job-trackr mypy backend
