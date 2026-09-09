import type { Metadata, Viewport } from "next";
import { DM_Sans, Urbanist } from "next/font/google";

import AdminShell from "@/components/layout/AdminShell";
import "@/styles/globals.css";

const urbanist = Urbanist({ subsets: ["latin"], display: "swap", variable: "--font-urbanist-src" });
const dmSans = DM_Sans({ subsets: ["latin"], display: "swap", variable: "--font-dm-sans-src" });

export const metadata: Metadata = {
  title: { default: "Drive 2 Retail — Admin", template: "%s | D2R Admin" },
  description: "Operations dashboard for Drive 2 Retail Limited.",
  icons: { icon: "/assets/images/favicon.png", apple: "/assets/images/apple-touch-icon.png" },
  robots: { index: false, follow: false },  // internal tool, never indexed
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${urbanist.variable} ${dmSans.variable}`}>
      <body>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
