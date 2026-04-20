"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import EmptyState from "@/components/ui/EmptyState";

interface HostInfo {
  name: string;
  photo_url: string | null;
  verified: boolean;
  phone: string | null;
  email: string;
}

interface ListingInfo {
  id: string;
  title: string;
  area: string;
  photos: string[];
  rules: string | null;
}

interface BookingRequestData {
  id: string;
  storer_id: string;
  listing_id: string;
  standard_boxes: number;
  small_bulky: number;
  large_bulky: number;
  bikes: number;
  drop_off_date: string;
  collection_date: string;
  notes: string | null;
  status: string;
  created_at: string;
  listings: ListingInfo & {
    host_id: string;
    users: HostInfo;
  };
}

interface BookingData {
  id: string;
  request_id: string;
  payment_status: string;
  created_at: string;
}

const PRICES = {
  standard_boxes: 24,
  small_bulky: 13,
  large_bulky: 32,
} as const;

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-56 animate-pulse rounded-lg bg-primary/10" />
      <div className="grid gap-6 lg:grid-cols-[1fr_0.82fr]">
        <div className="animate-pulse rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10" />
              <div className="space-y-2">
                <div className="h-5 w-32 rounded bg-primary/10" />
                <div className="h-4 w-24 rounded bg-primary/5" />
              </div>
            </div>
            <div className="h-px bg-primary/10" />
            <div className="space-y-3">
              <div className="h-4 w-48 rounded bg-primary/5" />
              <div className="h-4 w-40 rounded bg-primary/5" />
              <div className="h-4 w-36 rounded bg-primary/5" />
            </div>
            <div className="h-px bg-primary/10" />
            <div className="space-y-2">
              <div className="h-4 w-44 rounded bg-primary/5" />
              <div className="h-4 w-44 rounded bg-primary/5" />
            </div>
          </div>
        </div>
        <div className="animate-pulse rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
          <div className="h-40 rounded-lg bg-primary/5" />
          <div className="mt-4 space-y-3">
            <div className="h-4 w-56 rounded bg-primary/5" />
            <div className="h-4 w-48 rounded bg-primary/5" />
            <div className="h-4 w-40 rounded bg-primary/5" />
          </div>
          <div className="mt-6 h-12 rounded-lg bg-primary/10" />
        </div>
      </div>
    </div>
  );
}

interface LeftPanelProps {
  request: BookingRequestData;
}

