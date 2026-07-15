# Tasks

Each task mirrors a real senior-frontend live-coding problem. Practice rules:

- **Timebox yourself.** 60 min is the usual live-coding budget. Set a timer.
- **One page per task.** Create under `src/pages/<TaskName>/` with tests colocated.
- **Narrate your reasoning.** Even alone, talk through trade-offs out loud. This is half of what gets graded in a live round.

---

## Task 1 — Payments dashboard mini-SPA (merchants → transactions → payouts)

A classic fintech-flavored live-coding problem: build a small payments dashboard as a single-page application against a provided API.

**Route:** `/merchants`

### The brief

- "Turning supplied designs into executable code" — expect a desktop + mobile mock.
- "Single-page application with a front end interface that makes API calls to retrieve data."
- "Code that you can run, is separated where necessary and is designed in a way that testing can be applied."
- "Please talk us through what you're thinking as you develop your solution."
- "It doesn't matter if we do not finish the exercise." → **working simple > incomplete elegant**.
- No AI tooling (Copilot, ChatGPT, etc.).

### The problem

Two APIs are provided:

1. `GET /merchants` → list of merchants
2. `GET /merchants/:id/transactions` → transactions for a merchant

Build an SPA that:

- Lists merchants.
- Lets the user drill into a merchant and see their transactions.
- Calculates a **payout** per merchant — sum of transactions minus a discount rule (details vary; expect a percentage like `amount * (1 - discountRate)`).
- Is responsive (desktop + mobile layouts, per supplied designs).

A common sibling variant asks for structured output (CSV export of the processed data). Prepare for both.

### Suggested types

```ts
type Merchant = {
  id: string;
  name: string;
  discountRate: number; // e.g. 0.02 = 2%
};

type Transaction = {
  id: string;
  merchantId: string;
  amount: number;       // minor units (cents) — ask!
  currency: string;
  createdAt: string;    // ISO
};
```

**Clarifying questions to ask up front** (do this before writing code — it shows seniority):

- Are amounts in major or minor units?
- Is the discount per transaction or on the gross?
- Single currency or multi-currency (FX)?
- Pagination on transactions?
- How are failed/refunded transactions represented?

### Mocking the APIs for practice

No real backend — simulate it. Two options:

- Simple: `src/pages/Payments/mocks/` with JSON + a `fetchJson` helper that `setTimeout`s to mimic latency and has a toggleable error mode.
- Closer to real: MSW (`msw`) intercepting `fetch`. Nicer because your app code calls `fetch('/merchants')` unchanged.

### What gets graded

- **Separation of concerns** — data-fetching hook, presentation, business logic in distinct files.
- **Business logic as pure functions** — `calculatePayout(transactions, merchant)` must be a pure function with no React/fetch inside it. This is your testability anchor.
- **Loading / error / empty states** — not afterthoughts.
- **Sensible components** — e.g. `MerchantList`, `MerchantDetail`, `TransactionTable`, `PayoutSummary`.
- **Responsive layout** — mobile isn't "desktop but narrow"; expect distinct designs.
- **Runnable, working code** — `npm run dev` must show something by the end, even if incomplete.

### Behaviors a strong candidate demonstrates

- **Stay curious** — ask clarifying questions, especially when blocked. Don't guess the discount rule, the data shape, or the currency handling.
- **Make it happen** — a working-simple solution beats a perfect-unfinished one. Ship something runnable.
- **Think customer-first** — articulate *who* uses this ("a merchant checking their pending payout") and why your design serves them. Not "a developer exercising an API."
- **Work as one team** — narrate your thought process continuously. Treat interviewers as collaborators you're pairing with, not examiners you're performing for.

**Production-readiness — be specific, not generic.** Vague answers are a weak signal on all four axes:

- **Testing** — unit (pure payout calc, CSV encoder), integration (page + mocked fetch at the network layer), edge cases (empty list, zero transactions, large amounts, rounding).
- **Error handling** — distinguish *expected* (4xx, validation) vs *unexpected* (5xx, timeouts, malformed JSON). Retry transient errors with exponential backoff; surface the rest with actionable UI.
- **Monitoring & alerting** — structured logs (`request_id`, `merchant_id`, `status`, `duration_ms`), error-rate alert on 5xx %, latency p95 alert, client errors via an error tracker.
- **Scalability** — cursor-based pagination, bounded parallelism for batch fetches (`Promise.all` + `p-limit`), virtualize client lists, cache with SWR/ETag.

**Debugging discipline** (use this instead of random edits when something breaks):

1. **Log key variables** — inputs and outputs of the broken step.
2. **Narrow down** — binary-search the logic until you isolate where it breaks.
3. **Verify inputs → transformations → outputs** step by step; don't assume any stage works.

If stuck >5 minutes with no progress: **pause, reframe the problem aloud**.

