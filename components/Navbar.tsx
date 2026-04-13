"use client";

import { useState } from "react";
import Link from "next/link";

interface NavbarProps {
  isLoggedIn?: boolean;
  userName?: string;
}

function UserInitials({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
      {initials}
    </div>
  );
}

export default function Navbar({ isLoggedIn = false, userName = "" }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-primary/10 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="text-xl font-black tracking-tight text-primary">
          Space4It
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 text-sm font-medium text-primary/70 md:flex">
          <Link href="/browse" className="transition-colors hover:text-primary">
            Browse
          </Link>
          <Link href="/#how-it-works" className="transition-colors hover:text-primary">
            How it Works
          </Link>
          <Link href="/#pricing" className="transition-colors hover:text-primary">
            Pricing
          </Link>

          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/storer"
                className="transition-colors hover:text-primary"
              >
                Dashboard
              </Link>
              <UserInitials name={userName || "User"} />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth"
                className="rounded-lg px-4 py-2 text-primary transition-colors hover:bg-primary/5"
              >
                Login
              </Link>
              <Link
                href="/auth"
                className="rounded-lg bg-action px-4 py-2 font-semibold text-white transition-colors hover:bg-action/90"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/5 md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile slide-down menu */}
      {mobileOpen && (
        <div className="border-t border-primary/10 bg-white px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-3 text-sm font-medium text-primary/70">
            <Link href="/browse" className="py-2 transition-colors hover:text-primary" onClick={() => setMobileOpen(false)}>
              Browse
            </Link>
            <Link href="/#how-it-works" className="py-2 transition-colors hover:text-primary" onClick={() => setMobileOpen(false)}>
              How it Works
            </Link>
            <Link href="/#pricing" className="py-2 transition-colors hover:text-primary" onClick={() => setMobileOpen(false)}>
              Pricing
            </Link>

            {isLoggedIn ? (
              <>
                <Link href="/dashboard/storer" className="py-2 transition-colors hover:text-primary" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 py-2">
                  <UserInitials name={userName || "User"} />
                  <span className="text-primary">{userName}</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href="/auth"
                  className="rounded-lg px-4 py-2 text-center text-primary transition-colors hover:bg-primary/5"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth"
                  className="rounded-lg bg-action px-4 py-2 text-center font-semibold text-white transition-colors hover:bg-action/90"
                  onClick={() => setMobileOpen(false)}
                >
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
