# Allo Inventory — Reservation System

**Live:** [https://allo-inventory.vercel.app](https://allo-inventory-app.vercel.app/)

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

The implementation was validated by forcing inventory availability to a single
unit and issuing simultaneous reservation requests from multiple clients. Exactly
one request succeeded while the other returned HTTP 409 Conflict.

### Expiry Mechanism

A Vercel Cron job periodically calls `/api/cron/expire-reservations` to release
expired reservations and decrement reserved stock. Due to hobby-tier compute
constraints, the cron is currently configured to run daily at midnight instead of
every minute. To avoid poor UX during the gap window, the system also implements
lazy expiry checks during confirm/release operations and disables actions
client-side when the countdown reaches zero.

### Idempotency (Bonus)

`POST /api/reservations` accepts an `Idempotency-Key` header. The key and
serialised response are stored in Upstash Redis with a 24-hour TTL. Retries
with the same key return the original response without re-executing the side
effect — safe for clients on flaky connections.

---

## Reservation Lifecycle

```
PENDING
  → CONFIRMED  (user confirms purchase)
  → RELEASED   (user cancels)
  → RELEASED   (expiry cleanup via cron or lazy check on confirm/release)
```

---

## Trade-offs

- **Cron granularity & Lazy Expiry**: The cron is configured to run daily at midnight instead of every minute to reduce compute costs. To compensate, we implemented **lazy expiry**: if a user tries to confirm or release an expired reservation, the API detects it, releases the stock immediately, and returns a 410 response. The client-side countdown also hits zero and disables UI actions without waiting for the cron. The only gap is that expired reservations won't release their stock back to the pool until midnight if no one touches them. For a take-home exercise, this is an acceptable trade-off between strict consistency and platform limits.
- **Optimistic UI**: State updates after confirm/release are currently driven by
  the API response. With more time I'd add optimistic updates via SWR.
- **DB lock vs Redis lock**: I chose `FOR UPDATE` over a Redis distributed lock
  because it keeps the atomicity guarantee within the same transaction boundary
  as the data write — one fewer distributed failure mode.
