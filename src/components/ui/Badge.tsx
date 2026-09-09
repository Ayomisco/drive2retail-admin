export type BadgeTone = "neutral" | "primary" | "success" | "warning" | "error" | "info";

/** Maps an order status to its badge tone, using the storefront's own vocabulary. */
export const ORDER_STATUS_TONE: Record<string, BadgeTone> = {
  "Pending Payment": "warning",
  Processing: "info",
  Delivering: "primary",
  Completed: "success",
  Cancelled: "error",
  Returned: "neutral",
};

export default function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
