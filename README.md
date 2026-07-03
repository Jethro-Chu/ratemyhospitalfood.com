# Rate My Hospital Food

The community guide to hospital cafeteria food — search hospitals, read real food
reviews from patients, visitors, and staff, and rate the trays yourself.
Live at [ratemyhospitalfood.com](https://ratemyhospitalfood.com).

## Stack

- **Next.js 14** (App Router, mostly server components; plain JavaScript)
- **Vercel Postgres** (Neon) via `@vercel/postgres` — schema managed by the idempotent `GET /seed` route
- **Vercel Blob** for review photo uploads (client-side compression first)
- **Tailwind CSS v3** with a custom warm theme (`cream` surfaces, `ink` text, `brand` ember orange, `honey` gold)
- **lucide-react** icons

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. You'll need Postgres/Blob credentials in `.env.local`
(`POSTGRES_URL`, `BLOB_READ_WRITE_TOKEN`, …). Visit `/seed` once to create/migrate
the tables and indexes.

## How it's laid out

| Path | What it is |
| --- | --- |
| `app/page.js` | Homepage: hero search, top rated, recent + popular reviews, how it works |
| `app/search/` | The single search surface (`?q=` prefill, `?intent=review` for review-first flow) |
| `app/hospital/[id]/` | Hospital page: rating summary + distribution, photo strip, reviews (`?review=true` opens the modal) |
| `app/top-rated/`, `app/recent-reviews/` | Server-rendered lists with skeleton loading |
| `app/add/` | Add a hospital (dedupes case-insensitively, then jumps into the review flow) |
| `app/api/review`, `app/api/upload`, `app/api/react` | Review writes, photo uploads, Helpful/Funny reactions |
| `lib/actions.js` | All Postgres queries (server actions) |
| `lib/ratingTone.js` | The one rating vocabulary ("Chef's kiss" → "Pack snacks") |
| `components/` | Shared UI: `HospitalCard`, `ReviewCard`, `RatingStars`, skeletons, empty states |
| `app/games/`, `app/abyss/` | The arcade. `/abyss` is a hidden easter egg (check the footer radar) |

## House style

Fun but kind. The site jokes with hospital food, never at the people who cook or
eat it. One rating vocabulary everywhere, warm paper palette, rounded cards,
no scroll-jacking, and every list has a real skeleton, empty, and error state.
