"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import type { BookingRequest } from "@/lib/types";

type ModificationState = "idle" | "pending" | "approved";

interface UseModificationStatusOptions {
  bookingRequest: BookingRequest;
  notesFilter: string;
  onApproved: () => void;
  pollIntervalMs?: number;
}

interface UseModificationStatusResult {
  state: ModificationState;
  pendingRequest: BookingRequest | null;
  refresh: () => Promise<void>;
}

export function useModificationStatus({
  bookingRequest,
  notesFilter,
  onApproved,
  pollIntervalMs = 10000,
}: UseModificationStatusOptions): UseModificationStatusResult {
  const supabase = useMemo(() => createClient(), []);

  const [state, setState] = useState<ModificationState>("idle");
  const [pendingRequest, setPendingRequest] = useState<BookingRequest | null>(null);

  const check = useCallback(async () => {
    const { data } = await supabase
      .from("booking_requests")
      .select("*")
      .eq("storer_id", bookingRequest.storer_id)
      .eq("listing_id", bookingRequest.listing_id)
      .in("status", ["pending", "accepted"])
      .ilike("notes", `%${notesFilter}%`)
      .gt("created_at", bookingRequest.created_at)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!data || data.length === 0) {
      setState("idle");
      setPendingRequest(null);
      return;
    }

    const latest = data[0] as BookingRequest;

    if (latest.status === "pending") {
      setState("pending");
      setPendingRequest(latest);
    } else if (latest.status === "accepted") {
      setState("approved");
      setPendingRequest(null);
      onApproved();
    }
  }, [supabase, bookingRequest, notesFilter, onApproved]);

  useEffect(() => {
    check();
  }, [check]);

  useEffect(() => {
    if (state !== "pending") return;

    const interval = setInterval(check, pollIntervalMs);
    return () => clearInterval(interval);
  }, [state, check, pollIntervalMs]);

  return { state, pendingRequest, refresh: check };
}
