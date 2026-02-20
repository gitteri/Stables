"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/globe", label: "Globe" },
    { href: "/map", label: "Map" },
    { href: "/stablecoins", label: "Stablecoins" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-sol-border bg-sol-darker/80 backdrop-blur-xl">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sol-purple to-sol-green flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" opacity="0.9" />
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-lg font-bold gradient-text">
              Solana Stables
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-sol-purple/20 text-sol-purple"
                      : "text-sol-text-muted hover:text-sol-text hover:bg-sol-card"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Live indicator */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sol-card border border-sol-border">
              <div className="w-2 h-2 rounded-full bg-sol-green pulse-glow" />
              <span className="text-xs text-sol-text-muted">Live on Solana</span>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-sol-text-muted hover:bg-sol-card"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <>
                  <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" strokeLinejoin="round" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-sol-border mt-2 pt-4">
            {links.map((link) => {
              const isActive = pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-sol-purple/20 text-sol-purple"
                      : "text-sol-text-muted hover:text-sol-text hover:bg-sol-card"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
