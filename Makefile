# Makefile
.PHONY: up build build-nc restart logs down down-v bash psql \
migrations migrate superuser django-check cov

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

# --- Django ---
DJANGO_VENV := /app/.venv/bin/python
migrations:
	$(DC) exec job-trackr $(DJANGO_VENV) job_trackr/manage.py makemigrations

migrate:
	$(DC) exec job-trackr $(DJANGO_VENV) job_trackr/manage.py migrate

superuser:
	$(DC) exec job-trackr $(DJANGO_VENV) job_trackr/manage.py createsuperuser

django-check:
	$(DC) exec job-trackr $(DJANGO_VENV) -c "import django; print(django.get_version())"

# --- Scripts ---

# Ingestion targets are temporarily removed while the ingestion
# pipeline is being migrated to Django.

# Fixture and sample targets will be reintroduced once the new
# FastAPI-based scripts are implemented.

cov:
	pytest --cov=app --cov-report=term-missing
