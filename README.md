# Ledger — Finance Tracker

A simple, clean finance tracker built with Next.js 16 (App Router), Tailwind CSS,
Prisma, PostgreSQL via Supabase, and Supabase Auth for registration/login.

## Features

- Email/password registration and login (Supabase Auth), with sessions guarded by
  Next.js middleware — every route except `/login` and `/register` requires sign-in
- Each user only ever sees and manages their own transactions
- Add income and expense entries (amount, category, date, note)
- Live totals for all-time income, expenses, and net balance
- Recent activity feed with filtering and delete
- Reports for **daily, weekly, monthly, quarterly, and annual** periods
  - Trend chart (income vs. expense per period)
  - Current-period totals
  - Category breakdown for income and/or expenses
- Amounts shown in Philippine pesos (₱)

## Tech stack

- **Next.js 16** (App Router, Server Components + Route Handlers)
- **Tailwind CSS 3**
- **Prisma ORM 6**
- **PostgreSQL** hosted on **Supabase**
- **Supabase Auth** (`@supabase/ssr` + `@supabase/supabase-js`) for registration/login
- `recharts` for the report chart, `date-fns` for period math, `lucide-react` for icons

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **Project Settings → Database → Connection string** and copy the
   **pooled** connection string (port `6543`, includes `pgbouncer=true`) and the
   **direct** connection string (port `5432`).
3. Go to **Project Settings → API** and copy the **Project URL** and the
   **anon public** key.
4. (Optional, recommended for local testing) Go to **Authentication → Providers →
   Email** and turn **Confirm email** off, so newly registered accounts can sign
   in immediately without clicking an email link. Leave it on for production if
   you want verified emails.

## 2. Configure environment variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[anon-public-key]"
```

`DATABASE_URL` is used by the app at runtime (through Supabase's connection pooler).
`DIRECT_URL` is used by Prisma Migrate, which needs a non-pooled connection.
The two `NEXT_PUBLIC_*` variables are used by Supabase Auth for registration/login —
they're safe to expose to the browser (the anon key is designed for client-side use).

## 3. Install dependencies

```bash
npm install
```

## 4. Create the database schema

```bash
npx prisma migrate dev --name init
```

This creates the `transactions` table (with a `userId` column tying each entry to
a Supabase Auth user) in your Supabase database and generates the Prisma client.
(`npm install` already runs `prisma generate` via `postinstall`.)

You can inspect your data any time with:

```bash
npx prisma studio
```

## 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll land on **Sign in** —
use **Create an account** to register, then sign in.

## Project structure

```
prisma/
  schema.prisma          # Transaction model (userId, type, amount, category, date, ...)
src/
  middleware.ts           # Refreshes the Supabase session; redirects signed-out users to /login
  app/
    api/
      transactions/       # GET (list) / POST (create) — scoped to the signed-in user
      transactions/[id]/  # PUT / DELETE — ownership-checked
      reports/            # GET — aggregated daily/weekly/monthly/quarterly/annual data
    auth/
      callback/           # Exchanges Supabase email-confirmation codes for a session
      auth-code-error/    # Shown if a confirmation link fails
    login/, register/     # Auth pages (render the shared AuthForm)
    page.tsx              # Server component, requires a session, loads that user's transactions
    layout.tsx, globals.css
  components/
    AuthForm.tsx            # Shared login/register form
    LogoutButton.tsx         # Sign-out control
    Dashboard.tsx            # Client shell holding app state
    SummaryCards.tsx          # All-time income / expense / net
    TransactionForm.tsx       # Add income or expense
    TransactionList.tsx       # Recent activity, filterable, deletable
    ReportsPanel.tsx          # Period tabs + trend chart + category breakdown
  lib/
    prisma.ts               # Prisma client singleton
    supabase/client.ts        # Supabase client for Client Components
    supabase/server.ts        # Supabase client for Server Components / Route Handlers
    reports.ts               # Period bucketing helpers (daily/weekly/monthly/quarterly/annual)
    format.ts                 # Currency (₱)/date formatting
  types/
    index.ts                  # Shared TypeScript types
```

## Authentication

Registration and login are handled by **Supabase Auth** (email + password):

- `src/middleware.ts` refreshes the session on every request and redirects
  signed-out users to `/login` (and signed-in users away from `/login`/`/register`).
- `/register` calls `supabase.auth.signUp()`. If your project has email
  confirmation enabled, the user sees a "check your inbox" message and confirms
  via a link that lands on `/auth/callback`, which exchanges the code for a
  session. If confirmation is disabled, they're signed in immediately.
- `/login` calls `supabase.auth.signInWithPassword()`.
- Every API route (`/api/transactions`, `/api/transactions/[id]`, `/api/reports`)
  reads the session server-side and scopes all reads/writes to `userId`, so one
  account can never see or modify another's entries.
- The **Sign out** button in the header calls `supabase.auth.signOut()`.

## How the reports work

`GET /api/reports?period=monthly` (period is one of `daily`, `weekly`, `monthly`,
`quarterly`, `annual`) returns:

- `totals` — income, expense, and net for the *current* period
- `buckets` — a trend series of past periods (e.g. last 12 months) with income,
  expense, and net per bucket, used for the chart
- `categories.income` / `categories.expense` — category breakdown for the current
  period

The **Both / Income / Expenses** toggle in the Reports panel controls which series
are shown in the chart and which category breakdown(s) are visible, so you can view
income-only, expense-only, or combined reports at any period granularity.

## Deploying

This app deploys cleanly to **Vercel**:

1. Push this project to a Git repository.
2. Import it in Vercel.
3. Add the `DATABASE_URL` and `DIRECT_URL` environment variables in the Vercel
   project settings.
4. Deploy. Run `npx prisma migrate deploy` (or `db push`) against your Supabase
   database before or during your first deploy.
