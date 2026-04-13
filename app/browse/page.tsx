"use client";

import { useState } from "react";
import ListingCard from "@/components/ListingCard";

interface Host {
  id: string;
  hostName: string;
  area: string;
  capacity: number;
  rating: number;
  pricePerBox: number;
}

const mockHosts: Host[] = [
  {
    id: "1",
    hostName: "Emma Wilson",
    area: "South Street",
    capacity: 12,
    rating: 4.9,
    pricePerBox: 24,
  },
  {
    id: "2",
    hostName: "James Murray",
    area: "North Street",
    capacity: 8,
    rating: 4.7,
    pricePerBox: 22,
  },
  {
    id: "3",
    hostName: "Sofia Chen",
    area: "Market Street",
    capacity: 15,
    rating: 5.0,
    pricePerBox: 26,
  },
  {
    id: "4",
    hostName: "Lucas Brown",
    area: "The Scores",
    capacity: 6,
    rating: 4.5,
    pricePerBox: 20,
  },
  {
    id: "5",
    hostName: "Olivia Stewart",
    area: "Hepburn Gardens",
    capacity: 10,
    rating: 4.8,
    pricePerBox: 24,
  },
  {
    id: "6",
    hostName: "Noah Patel",
    area: "Argyle Street",
    capacity: 20,
    rating: 4.6,
    pricePerBox: 18,
  },
];

const areas = [
  "All Areas",
  "South Street",
  "North Street",
  "Market Street",
  "The Scores",
  "Hepburn Gardens",
  "Argyle Street",
];

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("All Areas");

  const filteredHosts = mockHosts.filter((host) => {
    const matchesSearch =
      host.hostName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      host.area.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea =
      selectedArea === "All Areas" || host.area === selectedArea;
    return matchesSearch && matchesArea;
  });

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary md:text-4xl">
            Browse Hosts
          </h1>
          <p className="mt-2 text-primary/60">
            Find a trusted local host to store your belongings in St Andrews.
          </p>
        </div>

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
              placeholder="Search by host name or area..."
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
          {filteredHosts.length}{" "}
          {filteredHosts.length === 1 ? "host" : "hosts"} available
        </p>

        {/* Host Grid */}
        {filteredHosts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredHosts.map((host) => (
              <ListingCard key={host.id} {...host} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/5">
              <svg
                className="h-8 w-8 text-primary/30"
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
            </div>
            <h3 className="text-lg font-bold text-primary">No hosts found</h3>
            <p className="mt-1 text-sm text-primary/50">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
