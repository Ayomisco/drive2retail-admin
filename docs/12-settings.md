# Settings & System

---

## 1. Staff & roles — `/staff`

**Columns** — name, email, roles, last login, MFA, status, created.

**Detail** — profile, role assignments, activity, active sessions.

**Actions** — invite · change roles · reset MFA · force password reset ·
suspend · revoke sessions.

**Roles** — `admin · catalogue · inventory · ops · finance · support · sales`,
per the backend RBAC matrix. The permission matrix is shown read-only in the UI
so a manager can see exactly what a role grants before assigning it.

**MFA is mandatory for every staff account.** A staff session that has not
completed MFA reaches nothing but the enrolment screen.

**Separation of duties is enforced, not advisory** — the person who requests a
refund cannot approve it; the person who raises a PO cannot approve it; the
person who creates a stock adjustment may not be the one who applies it.

---

## 2. Delivery settings — `/settings/delivery`

- **Zones** — code, name, active, supports restricted, COD allowed, sort order
- **Areas** — the matching rules per zone (city, state, LGA, postal). Bulk import.
- **Rates** — per zone: type (flat, weight, order value, free), base fee, per-kg,
  bands, free-above threshold, estimated days, priority
- **Rate tester** — enter an address and order value, see the resolved zone, the
  matched rate and the final fee. Prevents publishing a rate card that silently
  fails for a real address.

---

## 3. Notifications — `/settings/notifications`

Template catalogue with a channel matrix.

| Template | Email | SMS | WhatsApp | In-app |
| --- | :-: | :-: | :-: | :-: |
| Account registered | ✅ | — | — | — |
| Email verification | ✅ | — | — | — |
| Account approved | ✅ | ✅ | — | — |
| Account rejected | ✅ | — | — | — |
| Password reset | ✅ | — | — | — |
| Order confirmed | ✅ | ✅ | — | ✅ |
| Payment received | ✅ | — | — | ✅ |
| Payment failed | ✅ | — | — | ✅ |
| Invoice issued | ✅ | — | — | — |
| Order dispatched | ✅ | ✅ | ✅ | ✅ |
| Out for delivery | — | ✅ | ✅ | ✅ |
| Delivered | ✅ | ✅ | — | ✅ |
| Delivery failed | ✅ | ✅ | ✅ | ✅ |
| Order cancelled | ✅ | — | — | ✅ |
| Refund processed | ✅ | — | — | ✅ |
| Back in stock | ✅ | — | — | ✅ |
| Low stock (staff) | ✅ | — | — | ✅ |
| Approval pending (staff) | ✅ | — | — | ✅ |
| Cash unreconciled (staff) | ✅ | — | — | ✅ |

Per template: subject, body with variable list, per-channel toggle, and a
**send test** to a chosen address. Editing shows a live preview with sample data.

Provider settings: Resend for email; SMS and WhatsApp providers to be chosen.

---

## 4. Business rules — `/settings`

Runtime configuration, no deploy needed, every change audited.

| Group | Keys |
| --- | --- |
| Accounts | Require approval · hide prices until approved · allow self-registration |
| Checkout | Reservation TTL · minimum order value · guest checkout (off) |
| Payments | See the gateway registry — this section links there |
| Delivery | Free-delivery threshold · default zone · block unsupported zones |
| Tax | Default tax class · prices include tax |
| Restricted | Require acknowledgement · acknowledgement wording |
| Inventory | Minimum shelf life by category · low-stock threshold · negative stock (off) |
| Dispatch | Driver cash limit · unreconciled trip limit · reattempt policy |
| Store | Trading hours · order cut-off · holiday closures |

Several of these are the open questions from the PRD. Making them settings means
launch is not blocked on a final answer, and a change of mind is a click.

---

## 5. Company — `/settings/company`

Legal name, registration number, TIN, registered address, logo, invoice footer,
bank details, support contacts. Feeds invoices and transactional email.

---

## 6. Audit log — `/audit`

**Columns** — timestamp, actor, actor type, action, object, summary of changes,
IP, request ID.

**Filters** — actor, action, object type, date range, IP, request ID.

Every material action: stock adjustments, price changes, order status changes,
payment and gateway configuration changes, refunds, customer approval and
suspension, permission changes, product publish and archive, bulk imports, data
exports, impersonation.

Append-only. Exportable. Retained three years, then archived.

---

## 7. System health — `/settings/system` (admin only)

- Background job queues: depth, failures, retries, with a retry control
- Webhook delivery: recent events, failures, retry
- Import jobs: running, completed, failed
- Cache status and a targeted purge
- API health: database, cache, broker
- Version, deployed commit, environment badge

The environment badge is loud on staging so nobody mistakes it for production.

---

## 8. CRUD matrix

| Entity | Create | Read | Update | Delete |
| --- | --- | --- | --- | --- |
| Staff user | ✅ invite | ✅ | ✅ | Suspend only |
| Role assignment | ✅ | ✅ | ✅ | ✅ |
| Zone / area / rate | ✅ | ✅ | ✅ | If unused |
| Notification template | System | ✅ | ✅ | ✅ toggle |
| Setting | System | ✅ | ✅ admin | Never |
| Audit entry | System | ✅ | **Never** | **Never** |
