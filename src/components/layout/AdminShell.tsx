"use client";

import { useState, type ReactNode } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

/** Sidebar + topbar frame. Counts come from the dashboard queues API. */
export default function AdminShell({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar
        open={navOpen}
        onClose={() => setNavOpen(false)}
        counts={{ pendingOrders: 12, pendingApprovals: 8, lowStock: 37, unreconciled: 2 }}
      />
      <div className="lg:pl-(--spacing-sidebar)">
        <Topbar onMenuClick={() => setNavOpen(true)} />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
