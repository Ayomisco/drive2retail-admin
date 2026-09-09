# Domains & Deployment

How the four applications are hosted and how they authenticate against each other.

---

## 1. Domains

```
drive2retail.com                 Storefront          Next.js
admin.drive2retail.com           Admin              Next.js   ← Delivery Control lives here
dispatch.drive2retail.com        Dispatch rider app Next.js PWA
api.drive2retail.com             API                Django + DRF
cdn.drive2retail.com             Media              S3 / Cloudflare R2
```

Staging mirrors it exactly under `staging.drive2retail.com`,
`admin.staging.…`, `dispatch.staging.…`, `api.staging.…`.

---

## 2. Which surfaces get their own origin, and why

| Surface | Origin | Reasoning |
| --- | --- | --- |
| Storefront | Own | Public, SEO-indexed, anonymous traffic |
| Admin | Own | Staff only, `noindex`, different bundle and auth lifetime |
| **Delivery Control** | **Path on admin** (`/delivery-control`) | Same staff, same session, same components. A different *layout*, not a different app |
| **Dispatch app** | **Own** | Service worker scope, bundle isolation, trip-scoped tokens, PWA identity |
| API | Own | Single backend for all three clients |

### Why Delivery Control is a path

A subdomain would buy nothing and cost real things: either widening the auth
cookie to `.drive2retail.com` — weakening isolation for every subdomain — or
making coordinators log in twice. Plus duplicated components, another deploy
target, another certificate, another CORS and CSP origin.

The coordinator's "own dashboard" is a **layout concern**. Next.js route groups
give it a full-bleed root layout with no sidebar while sharing auth, the API
client, generated types and every component underneath.

### Why the dispatch app is not

| Reason | Cost of sharing an origin with admin |
| --- | --- |
| Service worker scope | Offline caching is scoped by origin — a rider's SW could see and cache admin routes |
| Bundle isolation | A rider on 3G downloads admin JavaScript they can never use |
| Auth boundary | Rider tokens are trip-scoped; a separate origin means a stolen token cannot reach admin endpoints even if scoping were misconfigured |
| PWA identity | Home-screen install, icon and name belong to the rider app |

### When Delivery Control would move to its own origin

Two cases, neither current:

1. **Dispatch is outsourced to a partner** who must never see catalogue, pricing
   or customers. A separate origin with its own auth boundary is a far stronger
   guarantee than route-level permissions.
2. **A permanently mounted wall display** on a kiosk account — easier to lock a
   whole origin to one read-only login than to fence a path.

Both are a redeploy, not a rewrite.

---

## 3. Authentication across origins

Every client authenticates against `api.drive2retail.com`, but the token never
reaches browser JavaScript.

```
Browser ──▶ Next.js BFF (same origin as the page) ──▶ api.drive2retail.com
            httpOnly · Secure · SameSite=Lax           Authorization: Bearer
            cookie, scoped to that host                (added server-side)
```

- **Cookies are host-scoped, never `.drive2retail.com`.** Admin, storefront and
  dispatch each hold their own session. A compromise of one does not carry.
- Each Next.js app has its own route handlers that exchange the cookie for a
  bearer token server-side. The browser never sees a token, so XSS cannot steal one.
- Session lifetimes differ by surface: storefront 14 days, **admin 8 hours with
  mandatory MFA**, dispatch app the length of a shift.
- Rider tokens are **scoped to their own trips** and reach no other endpoint.

---

## 4. CORS and CSP

Because each client talks to the API through its own BFF, **the browser never
makes a cross-origin API call**. CORS stays narrow:

```
CORS_ALLOWED_ORIGINS = [
    "https://drive2retail.com",
    "https://admin.drive2retail.com",
    "https://dispatch.drive2retail.com",
]
CORS_ALLOW_CREDENTIALS = True
```

CSP per surface. The storefront must allow the Paystack script and frame; the
admin and dispatch apps must not.

| Directive | Storefront | Admin | Dispatch |
| --- | --- | --- | --- |
| `script-src` | self, nonce, js.paystack.co | self, nonce | self, nonce |
| `frame-src` | checkout.paystack.com | none | none |
| `connect-src` | self, api.paystack.co | self | self |
| `img-src` | self, data:, cdn | self, data:, cdn | self, data:, blob: (camera) |
| `frame-ancestors` | none | none | none |

---

## 5. Hosting

| Component | Recommendation | Notes |
| --- | --- | --- |
| Three Next.js apps | Vercel, or containers behind one load balancer | Independent deploys; a storefront release must not restart the API |
| Django API | Container — Railway, Render, Fly, or ECS | Behind PgBouncer |
| Celery workers | Same image, different command | Two: `critical,default` and `bulk` |
| Celery beat | Single instance | **Never more than one**, or schedules fire twice |
| PostgreSQL | Managed, with PITR | Nightly full + WAL |
| Redis | Managed | Cache, broker, rate limits |
| Media | S3 or Cloudflare R2 behind `cdn.` | Versioned, replicated |

**Domain and DNS must be registered in D2R's name**, not the agency's. The
single most commonly botched part of an agency engagement.

---

## 6. Environments

| | Local | Staging | Production |
| --- | --- | --- | --- |
| Storefront | :3000 | staging.drive2retail.com | drive2retail.com |
| Admin | :3001 | admin.staging.… | admin.drive2retail.com |
| Dispatch | :3002 | dispatch.staging.… | dispatch.drive2retail.com |
| API | :8000 | api.staging.… | api.drive2retail.com |
| Payments | Provider test keys | Provider test keys | **Live keys** |
| Data | Fixtures | Anonymised copy | Live |
| Robots | — | `Disallow: /` | Storefront indexed; admin and dispatch `noindex` |

Staging carries a loud environment badge. Nobody should ever be unsure which
one they are looking at — the same reason the gateway mode badge is red for LIVE.

---

## 7. Release order

The API is the contract. Deploy it first, and make it backward-compatible for
one release so clients can catch up.

```
1  API (migrations first, then code — additive changes only)
2  Storefront
3  Admin
4  Dispatch app
```

Never ship a migration that drops a column in the same release as the code that
stopped using it. Split it across two: stop writing, deploy, then drop.
