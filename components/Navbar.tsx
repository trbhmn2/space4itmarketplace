"use client";

import { useState } from "react";
import Link from "next/link";

const navLinks = [
  { href: "/browse", label: "Browse" },
  { href: "#how-it-works", label: "How it Works" },
  { href: "#pricing", label: "Pricing" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 border-b border-primary/10 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-black text-white">S4</span>
          </div>
          <span className="text-xl font-black text-primary">Space4It</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-primary/60 transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/auth"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-primary/70 transition-colors hover:bg-primary/5 hover:text-primary"
          >
            Log In
          </Link>
          <Link
            href="/auth"
            className="rounded-lg bg-action px-4 py-2 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-action/90 hover:shadow-md"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/5 md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-primary/5 bg-background px-4 pb-4 pt-2 md:hidden">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-primary/70 transition-colors hover:bg-primary/5 hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 border-t border-primary/5 pt-3">
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/auth"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg border border-primary/10 py-2.5 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
              >
                Log In
              </Link>
              <Link
                href="/auth"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg bg-action py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-action/90"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
