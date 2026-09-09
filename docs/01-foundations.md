# Foundations

The patterns every screen reuses. Getting these right once is most of the work.

---

## 1. Information architecture

```
/                              Dashboard (role-aware)

/products                      Catalogue
  /products/new                Create
  /products/[id]               Edit — tabs: basics · description · specs ·
                               variants · pricing · media · inventory · SEO ·
                               restrictions · history
  /products/import             Import wizard
  /categories                  Tree editor
  /brands                      List + detail
  /attributes                  Filterable facet definitions

/pricing                       Price list
  /pricing/bulk                Bulk update / schedule
  /promotions                  List + detail
  /promotions/[id]/redemptions Usage

/inventory                     Stock console
  /inventory/adjustments       List → /new → /[id]
  /inventory/movements         The ledger (read-only)
  /inventory/batches           Batch & expiry
  /inventory/stock-takes       Counts
  /inventory/transfers         Between warehouses (Phase 2)

/orders                        Order list (saved views)
  /orders/[number]             Detail
  /orders/fulfilment           Kanban board
  /orders/returns              Returns & exceptions

/dispatch                      DISPATCH CONSOLE — full-bleed, no shell
  /dispatch/trips              Trip list
  /dispatch/trips/[number]     Trip detail + cash reconciliation
  /dispatch/fleet/drivers      Drivers
  /dispatch/fleet/vehicles     Vehicles
  /dispatch/routes             Route templates

/payments                      Payment attempts
  /payments/reconciliation     Finance view + exceptions
  /payments/refunds            Requests & approvals
  /payments/gateways           GATEWAY REGISTRY — providers, sandbox/live
  /payments/gateways/[code]    Configure one gateway
  /payments/gateways/routing   Routing rules & failover
  /invoices                    Issued invoices

/customers                     Business accounts
  /customers/[number]          Detail — profile · members · addresses ·
                               orders · payments · notes · activity
  /customers/approvals         Approval queue
  /customers/groups            Customer groups / tiers

/procurement/orders            Purchase orders
  /procurement/orders/[number] PO detail
  /procurement/receipts        Goods receipt
  /procurement/suppliers       Vendors
  /procurement/invoices        Supplier invoices & three-way match

/reports                       Report catalogue
  /reports/[slug]              Run, filter, export, schedule

/staff                         Staff & roles
/settings                      System settings
  /settings/delivery           Zones, areas, rates
  /settings/notifications      Templates & channels
  /settings/tax                Tax classes
  /settings/company            Company details for invoices
/audit                         Audit log
```

Every path above is a real screen in this spec. Nothing is decorative.

---

## 2. Page anatomy

