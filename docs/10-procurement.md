# Procurement

D2R buys from Beiersdorf, Kraft Heinz, Givanas, Morning Star and others. Inbound
is half the operation and was missing from the original design entirely.

---

## 1. Purchase orders — `/procurement/orders`

**Columns** — PO number, supplier, warehouse, lines, value, expected date,
received %, status, raised by, approved by.

**Filters** — supplier, status, warehouse, date range, overdue, partially
received, awaiting approval, value band.

**Saved views** — Draft · Awaiting approval · Sent · Overdue · Partially
received · Received.

### Create — `/procurement/orders/new`

- Supplier, warehouse, expected date, payment terms (defaulted from the supplier)
- Lines: SKU, quantity, unit cost, expected expiry. Add by search, scan or CSV.
- **Suggest from low stock** — pre-fills lines from SKUs below reorder point,
  using the trailing sales rate to size the quantity
- Live totals with shipping, duty and other charges
- Save as draft, then submit for approval

**Approval is a different person from the raiser**, enforced by the API and
shown in the UI.

### Detail

Header, lines with ordered/received/outstanding, receipts against it, supplier
invoices, and activity. Actions: approve · send to supplier (emails the PDF) ·
receive · amend (pre-approval) · cancel · duplicate.

---

## 2. Goods receipt — `/procurement/receipts`

Where lot numbers and expiry dates **enter the system**. Nothing else creates a
batch — that single choke point is what keeps traceability honest.

```
  GRN-2026-0184        PO D2R-PO-2026-0142 · Beiersdorf Nigeria

  SKU              Ordered  Received  Accepted  Rejected  Lot      Expiry
  D2R-NIV-CRM150      200       200       200         0  L4421   2028-03
  D2R-NIV-DEO050      150       150       142         8  L4419   2027-11
                                                          ↳ 8 damaged in transit

  [Save draft]   [Accept receipt]  → creates batches, movements, updates PO
```

- Quantity received, accepted and rejected per line, with a rejection reason
- Lot number, expiry and manufactured date per line — **required** for any
  product in a category with a shelf life
- Photos of damage
- Unit cost, with landed-cost apportionment (§4)

Accepting writes `inventory_batch` rows, `receipt` movements, and updates the PO.

---

## 3. Suppliers — `/procurement/suppliers`

Code, name, type (manufacturer, importer, distributor), contacts, address,
payment terms, brands supplied, active flag.

**Performance panel** — POs raised, on-time delivery %, in-full %, **OTIF**,
average lead time, quality rejection rate, spend.

OTIF turns *"Kraft Heinz are always late"* from a feeling into a number you can
negotiate with.

---

## 4. Supplier invoices & three-way match — `/procurement/invoices`

The control that stops D2R paying for goods it never received, or paying twice.

```
  Invoice  BN-2026-8841 · Beiersdorf Nigeria

  PO value        ₦4,120,000
  Received value  ₦4,036,000     8 units rejected
  Invoice total   ₦4,120,000
  ─────────────────────────
  Variance          ₦84,000  ⚠ supplier billed for rejected stock

  [Dispute]  [Approve anyway — reason required]  [Request credit note]
```

Statuses: pending · matched · disputed · approved · paid.
`unique (vendor, invoice_number)` prevents double payment.

**Ageing report** — what is owed, to whom, when.

### Landed cost

For importers, the purchase price is not the cost. Duty, clearing, freight and
haulage are apportioned across PO lines by value and written to
`inventory_batch.unit_cost`.

Without it, gross margin is overstated on every imported line — and margin is
the number the buying team acts on.

---

## 5. CRUD matrix

| Entity | Create | Read | Update | Delete |
| --- | --- | --- | --- | --- |
| Purchase order | ✅ | ✅ | Pre-approval | Cancel only |
| PO line | ✅ | ✅ | Pre-approval | Pre-approval |
| Goods receipt | ✅ | ✅ | Draft only | Draft only |
| Batch | Via receipt | ✅ | Status only | **Never** |
| Supplier | ✅ | ✅ | ✅ | Deactivate |
| Supplier invoice | ✅ | ✅ | Until approved | Until approved |
