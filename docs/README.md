# Admin — Functional Specification

Everything the Drive 2 Retail operations platform must do: every section, page,
CRUD surface, workflow and state.

Benchmarked against Jumia Seller Center, AliExpress Merchant, Shopify Admin and
Odoo — taking what fits a **single-seller FMCG distributor with its own fleet**,
and discarding the marketplace machinery that does not apply.

| # | Doc | Covers |
| --- | --- | --- |
| 0 | [01-foundations.md](01-foundations.md) | Information architecture, shared UI patterns, tables, filters, forms, bulk actions, exports, states, permissions, keyboard |
| 1 | [02-dashboard.md](02-dashboard.md) | Role-aware dashboards, KPIs, charts, action queues |
| 2 | [03-catalogue.md](03-catalogue.md) | Products, variants, categories, brands, attributes, media, bulk import |
| 3 | [04-pricing.md](04-pricing.md) | Price lists, tiers, volume breaks, scheduled changes, promotions |
| 4 | [05-inventory.md](05-inventory.md) | Stock console, adjustments, movements, batches and expiry, stock takes, transfers |
| 5 | [06-orders.md](06-orders.md) | Order list, order detail, fulfilment board, returns |
| 6 | [07-dispatch.md](07-dispatch.md) | **Delivery Control**, fleet, routes, trips, the dispatch rider app, cash reconciliation |
| 7 | [08-payments-gateways.md](08-payments-gateways.md) | **Gateway registry — multiple providers, sandbox/live, routing, failover**, reconciliation, refunds, invoices |
| 8 | [09-customers.md](09-customers.md) | Accounts, approvals, members, credit, segmentation |
| 9 | [10-procurement.md](10-procurement.md) | Purchase orders, goods receipt, suppliers, three-way match |
| 10 | [11-reports.md](11-reports.md) | Reporting, analytics, exports, scheduled delivery |
| 11 | [12-settings.md](12-settings.md) | Staff and roles, delivery zones, notifications, audit, system |
| 12 | [13-deployment.md](13-deployment.md) | Domains, origins, cross-app auth, CORS/CSP, environments, release order |

Backend contracts referenced throughout live in the API repository under
`docs/backend/`.

---

## Design principles

These are decisions, not aspirations. Every screen in this spec follows them.

**1. Queues over reports.** A dashboard that tells you revenue is a report. A
dashboard that says *"28 orders awaiting dispatch — create shipment"* is a
workspace. Every summary number links to the filtered list that produced it, and
every queue carries its action inline.

**2. The list is the product.** Staff spend their day in tables, not forms. Lists
get server-side sort, filter, saved views, bulk selection, inline actions,
keyboard navigation and export. Getting the table right matters more than any
individual detail page.

**3. Never lose work.** Draft-then-apply for anything consequential: stock
adjustments, imports, price changes, purchase orders. Autosave drafts. Confirm
destructive actions with a typed confirmation, not a bare "Are you sure?".

**4. Show the cost of being wrong.** Before applying a 5,000-row price import,
show *"4,812 valid, 188 errors"* and let the operator download the errors. Before
a stock adjustment, show the value change. Before a refund, show the remaining
refundable balance.

**5. Two clicks to anywhere.** Global search (`⌘K`) resolves an order number,
SKU, business name or invoice number directly to its record.

**6. The database is the truth, the UI is a lens.** Role gating hides what a user
cannot use; the API enforces it. Never trust a hidden button.

**7. Speed is a feature.** Lists paginate server-side and target p95 < 350 ms.
No screen loads all rows. No screen blocks on a chart.

---

## What we take from the big platforms, and what we do not

| Pattern | Source | Verdict |
| --- | --- | --- |
| Action queues on the dashboard | Shopify | **Take** — the single highest-value pattern |
| Saved list views with counts | Shopify, Linear | **Take** |
| Bulk edit with a sticky selection bar | AliExpress | **Take** |
| Two-phase CSV import with an error report | Jumia | **Take** — essential for vendor price lists |
| Order timeline with actor and timestamp | Shopify | **Take** — answers "what happened to my order" |
| Dedicated dispatch/logistics console | Jumia Logistics | **Take** — see below |
| Driver mobile app with proof of delivery | Jumia, Glovo | **Take** |
| Gateway switching with sandbox/live | Stripe, Paystack dashboards | **Take** — §8 |
| Product quality/completeness score | Jumia | **Take** — drives catalogue quality |
| Scheduled report emails | Odoo | **Take** |
| Seller onboarding, storefronts, payouts | Jumia, AliExpress | **Discard** — D2R has no third-party sellers |
| Commission and settlement ledgers | Marketplaces | **Discard** |
| Buyer/seller chat and disputes | AliExpress | **Discard** — B2B relationships run on phone and rep |
| Flash-sale and coupon-blast engines | AliExpress | **Defer** — promotions cover the wholesale need |
| Multi-currency, multi-language | Global platforms | **Defer** — NGN and English at launch |

---

## Two things called "dispatch"

D2R uses the word for the rider. The coordinator's screen needed a different
name so the two are never confused.

| Surface | Who | Where | Why |
| --- | --- | --- | --- |
| **Admin** (this app) | Catalogue, finance, support, sales | `admin.drive2retail.com` | General back office |
| **Delivery Control** | Logistics coordinator | `admin.drive2retail.com/delivery-control` | Runs the day from one board. Full-bleed layout, no admin chrome — but the same app, same session, same components |
| **Dispatch app** | Riders | **`dispatch.drive2retail.com`** | Its own origin: service worker scope, bundle isolation, trip-scoped tokens, PWA identity |

Delivery Control is a **layout** concern, so it stays a path. The dispatch app is
an **origin** concern, so it does not. Reasoning in
[13-deployment.md](13-deployment.md) §2.

**Third-party dispatch partners** are modelled at launch and left unused — a
nullable `partner_id` on the rider. D2R expects to use its own riders; adopting
a partner later becomes a data change and an auth scope rather than a migration
of every rider and trip. See [07-dispatch.md](07-dispatch.md) §7.

Full specification in [07-dispatch.md](07-dispatch.md).

---

## Build order

Follows the backend milestones so each admin screen has an API behind it.

| Phase | Screens | Backend milestone |
| --- | --- | --- |
| 1 | Auth, shell, dashboard skeleton | M1 |
| 2 | Catalogue CRUD, categories, brands, media, import | M2 |
| 3 | Inventory console, adjustments, movements | M3 |
| 4 | Orders list and detail, payments, **gateway configuration** | M4 |
| 5 | Fulfilment board, dispatch console, customers, reports, settings | M5 |
| 6 | Procurement, batches, driver app | M5–M6 |
| 7 | Analytics, scheduled exports, saved views | M7 |