**Common pitfalls — don't:**

- Start coding without clarifying the discount rule and data shapes.
- Pull in an unfamiliar library under time pressure — use what you're fluent in. If you do introduce one, say *why* and how it works.
- Batch all testing for the end. Test incrementally — after mocks, after the pure function, after the wire-up.
- Give generic production-readiness answers. "I'd add logging" is weak; "I'd wrap fetch in a function that emits `request_id`/`status`/`duration_ms` and alert on 5xx rate >1%" is strong.
- Silently pick between two options. If you chose `useReducer` over Zustand, say why ("one page of state, no other consumers").

**Language note** — be ready for a backend-flavored variant too: a Node-style "fetch external source → transform to CSV" task, or a combined one.

### Suggested 60-minute build order

1. **(5m)** Read designs, ask clarifying questions, sketch component tree + data flow aloud.
2. **(10m)** Types + mock fetchers + `calculatePayout` pure function.
3. **(5m)** Unit test `calculatePayout` — edge cases: empty list, zero discount, rounding. **Get the green tick here before touching UI.**
4. **(20m)** MerchantList + selection state + TransactionTable wired to the fetchers.
5. **(10m)** Loading / error states, responsive layout (one breakpoint is enough).
6. **(10m)** Buffer: CSV export, one RTL component test, polish. If you ran over, stop and summarize what you'd do next — that's a strong signal.

### Likely follow-up questions (have answers ready)

- **"How would this handle many thousands of transactions?"** — Server-side pagination (`?cursor=...&limit=50`), virtualization on the client (`react-window` / `IntersectionObserver`), memoize the payout calc with `useMemo`, compute totals server-side if possible. The `/merchants` page should be built in a way that swapping to a virtualized list is a small diff.
- **"How would you export as CSV?"** — Pure function `toCSV(rows)` (escape `"` → `""`, wrap fields containing `,`/`"`/`\n`, prepend headers). Download via `new Blob([csv], { type: 'text/csv' })` + `URL.createObjectURL` + temporary `<a download>` click.
- **"How would you test this?"** — Pure logic: unit tests (payout calc, CSV encoder). Components: React Testing Library + a mocked fetch layer (not mocked components). One integration test that renders the page, waits for merchants, clicks one, asserts transactions render.
- **"Where does error handling live?"** — Thin `fetchJson` wrapper returns a discriminated union `{ ok: true; data } | { ok: false; error }` so callers can't forget to handle failure. Surface errors in UI, don't swallow.
- **"How would you add auth?"** — Bearer access token in `Authorization` header. Access token in memory (not localStorage → XSS risk). Refresh token in httpOnly+Secure cookie. Refresh-on-401 interceptor.
- **"Caching strategy?"** — `Cache-Control` + `ETag`/`304` for conditional requests. On the client, stale-while-revalidate (roll your own with `useReducer`, or mention SWR/React Query). Cache key = URL; invalidate on mutation.
- **"How would you structure this if it grew 10x?"** — Feature folders, a dedicated API client module, a state layer (Zustand / Redux Toolkit / React Query), route-level code splitting.

### Trivia to brush up on (common rapid-fire technical-competency questions)

Skim MDN the night before a live round.

