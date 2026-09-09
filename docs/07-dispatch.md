# Dispatch, Fleet & Courier

**Yes, dispatch gets its own dashboard.** D2R runs its own vans across five Lagos
axes covering 2,500 VAN outlets. The logistics coordinator's job — watch a board,
assign drops to vans, answer the phone when a shop calls — has nothing in common
with editing a product's tax class.

Three surfaces:

| Surface | Who | Device | Frame |
| --- | --- | --- | --- |
| **Dispatch Console** | Coordinator | Desktop / wall display | Full-bleed, no admin shell |
| **Fleet admin** | Ops manager | Desktop | Standard admin shell |
| **Driver app** | Riders | Cheap Android, 3G | Mobile-only, offline-first |

---

## 1. Dispatch Console — `/dispatch`

Renders **without the sidebar and topbar**. Full width, auto-refreshing every
30 seconds, designed to be left open all day and readable from across a room.

```
┌───────────────────────────────────────────────────────────────────────────┐
│ ⬅ Admin   DISPATCH   Fri 12 Sep   Ikorodu ▾    ⟳ 12s    ⛶  🌙            │
├───────────────────────────────────────────────────────────────────────────┤
│  Trips 6 · Stops 68 · Delivered 41 · Failed 3 · Cash due ₦6.2m           │
├──────────────────┬──────────────────┬──────────────────┬─────────────────┤
│ UNASSIGNED (14)  │ TRP-0912-01      │ TRP-0912-02      │ TRP-0912-03     │
│                  │ Emeka · VAN-07   │ Bola · VAN-03    │ Musa · VAN-11   │
│ ┌──────────────┐ │ ▓▓▓▓▓▓▓░░ 8/12   │ ▓▓▓▓▓▓▓▓▓ 11/12  │ ░░░░░░ Planning │
│ │ D2R-…-000418 │ │ 340/800 kg       │ 690/800 kg       │ 120/800 kg      │
│ │ Surulere     │ │ Cash ₦1.2m       │ Cash ₦2.4m ⚠     │ Cash ₦0.4m      │
│ │ 42kg · ₦184k │ │ ┌──────────────┐ │ ┌──────────────┐ │ ┌─────────────┐ │
│ │ 💵 COD       │ │ │1 …401     ✓  │ │ │1 …410     ✓  │ │ │1 …420       │ │
│ ├──────────────┤ │ │2 …403     ✓  │ │ │2 …411     ⚠  │ │ └─────────────┘ │
│ │ D2R-…-000419 │ │ │3 …407     ●  │ │ │3 …412        │ │                 │
│ │ Yaba · 18kg  │ │ └──────────────┘ │ └──────────────┘ │  [+ Add stops]  │
│ └──────────────┘ │ [Manifest][Go]   │ [Manifest]       │                 │
└──────────────────┴──────────────────┴──────────────────┴─────────────────┘
```

**Interactions**

- Drag an unassigned shipment onto a trip. Drag within a trip to resequence.
- Live capacity bar; blocks loading past `vehicle.capacity_kg` with a clear reason.
- Cash-due total per trip, warning when it exceeds `driver.cash_limit`.
- Stop status: ✓ delivered · ⚠ exception · ● in progress · ○ pending.
- Click a stop for a slide-over: order, items, address, phone, cash due, proof.
- **Auto-assign** — bulk-assigns unassigned shipments by zone and capacity, then
  shows a preview before committing.
- **Optimise sequence** — orders drops by proximity (Phase 2).
- Print all manifests, all delivery notes, all pick lists for a trip.
- Filter by zone, delivery date, COD only, exceptions only.

**Presentation mode** (`⛶`) hides controls for a wall display: counts, progress
bars and exceptions only. Dark theme for a screen that stays on.

---

## 2. Trips — `/dispatch/trips`

**Columns** — trip number, date, route, driver, vehicle, stops, delivered,
failed, cash expected, cash collected, cash remitted, **variance**, status.

**Filters** — date range, driver, vehicle, route, zone, status, unreconciled,
has variance, has exceptions.

**Saved views** — Today · Planned · In progress · Returned, uncounted ·
Cash variance · Failed stops.

### Trip detail — `/dispatch/trips/[number]`

- **Header** — driver, vehicle, route, date, status, odometer, departed, returned
- **Stops** — sequence, order, account, address, status, cash due, cash received,
  receiver, proof thumbnails, exceptions, timestamps and GPS
- **Load** — total weight, volume, value against vehicle capacity
- **Cash** — the reconciliation panel (§3)
- **Exceptions** — every line-level problem recorded at the door
- **Activity** — full audit

Actions: assign driver/vehicle · resequence · add or remove stops · dispatch ·
mark returned · reconcile cash · print manifest · cancel.

---

## 3. Cash reconciliation — the screen that protects the money

A large share of wholesale value arrives as cash in a van. This is the control.

