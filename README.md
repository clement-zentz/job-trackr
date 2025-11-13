<!-- README.md -->

# JobAI Agent

An AI agent applying for job offers.

## 🪶 Database Configuration (SQLite)

This project uses SQLite as the default database engine for local development. SQLite is lightweight, file-based, and requires no external service, making it ideal for quick setup and testing.

FastAPI + SQLModel handles migrations and table creation automatically during startup.

### 🔧 Database URL

The database connection URL is defined in your .env file using the environment variable:

```ini
DATABASE_URL=sqlite+aiosqlite:///./jobai.db
```

### 📄 Explanation:

sqlite+aiosqlite → Async SQLite driver for SQLModel

./jobai.db → The database file created in the project root

If the file does not exist, it will be created automatically.

## License
This project is licensed under the GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later).  
See the [LICENSE](./LICENSE) file for details.

