# Payments, Gateways & Finance

Includes the **gateway registry** — multiple providers configured side by side,
each with independent sandbox and live credentials, switchable without a deploy,
with routing rules and automatic failover.

> This supersedes the single `payment.active_gateway` string in the original
> settings design. A string cannot express *"Paystack live for card, Flutterwave
> live for bank transfer, both sandbox on staging, fail over if one is down."*
> The backend needs the `payment_gateway` and `payment_routing_rule` tables in §4.

---

## 1. Gateway registry — `/payments/gateways`

The list every gateway appears in. One row per provider, not per environment —
a gateway holds both sets of credentials and a mode switch.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Payment gateways                            [+ Add gateway]  [Test all] │
├──────────────────────────────────────────────────────────────────────────┤
│  ⬤ Paystack            LIVE     Priority 1   card, bank, ussd, transfer  │
│    98.4% success · 1,284 txns · ₦18.4m · avg 2.1s      [Configure] [⋯]   │
├──────────────────────────────────────────────────────────────────────────┤
│  ⬤ Flutterwave         LIVE     Priority 2   card, bank, ussd            │
│    97.1% success · 142 txns · ₦2.1m · avg 2.8s         [Configure] [⋯]   │
├──────────────────────────────────────────────────────────────────────────┤
│  ⬤ Cash on delivery    LIVE     Priority 3   cash                        │
│    Ikorodu, Kosofe only · ₦6.2m outstanding            [Configure] [⋯]   │
├──────────────────────────────────────────────────────────────────────────┤
│  ○ Bank transfer       SANDBOX  Disabled     manual verification         │
│    Awaiting account details                            [Configure] [⋯]   │
└──────────────────────────────────────────────────────────────────────────┘
```

**Columns** — status dot, provider, **mode badge (LIVE / SANDBOX)**, enabled,
priority, supported channels, 30-day success rate, volume, value, average
response, last health check.

**Row actions** — configure · enable/disable · switch mode · test connection ·
view transactions · reorder priority.

**Multiple gateways can be enabled at once.** That is the point — routing (§3)
decides which handles a given payment, and failover covers the rest.

The mode badge is deliberately loud. **LIVE** is red-bordered. Nobody should
ever be unsure which environment they are looking at.

---

## 2. Configure a gateway — `/payments/gateways/[code]`

Tabbed.

### Credentials

Two independent sets, side by side, so switching is a toggle and not a paste.

```
  ⚠ Mode:  ( ) Sandbox     (•) LIVE          [Switch mode]

  SANDBOX                              LIVE
  Public key   pk_test_xxxx…4a2c       Public key   pk_live_••••••••  [Reveal]
  Secret key   sk_test_••••  [Reveal]  Secret key   sk_live_••••••••  [Reveal]
  Webhook URL  https://api…/paystack   Webhook URL  https://api…/paystack
  Webhook secret ••••          [Copy]  Webhook secret ••••     [Copy]
               [Test connection]                    [Test connection]
               ✓ Connected · 240ms                  ✓ Connected · 180ms
```

- Secrets are **write-only** from the UI. They are stored in the secret manager;
  the database keeps a reference, never the value. Reveal requires re-authentication
  and writes an audit entry.
- Webhook URL and secret are shown for copying into the provider's dashboard,
  with a "webhook last received" timestamp so a misconfiguration is obvious.
- **Test connection** calls the provider's balance or ping endpoint and reports
  latency. Run it before switching mode; the switch dialog refuses on failure.

### Capabilities

- Supported channels — card · bank transfer · USSD · QR · mobile money · cash
- Supported currencies
- Minimum and maximum transaction amount
- Supports refunds · partial refunds · recurring · tokenisation
- Settlement period

### Fees

Percentage, flat, cap, and who bears it. Used for the true-margin report and to
compare providers on real cost rather than headline rate.

### Availability

- Enabled / disabled
- Priority for failover ordering
- Restrict to customer groups, delivery zones or order value bands
- Business hours (relevant for manual bank transfer)

### Health

Rolling success rate, average response time, error breakdown by code, webhook
delivery rate, and the last 20 failed transactions with reasons.

### Activity

Every configuration change: who, when, what changed, from what to what.
Credential and mode changes are always logged, never silently.

---

## 3. Routing rules — `/payments/gateways/routing`

Decides which gateway handles a payment when several are enabled. Rules evaluate
top-down; the first match wins; the default catches the rest.

```
  1. IF channel = bank transfer            → Flutterwave        [edit] [↕]
  2. IF zone IN (Ikorodu, Kosofe)
        AND customer.cod_allowed
        AND order ≤ ₦500,000               → Cash on delivery   [edit] [↕]
  3. IF order value > ₦2,000,000           → Paystack           [edit] [↕]
  4. DEFAULT                               → Paystack

  Failover:  ⦿ On   After 2 failures or 30s timeout, try the next by priority
             Never fail over a cash-on-delivery order
