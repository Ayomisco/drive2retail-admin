# Customers

The customer is the **business account**, not the user. A shop may have an owner,
a buyer and an accountant on one account sharing one order history.

---

## 1. Accounts — `/customers`

**Columns** — account number, business name, type, status, zone, orders,
lifetime value, last order, group, credit, registered.

**Filters** — status, business type, customer group, zone, has ordered, dormant
(no order in N days), COD allowed, restricted allowed, assigned rep, credit
enabled, registered in period.

**Saved views** — All · Approved · Awaiting approval · Suspended · Dormant ·
High value · New this month · Never ordered.

**Bulk** — assign group, assign rep, enable COD, export, send campaign (Phase 2).

---

## 2. Approval queue — `/customers/approvals`

The gate on new accounts. Reviewed one at a time with everything needed on screen.

```
  Adeola Stores Ltd                              Registered 2 days ago
  Retailer · CAC RC1234567 · TIN 12345678-0001

  Contact   Adeola Okonkwo · buyer@adeolastores.ng · +234 801 234 5678
            ✓ Email verified
  Address   14 Ayangburen Road, Ikorodu, Lagos
            → Resolves to zone: Ikorodu Axis ✓

  On approval:  ⦿ Can view prices   ⦿ Can order
                ☐ Cash on delivery  ☐ Restricted products
                Customer group: [Standard ▾]

  [Approve]   [Reject — reason required]   [Request more information]
```

Rejection requires a reason and emails the applicant. Requesting information
emails a specified question and returns the account to the queue.

---

## 3. Account detail — `/customers/[number]`

Tabs: **Profile · Members · Addresses · Orders · Payments · Pricing · Notes ·
Activity**.

- **Profile** — business details, status, group, rep, credit limit, terms,
  COD and restricted flags. Some fields lock after approval.
- **Members** — users on the account with roles (owner, buyer, viewer). Invite,
  change role, remove. Owner cannot be removed while sole owner.
- **Addresses** — all saved delivery and billing addresses with resolved zones.
- **Orders** — full history with totals, statuses and reorder rate.
- **Payments** — attempts, methods used, failure rate, outstanding COD.
- **Pricing** — effective prices for this account's group, with any overrides.
- **Notes** — internal, staff-only, timestamped.
- **Activity** — audit trail.

**Actions** — approve · suspend (reason required) · reactivate · reset password ·
set group · set credit limit · assign rep · toggle COD · toggle restricted ·
**impersonate** · export account data.

**Impersonation** is read-only, time-boxed to 30 minutes, requires a reason, and
writes a prominent audit entry. Support can see what the customer sees; support
cannot place an order as them.

---

## 4. Segmentation & customer groups — `/customers/groups`

Code, name, blanket discount, priority, member count, effective price count.
Used for tier pricing. Moving an account is audited and applies at the next cart
revalidation.

---

## 5. CRUD matrix

| Entity | Create | Read | Update | Delete |
| --- | --- | --- | --- | --- |
| Business account | ✅ admin-created allowed | ✅ | ✅ | Close only — orders must survive |
| Member | ✅ invite | ✅ | Role | Remove |
| Address | ✅ | ✅ | ✅ | Archive |
| Group | ✅ | ✅ | ✅ | If empty |
| Note | ✅ | ✅ | Own, 15 min | Own, 15 min |
