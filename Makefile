# Makefile
.PHONY: up build build-nc restart logs down down-v bash psql \
migrations migrate superuser django-check ingest-jobs \
cov

# Ignore unknown target
%:
	@:

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

# make manage <command>
manage:
	$(DC) exec job-trackr $(DJANGO_VENV) $(MANAGE) $(filter-out $@,$(MAKECMDGOALS))

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

# --- job-extraction (FastAPI) ---

# Fixture and sample targets will be reintroduced once the new
# FastAPI-based scripts are implemented.

cov:
	pytest --cov=app --cov-report=term-missing
