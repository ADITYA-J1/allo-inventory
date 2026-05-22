# Allo Inventory — Reservation System

**Live:** https://allo-inventory.vercel.app

---

## Running Locally

```bash
npm install
cp .env.example .env.local
# Fill in the values in .env.local
npx prisma db push
npx prisma db seed
npm run dev
```

Required environment variables (see `.env.example`):
- `DATABASE_URL` — Supabase transaction pooler URI
- `DIRECT_URL` — Supabase direct connection URI
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `CRON_SECRET`

---

## Architecture

### Concurrency Safety

The reservation endpoint uses PostgreSQL's `SELECT ... FOR UPDATE` inside a CTE.
The availability check and the stock increment happen in a single atomic SQL
statement. When two requests arrive simultaneously for the last unit:

1. Request A acquires the row-level lock on `Stock`
2. Request B blocks, waiting for the lock
3. Request A increments `reserved`, commits, releases the lock
4. Request B evaluates the `WHERE (total - reserved) >= quantity` clause
   against the now-updated row — it fails, the CTE returns `success = false`
5. Request B receives a clean 409

No application-level race condition is possible. The guarantee lives entirely
inside Postgres.

### Expiry Mechanism

A Vercel Cron job runs `/api/cron/expire-reservations` every minute. It finds
all `PENDING` reservations past their `expiresAt`, sets them to `RELEASED`, and
decrements `Stock.reserved` — all inside a single Prisma transaction for
consistency.

On the client, the countdown runs via `setInterval`. When it hits zero, the UI
disables action buttons immediately — the user never needs to wait for the cron.

### Idempotency (Bonus)

`POST /api/reservations` accepts an `Idempotency-Key` header. The key and
serialised response are stored in Upstash Redis with a 24-hour TTL. Retries
with the same key return the original response without re-executing the side
effect — safe for clients on flaky connections.

---

## Trade-offs

- **Cron granularity**: The 1-minute cron means a reservation can linger up to
  ~60s past expiry. Acceptable here; lazy expiry on read would close the gap.
- **Optimistic UI**: State updates after confirm/release are currently driven by
  the API response. With more time I'd add optimistic updates via SWR.
- **DB lock vs Redis lock**: I chose `FOR UPDATE` over a Redis distributed lock
  because it keeps the atomicity guarantee within the same transaction boundary
  as the data write — one fewer distributed failure mode.
