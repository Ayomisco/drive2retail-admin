# Drive 2 Retail — Admin

Operations dashboard for **Drive 2 Retail Limited**. Catalogue, inventory,
orders, dispatch, payments and customers.

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4 · ApexCharts

> D2R manages the catalogue on its vendors' behalf, so staff live in these
> screens all day while customers pass through the storefront in minutes.
> **This is the product.** Spec: `docs/backend/06-admin-ops.md` in the backend
> repository.

## Specification

Full functional spec in [`docs/`](docs/) — every section, page, CRUD surface and
workflow, including the payment gateway registry and the dedicated dispatch
console. Start with [`docs/README.md`](docs/README.md).

## Getting started

```bash
npm install
npm run dev      # http://localhost:3001
npm run build
npm run lint
```

Runs on **3001** so it can sit alongside the storefront on 3000.

## Two admin surfaces, deliberately

| | Django Admin (`/staff/`) | This app |
| --- | --- | --- |
| Purpose | Data management | Operational workflow |
| Built | Configuration, days | React, weeks |
| Covers | CRUD on all 65 tables, search, filters, bulk actions, history | Dashboard, fulfilment board, stock console, reconciliation, dispatch |

Django Admin is not a placeholder to be replaced. It is the right tool for
"edit this product's tax class". This app exists only where a workflow spans
several tables and has to be fast under repetition — picking fifty orders,
counting stock, reconciling a driver's cash.

Both authenticate against the same users and roles, and both write to the same
audit log.

## Brand

Inherits the storefront's tokens so the two surfaces read as one product —
`#00a858` green, `#f88838` orange, `#f03038` red, sampled from the D2R logo.
Layout and density differ on purpose: the storefront is a shop, this is a tool.

Shared with the frontend: the icon font, the logo set, and the type pairing
(Urbanist headings, DM Sans body).

## Structure

```
src/
  app/                    routes
  components/
    layout/               Sidebar, Topbar, AdminShell
    ui/                   StatCard, Badge, PageHeader, Charts
  lib/
    navigation.ts         nav model, role-gated
    format.ts             money, numbers, Africa/Lagos dates
  styles/
    globals.css           brand tokens + admin component classes
```

Navigation is gated by staff role against the RBAC matrix in
`docs/backend/04-security.md` §2.3. **That only hides what a role cannot use —
authorisation is enforced by the API**, never by the client.

## Built

- Shell — collapsible sidebar, topbar, search, role-gated navigation
- Dashboard — today's stats, revenue chart, order-mix donut, the "needs
  attention" queues, recent orders, top products, inventory strip
- Component library — cards, buttons, badges, tables, forms, stat cards
- Formatting — NGN currency, tabular numerals, Africa/Lagos dates

Figures on the dashboard are placeholders whose shapes match
`GET /admin/dashboard/summary` in `docs/backend/02-api.md` §7, so wiring the
API is a fetch call and a type rather than a rewrite.

## Next

Build order and screen-by-screen detail are in [`docs/`](docs/). In short:

1. Auth against the API, with staff MFA
2. Generate the typed client from the backend's OpenAPI schema
3. Data tables with server-side sort, filter and pagination
4. Product form, variants, pricing, image upload
5. Inventory console with draft-then-apply adjustments
6. Fulfilment kanban and the dispatch board
7. Import wizard — upload, validate, review errors, apply

## Conventions

- Server Components by default; `"use client"` only where there is interaction
- ApexCharts is dynamically imported — it must never enter the initial bundle
- Money is formatted in `lib/format.ts` and nowhere else
- Dates are stored UTC and presented in Africa/Lagos
- Focus rings are never removed; staff work here by keyboard all day
- `robots: noindex` — internal tool
