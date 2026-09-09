# Orders & Fulfilment

---

## 1. Order list — `/orders`

**Columns** — order number, account, placed, items, total, payment, fulfilment,
zone, source, flags.

Flags surface exceptions inline: ⚠ payment exception · 🔒 restricted items ·
💵 cash on delivery · ↩ has return.

**Filters** — status, payment status, fulfilment status, date range, zone,
customer group, value band, contains restricted, payment gateway, COD, has
exception, delivery date, assigned rep.

**Search** — order number, business name, account number, customer email, phone,
SKU contained in the order.

**Saved views** — All · Pending payment · Paid, awaiting dispatch · Processing ·
Dispatched · Delivered today · Cancelled · Payment exceptions · COD unreconciled ·
Contains restricted.

**Bulk** — assign to trip, print pick lists, print invoices, export, mark
processing, cancel (with reason).

---

## 2. Order detail — `/orders/[number]`

```
┌─────────────────────────────────────────┬──────────────────────────┐
│ D2R-2026-000417        [Processing]     │  CUSTOMER                │
│ Placed 12 Sep, 09:42 · web              │  Adeola Stores Ltd       │
│                                          │  D2R-C-00417 · Approved  │
│ ITEMS                                    │  42 orders · ₦8.4m LTV   │
│  ┌────────────────────────────────────┐ │  [View account]          │
│  │ img  NIVEA Men Creme 150ml         │ │                          │
│  │      SKU-CS · Case of 24           │ │  DELIVERY                │
│  │      12 × ₦27,490      ₦329,880    │ │  Ikorodu Axis            │
│  │      Fulfilled 12/12               │ │  14 Ayangburen Rd…       │
│  └────────────────────────────────────┘ │  Before 10am             │
│                                          │                          │
│ Subtotal            ₦329,880             │  PAYMENT                 │
│ Discount            −₦0                  │  Paystack · card ••4242  │
│ Delivery             ₦8,500              │  ₦363,121 · verified     │
│ VAT 7.5%            ₦24,741              │  ref pay_9f2a1c…         │
│ ─────────────────────────                │  [3 attempts]            │
│ Total               ₦363,121             │                          │
│                                          │  SHIPMENTS               │
│ [Create shipment] [Note] [Invoice] [⋯]  │  SHP-0912-03 · Trip 02   │
└─────────────────────────────────────────┴──────────────────────────┘
  Tabs:  Timeline · Payments · Shipments · Returns · Notes · Activity
```

**Items** show the *snapshot* — the SKU, name, unit and price as they were when
ordered, not as they are today. Per-line fulfilled and returned quantities.

**Timeline** is the audit log filtered to this order: status changes, payment
events, notes, shipments, refunds — each with actor and timestamp. This is what
support reads when a customer calls.

**Actions** (permission-gated) — change status · create shipment · add internal
note · cancel · request refund · resend confirmation · download invoice · print
pick list · edit delivery address (before dispatch) · reassign trip.

Illegal status transitions are not offered. The state machine is enforced by the
API and mirrored in the UI.

---

## 3. Fulfilment board — `/orders/fulfilment`

Kanban across **Paid → Processing → Dispatched → Delivered**.

- Drag to transition; illegal moves are refused with an explanation.
- Cards show order number, account, zone, item count, value, COD flag, age.
- Cards age visually — an order paid three days ago and still unpicked turns amber.
- Column headers show count and total value.
- Filter by zone, delivery date, value band.
- Multi-select to print pick lists or assign to a trip in one action.

Built for the ops team processing the day's orders in one sitting.

---

## 4. Returns & exceptions — `/orders/returns`

Feeds from delivery exceptions recorded at the door and from customer requests.

**Columns** — reference, order, account, type, lines, value, status, raised,
resolution.

Types: short delivered · damaged · rejected · wrong item · expired ·
customer return.

**Resolution** — credit note · replacement · refund · none. Approving a return
optionally restocks (creating a `return` movement) and can trigger a refund.

---

## 5. Pick lists & documents

| Document | Contents |
| --- | --- |
| Pick list | Grouped by warehouse location, batch-aware for FEFO, barcodes |
| Packing slip | Customer copy, no prices |
| Invoice | Full tax invoice, gapless number, PDF |
| Delivery note | For the driver, signature block |
| Trip manifest | All stops for a trip, with cash due per drop |

All printable individually or in bulk from a selection.

---

## 6. CRUD matrix

| Entity | Create | Read | Update | Delete |
| --- | --- | --- | --- | --- |
| Order | Admin-created allowed | ✅ | Status, notes, address pre-dispatch | **Never** — cancel only |
| Order item | With the order | ✅ | Quantity pre-payment only | Never |
| Shipment | ✅ | ✅ | Status, tracking, driver | If not dispatched |
| Return | ✅ | ✅ | Until resolved | Draft only |
| Note | ✅ | ✅ | Own, 15 min | Own, 15 min |

A paid order is never deleted. A deleted order is an unauditable hole in the
accounts.
