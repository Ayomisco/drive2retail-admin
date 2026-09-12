/**
 * Admin navigation.
 *
 * Sections mirror the operational surface in the backend architecture docs
 * (06-admin-ops.md). `roles` gates each item against the staff RBAC matrix in
 * 04-security.md §2.3 — the API enforces it, this only hides what a user
 * cannot use.
 */

export type StaffRole =
  | "admin"
  | "catalogue"
  | "inventory"
  | "ops"
  | "finance"
  | "support"
  | "sales";

export type NavItem = {
  label: string;
  href: string;
  icon: string;
  roles?: StaffRole[];
  badge?: "pendingOrders" | "pendingApprovals" | "lowStock" | "unreconciled";
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const navigation: NavSection[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/", icon: "hgi-dashboard-square-01" }],
  },
  {
    title: "Catalogue",
    items: [
      { label: "Products", href: "/products", icon: "hgi-package", roles: ["catalogue"] },
      { label: "Categories", href: "/categories", icon: "hgi-menu-square", roles: ["catalogue"] },
      { label: "Brands", href: "/brands", icon: "hgi-tag-01", roles: ["catalogue"] },
      { label: "Pricing", href: "/pricing", icon: "hgi-money-bag-02", roles: ["catalogue", "finance"] },
      { label: "Promotions", href: "/promotions", icon: "hgi-discount-01", roles: ["catalogue", "finance"] },
    ],
  },
  {
    title: "Inventory",
    items: [
      { label: "Stock", href: "/inventory", icon: "hgi-chart-histogram", roles: ["inventory", "ops"], badge: "lowStock" },
      { label: "Adjustments", href: "/inventory/adjustments", icon: "hgi-exchange-01", roles: ["inventory"] },
      { label: "Movements", href: "/inventory/movements", icon: "hgi-clock-01", roles: ["inventory", "ops"] },
      { label: "Batches & Expiry", href: "/inventory/batches", icon: "hgi-calendar-02", roles: ["inventory"] },
    ],
  },
  {
    title: "Orders",
    items: [
      { label: "All Orders", href: "/orders", icon: "hgi-shopping-cart-01", roles: ["ops", "finance", "support"], badge: "pendingOrders" },
      { label: "Fulfilment", href: "/orders/fulfilment", icon: "hgi-package-moving", roles: ["ops"] },
      { label: "Dispatch Board", href: "/dispatch", icon: "hgi-truck-delivery", roles: ["ops"] },
      { label: "Trips", href: "/dispatch/trips", icon: "hgi-route-01", roles: ["ops"] },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Payments", href: "/payments", icon: "hgi-credit-card", roles: ["finance"] },
      { label: "Reconciliation", href: "/payments/reconciliation", icon: "hgi-checkmark-badge-01", roles: ["finance"], badge: "unreconciled" },
      { label: "Refunds", href: "/payments/refunds", icon: "hgi-arrow-turn-backward", roles: ["finance", "ops"] },
      { label: "Invoices", href: "/invoices", icon: "hgi-invoice-01", roles: ["finance"] },
    ],
  },
  {
    title: "Customers",
    items: [
      { label: "Accounts", href: "/customers", icon: "hgi-store-01", roles: ["sales", "support", "ops"] },
      { label: "Approvals", href: "/customers/approvals", icon: "hgi-user-check-01", roles: ["sales"], badge: "pendingApprovals" },
    ],
  },
  {
    title: "Procurement",
    items: [
      { label: "Purchase Orders", href: "/procurement/orders", icon: "hgi-file-01", roles: ["inventory"] },
      { label: "Goods Receipt", href: "/procurement/receipts", icon: "hgi-package-delivered", roles: ["inventory"] },
      { label: "Suppliers", href: "/procurement/suppliers", icon: "hgi-building-03", roles: ["inventory"] },
    ],
  },
  {
    title: "Insight",
    items: [
      { label: "Reports", href: "/reports", icon: "hgi-analytics-01" },
      { label: "Audit Log", href: "/audit", icon: "hgi-search-list-01", roles: ["admin", "finance"] },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Staff & Roles", href: "/staff", icon: "hgi-user-group", roles: ["admin"] },
      { label: "Delivery Zones", href: "/settings/delivery", icon: "hgi-location-01", roles: ["admin", "ops"] },
      { label: "Settings", href: "/settings", icon: "hgi-settings-02", roles: ["admin"] },
    ],
  },
];

/** Hides what a role cannot use. Authorisation itself is enforced by the API. */
export function visibleFor(role: StaffRole | null): NavSection[] {
  if (role === "admin" || role === null) return navigation;
  return navigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.roles || item.roles.includes(role)),
    }))
    .filter((section) => section.items.length > 0);
}

export function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
