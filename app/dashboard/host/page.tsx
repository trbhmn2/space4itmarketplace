"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import SectionCard from "@/components/ui/SectionCard";
import EmptyState from "@/components/ui/EmptyState";
import StatusChip from "@/components/ui/StatusChip";
import type { Listing, BookingRequest, Booking, Payment } from "@/lib/types";

interface RequestRow extends BookingRequest {
  listings: { title: string };
  users: { name: string };
}

interface BookingRow extends Booking {
  booking_requests: {
    storer_id: string;
    drop_off_date: string;
    collection_date: string;
    standard_boxes: number;
    small_bulky: number;
    large_bulky: number;
    bikes: number;
    users: { name: string };
  };
}

interface PaymentRow extends Payment {
  bookings: {
    id: string;
    booking_requests: {
      listings: { title: string };
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

function formatDateRange(start: string, end: string) {
  const s = new Date(start).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
  const e = new Date(end).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${s} – ${e}`;
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

export default function HostDashboard() {
  const { user, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [listings, setListings] = useState<Listing[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [payouts, setPayouts] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data: myListings, error: listErr } = await supabase
        .from("listings")
        .select("*")
        .eq("host_id", user.id)
        .order("created_at", { ascending: false });

      if (listErr) throw listErr;

      const listingIds = (myListings ?? []).map((l: Listing) => l.id);

      if (listingIds.length === 0) {
        setListings(myListings ?? []);
        setRequests([]);
        setBookings([]);
        setPayouts([]);
        setLoading(false);
        return;
      }

      const [reqResult, bookResult, payResult] = await Promise.all([
        supabase
          .from("booking_requests")
          .select("*, listings(title), users:users!booking_requests_storer_id_fkey(name)")
          .in("listing_id", listingIds)
          .order("created_at", { ascending: false }),
        supabase
          .from("bookings")
          .select(
            "*, booking_requests!inner(storer_id, drop_off_date, collection_date, standard_boxes, small_bulky, large_bulky, bikes, listing_id, users:users!booking_requests_storer_id_fkey(name))"
          )
          .in("booking_requests.listing_id", listingIds)
          .order("created_at", { ascending: false }),
        supabase
          .from("payments")
          .select(
            "*, bookings!inner(id, booking_requests!inner(listing_id, listings(title)))"
          )
          .in("bookings.booking_requests.listing_id", listingIds)
          .order("created_at", { ascending: false }),
      ]);

      if (reqResult.error) throw reqResult.error;
      if (bookResult.error) throw bookResult.error;
      if (payResult.error) throw payResult.error;

      setListings(myListings ?? []);
      setRequests((reqResult.data ?? []) as RequestRow[]);
      setBookings((bookResult.data ?? []) as BookingRow[]);
      setPayouts((payResult.data ?? []) as PaymentRow[]);
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

  const handleRequestAction = useCallback(
    async (requestId: string, newStatus: "accepted" | "declined") => {
      setActionLoading(requestId);
      try {
        const { error: updateErr } = await supabase
          .from("booking_requests")
          .update({ status: newStatus })
          .eq("id", requestId);

        if (updateErr) throw updateErr;

        setRequests((prev) =>
          prev.map((r) =>
            r.id === requestId ? { ...r, status: newStatus } : r
          )
        );
      } catch {
        alert(`Failed to ${newStatus} request. Please try again.`);
      } finally {
        setActionLoading(null);
      }
    },
    [supabase]
  );

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-8 w-48 animate-pulse rounded bg-primary/10" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-primary/5" />
          </div>
          <div className="h-10 w-40 animate-pulse rounded-lg bg-primary/5" />
        </div>
        <SectionCard title="My Listings">
          <div className="grid gap-4 sm:grid-cols-2">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </SectionCard>
        <SectionCard title="Incoming Requests">
          <TableSkeleton />
        </SectionCard>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="Sign in required"
          description="Please sign in to view your host dashboard."
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
        {listings.length === 0 ? (
          <EmptyState
            title="No listings yet"
            description="You haven't created any listings yet."
            ctaText="Create Your First Listing"
            ctaHref="/listing/create"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="rounded-lg border border-primary/10 p-4"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-primary">
                    {listing.title}
                  </h3>
                  <StatusChip
                    status={listing.status === "active" ? "active" : "pending"}
                  />
                </div>
                <p className="mt-1 text-sm text-primary/60">{listing.area}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-primary/70">
                    Capacity: {listing.capacity} items
                  </span>
                  <Link
                    href={`/listing/${listing.id}`}
                    className="rounded-md bg-primary/5 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Incoming Requests */}
      <SectionCard title="Incoming Requests" collapsible defaultOpen>
        {requests.length === 0 ? (
          <EmptyState
            title="No incoming requests"
            description="No incoming requests yet."
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
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b border-primary/5 last:border-0"
                  >
                    <td className="py-3 pr-4 font-medium text-primary">
                      {req.users?.name ?? "Unknown"}
                    </td>
                    <td className="py-3 pr-4 text-primary/70">
                      {formatItems(req)}
                    </td>
                    <td className="py-3 pr-4 text-primary/70">
                      {formatDateRange(req.drop_off_date, req.collection_date)}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusChip status={req.status} />
                    </td>
                    <td className="py-3">
                      {req.status === "pending" ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={actionLoading === req.id}
                            onClick={() =>
                              handleRequestAction(req.id, "accepted")
                            }
                            className="rounded-md bg-green-500 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-50"
                          >
                            {actionLoading === req.id
                              ? "..."
                              : "Accept"}
                          </button>
                          <button
                            type="button"
                            disabled={actionLoading === req.id}
                            onClick={() =>
                              handleRequestAction(req.id, "declined")
                            }
                            className="rounded-md bg-red-500 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                          >
                            {actionLoading === req.id
                              ? "..."
                              : "Decline"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-primary/40">—</span>
                      )}
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
        {bookings.length === 0 ? (
          <EmptyState
            title="No active bookings"
            description="No active bookings yet."
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
                      {br?.users?.name ?? "Unknown"}
                    </h3>
                    <StatusChip status={booking.payment_status} />
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-primary/70">
                    <p>
                      <span className="font-medium text-primary/80">
                        Items:
                      </span>{" "}
                      {br ? formatItems(br) : "—"}
                    </p>
                    <p>
                      <span className="font-medium text-primary/80">
                        Dates:
                      </span>{" "}
                      {br
                        ? formatDateRange(
                            br.drop_off_date,
                            br.collection_date
                          )
                        : "—"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Payout Status */}
      <SectionCard title="Payout Status" collapsible defaultOpen={false}>
        {payouts.length === 0 ? (
          <EmptyState
            title="No payouts yet"
            description="No payouts yet."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-primary/10 text-xs uppercase tracking-wider text-primary/50">
                  <th className="pb-3 pr-4 font-semibold">Listing</th>
                  <th className="pb-3 pr-4 font-semibold">Amount</th>
                  <th className="pb-3 pr-4 font-semibold">Platform Fee</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr
                    key={payout.id}
                    className="border-b border-primary/5 last:border-0"
                  >
                    <td className="py-3 pr-4 font-medium text-primary">
                      {payout.bookings?.booking_requests?.listings?.title ??
                        "—"}
                    </td>
                    <td className="py-3 pr-4 text-primary/70">
                      £{payout.amount.toFixed(2)}
                    </td>
                    <td className="py-3 pr-4 text-primary/70">
                      £{payout.platform_fee.toFixed(2)}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusChip status="paid" />
                    </td>
                    <td className="py-3 text-primary/60">
                      {formatDate(payout.created_at)}
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
