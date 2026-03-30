"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/admin/statistics", label: "Statistics", icon: "◆" },
  { href: "/admin/market-reports", label: "Report Builder", icon: "◧" },
  { href: "/admin/reports", label: "Custom Builder", icon: "◇" },
  { href: "/admin/report-products", label: "Report Catalog", icon: "▣" },
  { href: "/admin/users", label: "User Management", icon: "⊙" },
  { href: "/admin/payments", label: "Payments", icon: "◇" },
  { href: "/admin/report-logs", label: "Report Logs", icon: "▥" },
  { href: "/admin/prompts", label: "Prompt Editor", icon: "✦" },
  { href: "/admin/audit", label: "Audit Log", icon: "▤" },
  { href: "/admin/review", label: "Review Queue", icon: "◎" },
  { href: "/admin/insights", label: "Quality", icon: "◈" },
  { href: "/admin/cron", label: "Cron Jobs", icon: "⟳" },
  { href: "/admin/config", label: "Config", icon: "⚙" },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav style={{ flex: 1, padding: "16px 0" }}>
      {NAV_LINKS.map((link) => {
        const active =
          pathname === link.href ||
          (link.href !== "/admin" && pathname.startsWith(`${link.href}/`));
        return (
          <Link
            key={link.href}
            href={link.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 20px",
              fontFamily: "var(--font-mono, 'DM Mono')",
              fontSize: 12,
              color: active ? "#e8b96a" : "#a0a8c0",
              textDecoration: "none",
              transition: "color 0.15s, background 0.15s",
              letterSpacing: "0.05em",
              background: active ? "rgba(200,135,58,0.08)" : "transparent",
            }}
          >
            <span style={{ color: "#c8873a", width: 16, textAlign: "center" }}>
              {link.icon}
            </span>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
