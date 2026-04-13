"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import SectionCard from "@/components/ui/SectionCard";
import EmptyState from "@/components/ui/EmptyState";
import StatusChip from "@/components/ui/StatusChip";
import type { BookingRequest, Booking, Payment } from "@/lib/types";

interface RequestRow extends BookingRequest {
  listings: {
    title: string;
    area: string;
    host_id: string;
    users: { name: string };
  };
}

interface BookingRow extends Booking {
  booking_requests: {
    listing_id: string;
    drop_off_date: string;
    collection_date: string;
    standard_boxes: number;
    small_bulky: number;
    large_bulky: number;
    bikes: number;
    listings: {
      title: string;
      area: string;
      users: { name: string };
    };
  };
}

interface PaymentRow extends Payment {
  bookings: {
    booking_requests: {
      listings: {
        users: { name: string };
      };
    };
  };
}

function formatItems(req: {
  standard_boxes: number;
  small_bulky: number;
  large_bulky: number;
  bikes: number;
}) {
  const parts: string[] = [];
  if (req.standard_boxes > 0) parts.push(`${req.standard_boxes} box${req.standard_boxes > 1 ? "es" : ""}`);
  if (req.small_bulky > 0) parts.push(`${req.small_bulky} small bulky`);
  if (req.large_bulky > 0) parts.push(`${req.large_bulky} large bulky`);
  if (req.bikes > 0) parts.push(`${req.bikes} bike${req.bikes > 1 ? "s" : ""}`);
  return parts.join(", ") || "No items";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function TableSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex animate-pulse gap-4">
          <div className="h-4 w-24 rounded bg-primary/10" />
          <div className="h-4 w-32 rounded bg-primary/5" />
          <div className="h-4 w-20 rounded bg-primary/5" />
          <div className="h-4 w-16 rounded bg-primary/10" />
        </div>
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-primary/10 p-4">
      <div className="flex items-start justify-between">
        <div className="h-5 w-32 rounded bg-primary/10" />
        <div className="h-6 w-20 rounded-full bg-primary/5" />
      </div>
      <div className="mt-2 h-4 w-40 rounded bg-primary/5" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-36 rounded bg-primary/5" />
        <div className="h-3 w-28 rounded bg-primary/5" />
      </div>
    </div>
  );
}

export default function StorerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const [reqResult, bookResult, payResult] = await Promise.all([
        supabase
          .from("booking_requests")
          .select(
            "*, listings(title, area, host_id, users:users!listings_host_id_fkey(name))"
          )
          .eq("storer_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("bookings")
          .select(
            "*, booking_requests!inner(listing_id, drop_off_date, collection_date, standard_boxes, small_bulky, large_bulky, bikes, storer_id, listings(title, area, users:users!listings_host_id_fkey(name)))"
          )
          .eq("booking_requests.storer_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("payments")
          .select(
            "*, bookings!inner(booking_requests!inner(storer_id, listings(users:users!listings_host_id_fkey(name))))"
          )
          .eq("bookings.booking_requests.storer_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (reqResult.error) throw reqResult.error;
      if (bookResult.error) throw bookResult.error;
      if (payResult.error) throw payResult.error;

      setRequests((reqResult.data ?? []) as RequestRow[]);
      setBookings((bookResult.data ?? []) as BookingRow[]);
      setPayments((payResult.data ?? []) as PaymentRow[]);
    } catch {
      setError("Unable to load your dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchData();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user, fetchData]);

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-64 animate-pulse rounded bg-primary/10" />
          <div className="mt-2 h-4 w-80 animate-pulse rounded bg-primary/5" />
        </div>
        <SectionCard title="My Requests">
          <TableSkeleton />
        </SectionCard>
        <SectionCard title="My Bookings">
          <div className="grid gap-4 sm:grid-cols-2">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </SectionCard>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="Sign in required"
          description="Please sign in to view your storage dashboard."
          ctaText="Sign In"
          ctaHref="/auth"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-semibold text-red-700">{error}</p>
          <button
            onClick={fetchData}
            className="mt-3 rounded-lg bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
        {requests.length === 0 ? (
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
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b border-primary/5 last:border-0"
                  >
                    <td className="py-3 pr-4 font-medium text-primary">
                      {req.listings?.users?.name ?? "Unknown"}
                    </td>
                    <td className="py-3 pr-4 text-primary/70">
                      {req.listings?.area ?? "—"}
                    </td>
                    <td className="py-3 pr-4 text-primary/70">
                      {formatItems(req)}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusChip status={req.status} />
                    </td>
                    <td className="py-3 text-primary/60">
                      {formatDate(req.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* My Bookings */}
      <SectionCard title="My Bookings" collapsible defaultOpen>
        {bookings.length === 0 ? (
          <EmptyState
            title="No active bookings"
            description="No active bookings. Browse available hosts to get started."
            ctaText="Browse Hosts"
            ctaHref="/browse"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {bookings.map((booking) => {
              const br = booking.booking_requests;
              return (
                <div
                  key={booking.id}
                  className="rounded-lg border border-primary/10 p-4"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-primary">
                      {br?.listings?.users?.name ?? "Unknown Host"}
                    </h3>
                    <StatusChip status={booking.payment_status} />
                  </div>
                  <p className="mt-1 text-sm text-primary/60">
                    {br?.listings?.area ?? "—"}
                  </p>
                  <div className="mt-3 space-y-1 text-sm text-primary/70">
                    <p>
                      <span className="font-medium text-primary/80">
                        Drop-off:
                      </span>{" "}
                      {br ? formatDate(br.drop_off_date) : "—"}
                    </p>
                    <p>
                      <span className="font-medium text-primary/80">
                        Pick-up:
                      </span>{" "}
                      {br ? formatDate(br.collection_date) : "—"}
                    </p>
                    <p>
                      <span className="font-medium text-primary/80">
                        Items:
                      </span>{" "}
                      {br ? formatItems(br) : "—"}
                    </p>
                  </div>
                </div>
              );
            })}
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
        {payments.length === 0 ? (
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
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-primary/5 last:border-0"
                  >
                    <td className="py-3 pr-4 text-primary/70">
                      {formatDate(payment.created_at)}
                    </td>
                    <td className="py-3 pr-4 font-medium text-primary">
                      {payment.bookings?.booking_requests?.listings?.users
                        ?.name ?? "Unknown"}
                    </td>
                    <td className="py-3 pr-4 text-primary/70">
                      £{payment.amount.toFixed(2)}
                    </td>
                    <td className="py-3">
                      <StatusChip
                        status={
                          payment.refund_status === "none"
                            ? "fully_paid"
                            : "refunded"
                        }
                      />
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
