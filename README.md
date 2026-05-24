# Allo Inventory — Reservation System

**Live demo:** https://allo-inventory-app.vercel.app

---

## Running Locally

```bash
npm install
cp .env.example .env.local
# Fill in the five values in .env.local
npx prisma db push
npx prisma db seed
npm run dev
```

Environment variables required (see `.env.example`):

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Supabase transaction pooler URI (port 6543) |
| `DIRECT_URL` | Supabase session pooler URI (port 5432) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis auth token |
| `CRON_SECRET` | Bearer token for the expiry cron route |

---

## What's Built

A Next.js full-stack inventory reservation system. When a customer reaches checkout, units are held for 10 minutes. If payment succeeds the hold converts to a confirmed sale. If it fails or times out, the units return to available stock automatically.

**Stack:** Next.js 14 App Router · TypeScript · Prisma · Supabase Postgres · Upstash Redis · Tailwind · shadcn/ui · Vercel

### API

| Method | Path | Behaviour |
|--------|------|-----------|
| GET | `/api/products` | Products with available stock per warehouse |
| GET | `/api/warehouses` | All warehouses |
| POST | `/api/reservations` | Reserve units — 409 if stock insufficient |
| POST | `/api/reservations/:id/confirm` | Confirm reservation — 410 if expired |
| POST | `/api/reservations/:id/release` | Release reservation early |
| GET | `/api/cron/expire-reservations` | Auto-expiry (called by Vercel Cron) |

---

## Architecture

### Concurrency Safety

The reservation endpoint uses a Prisma `$transaction` at `Serializable` isolation level. Inside the transaction, we read the current stock, check availability, and increment `reserved` — all atomically. When two requests arrive simultaneously for the last unit:

1. Request A enters the transaction and reads stock
2. Request B enters and reads the same stock
3. One transaction commits first — the other detects the write conflict on commit and is rolled back by Postgres
4. The rolled-back request returns a clean 409

The guarantee lives inside Postgres. No application-level check can be tricked by a race condition because the database serialises conflicting writes.

The implementation was validated by setting Delhi Central stock for Minoxidil 5% Foam to a single unit and submitting simultaneous reserve requests from two browser tabs. One received the reservation page; the other received a 409 "Not enough stock" toast.

### Reservation Lifecycle

```
PENDING
  → CONFIRMED  (user confirms purchase within the window)
  → RELEASED   (user cancels)
  → RELEASED   (automatic expiry via cron or lazy check)
```

### Expiry

A Vercel Cron job calls `/api/cron/expire-reservations` on a schedule. It finds all PENDING reservations past their `expiresAt`, marks them RELEASED, and decrements `Stock.reserved` — all inside a single transaction.

On the Hobby plan, Vercel Cron runs at most once per day (configured at midnight). To avoid holding stock in limbo until then, two additional safety nets are in place:

- **Lazy expiry on read**: the confirm and release endpoints check `expiresAt` before acting. If expired, they release the stock immediately and return 410.
- **Client-side countdown**: the reservation page runs a `setInterval` countdown. When it hits zero, the action buttons disable instantly — the user never needs to wait for the cron.

### Idempotency (Bonus)

`POST /api/reservations` accepts an `Idempotency-Key` header. Before processing, we check Upstash Redis for that key. If found, we return the cached response immediately without touching the database. If not found, we process normally and cache the response with a 24-hour TTL. This makes retries safe on flaky connections — the side effect runs exactly once.

---

## Trade-offs

**Serializable vs FOR UPDATE** — I initially wrote the concurrency guard as a `SELECT ... FOR UPDATE` CTE. Supabase's transaction pooler (PgBouncer in transaction mode) doesn't support statement-level locking across round-trips, so I switched to `Serializable` isolation. This gives the same guarantee: conflicting concurrent writes are detected and one is rolled back. The trade-off is slightly higher abort rate under heavy contention, which is acceptable for this use case.

**Cron granularity** — Daily cron means expired reservations can hold stock for up to 24 hours if nobody touches them. The lazy-expiry pattern on the API routes closes most of this gap in practice. With a Pro plan the cron would run every minute.

**Optimistic UI** — Confirm and cancel update state from the API response rather than optimistically. With more time I'd use SWR's mutate for instant feedback before the round-trip completes.

**No auth** — The system has no user authentication. In production, reservation ownership would be tied to a user session so users can only confirm or release their own reservations.
