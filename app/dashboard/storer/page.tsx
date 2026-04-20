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

export default function StorerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [request, setRequest] = useState<BookingRequestData | null>(null);
  const [booking, setBooking] = useState<BookingData | null>(null);
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
        {/* Left Panel — Booking Details */}
        <div className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
          <p className="text-sm text-primary/50">Left panel — booking details coming next</p>
        </div>

        {/* Right Panel — Location & Logistics */}
        <div className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
          <p className="text-sm text-primary/50">Right panel — location &amp; logistics coming next</p>
        </div>
      </div>
    </div>
  );
}
