# Space4It Marketplace — Database Schema

## Entity Relationship Diagram

```
┌──────────┐       ┌───────────┐       ┌──────────────────┐
│  users   │       │ listings  │       │ booking_requests  │
├──────────┤       ├───────────┤       ├──────────────────┤
│ id (PK)  │◄──┐   │ id (PK)   │◄──┐   │ id (PK)          │
│ email    │   │   │ host_id   │───┘   │ storer_id (FK)   │───► users
│ name     │   │   │ title     │       │ listing_id (FK)  │───► listings
│ role_*   │   │   │ area      │       │ standard_boxes   │
│ verified │   │   │ capacity  │       │ drop_off_date    │
│ phone    │   │   │ status    │       │ collection_date  │
│ photo_url│   │   │ ...       │       │ status           │
│ created  │   │   │ created   │       │ created          │
└──────────┘   │   └───────────┘       └────────┬─────────┘
               │                                │
               │   ┌───────────┐                │
               │   │ bookings  │                │
               │   ├───────────┤                │
               │   │ id (PK)   │                │
               │   │ request_id│────────────────┘
               │   │ payment_* │
               │   │ dispute_* │        ┌───────────┐
               │   │ created   │        │ messages   │
               │   └─────┬─────┘        ├───────────┤
               │         │              │ id (PK)   │
               │   ┌─────▼─────┐        │ thread_id │
               │   │ payments  │        │ sender_id │───► users
               │   ├───────────┤        │ booking_  │
               │   │ id (PK)   │        │  request_id───► booking_requests
               │   │ booking_id│        │ content   │
               │   │ amount    │        │ created   │
               │   │ platform_ │        └───────────┘
               │   │   fee     │
               │   │ refund_*  │
               │   │ created   │
               │   └───────────┘
               │
               └── (host_id, storer_id, sender_id all reference users.id)
```

## Tables

### `users`
Application users who can be storers (need storage), hosts (offer storage), or both.
Key fields: `role_storer`, `role_host` booleans, `verified` flag.

### `listings`
Storage spaces offered by hosts. Each listing belongs to one host and describes
the physical space: area, capacity, accepted item types, availability window, and rules.
Status can be `active`, `paused`, or `archived`.

### `booking_requests`
Created by storers to request storage at a listing. Tracks item quantities
(standard boxes, small/large bulky items, bikes), date range, and a status that
progresses through: `pending` → `accepted` → `confirmed` → `active` →
`collection_due` → `completed` (or `declined` at any point).

### `bookings`
Created when a booking request is accepted and confirmed. Tracks payment lifecycle
(`payment_status`, `payout_status`), drop-off/collection confirmation timestamps,
and dispute state.

### `messages`
In-app messaging between storers and hosts within a booking request thread.
`thread_id` groups messages into conversations. `moderation_flag` marks messages
caught by content moderation.

### `payments`
Financial records tied to a booking. Stores the amount, platform fee, and
refund status (`none`, `partial`, `full`).

## Row Level Security (RLS) Summary

| Table              | SELECT                                        | INSERT               | UPDATE                | DELETE        |
|--------------------|-----------------------------------------------|----------------------|-----------------------|---------------|
| `users`            | Own row only                                  | Own row (signup)     | Own row only          | —             |
| `listings`         | Active listings (public) + own listings       | Own listings (host)  | Own listings (host)   | Own (host)    |
| `booking_requests` | Storer: own requests; Host: requests on their listings | Storer only  | Host: status on their listings | —       |
| `bookings`         | Related storer or host                        | —                    | Host                  | —             |
| `messages`         | Sender + related storer/host via booking_request | Authenticated, own thread | —             | —             |
| `payments`         | Related storer or host                        | —                    | —                     | —             |

All tables have RLS enabled. Policies use `auth.uid()` from Supabase Auth.

## Running Migrations

### With Supabase CLI

```bash
# Link to your project (first time only)
supabase link --project-ref <your-project-ref>

# Push migrations
supabase db push
```

### Manually

Run the SQL files in order against your Supabase database:

```bash
psql "$DATABASE_URL" -f supabase/migrations/001_initial_schema.sql
psql "$DATABASE_URL" -f supabase/migrations/002_rls_policies.sql
```

## Seeding the Database

```bash
# Via Supabase CLI (runs supabase/seed.sql automatically)
supabase db reset

# Or manually
psql "$DATABASE_URL" -f supabase/seed.sql
```

The seed file creates 6 host users and 6 listings with realistic data for
development and testing. All listings have availability from June 1 to
September 15, 2025.
