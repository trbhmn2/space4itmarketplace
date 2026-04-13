"use client";

import SectionCard from "@/components/ui/SectionCard";
import EmptyState from "@/components/ui/EmptyState";
import StatusChip from "@/components/ui/StatusChip";
import type { BookingRequest, Booking, Payment } from "@/lib/types";

const mockRequests: (BookingRequest & { hostName: string; location: string; items: string })[] = [
  {
    id: "req-1",
    storer_id: "user-1",
    listing_id: "listing-1",
    standard_boxes: 3,
    small_bulky: 0,
    large_bulky: 0,
    bikes: 1,
    drop_off_date: "2026-06-01",
    collection_date: "2026-09-15",
    notes: null,
    status: "pending",
    created_at: "2026-04-10",
    hostName: "Sarah M.",
    location: "North St, St Andrews",
    items: "3 boxes, 1 bike",
  },
  {
    id: "req-2",
    storer_id: "user-1",
    listing_id: "listing-2",
    standard_boxes: 5,
    small_bulky: 1,
    large_bulky: 0,
    bikes: 0,
    drop_off_date: "2026-06-05",
    collection_date: "2026-09-20",
    notes: "Fragile items",
    status: "accepted",
    created_at: "2026-04-08",
    hostName: "James K.",
    location: "South St, St Andrews",
    items: "5 boxes, 1 small bulky",
  },
];

const mockBookings: (Booking & { hostName: string; location: string; items: string; dropOff: string; collection: string })[] = [
  {
    id: "book-1",
    request_id: "req-2",
    payment_status: "deposit_paid",
    payout_status: "pending",
    confirmed_drop_off: null,
    confirmed_collection: null,
    dispute_state: "none",
    created_at: "2026-04-09",
    hostName: "James K.",
    location: "South St, St Andrews",
    items: "5 boxes, 1 small bulky",
    dropOff: "5 Jun 2026",
    collection: "20 Sep 2026",
  },
];

const mockPayments: (Payment & { hostName: string })[] = [
  {
    id: "pay-1",
    booking_id: "book-1",
    amount: 120,
    platform_fee: 12,
    refund_status: "none",
    created_at: "2026-04-09",
    hostName: "James K.",
  },
];

export default function StorerDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary md:text-3xl">
          My Storage Dashboard
        </h1>
        <p className="mt-1 text-primary/60">
          Manage your storage requests and bookings
        </p>
      </div>

      {/* My Requests */}
      <SectionCard title="My Requests" collapsible defaultOpen>
        {mockRequests.length === 0 ? (
          <EmptyState
            title="No requests yet"
            description="You haven't made any storage requests yet."
            ctaText="Browse Hosts"
            ctaHref="/browse"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-primary/10 text-xs uppercase tracking-wider text-primary/50">
                  <th className="pb-3 pr-4 font-semibold">Host</th>
                  <th className="pb-3 pr-4 font-semibold">Location</th>
                  <th className="pb-3 pr-4 font-semibold">Items</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {mockRequests.map((req) => (
                  <tr key={req.id} className="border-b border-primary/5 last:border-0">
                    <td className="py-3 pr-4 font-medium text-primary">{req.hostName}</td>
                    <td className="py-3 pr-4 text-primary/70">{req.location}</td>
                    <td className="py-3 pr-4 text-primary/70">{req.items}</td>
                    <td className="py-3 pr-4">
                      <StatusChip status={req.status} />
                    </td>
                    <td className="py-3 text-primary/60">{req.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* My Bookings */}
      <SectionCard title="My Bookings" collapsible defaultOpen>
        {mockBookings.length === 0 ? (
          <EmptyState
            title="No active bookings"
            description="No active bookings. Browse available hosts to get started."
            ctaText="Browse Hosts"
            ctaHref="/browse"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {mockBookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-lg border border-primary/10 p-4"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-primary">{booking.hostName}</h3>
                  <StatusChip status={booking.payment_status} />
                </div>
                <p className="mt-1 text-sm text-primary/60">{booking.location}</p>
                <div className="mt-3 space-y-1 text-sm text-primary/70">
                  <p>
                    <span className="font-medium text-primary/80">Drop-off:</span>{" "}
                    {booking.dropOff}
                  </p>
                  <p>
                    <span className="font-medium text-primary/80">Pick-up:</span>{" "}
                    {booking.collection}
                  </p>
                  <p>
                    <span className="font-medium text-primary/80">Items:</span>{" "}
                    {booking.items}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Messages */}
      <SectionCard title="Messages" collapsible defaultOpen={false}>
        <EmptyState
          title="No messages yet"
          description="Messages will appear here once you start a booking."
        />
      </SectionCard>

      {/* Payment Receipts */}
      <SectionCard title="Payment Receipts" collapsible defaultOpen={false}>
        {mockPayments.length === 0 ? (
          <EmptyState
            title="No payment history"
            description="No payment history yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-primary/10 text-xs uppercase tracking-wider text-primary/50">
                  <th className="pb-3 pr-4 font-semibold">Date</th>
                  <th className="pb-3 pr-4 font-semibold">Host</th>
                  <th className="pb-3 pr-4 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-primary/5 last:border-0">
                    <td className="py-3 pr-4 text-primary/70">{payment.created_at}</td>
                    <td className="py-3 pr-4 font-medium text-primary">{payment.hostName}</td>
                    <td className="py-3 pr-4 text-primary/70">£{payment.amount.toFixed(2)}</td>
                    <td className="py-3">
                      <StatusChip status={payment.refund_status === "none" ? "fully_paid" : "refunded"} />
                    </td>
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
