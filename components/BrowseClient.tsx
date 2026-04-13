"use client";

import { useState, useMemo } from "react";
import ListingCard from "@/components/ListingCard";
import EmptyState from "@/components/ui/EmptyState";
import type { ListingWithHost } from "@/lib/types";

interface BrowseClientProps {
  listings: ListingWithHost[];
}

export default function BrowseClient({ listings }: BrowseClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("All Areas");

  const areas = useMemo(() => {
    const unique = Array.from(new Set(listings.map((l) => l.area))).sort();
    return ["All Areas", ...unique];
  }, [listings]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return listings.filter((listing) => {
      const matchesSearch =
        !q ||
        listing.title.toLowerCase().includes(q) ||
        listing.area.toLowerCase().includes(q) ||
        listing.users.name.toLowerCase().includes(q);
      const matchesArea =
        selectedArea === "All Areas" || listing.area === selectedArea;
      return matchesSearch && matchesArea;
    });
  }, [listings, searchQuery, selectedArea]);

  return (
    <>
      {/* Search & Filter Bar */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/30"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by title, host, or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-primary/10 bg-white py-3 pl-10 pr-4 text-sm text-primary shadow-sm transition-colors placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          className="rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm text-primary shadow-sm transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        >
          {areas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>

      {/* Results Count */}
      <p className="mb-4 text-sm text-primary/50">
        {filtered.length} {filtered.length === 1 ? "listing" : "listings"}{" "}
        available
      </p>

      {/* Listings Grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No listings found"
          description="Try adjusting your search or filter criteria."
          icon={
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          }
        />
      )}
    </>
  );
}
