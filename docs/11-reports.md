# Reports, Analytics & Exports

The dashboard answers *what needs doing now*. This answers *how are we doing*.

---

## 1. Report catalogue — `/reports`

Cards grouped by area, each with a description, last-run time and a run button.
Role-filtered — support does not see margin reports.

### Sales
| Report | Contents |
| --- | --- |
| Sales summary | Revenue, orders, AOV, by day / week / month |
| Sales by product | Units, revenue, **margin** |
| Sales by category / brand / vendor | Same, grouped |
| Sales by customer | Top accounts, frequency, recency |
| Sales by zone | Revenue and delivery cost per axis |
| Sales by rep | Phase 2 |
| Discount analysis | Promotion cost against incremental revenue |

### Inventory
| Report | Contents |
| --- | --- |
| Inventory valuation | On hand × landed cost, by warehouse |
| Stock movement | Full ledger for a period |
| Slow moving | No sales in N days, value at risk |
| Expiring stock | 30 / 60 / 90 days, value at risk |
| Write-off analysis | By reason and category |
| Stock accuracy | Count variance over time |

### Operations
| Report | Contents |
| --- | --- |
| Fulfilment time | Paid → dispatched → delivered, median and p90 |
| Delivery performance | On-time %, first-attempt success, by route and driver |
| Cost per drop | By zone |
| Failed deliveries | Reason breakdown |
| Cash reconciliation | Variance by driver, trend |
| Vehicle utilisation | Load factor |

### Finance
| Report | Contents |
| --- | --- |
| Payment reconciliation | By gateway, with fees and net |
| Gateway comparison | Success rate, latency, **true cost after fees** |
| Refund analysis | By reason, value, rate |
| Accounts payable ageing | Supplier invoices due |
| Tax summary | VAT collected, by period |

### Customers
| Report | Contents |
| --- | --- |
| Acquisition | Registrations, approvals, first-order conversion |
| Retention | Repeat rate, months since last order |
| Dormant accounts | Ordered before, not recently — a call list |
| Abandoned carts | Value, age, contents |
| **Zero-result searches** | What customers want that D2R does not stock |

That last one is the cheapest to build and the most commercially useful — it
turns the search log into a buying signal for the vendor team.

---

## 2. Report viewer — `/reports/[slug]`

- Filter bar: date range with presets and comparison, plus report-specific filters
- Summary tiles for the headline figures
- Chart, where a chart adds meaning
- Data table with sort and pagination
- **Compare to previous period** toggle, showing deltas
- Group-by selector where it applies (day / week / month, category / brand)
- Drill-through: clicking a row opens the underlying records

---

## 3. Exports

- **CSV** and **XLSX** from every report and every list
- Scope: current filter or explicit selection
- ≤ 5,000 rows download immediately; larger runs async and emails a signed link
  that expires in 24 hours
- Charts export as PNG, with the underlying data as CSV
- **Every export writes an audit entry** — it is a data-egress event
- Exports respect field permissions

### Scheduled reports

Any report can be scheduled: frequency (daily, weekly, monthly), recipients,
format, and the filter set. Delivered by email with the file attached or linked.

Typical: Monday sales summary to management, daily low-stock to the buying team,
month-end reconciliation to the accountant.

---

## 4. Analytics principles

**Show comparison, not just value.** ₦18.4m means nothing alone; ₦18.4m against
₦16.4m last month is information.

**Grey out incomplete comparisons.** A half-finished day against a whole one is
noise. Showing "−48%" at 11am erodes trust in every other number on the page.

**Every number is a link.** Clicking a figure opens the records behind it. A
report you cannot drill into is a dead end.

**Currency is always explicit.** ₦ everywhere, compact where space is tight
(₦18.4m), full where precision matters.

**No vanity metrics.** Page views and session counts do not help anyone here.
