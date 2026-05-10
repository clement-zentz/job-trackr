# Makefile
.PHONY: up build build-nc restart logs down reset-compose prune-global bash psql \
manage migrations migrate superuser django-check \
backend-coverage backend-mypy pre-commit backend-test frontend-test \
backend-deptry backend-upgrade backend-sync frontend-update frontend-outdated

COMPOSE_DEV=docker compose -f compose.dev.yml
COMPOSE_TEST=docker compose -f compose.test.yml

# --- docker ---
up:
	$(COMPOSE_DEV) up

build:
	$(COMPOSE_DEV) build

build-nc:
	$(COMPOSE_DEV) build --no-cache

restart:
	$(COMPOSE_DEV) restart

logs:
	$(COMPOSE_DEV) logs

down:
	$(COMPOSE_DEV) down --remove-orphans

reset-compose:
	$(COMPOSE_DEV) down -v --remove-orphans --rmi all

prune-global:
	./scripts/prune_global_docker.sh

APP ?= backend
bash:
	$(COMPOSE_DEV) exec $(APP) bash

USER_DB ?= job_trackr
DATABASE ?= job_trackr
psql:
	$(COMPOSE_DEV) exec postgres psql -U $(USER_DB) -d $(DATABASE)

# --- backend (Django) ---
BACKEND_PYTHON := /app/.venv/bin/python
MANAGE := job_trackr/manage.py

# make manage CMD="<command> <args>"
manage:
	$(COMPOSE_DEV) exec backend $(BACKEND_PYTHON) $(MANAGE) $(CMD)

migrations:
	$(COMPOSE_DEV) exec backend $(BACKEND_PYTHON) $(MANAGE) makemigrations

migrate:
	$(COMPOSE_DEV) exec backend $(BACKEND_PYTHON) $(MANAGE) migrate

superuser:
	$(COMPOSE_DEV) exec backend $(BACKEND_PYTHON) $(MANAGE) createsuperuser

django-check:
	$(COMPOSE_DEV) exec backend $(BACKEND_PYTHON) \
	-c "import django; print(django.get_version())"

# --- Tooling ---
backend-mypy:
	$(COMPOSE_DEV) exec backend uv run mypy job_trackr scripts

backend-test:
	$(COMPOSE_TEST) run --rm backend; status=$$?; \
	$(COMPOSE_TEST) down --remove-orphans; \
	exit $$status

backend-coverage:
	$(COMPOSE_TEST) run --rm backend uv run pytest \
	--cov \
	--cov-report=term-missing \
	--cov-report=html; status=$$?; \
	$(COMPOSE_TEST) down --remove-orphans; \
	exit $$status

frontend-test:
	$(COMPOSE_DEV) exec frontend npm run test:run

pre-commit:
	cd backend && uv run pre-commit run --all-files

# --- Dependencies ---
backend-deptry:
	$(COMPOSE_DEV) exec backend uv run deptry .

backend-upgrade:
	cd backend && uv lock --upgrade

backend-sync:
	cd backend && uv sync --all-groups

frontend-update:
	cd frontend && npm update

frontend-outdated:
	cd frontend && npm outdated
