"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { isActive, visibleFor, type StaffRole } from "@/lib/navigation";

export default function Sidebar({
  role = "admin",
  open,
  onClose,
  counts = {},
}: {
  role?: StaffRole;
  open: boolean;
  onClose: () => void;
  counts?: Partial<Record<string, number>>;
}) {
  const pathname = usePathname();
  const sections = visibleFor(role);

  return (
    <>
      {/* Backdrop, mobile only */}
      <div
        className={`fixed inset-0 z-40 bg-gray-900/40 lg:hidden ${open ? "" : "hidden"}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-(--spacing-sidebar) flex-col border-r border-gray-300 bg-white transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-(--spacing-topbar) shrink-0 items-center gap-x-3 border-b border-gray-300 px-5">
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/images/logo.png"
              alt="Drive 2 Retail"
              width={114}
              height={80}
              priority
              className="h-10 w-auto"
            />
          </Link>
          <span className="ml-auto rounded-md bg-gray-200 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-gray-600 uppercase">
            Admin
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-6" aria-label="Main">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="nav-section">{section.title}</p>
              <ul className="flex flex-col gap-y-0.5">
                {section.items.map((item) => {
                  const count = item.badge ? counts[item.badge] : undefined;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={isActive(item.href, pathname) ? "page" : undefined}
                        className={`nav-link ${isActive(item.href, pathname) ? "active" : ""}`}
                      >
                        <i className={`hgi hgi-stroke ${item.icon} text-xl`} />
                        <span className="truncate">{item.label}</span>
                        {count ? (
                          <span className="ml-auto rounded-full bg-error px-1.5 py-px text-[11px] font-semibold text-white">
                            {count}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
