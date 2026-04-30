# Makefile
.PHONY: up build build-nc restart logs down down-v bash psql \
manage migrations migrate superuser django-check \
cov mypy sync

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

APP ?= job-trackr
bash:
	$(DC) exec $(APP) bash

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
	$(DC) exec job-trackr $(DJANGO_VENV) \
	-c "import django; print(django.get_version())"

# ---  Extra ---
cov:
	pytest --cov=app --cov-report=term-missing

mypy:
	$(DC) exec -w /app/job_trackr job-trackr mypy .

sync:
	cd backend && uv sync --all-groups