function LeftPanel({ request }: LeftPanelProps) {
  const host = request.listings.users;
  const listing = request.listings;

  const standardTotal = request.standard_boxes * PRICES.standard_boxes;
  const smallBulkyTotal = request.small_bulky * PRICES.small_bulky;
  const largeBulkyTotal = request.large_bulky * PRICES.large_bulky;
  const totalCost = standardTotal + smallBulkyTotal + largeBulkyTotal;

  return (
    <div className="rounded-xl border border-primary/10 bg-white shadow-sm">
      {/* Host Information */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {host.photo_url ? (
              <img
                src={host.photo_url}
                alt={host.name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {getInitials(host.name)}
              </div>
            )}
            <div>
              <h3 className="font-bold text-primary">{host.name}</h3>
              {host.verified && (
                <span className="mt-0.5 inline-block rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-white">
                  Verified Student Host
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => console.log("Change Host clicked — modal placeholder for Agent 4")}
            className="text-sm font-semibold text-action hover:text-action/80"
          >
            Change Host
          </button>
        </div>
        <p className="mt-2 text-sm text-primary/60">{listing.title}</p>
      </div>

      <div className="mx-6 border-t border-primary/10" />

      {/* Storage Needs */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <h4 className="text-sm font-bold uppercase tracking-wider text-primary/50">
            Storage Needs
          </h4>
          <button
            type="button"
            onClick={() => console.log("Modify storage needs — modal placeholder for Agent 4")}
            className="text-sm font-semibold text-action hover:text-action/80"
          >
            Modify
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {request.standard_boxes > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-primary/70">
                Standard Boxes: {request.standard_boxes} × £{PRICES.standard_boxes}
              </span>
              <span className="font-medium text-primary">£{standardTotal}</span>
            </div>
          )}
          {request.small_bulky > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-primary/70">
                Small Bulky: {request.small_bulky} × £{PRICES.small_bulky}
              </span>
              <span className="font-medium text-primary">£{smallBulkyTotal}</span>
            </div>
          )}
          {request.large_bulky > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-primary/70">
                Large Bulky: {request.large_bulky} × £{PRICES.large_bulky}
              </span>
              <span className="font-medium text-primary">£{largeBulkyTotal}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-primary/10 pt-2">
            <span className="text-sm font-bold text-primary">Total Cost</span>
            <span className="text-lg font-bold text-action">£{totalCost}</span>
          </div>
        </div>
      </div>

      <div className="mx-6 border-t border-primary/10" />

      {/* Storage Dates */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <h4 className="text-sm font-bold uppercase tracking-wider text-primary/50">
            Storage Dates
          </h4>
          <button
            type="button"
            onClick={() => console.log("Modify dates — modal placeholder for Agent 4")}
            className="text-sm font-semibold text-action hover:text-action/80"
          >
            Modify
          </button>
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary/40"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="text-primary/60">Drop-off:</span>
            <span className="font-medium text-primary">
              {formatDate(request.drop_off_date)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary/40"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="text-primary/60">Pick-up:</span>
            <span className="font-medium text-primary">
              {formatDate(request.collection_date)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RightPanelLockedProps {
  request: BookingRequestData;
  booking: BookingData | null;
  onPaymentComplete: () => void;
}

function RightPanelLocked({ request, booking, onPaymentComplete }: RightPanelLockedProps) {
  const [processing, setProcessing] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const standardTotal = request.standard_boxes * PRICES.standard_boxes;
  const smallBulkyTotal = request.small_bulky * PRICES.small_bulky;
  const largeBulkyTotal = request.large_bulky * PRICES.large_bulky;
  const totalCost = standardTotal + smallBulkyTotal + largeBulkyTotal;
  const deposit = Math.ceil(totalCost * 0.2);
  const balance = totalCost - deposit;

  async function handlePayment() {
    if (!booking) return;
    setProcessing(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const { error } = await supabase
      .from("bookings")
      .update({ payment_status: "paid" })
      .eq("id", booking.id);

    if (error) {
      console.error("Payment update failed:", error);
      setProcessing(false);
      return;
    }

    setProcessing(false);
    onPaymentComplete();
  }

  return (
    <div className="rounded-xl border border-primary/10 bg-white shadow-sm">
      {/* Blurred placeholder */}
      <div className="relative overflow-hidden rounded-t-xl">
        <div className="h-48 w-full bg-gradient-to-br from-accent/30 via-primary/15 to-action/20 blur-[12px]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-white/80 p-3 backdrop-blur-sm">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary/60"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-6">
        {/* Info box */}
        <div className="rounded-lg border border-primary/10 bg-primary/[0.03] p-4">
          <div className="flex items-start gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 shrink-0 text-primary/50"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <p className="text-sm leading-relaxed text-primary/70">
              Complete your payment to unlock precise location, access directions, and host contact information.
            </p>
          </div>
        </div>

        {/* Locked bullet list */}
        <ul className="space-y-2.5">
          {[
            "Exact address and directions",
            "Host phone number and email",
            "Detailed access instructions",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-sm text-primary/40">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              {item}
            </li>
          ))}
        </ul>

        <div className="border-t border-primary/10" />

        {/* Total Amount */}
        <div className="text-center">
          <p className="text-sm text-primary/50">Total Amount</p>
          <p className="text-3xl font-bold text-action">£{totalCost}</p>
        </div>

        {/* Pay with Stripe button */}
        <button
          type="button"
          onClick={handlePayment}
          disabled={processing || !booking}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-action px-6 py-3.5 text-base font-bold text-white transition-colors hover:bg-action/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {processing ? (
            <>
              <svg
                className="h-5 w-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing…
            </>
          ) : (
            "Pay with Stripe"
          )}
        </button>

        {/* Payment split note */}
        <p className="text-center text-xs text-primary/40">
          *Pay 20% (£{deposit}) before drop-off and 80% (£{balance}) before pick-up
        </p>
      </div>
    </div>
  );
}

export default function StorerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [request, setRequest] = useState<BookingRequestData | null>(null);
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data: reqData, error: reqError } = await supabase
        .from("booking_requests")
        .select(
          "id, storer_id, listing_id, standard_boxes, small_bulky, large_bulky, bikes, drop_off_date, collection_date, notes, status, created_at, listings(id, title, area, photos, rules, host_id, users:users!listings_host_id_fkey(name, photo_url, verified, phone, email))"
        )
        .eq("storer_id", user.id)
        .in("status", ["confirmed", "accepted", "active", "collection_due"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (reqError && reqError.code !== "PGRST116") {
        throw reqError;
      }

      if (!reqData) {
        setRequest(null);
        setBooking(null);
        setLoading(false);
        return;
      }

      setRequest(reqData as unknown as BookingRequestData);

      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .select("id, request_id, payment_status, created_at")
        .eq("request_id", reqData.id)
        .limit(1)
        .single();

      if (bookingError && bookingError.code !== "PGRST116") {
        throw bookingError;
      }

      if (bookingData) {
        setBooking(bookingData as BookingData);
        setIsPaid(bookingData.payment_status === "paid" || bookingData.payment_status === "fully_paid");
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
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
    return <DashboardSkeleton />;
  }

  if (!user) {
    return (
      <EmptyState
        title="Sign in required"
        description="Please sign in to view your storage dashboard."
        ctaText="Sign In"
        ctaHref="/auth"
      />
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-semibold text-red-700">{error}</p>
        <button
          onClick={fetchData}
          className="mt-3 rounded-lg bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-primary md:text-3xl">
          User Dashboard
        </h1>
        <EmptyState
          title="No bookings yet"
          description="Browse hosts to find your perfect storage match."
          ctaText="Browse Hosts"
          ctaHref="/browse"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary md:text-3xl">
        User Dashboard
      </h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.82fr]">
        <LeftPanel request={request} />

        {!isPaid ? (
          <RightPanelLocked
            request={request}
            booking={booking}
            onPaymentComplete={() => setIsPaid(true)}
          />
        ) : (
          <div className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
            <p className="text-sm text-primary/50">Unlocked state coming next</p>
          </div>
        )}
      </div>
    </div>
  );
}
