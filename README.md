# Space4It — Student Storage Marketplace

Peer-to-peer student storage marketplace for the University of St Andrews.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS with custom brand tokens
- **Database:** Supabase (Postgres + Auth + Storage)
- **Language:** TypeScript

## Brand Tokens

| Token      | Value     |
|------------|-----------|
| Background | `#F5F3EE` |
| Primary    | `#253E5F` |
| Action/CTA | `#E06B6B` |
| Accent     | `#7BBCBE` |
| Font       | Lato      |

## Getting Started

```bash
npm install
cp .env.local.example .env.local
# Fill in your Supabase credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/app                  – Next.js App Router pages
  /browse             – Browse hosts grid
  /listing/[id]       – Individual listing detail
  /auth               – Sign in / Sign up
  /dashboard/storer   – Storer dashboard
  /dashboard/host     – Host dashboard
/components           – Reusable React components
  /ui                 – Base UI primitives
/lib                  – Utilities and config
  supabase.ts         – Supabase client
  types.ts            – TypeScript interfaces
/supabase             – Database migrations and seed data
```
