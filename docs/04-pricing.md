# Pricing & Promotions

Prices are never updated in place. A change closes the current row and opens a
new one, so any past order can always be explained.

---

## 1. Price list — `/pricing`

**Columns** — SKU, product, unit, customer group, current price, compare-at,
margin %, valid from, next change, updated by.

**Filters** — category, brand, vendor, customer group, has scheduled change,
below margin threshold, not priced, changed in period.

**Saved views** — All · List prices · Group prices · Scheduled · Unpriced ·
Below target margin.

Margin columns are hidden from roles without cost access.

---

## 2. Editing a price

Inline for a single value; a panel for the full record:

- Amount, currency, compare-at (the strike-through "was")
- Customer group — blank means list price
- Minimum quantity — the volume break
- Valid from / valid to — **future-dated changes are the point**; a rise can be
  scheduled and will apply itself
- Reason (required) — appears in the audit trail

Resolution order at checkout: group + quantity break → group → list + break →
list. The highest `min_quantity` the line satisfies wins. The panel shows a live
preview of what a customer in each group would pay at 1, 10 and 100 units.

---

## 3. Bulk pricing — `/pricing/bulk`

Select by filter, then apply:

- Percentage increase or decrease
- Fixed amount change
- Set to a target margin over landed cost
- Round to the nearest ₦50 / ₦100
- Copy one customer group's prices to another

Always previews *"1,284 prices will change — average +4.2%, 12 would fall below
target margin"* before applying. Effective date supported. Reversible for 24
hours via the audit entry.

---

## 4. Tax classes — `/settings/tax`

Code, name, rate, inclusive or exclusive, effective dates. Rate changes keep
history so an old invoice still recalculates correctly.

> Whether displayed prices include VAT is one of the decisions that cannot be
> changed after real orders exist.

---

## 5. Customer groups — `/customers/groups`

Code, name, blanket discount, priority, member count. Used for tier pricing.
Moving an account between groups is audited and takes effect on their next cart
revalidation.

---

## 6. Promotions — `/promotions`

**List** — code, name, type, value, usage, limit, window, status.

**Detail**

- Code (the coupon the cart accepts), name, description
- Type — percentage, fixed amount, free delivery
- Value, minimum order amount, maximum discount cap
- Scope — whole order, category, brand, specific variants
- Limits — total uses, uses per account
- Customer group restriction
- Window — starts, ends
- Status — draft, scheduled, active, paused, expired

**Redemptions tab** — every use: order, account, amount discounted, timestamp.

Duplicate a promotion to run it again. Pausing stops new redemptions without
invalidating carts that already applied it.

---

## 7. CRUD matrix

| Entity | Create | Read | Update | Delete | Bulk |
| --- | --- | --- | --- | --- | --- |
| Price | ✅ | ✅ | New row, never in place | Close, never delete | Import, bulk change |
| Tax class | ✅ | ✅ | New effective row | If unused | — |
| Customer group | ✅ | ✅ | ✅ | If empty | — |
| Promotion | ✅ | ✅ | ✅ | If unused, else archive | Activate, pause |
