# Makefile
.PHONY: up build build-nc restart logs down down-v bash psql ingest fixture cov

# Convert dc variable to uppercase DC when the user will select env.
# Example: dev, prod, stage, etc.
dc=docker compose -f docker-compose.dev.yml

up:
	$(dc) up

build:
	$(dc) build

build-nc:
	$(dc) build --no-cache

restart:
	$(dc) restart

logs:
	$(dc) logs

down:
	$(dc) down

down-v:
	$(dc) down -v --remove-orphans

bash:
	$(dc) exec job-trackr bash

USER_DB ?= job_trackr
DATABASE ?= job_trackr
psql:
	$(dc) exec postgres psql -U $(USER_DB) -d $(DATABASE)

ingest:
	$(dc) exec job-extraction python3 -m scripts.python.ingest_emails

fixture:
	$(dc) exec job-extraction python3 -m scripts.python.generate_fixtures

sample:
	$(dc) exec job-extraction python3 -m scripts.python.generate_samples

cov:
	pytest --cov=app --cov-report=term-missing
