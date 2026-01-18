<!-- README.md -->

# 📊 JobTrackr Platform

JobTrackr is a personal job-tracking platform designed to help collect, organize, and analyze job opportunities from multiple sources.

The project focuses on **reliable data ingestion**, **clean domain modeling**, and a **clear separation of concerns** between data pipelines and product logic.

---

## 🎯 Project Goals

- Collect job opportunities from external sources (email alerts, platforms, feeds)
- Normalize and deduplicate job data
- Track job opportunities and applications over time
- Provide a clean dashboard for reviewing and managing job searches

The platform deliberately avoids full automation that would violate job platform Terms of Service.
Human-in-the-loop workflows are preferred.

---

## 🧱 High-Level Architecture

The system is split into two main components:

### 1️⃣ Ingestion Pipeline
- Responsible for fetching and parsing external job data (e.g. email alerts)
- Stateless, async, and retry-friendly
- Produces normalized job data

### 2️⃣ Product Dashboard
- Owns users, permissions, and business rules
- Stores canonical job data
- Enforces deduplication and consistency
- Provides admin and dashboard functionality

This separation allows each part to evolve independently while keeping a single source of truth.

---

## 🚧 Project Status

This project is under active development.

The architecture has evolved from a single service to a **Django-based product core** with a **FastAPI-based ingestion pipeline**, reflecting real-world constraints discovered during development.

Details may change as the system matures.

---

## 📜 License

This project is licensed under the **GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later)**.
See the [LICENSE](./LICENSE) file for details.
