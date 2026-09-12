import Badge, { ORDER_STATUS_TONE } from "@/components/ui/Badge";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import { OrderMixChart, RevenueChart } from "@/components/ui/Charts";
import { compactMoney, money, number } from "@/lib/format";

/**
 * Placeholder figures until the API lands. Shapes match
 * `GET /admin/dashboard/summary` in docs/backend/02-api.md §7, so wiring this
 * up is a fetch call and a type, not a rewrite.
 */
const summary = {
  orders: { today: 42, pendingPayment: 12, awaitingDispatch: 28, delivered: 96 },
  revenue: { today: 4_182_500, change: 12.4 },
  inventory: { skus: 1284, lowStock: 37, outOfStock: 9, value: 94_210_000 },
  customers: { total: 412, pendingApproval: 8 },
};

const revenueSeries = [
  { name: "This year", data: [8.4, 9.1, 11.2, 10.4, 12.8, 14.1, 13.6, 15.9, 17.2, 16.4, 18.4, 19.8].map((v) => v * 1_000_000) },
  { name: "Last year", data: [6.2, 7.0, 8.1, 8.8, 9.4, 10.2, 11.0, 11.4, 12.1, 13.0, 13.4, 14.2].map((v) => v * 1_000_000) },
];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const recentOrders = [
  { number: "D2R-2026-000417", account: "Adeola Stores Ltd", zone: "Ikorodu", total: 363_121, status: "Processing" },
  { number: "D2R-2026-000416", account: "Mama Chidi Provisions", zone: "Surulere", total: 184_500, status: "Delivering" },
  { number: "D2R-2026-000415", account: "Blessed Supermarket", zone: "Eti Osa", total: 921_400, status: "Completed" },
  { number: "D2R-2026-000414", account: "Kunle & Sons", zone: "Apapa", total: 76_800, status: "Pending Payment" },
  { number: "D2R-2026-000413", account: "Grace Mini Mart", zone: "Kosofe", total: 245_900, status: "Completed" },
];

/** The queues that make the dashboard a workspace rather than a report. */
const queues = [
  { label: "Orders awaiting dispatch", count: 28, action: "Create shipment", href: "/orders/fulfilment", tone: "info" as const },
  { label: "Payments unverified > 15 min", count: 3, action: "Verify now", href: "/payments", tone: "warning" as const },
  { label: "Customers awaiting approval", count: 8, action: "Review", href: "/customers/approvals", tone: "primary" as const },
  { label: "Low-stock SKUs", count: 37, action: "Raise PO", href: "/inventory", tone: "warning" as const },
  { label: "Trips returned, cash not counted", count: 2, action: "Reconcile", href: "/dispatch/trips", tone: "error" as const },
  { label: "Refunds awaiting approval", count: 1, action: "Approve", href: "/payments/refunds", tone: "error" as const },
];

