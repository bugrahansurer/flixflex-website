# Database Backup

This directory contains a SQL dump of the project database.

## How to Import

1. Create a new database in PostgreSQL (e.g., `flixflex`).
2. Run the following command to import the data:

```bash
psql -U postgres -d flixflex < prisma/backups/db_dump.sql
```

Alternatively, if you are using a different user or host:

```bash
psql -h localhost -U your_username -d your_db_name < prisma/backups/db_dump.sql
```

## Prisma Setup

After importing the database, make sure your `.env` file has the correct `DATABASE_URL`.
Then run:

```bash
npx prisma generate
```