- **HTTP/1.1 vs HTTP/2** — multiplexing over one TCP connection, header compression (HPACK), binary protocol, server push, solves HOL blocking at the app layer.
- **HTTP caching** — `Cache-Control: no-cache` (revalidate) vs `no-store` (don't cache at all), `ETag`/`If-None-Match` → `304 Not Modified`, `max-age`, `immutable`.
- **CORS** — same-origin policy, `Access-Control-Allow-Origin`, preflight (`OPTIONS`) triggered by non-simple requests.
- **Cookies vs localStorage vs sessionStorage** — cookies: 4 KB, sent on every request, server-readable, can be httpOnly/Secure/SameSite; localStorage: 5 MB, client-only, no expiry, JS-readable (XSS-exposed); sessionStorage: per-tab.
- **Auth** — OAuth 2.0 access+refresh token flow, OpenID Connect = identity layer on top, where to store each token.
- **Password storage** — bcrypt / argon2, per-user salt, never roll your own, never store plaintext.
- **Security** — XSS (sanitize/escape, CSP), CSRF (SameSite cookies, CSRF tokens), SQLi (parameterized queries), clickjacking (X-Frame-Options / frame-ancestors).
- **Media queries / responsive** — `@media (min-width: …)`, viewport meta, mobile-first, `rem`/`em` vs `px`, container queries.
- **DB basics** — index = B-tree for O(log n) lookup; sharding = horizontal split across instances; partitioning = split within one instance; join types (inner/left/right/full).
- **CDN** — geographically distributed cache, origin fallback on miss, cache-busting via fingerprinted filenames.
- **TLS** — handshake, cert verification, symmetric session key after asymmetric exchange.

### Live-coding etiquette

- **Think aloud continuously.** Silence reads as being stuck. Even "I'm deciding between X and Y because…" is valuable.
- **Ask clarifying questions early** — designs, API shapes, edge cases. Seniors are expected to, juniors aren't.
- **Prefer working-simple over elegant-incomplete.** The rubric rewards something runnable.
- **When stuck, narrate the next thing you'd try.** Don't go silent; don't fake it.
- **Design for the handoff.** At any moment, could you git-add-commit and give this to a reviewer?
- **Know how to run your code.** Have `npm run dev` / `npm test` ready.

### Design reference (since real designs aren't supplied during practice)

A live round hands you desktop + mobile mocks. For practice, follow the visual conventions of modern payments dashboards — clean, dense, neutral.

**Suggested palette:**

- Primary teal: `#0B6D6D` – `#0F7474`
- Deep navy / ink: `#0A1F2A` (text, headers)
- Page background: `#F7F7F5` or `#FFFFFF`
- Accent / CTA warm: soft coral `#E9A66F`
- Status pills: success `#0E8A6A`, warning `#B97A00`, danger `#C3341F`, neutral `#6B7280`
- Font: **Inter** (free), weights 400/500/600, one family only

**Desktop layout — 3-zone shell (fixed sidebar + top bar + main):**

```
+--------+------------------------------------------------+
| LOGO   |  Breadcrumb / Page title         [search] [me] |
|        +------------------------------------------------+
| Home   |  H1: Merchants                                 |
| Pay's  |  [filter] [search]                    [Export] |
| Cust's |  +------------------------------------------+  |
| Payouts|  | Avatar | Name        | Ref    | Status  |  |
| ...    |  | AB     | Acme Ltd    | MRC_01 | Active  |  |
|        |  | BB     | Bright Bake | MRC_02 | Active  |  |
|        |  +------------------------------------------+  |
+--------+------------------------------------------------+
```

Merchant detail is a **full route** (not a drawer) — header **payout card** on top (big number + breakdown), dense transaction table below.

**Mobile pattern:**

- Sidebar collapses to a hamburger drawer or bottom tab bar.
- **Tables become stacked cards** — don't try to cram a 5-column table into 375px. Each transaction card: primary label top-left, amount top-right, status pill + date on a muted second row.
- Detail view is a pushed screen with the payout card as a sticky header.

**Component specifics:**

- **Merchant list row** — 56-64px tall, circular avatar with initials on tinted bg, name (weight 500) + muted sub-line (ID/email), status pill, chevron. Whole row clickable.
- **Transaction table** — columns: `Date | ID | Customer | Amount | Status`. Right-align amount. Status = rounded-full pill, colored bg at ~10% opacity + colored text at full. Row height 48-56px. Hairline dividers `#E5E7EB`, no zebra stripes. Use skeletons for loading, not spinners. Realistic payment statuses to borrow from: `Pending submission`, `Submitted`, `Confirmed`, `Paid out`, `Failed`, `Cancelled`, `Charged back`.
- **Payout summary card** — small uppercase label ("Payout total"), amount in 28-32px semibold, breakdown subtitle: `Gross £1,234.00 − Fee 2% £24.68 = Net £1,209.32`. Putting the discount math in the visible subtitle is a strong signal that the logic is correct.

### Stretch goals (only if time remains)

- CSV export button (wire up `toCSV` pure function).
- Sort/filter transactions (pure `sortBy` / `filterBy` functions, easy to test).
- Debounced merchant search.
- Keyboard navigation in merchant list.
- Skeleton loaders instead of spinners.

### Definition of done (for this practice task)

- [ ] `/merchants` renders a merchant list from a mocked API
- [ ] Selecting a merchant shows their transactions
- [ ] A payout total is displayed per merchant, computed by a pure function
- [ ] Loading + error states are visible paths (not just "if everything works")
- [ ] `calculatePayout` has unit tests covering empty, single, multiple, zero-discount, and rounding cases
- [ ] At least one component test (RTL) covering "select merchant → transactions render"
- [ ] Responsive at a single mobile breakpoint (<=768px)
- [ ] Entire thing builds and runs with `npm run dev`

### Acceptance criteria (what a reviewer verifies on hand-off)

The **Definition of done** above is your self-check *during* practice. This section is the checklist a reviewer runs through *after* you hand it off — values + production-readiness + the pitfall list. Each item has a clear pass/fail.

Pass bar: at least one item in every category. Target: most items in each.

**A. Correctness (the core task works end-to-end)**

- [ ] A1. `/merchants` route renders — merchant list visible on first paint (with loading state first)
- [ ] A2. Clicking a merchant navigates to / reveals a detail view with that merchant's transactions
- [ ] A3. A payout total is rendered and numerically correct for every fixture merchant (verify at least 2 against hand-computed values)
- [ ] A4. Payout math is visible in the UI as a breakdown (e.g. `Gross − Fee = Net`) — not just a single final number
- [ ] A5. The app compiles, `npm run dev` serves it, and `npm test` passes without errors or warnings

**B. Architecture (separation of concerns)**

- [ ] B1. Business logic lives in a pure function (e.g. `calculatePayout`) with zero React or `fetch` imports — importable in a Node REPL
- [ ] B2. Data fetching is isolated from presentation (a hook, a service module, or both — not inline in a component body)
- [ ] B3. Components are small and single-purpose — no 300-line components that do fetching + rendering + formatting
- [ ] B4. No prop drilling past 2 levels without justification; no `useContext` for data that should just be a prop
- [ ] B5. Types are defined once and imported — no duplicated `Merchant`/`Transaction` definitions across files

**C. Testability & tests (the #1 production-readiness axis)**

- [ ] C1. `calculatePayout` has at minimum these unit tests: empty transactions, single transaction, multiple transactions, zero discount, non-trivial discount with rounding
- [ ] C2. At least one RTL test covering "user selects a merchant → transactions render" with `fetch` mocked at the network boundary (not by mocking the component)
- [ ] C3. Test names read as behavior, not implementation — `"shows zero when there are no transactions"`, not `"test 1"` or `"renders correctly"`
- [ ] C4. No skipped (`.skip`), only (`.only`), or commented-out tests

**D. Error, loading, empty states**

- [ ] D1. Loading state is visible on initial fetch (skeleton or spinner) — not a blank screen
- [ ] D2. API failure shows an actionable error state, not a white screen of death or a silent console log
- [ ] D3. Empty state (merchant with zero transactions) renders something sensible, not `undefined` or a crashed component
- [ ] D4. Error states distinguish expected failures (e.g. 404 "merchant not found") from unexpected (5xx "something went wrong, retry")

**E. Responsive (mobile + desktop)**

- [ ] E1. At viewport ≥1024px, renders a desktop layout (sidebar or top-nav + main content area with a proper table)
- [ ] E2. At viewport ≤768px, the transaction table collapses to stacked cards — no horizontal scroll
- [ ] E3. No overflow bugs at common widths (375, 768, 1024, 1440)
- [ ] E4. Tappable elements are ≥44px touch targets on mobile

**F. Code quality (logical, reusable methods + clean naming)**

- [ ] F1. Names convey intent — `calculatePayout` not `calc`, `transactions` not `data` (except at true boundaries)
- [ ] F2. No dead code, no commented-out blocks, no `console.log` left behind
- [ ] F3. No duplicate logic — if payout math or formatting appears twice, it's extracted
- [ ] F4. Functions do one thing; if one has three distinct concerns, they're split
- [ ] F5. ESLint passes (`npm run lint`) with zero errors and zero warnings

**G. Communication artifacts (the "work as one team" value)**

- [ ] G1. A short `NOTES.md` or README section inside `src/pages/Payments/` captures: clarifying questions you'd have asked, trade-offs you made, what you'd do next with more time
- [ ] G2. At least one inline comment explaining a non-obvious choice (not WHAT — WHY). Zero comments that restate the code
- [ ] G3. Git history (or a single commit) has a message that summarizes the approach — not `"wip"` or `"task 1"`

**H. Production-readiness story (verbal follow-ups after review)**

These aren't code checks — they're questions to answer. A strong answer references specifics from your code.

- [ ] H1. "Walk me through how you'd add observability." Expected: structured logs at the fetch boundary (`request_id`, endpoint, status, duration_ms), error-rate + p95 latency alerts, client error tracking.
- [ ] H2. "How would this handle 100k transactions per merchant?" Expected: server-side pagination first, then client-side virtualization, then memoized payout calc. Not "I'd use React Query."
- [ ] H3. "What would you add for auth?" Expected: bearer token in memory, refresh token in httpOnly+Secure cookie, 401-refresh interceptor. Not "JWT."
- [ ] H4. "What's the weakest part of your solution?" Expected: a concrete, specific answer — not "I'd write more tests." Self-awareness is the grade.

**Auto-fail signals** (the pitfall list):

- [ ] Z1. ❌ You started coding without clarifying anything in the prompt
- [ ] Z2. ❌ You pulled in a library you don't understand (e.g. used Redux Toolkit and can't explain the reducer pattern)
- [ ] Z3. ❌ You wrote zero tests, or wrote them all in the final 5 minutes
- [ ] Z4. ❌ Your production-readiness answers are generic ("I'd add logging, tests, and monitoring")
- [ ] Z5. ❌ Silent choices — you can't justify why X over Y for any decision I point at
