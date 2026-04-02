# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies
npm run dev          # start dev server at http://localhost:5173
npm run build        # production build
npm run preview      # preview production build
npm run lint         # ESLint
```

## Setup

1. Copy `.env.example` to `.env` and fill in Supabase credentials.
2. Run `supabase/schema.sql` in your Supabase SQL editor to create tables and seed default categories.
3. Enable email auth in Supabase → Authentication → Providers.

## Architecture

**Stack:** React 18 + Vite, Tailwind CSS, Supabase (auth + Postgres), Recharts, React Router v6, date-fns, lucide-react.

**Auth flow:** `AuthContext` wraps the app and keeps a `user` state synced via `supabase.auth.onAuthStateChange`. Pages redirect to `/auth` when unauthenticated and back to `/` after login.

**Data flow:** `useTransactions(month, year)` is the single data hook — it fetches all transactions for the selected month with their joined category, exposes derived totals (`totalIncome`, `totalExpense`, `balance`), and provides `addTransaction` / `deleteTransaction` mutations that refetch on success.

**Database tables:**
- `categories` — default categories (`is_default=true`) visible to all users; users can add custom ones.
- `transactions` — scoped per user via RLS; joined to `categories` in queries.

**Page structure:** single `Dashboard` page with a sticky header month-navigator, summary cards, bar + pie charts, and a transaction list. Auth is a separate full-page route at `/auth`.

**Component layers:**
- `src/components/ui/` — headless primitives (Button, Input, Select, Modal)
- `src/components/auth/` — login/register forms
- `src/components/dashboard/` — SummaryCards, MonthlyChart (weekly bar), CategoryBreakdown (donut pies)
- `src/components/transactions/` — AddTransactionModal, TransactionList
