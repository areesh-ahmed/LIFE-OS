# 🚀 Free Deployment Guide for LIFE_OS

This guide explains how to deploy **both the Frontend (Next.js 14)** and **Backend (Fastify + Prisma + PostgreSQL)** completely for **FREE** with high reliability and zero credit card requirements.

---

## ⚡ Recommended Free Hosting Stacks

| Component | Recommended Platform | Plan | Key Features |
|:---|:---|:---:|:---|
| **Frontend** | **[Vercel](https://vercel.com)** | Free Hobby | Native Next.js 14 support, automatic HTTPS, global CDN, Git CI/CD |
| **Backend API** | **[Render](https://render.com)** or **[Koyeb](https://koyeb.com)** | Free Tier | Node.js web services, automatic Git deploys, custom domains |
| **Database** | **[Neon.tech](https://neon.tech)** or **[Supabase](https://supabase.com)** | Free Tier | Managed PostgreSQL with connection pooling, works with Prisma ORM |

---

## 🎯 Choose Your Deployment Strategy

### Strategy A: 100% Free Frontend Only (Local-First Mode)
> **Best for**: Personal daily use, zero maintenance, instant 60-second setup.

Because we built LIFE_OS with persistent browser `localStorage`, you can deploy **just the frontend to Vercel for free**. All tasks, habits, focus sessions, and logs will save directly to your browser without needing a database or server to maintain!

1. Push your repository to **GitHub**.
2. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub.
3. Click **"Add New Project"** and import `LIFE-OS`.
4. Keep the default settings (Framework Preset: **Next.js**, Root Directory: `./`).
5. Click **"Deploy"**.
6. **Done!** Your app is live at `https://your-life-os.vercel.app`.

---

### Strategy B: Full-Stack Free Deployment (Frontend + Backend + PostgreSQL)
> **Best for**: Cloud data sync, Google OAuth login, and multi-device access.

```text
┌─────────────────────────┐          ┌─────────────────────────┐
│     Vercel (Frontend)   │ ───────► │   Render / Koyeb (API)  │
│  https://life-os.vercel │          │ https://lifeos-api.onrender│
└─────────────────────────┘          └────────────┬────────────┘
                                                  │
                                                  ▼
                                     ┌─────────────────────────┐
                                     │  Neon / Render (Postgres│
                                     │  Managed PostgreSQL DB  │
                                     └─────────────────────────┘
```

---

### Step 1: Deploy Free PostgreSQL Database

You have two great free options for PostgreSQL:

#### Option 1: Neon.tech (Recommended — Fast & Serverless)
1. Sign up for free at **[neon.tech](https://neon.tech)**.
2. Click **"Create Project"**, name it `lifeos-db`, and select the region nearest to you.
3. In your dashboard, copy the **Connection Details** string (Select **"Pooled connection"**):
   ```text
   postgres://username:password@ep-cool-pool-123456-pooler.us-east-2.aws.neon.tech/lifeos?sslmode=require
   ```
4. Save this string — you will use it as your `DATABASE_URL`.

#### Option 2: Render Free PostgreSQL
1. Sign up at **[render.com](https://render.com)**.
2. Click **New +** -> **PostgreSQL**.
3. Name it `lifeos-db`, choose the **Free** tier, and click **Create Database**.
4. Copy the **Internal Connection String** (or External Connection String).

---

### Step 2: Deploy Backend to Render

1. On **[render.com](https://render.com)**, click **New +** -> **Web Service**.
2. Connect your GitHub repository (`LIFE-OS`).
3. Configure the following settings:
   * **Name**: `lifeos-backend`
   * **Region**: Same region as your database
   * **Root Directory**: `server`
   * **Runtime**: `Node`
   * **Build Command**:
     ```bash
     npm install && npx prisma generate && npm run build
     ```
   * **Start Command**:
     ```bash
     npm run start
     ```
   * **Instance Type**: **Free**
4. Under **Environment Variables**, add:
   | Variable | Value | Description |
   |:---|:---|:---|
   | `NODE_ENV` | `production` | Production environment |
   | `DATABASE_URL` | `your_postgres_connection_string` | From Step 1 |
   | `FRONTEND_URL` | `https://your-app.vercel.app` | Your Vercel frontend URL (from Step 3) |
   | `SESSION_SECRET` | `generate-a-random-32-char-string` | Secret key for JWT session cookies |
   | `GOOGLE_CLIENT_ID` | *(Optional)* | Google Cloud OAuth Client ID |
   | `GOOGLE_CLIENT_SECRET`| *(Optional)* | Google Cloud OAuth Secret |
   | `GOOGLE_CALLBACK_URL`| *(Optional)* | `https://your-backend.onrender.com/api/auth/google/callback` |
5. Click **Create Web Service**.
6. Once deployed, run database migrations once from Render Shell or your terminal:
   ```bash
   npx prisma migrate deploy
   ```
7. Copy your backend URL: `https://lifeos-backend.onrender.com`.

---

### Step 3: Deploy Frontend to Vercel

1. Go to **[vercel.com](https://vercel.com)**.
2. Click **"Add New Project"** and select your `LIFE-OS` repo.
3. Expand **Environment Variables** and add:
   | Variable | Value |
   |:---|:---|
   | `NEXT_PUBLIC_API_URL` | `https://lifeos-backend.onrender.com/api` |
4. Click **Deploy**.
5. Once your Vercel URL is generated (e.g. `https://life-os-alpha.vercel.app`), go back to your Render backend dashboard and ensure `FRONTEND_URL` matches your Vercel domain.

---

## 🛠️ Free Tier Optimization & Tips

### 1. Handling Render Free Tier Sleep / Cold Starts
* **How it works**: Render's free web service spins down after 15 minutes of inactivity and takes ~30-50 seconds to wake up on the first request.
* **Solution**:
  1. Because LIFE_OS has a built-in **local-first fallback**, the dashboard loads instantly even while the backend wakes up!
  2. You can keep your free backend awake by adding a free uptime ping at **[cron-job.org](https://cron-job.org)** or **[uptimerobot.com](https://uptimerobot.com)** hitting:
     ```text
     https://lifeos-backend.onrender.com/health
     ```
     every 10 minutes.

### 2. Alternative Backend: Koyeb (Zero Cold Starts)
* **[Koyeb](https://koyeb.com)** offers a free Eco tier for web services that does **not sleep** like Render.
* Setup is identical: set Root Directory to `server`, build command to `npm install && npx prisma generate && npm run build`, and start command to `npm run start`.

### 3. Alternative Database: Supabase
* **[Supabase](https://supabase.com)** provides a free 500 MB PostgreSQL instance with an interactive table viewer UI.
* Remember to copy the **Transaction Connection Pooler** URI (port `6543`) for Prisma.

---

## 📋 Environment Variables Checklist

### Frontend (`.env.production` or Vercel Environment Variables)
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
```

### Backend (`server/.env` or Render/Koyeb Environment Variables)
```env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
FRONTEND_URL="https://your-life-os.vercel.app"
SESSION_SECRET="e9a2b8c4d1e7f0a3b5c8d2e4f6a1b9c3"
# Optional for Google Authentication
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-secret"
GOOGLE_CALLBACK_URL="https://your-backend.onrender.com/api/auth/google/callback"
```

---

<div align="center">
  <sub>Deploy with confidence. Zero cost, production performance. 🚀</sub>
</div>
