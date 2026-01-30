# Makefile
.PHONY: up build build-nc restart logs down down-v bash psql \
migrations migrate superuser django-check \
ingest fixture sample cov

# Convert DC variable to uppercase DC when the user will select env.
# Example: dev, prod, stage, etc.
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

# --- Script ---
ingest:
	$(DC) exec job-trackr python3 -m job_trackr.scripts.ingest_emails

fixture:
	$(DC) exec job-extraction python3 -m job_extraction.scripts.generate_fixtures

sample:
	$(DC) exec job-extraction python3 -m job_extraction.scripts.generate_samples

cov:
	pytest --cov=app --cov-report=term-missing
