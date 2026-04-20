"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import UnreadBadge from "@/components/UnreadBadge";

function getUserDisplay(user: { user_metadata?: Record<string, unknown>; email?: string } | null): {
  fullName: string;
  firstName: string;
  initials: string;
  isHost: boolean;
} {
  const meta = user?.user_metadata;
  const fullName = (meta?.full_name as string) || "";
  const email = user?.email || "";
  const displayName = fullName || email.split("@")[0] || "User";
  const firstName = displayName.split(" ")[0];
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";
  const isHost = meta?.role_host === true;
  return { fullName: displayName, firstName, initials, isHost };
}

const navLinks = [
  { href: "/browse", label: "Browse" },
  { href: "/#how-it-works", label: "How it Works" },
  { href: "/#pricing", label: "Pricing" },
];

export default function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const showNavLinks = pathname !== "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLoggedIn = !!user;
  const { firstName, initials, isHost } = getUserDisplay(user);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setDropdownOpen(false);
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  }

  const dashboardHref = isHost ? "/dashboard/host" : "/dashboard/storer";

  return (
    <nav className="sticky top-0 z-50 border-b border-primary/10 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-black text-white">S4</span>
          </div>
          <span className="text-xl font-black text-primary">Space4It</span>
        </Link>

        {showNavLinks && (
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-primary/60 transition-colors hover:text-primary">
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Desktop auth area */}
        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-primary/5" />
          ) : isLoggedIn ? (
            <div className="relative flex items-center gap-3" ref={dropdownRef}>
              <span className="relative">
                <Link href={dashboardHref} className="text-sm font-medium text-primary/60 transition-colors hover:text-primary">
                  Dashboard
                </Link>
                <UnreadBadge />
              </span>

              <button
                onClick={() => setDropdownOpen((p) => !p)}
                className="flex items-center gap-2 rounded-full py-1 pl-2 pr-3 transition-colors hover:bg-primary/5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {initials}
                </div>
                <span className="text-sm font-medium text-primary">{firstName}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`text-primary/40 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}>
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-primary/10 bg-white py-1 shadow-lg">
                  <Link href={dashboardHref} onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary/80 transition-colors hover:bg-primary/5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                    </svg>
                    My Dashboard
                  </Link>
                  {isHost && (
                    <Link href="/dashboard/host" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary/80 transition-colors hover:bg-primary/5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                      My Listings
                    </Link>
                  )}
                  <Link href="/browse" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary/80 transition-colors hover:bg-primary/5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    Browse Hosts
                  </Link>
                  <Link href="/dashboard/messages" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary/80 transition-colors hover:bg-primary/5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                    </svg>
                    Messages
                  </Link>
                  <div className="mx-3 my-1 border-t border-primary/5" />
                  <button onClick={handleSignOut} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-action transition-colors hover:bg-action/5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth" className="rounded-lg px-4 py-2 text-sm font-semibold text-primary/70 transition-colors hover:bg-primary/5 hover:text-primary">
                Log In
              </Link>
              <Link href="/onboarding" className="rounded-lg bg-action px-4 py-2 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-action/90 hover:shadow-md">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile: minimal landing = inline auth; otherwise hamburger */}
        {showNavLinks || isLoggedIn ? (
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/5 md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-2 md:hidden">
            <Link href="/auth" className="rounded-lg px-3 py-2 text-xs font-semibold text-primary/70 transition-colors hover:bg-primary/5 hover:text-primary sm:text-sm">
              Log In
            </Link>
            <Link href="/onboarding" className="rounded-lg bg-action px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-action/90 sm:text-sm">
              Sign Up
            </Link>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {mobileOpen && (showNavLinks || isLoggedIn) && (
        <div className="border-t border-primary/5 bg-background px-4 pb-4 pt-2 md:hidden">
          {showNavLinks && (
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-primary/70 transition-colors hover:bg-primary/5 hover:text-primary">
                  {link.label}
                </Link>
              ))}
            </div>
          )}
          <div className={showNavLinks ? "mt-3 border-t border-primary/5 pt-3" : "pt-1"}>
            {isLoggedIn ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {initials}
                  </div>
                  <span className="text-sm font-semibold text-primary">{firstName}</span>
                </div>
                <Link href={dashboardHref} onClick={() => setMobileOpen(false)} className="relative block rounded-lg px-3 py-2.5 text-sm font-medium text-primary/70 transition-colors hover:bg-primary/5 hover:text-primary">
                  Dashboard <UnreadBadge />
                </Link>
                <Link href="/dashboard/messages" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-primary/70 transition-colors hover:bg-primary/5 hover:text-primary">
                  Messages
                </Link>
                {isHost && (
                  <Link href="/dashboard/host" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-primary/70 transition-colors hover:bg-primary/5 hover:text-primary">
                    My Listings
                  </Link>
                )}
                <div className="mx-3 my-1 border-t border-primary/5" />
                <button onClick={handleSignOut} className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-action transition-colors hover:bg-action/5">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/auth" onClick={() => setMobileOpen(false)} className="rounded-lg border border-primary/10 py-2.5 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary/5">
                  Log In
                </Link>
                <Link href="/onboarding" onClick={() => setMobileOpen(false)} className="rounded-lg bg-action py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-action/90">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
