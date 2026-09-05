# LIFE OS - Backend

Fastify + Prisma + PostgreSQL backend for LIFE OS.

## Requirements
- Node.js >= 20
- PostgreSQL Database

## Setup
1. Copy `.env.example` to `.env` and configure your credentials.
   - `DATABASE_URL`: Your Postgres connection string
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: Setup in Google Cloud Console
   - `SESSION_SECRET`: A 32-character random string
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run migrations and seed data:
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

## API Documentation
Once running, visit `http://localhost:4000/docs` to view the OpenAPI/Swagger documentation.
