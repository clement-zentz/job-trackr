# Makefile
.PHONY: up build build-nc restart logs down down-v prune bash psql \
manage migrations migrate superuser django-check \
cov mypy pre-commit backend-test frontend-test \
deptry backend-upgrade sync frontend-update outdated

DC=docker compose -f compose.dev.yml

# --- docker ---
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

prune:
	docker system prune -a -f --volumes

APP ?= backend
bash:
	$(DC) exec $(APP) bash

USER_DB ?= job_trackr
DATABASE ?= job_trackr
psql:
	$(DC) exec postgres psql -U $(USER_DB) -d $(DATABASE)

# --- backend (Django) ---
DJANGO_VENV := /app/.venv/bin/python
MANAGE := job_trackr/manage.py

# make manage CMD="<command> <args>"
manage:
	$(DC) exec backend $(DJANGO_VENV) $(MANAGE) $(CMD)

migrations:
	$(DC) exec backend $(DJANGO_VENV) $(MANAGE) makemigrations

migrate:
	$(DC) exec backend $(DJANGO_VENV) $(MANAGE) migrate

superuser:
	$(DC) exec backend $(DJANGO_VENV) $(MANAGE) createsuperuser

django-check:
	$(DC) exec backend $(DJANGO_VENV) \
	-c "import django; print(django.get_version())"

# --- Tooling ---
cov:
	cd backend && uv run pytest --cov --cov-report=term-missing

mypy:
	cd backend && uv run mypy job_trackr scripts

pre-commit:
	cd backend && uv run pre-commit run --all-files

backend-test:
	cd backend && uv run pytest

frontend-test:
	cd frontend && npm run test:run

# --- Dependencies ---
deptry:
	cd backend && uv run deptry .

backend-upgrade:
	cd backend && uv lock --upgrade

sync:
	cd backend && uv sync --all-groups

frontend-update:
	cd frontend && npm update

outdated:
	cd frontend && npm outdated