```

**Conditions available** — channel, order value, customer group, delivery zone,
currency, COD eligibility, time of day, customer's previous gateway.

**Simulator** — enter a hypothetical order and see which gateway it would route
to and why. Essential before saving a rule; a bad routing rule silently costs
sales.

**Failover** — on provider timeout or error, the next enabled gateway by priority
is offered. Recorded as a separate `payment_attempt`, so reconciliation shows
both. Never applies to COD.

---

## 4. Backend additions this requires

The original schema had a single setting. Replace with:

### `payment_gateway`

| Column | Type | Notes |
| --- | --- | --- |
| `code` | varchar(30) unique | `paystack`, `flutterwave`, `cod`, `bank_transfer` |
| `name` | varchar(100) | |
| `provider` | varchar(30) | adapter class key |
| `is_enabled` | boolean | |
| `mode` | varchar(10) | `sandbox` \| `live` |
| `priority` | smallint | failover order |
| `sandbox_public_key` | varchar(200) | |
| `sandbox_secret_ref` | varchar(120) | **secret-manager key, not the secret** |
| `live_public_key` | varchar(200) | |
| `live_secret_ref` | varchar(120) | |
| `webhook_secret_ref` | varchar(120) | |
| `supported_channels` | varchar[] | |
| `supported_currencies` | char(3)[] | |
| `min_amount` / `max_amount` | numeric(14,2) | |
| `fee_percent` / `fee_flat` / `fee_cap` | numeric | true-cost reporting |
| `supports_refunds` | boolean | |
| `settlement_days` | smallint | |
| `last_health_check_at` | timestamptz | |
| `last_health_ok` | boolean | |

```
uq_gateway_code  unique (code)
idx_gateway_live (priority) where is_enabled
ck_gateway_mode  check (mode in ('sandbox','live'))
```

### `payment_routing_rule`

| Column | Type |
| --- | --- |
| `sequence` | smallint — evaluation order |
| `name` | varchar(150) |
| `conditions` | jsonb — `[{"field":"zone","op":"in","value":[…]}]` |
| `gateway_id` | FK → payment_gateway |
| `is_default` | boolean |
| `is_active` | boolean |

```
uq_routing_sequence unique (sequence)
uq_routing_default  unique (is_default) where is_default
```

### Mode-switch safety

Switching a gateway between sandbox and live must not corrupt in-flight payments:

1. Refuse if the target mode's credentials are missing or fail a health check.
2. Refuse if unresolved payment attempts exist on the current mode — list them.
3. Require a typed confirmation of the gateway name.
4. Write an audit entry with both modes and the actor.
5. Existing attempts keep their original mode; `payment_attempt` stores `mode`
   so reconciliation never mixes test and live money.

**A live gateway can never be edited into an inconsistent state.** Every write
to this table is a two-step: change, then verify by health check.

---

## 5. Payments list — `/payments`

Every **attempt**, not just successes. The failures are where the diagnostics live.

**Columns** — timestamp, order, account, **gateway**, **mode**, provider
reference, amount, fees, net, channel, status, response, verified at.

**Filters** — gateway, mode, status, channel, date range, amount band, has
mismatch, unverified over 15 minutes, failed with a specific error code.

**Saved views** — All · Successful · Failed · Unverified · Amount mismatch ·
Sandbox (never mixed with live by default).

**Row actions** — verify now · view order · view raw payload (redacted) ·
retry webhook · initiate refund.

---

## 6. Reconciliation — `/payments/reconciliation`

The finance screen. Exceptions first, totals second.

```
  12 Sep 2026        All gateways ▾        [Export] [Mark reconciled]

  ⚠ 3 exceptions — resolve before closing the day
    • D2R-…-000421  verified ₦250,000, order ₦240,000    [Review]
    • D2R-…-000419  payment successful, order unpaid     [Reconcile]
    • TRP-0912-02   cash variance −₦14,000               [Open trip]

  Gateway        Txns    Gross        Fees      Net         Settlement
  Paystack        176  ₦18,420,500  ₦276,307  ₦18,144,193   14 Sep
  Flutterwave      14   ₦2,110,000   ₦33,760   ₦2,076,240   15 Sep
  Cash on deliv.   11   ₦2,412,000        —    ₦2,398,000   counted
  ─────────────────────────────────────────────────────────
  Total           201  ₦22,942,500  ₦310,067  ₦22,618,433
```

Two exceptions matter most and are surfaced first:

- **Amount mismatch** — verified amount ≠ order total. Never auto-paid; a human
  decides. This is the most common way payment integrations lose money.
- **Orphan payment** — provider says successful, order still unpaid. Usually a
  webhook that never arrived.

Also: provider settlement file upload and match, and a per-gateway fee report.

---

## 7. Refunds — `/payments/refunds`

**Columns** — reference, order, account, amount, reason, type, status,
requested by, approved by, restock, created.

**Request** — order, lines, amount (capped at remaining refundable), reason,
restock toggle. Shows remaining refundable balance live.

**Approval requires a different person.** The approve control is disabled for the
requester with the reason shown. Enforced by the API, not just the UI.

After approval the provider call runs, and the refund tracks to `completed` via
webhook. Restocking writes a `return` movement.

---

## 8. Invoices — `/invoices`

**Columns** — invoice number, order, account, issue date, due date, subtotal,
tax, total, paid, status, PDF.

Invoice numbers are **gapless** — allocated from a dedicated sequence inside the
issuing transaction, never `count(*) + 1`. Required for tax.

Actions: view · download PDF · email to customer · void (with reason, never
delete) · bulk export for the accountant.

Company details, logo and tax fields come from `/settings/company`.

---

## 9. CRUD matrix

| Entity | Create | Read | Update | Delete |
| --- | --- | --- | --- | --- |
| Gateway | ✅ admin | ✅ | ✅ admin | Disable only |
| Gateway credentials | ✅ admin | Reference only | ✅ admin, re-auth | — |
| Routing rule | ✅ admin | ✅ | ✅ | ✅ |
| Payment attempt | System only | ✅ | **Never** | **Never** |
| Refund | ✅ finance, ops | ✅ | Until approved | Cancel while pending |
| Invoice | System on payment | ✅ | Void only | **Never** |
| Webhook event | System only | ✅ | Retry only | **Never** |
