# Dashboard

Role-aware. A finance lead and an inventory manager open the same URL and see
different work.

---

## 1. Layout

```
Row 1   Today          4 KPI tiles, period-over-period
Row 2   Trends         Revenue area chart (2/3)  ·  Order mix donut (1/3)
Row 3   Needs attention   6 action queues, each with its action inline
Row 4   Movement       Recent orders  ·  Top products
Row 5   Inventory      4 stock tiles
```

Period selector in the header — today, 7d, 30d, this month, last month, custom.
Applies to every tile and chart. Persisted per user.

---

## 2. KPI tiles

Each shows value, period-over-period delta, and links to its filtered list.

| Role | Tiles |
| --- | --- |
| **admin / ops** | Orders today · Revenue today · Pending payment · Awaiting dispatch |
| **finance** | Revenue · Payments successful · Failed payments · Unreconciled cash |
| **inventory** | Low stock · Out of stock · Expiring in 30d · Stock value |
| **catalogue** | Active SKUs · Drafts · Missing images · Zero-result searches |
| **sales** | New accounts · Awaiting approval · Orders by my accounts · Reorder rate |
| **support** | Open exceptions · Failed deliveries · Refund requests |

Deltas are grey when the comparison period is incomplete — a half-finished day
compared to a whole one is noise, and showing "−48%" at 11am erodes trust in
every other number.

---

## 3. Charts

| Chart | Type | Notes |
| --- | --- | --- |
| Revenue | Area, dual series | Current vs prior period. ₦ compact axis (₦20m, not ₦20000k) |
| Order mix | Donut | Completed · Processing · Delivering · Pending payment, with total in the hole |
| Orders per day | Bar | Weekday pattern — informs route planning |
| Top categories | Horizontal bar | Revenue share |
| Payment success rate | Line | **By gateway** — the earliest signal of a gateway degrading |
| Fulfilment time | Box or line | Paid → delivered, median and p90 |

Every chart: hover tooltip with exact figures, click a segment to open the
filtered list, and an export menu (PNG, CSV of the underlying data).

Charts never block the page. They stream in under Suspense with a skeleton.

---

## 4. Action queues — the most valuable section

Six cards, each with a count, the action, and a link to the filtered list.
Ordered by cost of delay, not alphabetically.

| Queue | Source | Action | Roles |
| --- | --- | --- | --- |
| Orders awaiting dispatch | `status=paid` | Create shipment | ops |
| Payments unverified > 15 min | attempts `initiated` | Verify now | finance, ops |
| Customers awaiting approval | accounts `pending` | Review | sales, admin |
| Low-stock SKUs | below reorder point | Raise PO | inventory |
| Trips returned, cash uncounted | `completed`, unreconciled | Reconcile | finance |
| Refunds awaiting approval | refunds `pending` | Approve | finance |

Plus, surfaced when non-zero:

- Failed webhooks needing retry
- Delivery exceptions unresolved
- Stock expiring within 30 days
- Import jobs awaiting confirmation
- Supplier invoices failing three-way match
- Products missing images or prices

A queue at zero collapses to a single satisfied line rather than an empty card.

---

## 5. Recent activity

**Recent orders** — number, account, zone, total, status badge. 5 rows.
**Top products** — name, brand, units, revenue. 5 rows.

Both link to their full report. Both respect field permissions — support does
not see margin.

---

## 6. Analytics beyond the dashboard

The dashboard answers *what needs doing now*. `/reports` answers *how are we
doing* — see [11-reports.md](11-reports.md).

Deliberately **not** on the dashboard: cohort retention, forecast models,
customer lifetime value. They invite staring rather than acting.

---

## 7. Data contract

`GET /api/v1/admin/dashboard/summary?from&to` for rows 1–2.
Queues are separate endpoints so each polls independently and a slow one cannot
delay the rest.

Refresh: KPIs and queues every 60 s while the tab is focused; charts on demand.
