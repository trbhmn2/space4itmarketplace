"use client";

import Link from "next/link";
import SectionCard from "@/components/ui/SectionCard";
import EmptyState from "@/components/ui/EmptyState";
import StatusChip from "@/components/ui/StatusChip";
import type { Listing, BookingRequest, Booking, Payment } from "@/lib/types";

const mockListings: Listing[] = [
  {
    id: "listing-1",
    host_id: "host-1",
    title: "Spare Room on North Street",
    area: "North St, St Andrews",
    item_categories: ["boxes", "bikes"],
    capacity: 20,
    rules: "No flammable items",
    photos: [],
    availability_start: "2026-06-01",
    availability_end: "2026-09-30",
    accepts_bikes: true,
    accepts_bulky: false,
    status: "active",
    created_at: "2026-03-15",
  },
  {
    id: "listing-2",
    host_id: "host-1",
    title: "Garage Space — South Street",
    area: "South St, St Andrews",
    item_categories: ["boxes", "bulky"],
    capacity: 40,
    rules: null,
    photos: [],
    availability_start: "2026-05-20",
    availability_end: "2026-10-01",
    accepts_bikes: true,
    accepts_bulky: true,
    status: "paused",
    created_at: "2026-03-20",
  },
];

const mockIncomingRequests: (BookingRequest & { storerName: string; items: string; dates: string })[] = [
  {
    id: "req-3",
    storer_id: "user-2",
    listing_id: "listing-1",
    standard_boxes: 4,
    small_bulky: 0,
    large_bulky: 0,
    bikes: 0,
    drop_off_date: "2026-06-02",
    collection_date: "2026-09-10",
    notes: null,
    status: "pending",
    created_at: "2026-04-11",
    storerName: "Emily R.",
    items: "4 standard boxes",
    dates: "2 Jun – 10 Sep 2026",
  },
  {
    id: "req-4",
    storer_id: "user-3",
    listing_id: "listing-1",
    standard_boxes: 2,
    small_bulky: 1,
    large_bulky: 0,
    bikes: 1,
    drop_off_date: "2026-06-05",
    collection_date: "2026-09-20",
    notes: "Bike is foldable",
    status: "pending",
    created_at: "2026-04-12",
    storerName: "Tom H.",
    items: "2 boxes, 1 small bulky, 1 bike",
    dates: "5 Jun – 20 Sep 2026",
  },
];

const mockActiveBookings: (Booking & { storerName: string; items: string; dates: string })[] = [
  {
    id: "book-2",
    request_id: "req-5",
    payment_status: "deposit_paid",
    payout_status: "pending",
    confirmed_drop_off: null,
    confirmed_collection: null,
    dispute_state: "none",
    created_at: "2026-04-05",
    storerName: "Alex W.",
    items: "6 boxes, 2 small bulky",
    dates: "1 Jun – 15 Sep 2026",
  },
];

const mockPayouts: (Payment & { bookingRef: string })[] = [
  {
    id: "payout-1",
    booking_id: "book-2",
    amount: 200,
    platform_fee: 20,
    refund_status: "none",
    created_at: "2026-04-06",
    bookingRef: "BOOK-002",
  },
];

export default function HostDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary md:text-3xl">
            Host Dashboard
          </h1>
          <p className="mt-1 text-primary/60">
            Manage your listings and incoming requests
          </p>
        </div>
        <Link
          href="/listing/create"
          className="inline-flex items-center justify-center rounded-lg bg-action px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-action/90"
        >
          + Create New Listing
        </Link>
      </div>

      {/* My Listings */}
      <SectionCard title="My Listings" collapsible defaultOpen>
        {mockListings.length === 0 ? (
          <EmptyState
            title="No listings yet"
            description="You haven't created any listings yet."
            ctaText="Create Your First Listing"
            ctaHref="/listing/create"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {mockListings.map((listing) => (
              <div
                key={listing.id}
                className="rounded-lg border border-primary/10 p-4"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-primary">{listing.title}</h3>
                  <StatusChip status={listing.status === "active" ? "active" : "pending"} />
                </div>
                <p className="mt-1 text-sm text-primary/60">{listing.area}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-primary/70">
                    Capacity: {listing.capacity} items
                  </span>
                  <button
                    type="button"
                    className="rounded-md bg-primary/5 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Incoming Requests */}
      <SectionCard title="Incoming Requests" collapsible defaultOpen>
        {mockIncomingRequests.length === 0 ? (
          <EmptyState
            title="No incoming requests"
            description="No incoming requests."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-primary/10 text-xs uppercase tracking-wider text-primary/50">
                  <th className="pb-3 pr-4 font-semibold">Storer</th>
                  <th className="pb-3 pr-4 font-semibold">Items</th>
                  <th className="pb-3 pr-4 font-semibold">Dates</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockIncomingRequests.map((req) => (
                  <tr key={req.id} className="border-b border-primary/5 last:border-0">
                    <td className="py-3 pr-4 font-medium text-primary">{req.storerName}</td>
                    <td className="py-3 pr-4 text-primary/70">{req.items}</td>
                    <td className="py-3 pr-4 text-primary/70">{req.dates}</td>
                    <td className="py-3 pr-4">
                      <StatusChip status={req.status} />
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-md bg-green-500 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-green-600"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          className="rounded-md bg-red-500 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-red-600"
                        >
                          Decline
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Active Bookings */}
      <SectionCard title="Active Bookings" collapsible defaultOpen>
        {mockActiveBookings.length === 0 ? (
          <EmptyState
            title="No active bookings"
            description="No active bookings."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {mockActiveBookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-lg border border-primary/10 p-4"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-primary">{booking.storerName}</h3>
                  <StatusChip status={booking.payment_status} />
                </div>
                <div className="mt-3 space-y-1 text-sm text-primary/70">
                  <p>
                    <span className="font-medium text-primary/80">Items:</span>{" "}
                    {booking.items}
                  </p>
                  <p>
                    <span className="font-medium text-primary/80">Dates:</span>{" "}
                    {booking.dates}
                  </p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent/90"
                  >
                    Confirm Drop-off
                  </button>
                  <button
                    type="button"
                    className="rounded-md bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                  >
                    Confirm Collection
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Payout Status */}
      <SectionCard title="Payout Status" collapsible defaultOpen={false}>
        {mockPayouts.length === 0 ? (
          <EmptyState
            title="No payouts yet"
            description="No payouts yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-primary/10 text-xs uppercase tracking-wider text-primary/50">
                  <th className="pb-3 pr-4 font-semibold">Booking Ref</th>
                  <th className="pb-3 pr-4 font-semibold">Amount</th>
                  <th className="pb-3 pr-4 font-semibold">Platform Fee</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {mockPayouts.map((payout) => (
                  <tr key={payout.id} className="border-b border-primary/5 last:border-0">
                    <td className="py-3 pr-4 font-medium text-primary">{payout.bookingRef}</td>
                    <td className="py-3 pr-4 text-primary/70">£{payout.amount.toFixed(2)}</td>
                    <td className="py-3 pr-4 text-primary/70">£{payout.platform_fee.toFixed(2)}</td>
                    <td className="py-3 pr-4">
                      <StatusChip status="paid" />
                    </td>
                    <td className="py-3 text-primary/60">{payout.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