```
TRP-2026-0912-02 · Bola Adeyemi · VAN-03            [Returned 17:40]

  Expected   ₦2,412,000    from 11 COD drops
  Declared   ₦2,412,000    driver's own figure
  Counted    [₦2,398,000]  cash office
  ─────────────────────────
  Variance     −₦14,000    ⚠ requires explanation

  Per stop
   #  Order          Account              Due        Received   ✓
   1  D2R-…-000410   Mama Chidi        ₦184,500     ₦184,500   ✓
   2  D2R-…-000411   Kunle & Sons      ₦ 96,000     ₦ 82,000   ⚠ short
   …
  [Explain variance…]                    [Approve]  [Escalate]
```

- `Variance` is a **generated column** — a shortfall cannot be edited away.
- Approving with a non-zero variance requires a reason and a second approver.
- Until a trip is reconciled it stays in the finance queue.
- A driver cannot be assigned a new trip while one is unreconciled beyond the
  configured limit.
- COD payment attempts only move to `successful` when the **cash office** confirms
  remittance — not when the driver says they collected.
- Every cash figure change is audited.

---

## 4. Fleet

### Drivers — `/dispatch/fleet/drivers`
Code, name, phone, licence number and expiry, home zone, status, cash limit,
app access. Performance panel: trips, on-time %, first-attempt success rate,
average cash variance, exception rate.

Blocks assignment when: licence expired · status not active · unreconciled trips
over the limit.

### Vehicles — `/dispatch/fleet/vehicles`
Code, registration, type, capacity (kg and m³), home warehouse, status,
insurance and roadworthiness expiry. Utilisation panel: trips, average load
factor, distance.

Compliance alerts fire 30 days before any document expires.

### Routes — `/dispatch/routes`
Template, not an instance. Code, name, zone, days of week, cut-off time, default
driver and vehicle, maximum stops.

Route templates are what let the storefront promise *"order before 4pm Monday for
Tuesday delivery"* without a human deciding each time.

---

## 5. Driver app — `/driver`

Mobile web, saved to the home screen. No app store, no installs, no update push.

**Screens**

1. **Today** — trip summary, stop count, cash expected, [Start trip]
2. **Stops** — ordered list with status; tap to open
3. **Stop detail** — shop, address, phone (tap to call), map link, items, cash due
4. **Deliver** — confirm lines, mark shortages or damage with a photo, capture
   receiver name, signature or photo, enter cash received
5. **Fail** — reason from a fixed list, note, photo
6. **Return** — odometer, declared cash, undelivered items

**Built for the reality**

- **Offline-first** — service worker caches the manifest; completions queue in
  IndexedDB and sync when signal returns
- **Low data** — thumbnails only, no product photography
- **One-handed** — large targets, minimal typing, camera over keyboard
- **Server-assigned timestamps** — the phone's clock can be wrong or changed
- **Idempotent submits** — a driver on a bad connection will tap twice; that must
  never double-count cash or double-deliver a stop
- **Scoped auth** — a driver sees only their own trip, never the catalogue or
  another driver's work

---

## 6. Customer-facing tracking

Deliberately **not** a live GPS dot. A shop owner wants a window and a phone
number.

Shown on the customer's order page: status, scheduled date, delivery window,
position in the run ("4th stop, 3 ahead"), driver name and phone **while the trip
is in progress**, and a timeline. The number is a masked relay where the
telephony provider supports it.

---

## 7. Third-party couriers — `/settings/couriers` (Phase 2)

For zones outside own-fleet coverage. Same `DeliveryProvider` interface as the
own fleet, so adding one is an adapter, not a schema change.

Per courier: code, name, provider, credentials reference (**a secret-manager key,
never the secret**), supported zones, COD support, rate card, active flag.

Routing: which zones use own fleet, which use a courier, and the fallback when
own-fleet capacity is exhausted.

---

## 8. Dispatch reports

| Report | Answers |
| --- | --- |
| Delivery performance by route/driver | On-time %, first-attempt success |
| Cost per drop by zone | Is this axis profitable? |
| Cash reconciliation by driver | Variance trend — the fraud and error signal |
| Failed delivery analysis | Reason breakdown by zone and time of day |
| Exception rate by product | Damage-prone SKUs, packaging problems |
| Vehicle utilisation | Load factor, idle capacity |
| Route density | Drops per trip per axis — where to add a van |

Route density and cost-per-drop inform expansion decisions, and both come free
once trips are modelled properly.

---

## 9. CRUD matrix

| Entity | Create | Read | Update | Delete |
| --- | --- | --- | --- | --- |
| Trip | ✅ | ✅ | Until dispatched | Cancel only |
| Trip stop | Via assignment | ✅ | Sequence, status | Unassign if pending |
| Driver | ✅ | ✅ | ✅ | Deactivate only |
| Vehicle | ✅ | ✅ | ✅ | Retire only |
| Route | ✅ | ✅ | ✅ | If unused |
| Proof of delivery | Driver app only | ✅ | **Never** | **Never** |
| Cash reconciliation | ✅ | ✅ | Until approved | Never |