const topProducts = [
  { name: "NIVEA Men Creme 150ml", brand: "NIVEA", units: 1_240, revenue: 3_410_000 },
  { name: "Heinz Tomato Ketchup 342g", brand: "Kraft Heinz", units: 980, revenue: 2_180_000 },
  { name: "O&B Beef Jerky 50g", brand: "O&B Foods", units: 870, revenue: 1_740_000 },
  { name: "Vektro Chapman 1L", brand: "Vektro", units: 760, revenue: 1_520_000 },
  { name: "Colavita Olive Oil 500ml", brand: "Colavita", units: 410, revenue: 1_230_000 },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Today at a glance, and what needs attention."
        actions={
          <>
            <button type="button" className="btn btn-outline btn-sm">
              <i className="hgi hgi-stroke hgi-calendar-03 text-base" />
              Last 30 days
            </button>
            <button type="button" className="btn btn-primary btn-sm">
              <i className="hgi hgi-stroke hgi-download-04 text-base" />
              Export
            </button>
          </>
        }
      />

      {/* Today */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Orders today"
          value={number(summary.orders.today)}
          change={8.2}
          icon="hgi-shopping-cart-01"
          tone="primary"
        />
        <StatCard
          label="Revenue today"
          value={compactMoney(summary.revenue.today)}
          change={summary.revenue.change}
          icon="hgi-money-bag-02"
          tone="success"
        />
        <StatCard
          label="Pending payment"
          value={number(summary.orders.pendingPayment)}
          icon="hgi-clock-01"
          tone="warning"
          hint="Stock held until they pay"
        />
        <StatCard
          label="Awaiting dispatch"
          value={number(summary.orders.awaitingDispatch)}
          icon="hgi-truck-delivery"
          tone="info"
          hint="Paid and ready to pick"
        />
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="card xl:col-span-2">
          <div className="card-header">
            <div>
              <h3>Revenue</h3>
              <p className="text-[13px] text-light-disabled-text">Monthly, against the prior year</p>
            </div>
          </div>
          <div className="card-body pt-2">
            <RevenueChart categories={months} series={revenueSeries} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Order mix</h3>
          </div>
          <div className="card-body pt-2">
            <OrderMixChart
              labels={["Completed", "Processing", "Delivering", "Pending payment"]}
              series={[96, 41, 28, 12]}
            />
          </div>
        </div>
      </div>

      {/* Queues */}
      <div className="mt-6 card">
        <div className="card-header">
          <div>
            <h3>Needs attention</h3>
            <p className="text-[13px] text-light-disabled-text">
              Work waiting on someone, oldest first
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 divide-y divide-gray-300 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3">
          {queues.map((queue) => (
            <a
              key={queue.label}
              href={queue.href}
              className="flex items-center gap-x-4 p-5 transition-colors hover:bg-gray-100"
            >
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-full font-urbanist text-sm font-bold ${
                  queue.tone === "error"
                    ? "bg-error-lighter text-error-dark"
                    : queue.tone === "warning"
                      ? "bg-warning-lighter text-warning-dark"
                      : queue.tone === "info"
                        ? "bg-info-lighter text-info-dark"
                        : "bg-primary-lighter text-primary-darker"
                }`}
              >
                {queue.count}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-light-primary-text">
                  {queue.label}
                </span>
                <span className="text-xs text-primary">{queue.action}</span>
              </span>
              <i className="hgi hgi-stroke hgi-arrow-right-01 text-lg text-gray-400" />
            </a>
          ))}
        </div>
      </div>

      {/* Tables */}
      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="card">
          <div className="card-header">
            <h3>Recent orders</h3>
            <a href="/orders" className="text-[13px] font-semibold text-primary hover:underline">
              View all
            </a>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Account</th>
                  <th className="num">Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.number}>
                    <td>
                      <span className="font-semibold text-light-primary-text">{order.number}</span>
                      <span className="block text-xs text-light-disabled-text">{order.zone}</span>
                    </td>
                    <td className="max-w-[180px] truncate">{order.account}</td>
                    <td className="num font-semibold text-light-primary-text">
                      {money(order.total)}
                    </td>
                    <td>
                      <Badge tone={ORDER_STATUS_TONE[order.status] ?? "neutral"}>
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Top products</h3>
            <a href="/reports" className="text-[13px] font-semibold text-primary hover:underline">
              Full report
            </a>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th className="num">Units</th>
                  <th className="num">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product) => (
                  <tr key={product.name}>
                    <td>
                      <span className="font-semibold text-light-primary-text">{product.name}</span>
                      <span className="block text-xs text-light-disabled-text">{product.brand}</span>
                    </td>
                    <td className="num">{number(product.units)}</td>
                    <td className="num font-semibold text-light-primary-text">
                      {compactMoney(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Inventory strip */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active SKUs" value={number(summary.inventory.skus)} icon="hgi-package" tone="info" />
        <StatCard label="Low stock" value={number(summary.inventory.lowStock)} icon="hgi-alert-02" tone="warning" hint="Below reorder point" />
        <StatCard label="Out of stock" value={number(summary.inventory.outOfStock)} icon="hgi-cancel-circle" tone="error" />
        <StatCard label="Stock value" value={compactMoney(summary.inventory.value)} icon="hgi-chart-histogram" tone="primary" hint="At landed cost" />
      </div>
    </>
  );
}
