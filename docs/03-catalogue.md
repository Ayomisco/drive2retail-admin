# Catalogue

D2R manages the catalogue on its vendors' behalf, so this is where the
catalogue team spends its day. Onboarding a vendor's range is the workflow to
optimise.

---

## 1. Products list — `/products`

**Columns** — image, name, SKU count, category, brand, vendor, price range,
stock, status, completeness, updated.

**Filters** — status, category, brand, vendor, has stock, low stock, restricted,
missing image, missing price, tax class, date range.

**Saved views** — All · Active · Drafts · Out of stock · Missing images ·
Missing prices · Restricted · Recently updated.

**Bulk actions** — publish, unpublish, archive, change category, change brand,
assign tax class, apply price change, export, delete drafts.

**Completeness score** — a quality percentage per product (name, description,
image, specs, price, stock, SEO). Borrowed from Jumia; it makes catalogue debt
visible instead of invisible.

---

## 2. Product detail — `/products/[id]`

Tabbed, autosaving, with an Activity tab.

### Basics
Name · slug (auto, editable, warns on change if published) · primary category ·
additional categories · brand · vendor · tax class · status · tags.

### Description
Short description (500 chars, used on cards) · full description (rich text,
sanitised server-side) · key features list.

### Specifications
Key/value rows writing to `product.attributes`. Renders as the PDP spec table.
Bulk-paste from a spreadsheet. Templates per category so every beverage gets the
same fields.

### Variants — **the sellable SKUs**
Inline editable table:

| SKU | Name | Unit | Units/pack | Packs/case | Base units | MOQ | Increment | Barcode | Weight | Status |

- `Base units` computes live — the field that makes *"12 cases = 288 units"*
  correct without staff arithmetic.
- Duplicate a variant to create the pack and case versions of a unit.
- Generate variants from attribute combinations (size × flavour).
- Warns before deactivating a variant with stock on hand or open orders.

### Pricing
Per variant, per customer group, with volume breaks and validity windows.
Shows the current effective price, the next scheduled change, and margin against
landed cost (hidden from roles without cost access). See
[04-pricing.md](04-pricing.md).

### Media
Drag-and-drop upload to S3, reorder, set primary, per-variant images.
**Alt text is required** — accessibility and SEO. Client-side crop and compress.
Warns on images below 800 px.

### Inventory
Read-only per warehouse: on hand, reserved, available, incoming, reorder point.
Opening stock creates a `receipt` movement. Links to the movement ledger.

### SEO
Meta title and description with a SERP preview and length counters. Canonical
URL. Slug history so old links keep working.

### Restrictions
Restricted flag · restriction note shown at checkout · permitted delivery zones ·
minimum remaining shelf life.

### Activity
Full audit trail for this product and its variants.

---

## 3. Create — `/products/new`

Two paths:

- **Quick create** — name, category, brand, one variant, price, stock. Under a
  minute for a single SKU.
- **Full create** — the tabbed form.

Also: **Duplicate** an existing product, which copies everything except SKU,
barcode and stock.

---

## 4. Import — `/products/import`

The normal path for a vendor price list. Two-phase, always.

```
1  Upload      CSV or XLSX, drag-and-drop. Download a template.
2  Map         Auto-matched columns, correctable. Mapping saved per vendor.
3  Validate    Every row checked. Nothing written.
                 → "4,812 valid · 188 errors"  [Download errors]
                 → Preview: 402 new, 4,410 updated
4  Confirm     Operator applies. Chunked, resumable, progress bar.
5  Result      Counts, duration, audit entry, error CSV retained
```

Import types: products, prices, inventory, customers.
Update modes: create only · update only · upsert.
A **dry run is the default and cannot be skipped** on first upload.

---

## 5. Categories — `/categories`

Drag-and-drop tree. Create, rename, reorder, nest, activate, archive.
Per node: image, icon, SEO fields, restricted flag, minimum shelf life,
product count.

Moving a node warns about the products affected and offers to redirect old URLs.
Archiving is blocked while active products remain.

---

## 6. Brands — `/brands`

List with logo, name, vendor, product count, status. CRUD with logo upload and
SEO fields. Merging two brands moves products and leaves a redirect.

---

## 7. Attributes — `/attributes`

Defines the **filterable facets** — size, colour, pack size, flavour. Each has a
code, display name, data type, filterable flag, and its value list with usage
counts. Non-filterable specs stay in the product's JSON and never appear here.

---

## 8. CRUD matrix

| Entity | Create | Read | Update | Delete | Bulk |
| --- | --- | --- | --- | --- | --- |
| Product | ✅ | ✅ | ✅ | Archive only | Import, publish, category, price |
| Variant | ✅ | ✅ | ✅ | Archive only | Import, activate |
| Category | ✅ | ✅ | ✅ | If empty | Reorder |
| Brand | ✅ | ✅ | ✅ | If unused | — |
| Attribute | ✅ | ✅ | ✅ | If unused | — |
| Image | ✅ | ✅ | ✅ | ✅ | Reorder, delete |

Products are never hard-deleted — an archived product must still explain a
two-year-old invoice.