```
┌──────────────────────────────────────────────────────────────────┐
│  Breadcrumb                                                       │
│  H1 Title                          [secondary] [primary action]   │
│  Supporting line                                                  │
├──────────────────────────────────────────────────────────────────┤
│  Saved views:  All · Awaiting dispatch (28) · Unpaid (12) · +     │
├──────────────────────────────────────────────────────────────────┤
│  [search........]  [filter ▾] [filter ▾]  [⋯]      [Export ▾]     │
├──────────────────────────────────────────────────────────────────┤
│  ☑  12 selected     [Assign] [Print] [Export] [Cancel]  ✕         │  ← sticky
├──────────────────────────────────────────────────────────────────┤
│  TABLE                                                            │
├──────────────────────────────────────────────────────────────────┤
│  Showing 1–24 of 1,284        ‹ 1 2 3 … 54 ›     24 per page ▾    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Data tables

The single most important component. Every list uses it.

**Behaviour**

- Server-side sort, filter and pagination. Never load all rows.
- Sticky header; sticky first column on wide tables.
- Row density toggle — comfortable / compact. Persisted per user.
- Column chooser — show, hide, reorder. Persisted per user per table.
- Click a row to open detail; `⌘`/`Ctrl`-click opens in a new tab.
- Inline row actions in a trailing `⋯` menu, never a wall of buttons.
- Numbers right-aligned with tabular numerals so columns compare visually.
- Empty, loading (skeleton, not spinner), and error states are designed, not default.

**Selection and bulk actions**

- Header checkbox selects the page; a banner then offers *"Select all 1,284
  matching"*.
- Selection survives pagination within the same filter.
- The sticky bar shows the count and only the actions valid for the whole
  selection.
- Destructive bulk actions require typing the count to confirm.
- Bulk jobs over 500 rows run async with a progress toast and a result summary.

**URL state**

Filters, sort, page and search all live in the query string, so a coordinator can
paste *"orders awaiting dispatch in Ikorodu"* into Slack and a colleague opens
exactly that.

---

## 4. Filters

| Type | Used for |
| --- | --- |
| Text search | Debounced 300 ms, searches the documented fields for that list |
| Multi-select | Status, zone, category, brand, staff |
| Date range | Presets — today, 7d, 30d, this month, last month, custom |
| Numeric range | Price, quantity, order value |
| Boolean | Low stock, restricted, has exceptions |

Active filters render as removable chips above the table with a **Clear all**.
Any filter combination can be saved as a view.

**Saved views** are per-user, optionally shared team-wide, and carry a live
count badge. Every list ships with sensible defaults — the queues in §2 of the
dashboard doc are saved views.

---

## 5. Forms

- Grouped into sections or tabs; never one long scroll.
- Inline validation on blur; the submit button never lies about what will happen.
- Server errors map to the field that caused them via the API's
  `detail[].field` — see the error envelope in the backend API doc.
- Unsaved-changes guard on navigation.
- Autosave drafts for long forms (products, purchase orders, adjustments).
- Currency inputs show ₦, group thousands, and accept pasted values with commas.
- Required fields marked on the label, not by absence of "optional".

**Two-person actions** — refunds, stock adjustment approval, purchase order
approval — show who requested, disable the approve control for that person, and
say why.

---

## 6. Exports

Every list exports. Consistency matters more than options.

- Formats: **CSV** and **XLSX**.
- Scope: current filter, or explicit selection.
- Column set: what is visible, or all available.
- ≤ 5,000 rows download immediately; larger runs async and emails a signed link
  that expires in 24 hours.
- Every export writes an audit entry — exports are a data-egress event.
- Exports respect permissions: a support user cannot export cost prices.

---

## 7. States

| State | Treatment |
| --- | --- |
| Loading | Skeleton matching the final layout. Never a centred spinner. |
| Empty (no data yet) | Illustration, one line explaining what goes here, primary action |
| Empty (no results) | "No orders match these filters" + Clear filters |
| Error | What failed, the request ID, and a Retry |
| Permission denied | What the user is missing and who to ask |
| Partial failure | Bulk result summary: 482 succeeded, 18 failed, download errors |

---

## 8. Permissions in the UI

Gating is cosmetic; the API enforces. Three levels:

1. **Navigation** — a role that cannot use a section does not see it.
2. **Action** — controls a role cannot use are hidden, not disabled, unless
   explaining the restriction helps (approve-your-own-refund shows disabled with
   a reason).
3. **Field** — cost price and margin are hidden from support and sales.

Roles per the backend RBAC matrix: `admin · catalogue · inventory · ops ·
finance · support · sales`.

---

## 9. Keyboard and speed

| Key | Action |
| --- | --- |
| `⌘K` | Global search — orders, products, customers, invoices |
| `/` | Focus the list search |
| `j` / `k` | Move row selection |
| `x` | Toggle row selection |
| `Enter` | Open the focused row |
| `Esc` | Close panel, clear selection |
| `g` then `o` / `p` / `i` / `d` | Go to orders / products / inventory / dispatch |
| `⌘S` | Save the open form |

Global search resolves an exact order number, SKU, invoice number or account
number straight to the record rather than to a results page.

---

## 10. Notifications and feedback

- **Toasts** for action results, with Undo where reversible (10-second window).
- **Inline banners** for page-level state — "This order has an unresolved
  payment exception".
- **Bell** for assigned work and background job completion.
- Optimistic UI on cheap mutations; a failure rolls back visibly and explains.

---

## 11. Audit surfaced in the UI

Every record with history shows an **Activity** tab: who, what, when, from what
to what, and why. It is the audit log filtered to that object.

Support answering *"what happened to my order"* should never need a developer.

---

## 12. Responsive and accessibility

- Desktop-first — this is a back-office tool — but every screen works at 768 px
  because managers check orders on a tablet.
- The Dispatch Console targets 1440 px and above and is also designed for a
  wall-mounted display.
- The driver app is mobile-only.
- WCAG 2.1 AA: contrast, focus visible, full keyboard operation, labelled
  controls, live regions for async results.
- Status is never conveyed by colour alone — badges carry text.
