import Link from "next/link";
import type { ListingWithHost } from "@/lib/types";

interface ListingCardProps {
  listing: ListingWithHost;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const host = listing.users;
  const initials = host.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const startDate = new Date(listing.availability_start).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "short" }
  );
  const endDate = new Date(listing.availability_end).toLocaleDateString(
    "en-GB",
    { day: "numeric", month: "short", year: "numeric" }
  );

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-36 bg-gradient-to-br from-accent/20 to-primary/10">
        <div className="absolute -bottom-6 left-4 flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-white bg-primary text-lg font-bold text-white shadow-md">
          {initials}
        </div>
        {host.verified && (
          <div className="absolute right-3 top-3 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white">
            Verified
          </div>
        )}
      </div>

      <div className="px-4 pb-4 pt-8">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold text-primary">
              {listing.title}
            </h3>
            <p className="flex items-center gap-1 text-sm text-primary/50">
              <svg
                className="h-3.5 w-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>
              {listing.area}
            </p>
          </div>
        </div>

        <p className="mt-1 text-xs text-primary/40">
          Hosted by {host.name}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-primary/50">
          <span className="flex items-center gap-1">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
              />
            </svg>
            Up to {listing.capacity} items
          </span>
          <span className="text-primary/20">|</span>
          <span>
            {startDate} — {endDate}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {listing.item_categories.includes("boxes") && (
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
              Boxes
            </span>
          )}
          {listing.accepts_bulky && (
            <span className="rounded-full bg-primary/5 px-2 py-0.5 text-[10px] font-semibold text-primary/60">
              Bulky Items
            </span>
          )}
          {listing.accepts_bikes && (
            <span className="rounded-full bg-primary/5 px-2 py-0.5 text-[10px] font-semibold text-primary/60">
              Bikes
            </span>
          )}
        </div>

        <div className="mt-4 w-full rounded-lg border border-primary/10 bg-primary/[0.03] py-2.5 text-center text-sm font-semibold text-primary transition-all duration-200 group-hover:bg-primary group-hover:text-white">
          View Details
        </div>
      </div>
    </Link>
  );
}
