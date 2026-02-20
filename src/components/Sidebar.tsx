"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    section: "Overview",
    items: [
      {
        href: "/",
        label: "Dashboard",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
      },
      {
        href: "/stablecoins",
        label: "Stablecoins",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v12M15 9.5H10.5a2.5 2.5 0 000 5H14a2.5 2.5 0 010 5H9" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "Visualizations",
    items: [
      {
        href: "/globe",
        label: "Globe",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
          </svg>
        ),
      },
      {
        href: "/map",
        label: "Issuer Map",
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
            <path d="M8 2v16M16 6v16" />
          </svg>
        ),
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-[312px] border-r border-[#E2E8F0] bg-white flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" opacity="0.9" />
              <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold text-black">
            Solana Stables
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-6">
        {NAV_ITEMS.map((group) => (
          <div key={group.section}>
            <div className="section-header mb-2">{group.section}</div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-link ${isActive ? "active" : ""}`}
                  >
                    <span className={`flex-shrink-0 w-[20px] h-[20px] transition-colors ${isActive ? "text-[#4F46E5]" : "text-[#94A3B8]"}`}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#E2E8F0] px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
          <span className="text-[12px] text-[#64748B] font-medium">
            Live Data
          </span>
        </div>
        <div className="mt-1.5 text-[11px] text-[#94A3B8] leading-relaxed">
          Powered by TopLedger Analytics
        </div>
      </div>
    </aside>
  );
}
