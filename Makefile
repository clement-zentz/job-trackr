# Makefile
.PHONY: up build build-nc restart logs down reset-compose prune-global bash psql \
manage migrations migrate superuser django-check \
backend-mypy test-db backend-test backend-coverage down-test frontend-test pre-commit \
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

down-v:
	$(COMPOSE_DEV) down -v --remove-orphans

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
	uv --directory backend run mypy job_trackr scripts

test-db:
	$(COMPOSE_TEST) up -d --wait postgres

backend-test: test-db
	uv --directory backend run pytest $(ARGS)

backend-coverage: test-db
	uv --directory backend run pytest $(ARGS) --cov \
	--cov-report=term-missing \
	--cov-report=html

down-test:
	$(COMPOSE_TEST) down -v --remove-orphans

frontend-test:
	cd frontend && npm run test:run

pre-commit:
	uv --directory backend run pre-commit run --all-files \
	--config ../.pre-commit-config.yaml

# --- Dependencies ---
backend-deptry:
	uv --directory backend run deptry .

backend-upgrade:
	cd backend && uv lock --upgrade

backend-sync:
	cd backend && uv sync --all-groups

frontend-update:
	cd frontend && npm update

frontend-outdated:
	cd frontend && npm outdated
