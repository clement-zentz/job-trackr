# Makefile

dc=docker compose

up:
$(dc) up -d

build:
$(dc) build

logs:
$(dc) logs

down:
$(dc) down



