"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase";
import type { BookingRequest } from "@/lib/types";

interface HostOption {
  listing_id: string;
  host_name: string;
  area: string;
  availability_start: string;
  availability_end: string;
}

interface ChangeHostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBookingRequest: BookingRequest;
  onHostChanged: () => void;
}

const REASON_MIN = 10;
const REASON_MAX = 200;

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ChangeHostModal({
  isOpen,
  onClose,
  currentBookingRequest,
  onHostChanged,
}: ChangeHostModalProps) {
  const supabase = useMemo(() => createClient(), []);
  const backdropRef = useRef<HTMLDivElement>(null);

  const [hosts, setHosts] = useState<HostOption[]>([]);
  const [selectedListingId, setSelectedListingId] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingHosts, setFetchingHosts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setSelectedListingId("");
    setReason("");
    setError(null);

    const fetchHosts = async () => {
      setFetchingHosts(true);
      const { data, error: fetchError } = await supabase
        .from("listings")
        .select("id, area, availability_start, availability_end, users!listings_host_id_fkey(name)")
        .eq("status", "active")
        .neq("id", currentBookingRequest.listing_id);

      setFetchingHosts(false);

      if (fetchError || !data) {
        setError("Failed to load available hosts.");
        return;
      }

      interface ListingRow {
        id: string;
        area: string;
        availability_start: string;
        availability_end: string;
        users: { name: string } | { name: string }[];
      }

      const options: HostOption[] = (data as ListingRow[]).map((listing) => {
        const hostUser = Array.isArray(listing.users) ? listing.users[0] : listing.users;
        return {
          listing_id: listing.id,
          host_name: hostUser?.name ?? "Unknown Host",
          area: listing.area,
          availability_start: listing.availability_start,
          availability_end: listing.availability_end,
        };
      });

      setHosts(options);
    };

    fetchHosts();
  }, [isOpen, supabase, currentBookingRequest.listing_id]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const canSubmit =
    selectedListingId !== "" && reason.length >= REASON_MIN && reason.length <= REASON_MAX;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    const { error: cancelError } = await supabase
      .from("booking_requests")
      .update({
        status: "cancelled",
        notes: `User changed host: ${reason}`,
      })
      .eq("id", currentBookingRequest.id);

    if (cancelError) {
      setLoading(false);
      setError("Failed to cancel current booking. Please try again.");
      return;
    }

    const { error: insertError } = await supabase
      .from("booking_requests")
      .insert({
        storer_id: currentBookingRequest.storer_id,
        listing_id: selectedListingId,
        standard_boxes: currentBookingRequest.standard_boxes,
        small_bulky: currentBookingRequest.small_bulky,
        large_bulky: currentBookingRequest.large_bulky,
        bikes: currentBookingRequest.bikes,
        drop_off_date: currentBookingRequest.drop_off_date,
        collection_date: currentBookingRequest.collection_date,
        status: "pending",
        notes: `Host change request: ${reason}`,
      });

    setLoading(false);

    if (insertError) {
      setError("Failed to create new booking request. Please try again.");
      return;
    }

    onHostChanged();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-[4px]"
    >
      <div className="w-full max-w-[520px] rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <h2 className="text-xl font-bold text-primary">Change Host</h2>
        <p className="mt-1 text-sm text-primary/60">
          Select a new host and provide a reason for the change.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="host-select"
              className="mb-1.5 block text-sm font-semibold text-primary"
            >
              New Host
            </label>
            {fetchingHosts ? (
              <div className="flex items-center gap-2 rounded-lg border border-primary/10 px-4 py-2.5">
                <svg
                  className="h-4 w-4 animate-spin text-primary/40"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm text-primary/40">Loading hosts...</span>
              </div>
            ) : (
              <select
                id="host-select"
                value={selectedListingId}
                onChange={(e) => setSelectedListingId(e.target.value)}
                className="w-full rounded-lg border border-primary/10 bg-white px-4 py-2.5 text-sm text-primary outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
              >
                <option value="">Select a host...</option>
                {hosts.map((host) => (
                  <option key={host.listing_id} value={host.listing_id}>
                    {host.host_name} — {host.area} (Available:{" "}
                    {formatShortDate(host.availability_start)} –{" "}
                    {formatShortDate(host.availability_end)})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label
              htmlFor="change-reason"
              className="mb-1.5 block text-sm font-semibold text-primary"
            >
              Reason for Change
            </label>
            <textarea
              id="change-reason"
              rows={3}
              maxLength={REASON_MAX}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Brief reason for changing host"
              className="w-full resize-none rounded-lg border border-primary/10 bg-white px-4 py-2.5 text-sm text-primary outline-none transition-colors placeholder:text-primary/30 focus:border-accent focus:ring-1 focus:ring-accent"
            />
            <div className="mt-1 flex items-center justify-between">
              {reason.length > 0 && reason.length < REASON_MIN && (
                <p className="text-xs text-action">
                  Minimum {REASON_MIN} characters required
                </p>
              )}
              <span className="ml-auto text-xs text-primary/40">
                {reason.length}/{REASON_MAX}
              </span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-action">{error}</p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="flex w-full items-center justify-center rounded-xl bg-action px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-action/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <svg
                className="h-5 w-5 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              "Send Request"
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="mx-auto block text-sm font-semibold text-primary/60 transition-colors hover:text-primary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
