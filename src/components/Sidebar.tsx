"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: "/stablecoins",
    label: "Stablecoins",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    href: "/globe",
    label: "Globe",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    href: "/map",
    label: "Map",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
        <line x1="8" y1="2" x2="8" y2="18" />
        <line x1="16" y1="6" x2="16" y2="22" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-0 h-full w-[60px] bg-sol-card border-r border-sol-border z-50 flex flex-col items-center py-4 gap-1">
      <Link href="/" className="w-9 h-9 rounded-lg bg-gradient-to-br from-sol-purple to-sol-green flex items-center justify-center mb-4 flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <circle cx="12" cy="12" r="10" fillOpacity="0.8" />
          <path d="M8 12h8M12 8v8" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </Link>
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
              active
                ? "bg-sol-purple/20 text-sol-purple"
                : "text-sol-text-muted hover:text-sol-text hover:bg-sol-card-hover"
            }`}
          >
            {item.icon}
          </Link>
        );
      })}
    </nav>
  );
}
