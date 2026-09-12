# Inventory & Stock

The screen an inventory manager keeps open all day.

**The rule that shapes every screen here: stock is never edited directly.** Every
change goes through an adjustment with a reason, and every change writes a
movement. That is what lets you answer *"where did 40 cases go?"*.

---

## 1. Stock console — `/inventory`

**Columns** — SKU, product, warehouse, on hand, reserved, **available**, incoming,
reorder point, days of cover, stock value, batch count, earliest expiry, status.

`Days of cover` is computed from the trailing 30-day sales rate. It is the number
a buyer actually acts on — "12 units left" means nothing without "that is 2 days".

**Filters** — warehouse, category, brand, vendor, low stock, out of stock,
overstocked, expiring within 30/60/90 days, has reservations, zero movement in N
days, restricted.

**Saved views** — All · Low stock · Out of stock · Expiring soon · Overstocked ·
Slow moving · Reserved.

**Row actions** — adjust, view movements, view batches, raise PO, set reorder
point, transfer.

**Bulk** — set reorder points, export, raise a consolidated PO, print count sheet.

**No inline quantity editing.** Deliberate. The control is the point.

---

## 2. Adjustments — `/inventory/adjustments`

Draft-then-apply, because a warehouse count is entered over hours and committed
once.

```
New adjustment
  ├ Type      count · damage · expiry · theft · correction · receipt
  ├ Warehouse
  ├ Reason    free text, REQUIRED
  ├ Lines     SKU · batch · current qty · new qty · delta (computed) · unit cost
  │           add by scan, search, or CSV paste
  ├ Impact    live: "net −128 units · ₦412,000 value change"
  ├ Save draft ──────────▶ nothing has moved
  └ Apply (permission-gated, may require approval above a threshold)
        → movements written · stock changed · audit logged · irreversible
```

Applied adjustments cannot be edited — only reversed by a new adjustment that
references the original.

**List columns** — reference, type, warehouse, lines, net units, value impact,
status, created by, approved by, applied.

---

## 3. Movement ledger — `/inventory/movements`

Append-only. Read-only. The auditable truth.

**Columns** — timestamp, SKU, warehouse, type, delta, balance after, unit cost,
reference (linked), reason, performed by.

**Filters** — SKU, warehouse, movement type, date range, user, reference type.

Types: receipt · sale · return · adjustment · damage · transfer in · transfer out ·
count.

Every row links to its source — the order, adjustment, goods receipt or trip.
Exportable for the accountant. This screen answers stock disputes.

---

## 4. Batches & expiry — `/inventory/batches`

Mandatory for FMCG. Ketchup, jerky, sauces, juices and cosmetics all expire, and
wholesale buyers reject short-dated stock.

**Columns** — SKU, product, lot number, warehouse, expiry, days remaining, on
hand, reserved, available, unit cost, goods receipt, status.

**Filters** — expiring 30/60/90, expired, quarantine, recalled, by supplier lot,
by goods receipt.

**Saved views** — Expiring soon · Expired · Quarantine · Recalled.

**Row actions** — quarantine, mark expired, write off, mark for markdown,
**trace** (see below).

**Allocation is FEFO** — first expired, first out. Batches inside the minimum
remaining shelf-life window for their category are excluded from sale and
flagged for markdown or write-off.

**Expiry lifecycle** (daily job, all audited):

| Days out | Action |
| --- | --- |
| 90 | Appears in the expiring-stock report |
| 60 | Ops alert; suggest promotion or bundle |
| 30 | Blocked from new orders (per-category setting) |
| 0 | Marked expired, written off, movement recorded |

### Batch trace — the recall screen

Enter a lot number, get every shop that received it: order, account, quantity,
delivery date, trip. Exportable, and printable as a recall notice list.

If Beiersdorf recalls a lot, this answers *"who has it"* in seconds. Without
batch tracking that answer does not exist at all.

---

## 5. Stock takes — `/inventory/stock-takes`

1. **Plan** — scope by warehouse, category, brand or location. Freeze optional.
2. **Count sheets** — printable, or a mobile count view. Blind count hides the
   expected figure so the counter is not anchored.
3. **Enter** — over hours, saved as draft, multiple counters.
4. **Variance report** — expected vs counted, by value, biggest first.
5. **Approve and apply** — creates a `count` adjustment and its movements.

Variance summary by value, not just units — 3 missing cases of Colavita matters
more than 300 sachets.

---

## 6. Transfers — `/inventory/transfers` (Phase 2)

Between warehouses. Dispatch decrements source, receipt increments destination,
with in-transit visible in both. Modelled now; single warehouse at launch.

---

## 7. Alerts

| Alert | Trigger | Goes to |
| --- | --- | --- |
| Low stock | Available ≤ reorder point | Inventory, daily digest |
| Out of stock | Available = 0 on an active SKU | Inventory, immediate |
| Expiring | Within category threshold | Inventory, weekly |
| Negative available | Should be impossible — indicates a bug | Admin, immediate |
| Large adjustment | Value above threshold | Admin, immediate |
| Stale stock | No movement in N days | Inventory, monthly |

---

## 8. CRUD matrix

| Entity | Create | Read | Update | Delete |
| --- | --- | --- | --- | --- |
| Stock level | Via adjustment only | ✅ | Via adjustment only | Never |
| Adjustment | ✅ | ✅ | Draft only | Draft only |
| Movement | System only | ✅ | **Never** | **Never** |
| Batch | Via goods receipt | ✅ | Status only | Never |
| Stock take | ✅ | ✅ | Until applied | Draft only |
| Reorder point | ✅ | ✅ | ✅ | — |
