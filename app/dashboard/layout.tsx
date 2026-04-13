"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const storerLinks: NavItem[] = [
  {
    label: "My Requests",
    href: "/dashboard/storer",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    label: "My Bookings",
    href: "/dashboard/storer#bookings",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: "Messages",
    href: "/dashboard/storer#messages",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: "Payments",
    href: "/dashboard/storer#payments",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
];

const hostLinks: NavItem[] = [
  {
    label: "My Listings",
    href: "/dashboard/host",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "Requests",
    href: "/dashboard/host#requests",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <polyline points="17 11 19 13 23 9" />
      </svg>
    ),
  },
  {
    label: "Bookings",
    href: "/dashboard/host#bookings",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: "Payouts",
    href: "/dashboard/host#payouts",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

function SidebarLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        isActive
          ? "bg-accent/10 text-accent"
          : "text-primary/60 hover:bg-primary/5 hover:text-primary"
      }`}
    >
      <span className={isActive ? "text-accent" : "text-primary/40"}>
        {item.icon}
      </span>
      {item.label}
    </Link>
  );
}

function BottomNavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
        isActive ? "text-accent" : "text-primary/50"
      }`}
    >
      <span className={isActive ? "text-accent" : "text-primary/40"}>
        {item.icon}
      </span>
      {item.label}
    </Link>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHost = pathname.startsWith("/dashboard/host");
  const isStorer = pathname.startsWith("/dashboard/storer");

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-7xl">
        {/* Desktop sidebar */}
        <aside className="sticky top-[57px] hidden h-[calc(100vh-57px)] w-64 shrink-0 overflow-y-auto border-r border-primary/10 bg-white p-4 md:block">
          {/* Storer section */}
          <div className="mb-6">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-primary/40">
              Storer
            </p>
            <nav className="space-y-1">
              {storerLinks.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  isActive={isStorer && item.href === "/dashboard/storer" ? pathname === "/dashboard/storer" : false}
                />
              ))}
            </nav>
          </div>

          {/* Divider */}
          <div className="mb-6 border-t border-primary/10" />

          {/* Host section */}
          <div>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-primary/40">
              Host
            </p>
            <nav className="space-y-1">
              {hostLinks.map((item) => (
                <SidebarLink
                  key={item.href}
                  item={item}
                  isActive={isHost && item.href === "/dashboard/host" ? pathname === "/dashboard/host" : false}
                />
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-primary/10 bg-white px-2 py-2 md:hidden">
        <div className="flex items-center justify-around">
          {(isHost ? hostLinks : storerLinks).map((item) => {
            const active = isHost
              ? item.href === "/dashboard/host" && pathname === "/dashboard/host"
              : item.href === "/dashboard/storer" && pathname === "/dashboard/storer";
            return (
              <BottomNavLink key={item.href} item={item} isActive={active} />
            );
          })}
        </div>
      </nav>
    </div>
  );
}
