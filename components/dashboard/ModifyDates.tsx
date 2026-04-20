"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase";
import type { BookingRequest } from "@/lib/types";
import { useModificationStatus } from "./useModificationStatus";

interface ModifyDatesProps {
  bookingRequest: BookingRequest;
  onUpdate: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function toInputDate(iso: string): string {
  return iso.slice(0, 10);
}

export default function ModifyDates({
  bookingRequest,
  onUpdate,
}: ModifyDatesProps) {
  const supabase = useMemo(() => createClient(), []);

  const { state: modState, pendingRequest } = useModificationStatus({
    bookingRequest,
    notesFilter: "Modification request: updated dates",
    onApproved: onUpdate,
  });

  const [editing, setEditing] = useState(false);
  const [dropOff, setDropOff] = useState(toInputDate(bookingRequest.drop_off_date));
  const [collection, setCollection] = useState(toInputDate(bookingRequest.collection_date));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isPending = modState === "pending";

  const handleEdit = () => {
    setDropOff(toInputDate(bookingRequest.drop_off_date));
    setCollection(toInputDate(bookingRequest.collection_date));
    setError(null);
    setValidationError(null);
    setEditing(true);
  };

  const handleCancel = () => {
    setError(null);
    setValidationError(null);
    setEditing(false);
  };

  const validate = (): boolean => {
    if (!dropOff || !collection) {
      setValidationError("Both dates are required.");
      return false;
    }
    if (collection <= dropOff) {
      setValidationError("Pick-up date must be after drop-off date.");
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase
      .from("booking_requests")
      .insert({
        storer_id: bookingRequest.storer_id,
        listing_id: bookingRequest.listing_id,
        standard_boxes: bookingRequest.standard_boxes,
        small_bulky: bookingRequest.small_bulky,
        large_bulky: bookingRequest.large_bulky,
        bikes: bookingRequest.bikes,
        drop_off_date: dropOff,
        collection_date: collection,
        status: "pending",
        notes: "Modification request: updated dates",
      });

    setLoading(false);

    if (insertError) {
      setError(insertError.message ?? "Failed to submit date modification request.");
      return;
    }

    setEditing(false);
    onUpdate();
  };

  const originalDropOff = bookingRequest.drop_off_date;
  const originalCollection = bookingRequest.collection_date;
  const pendingDropOff = pendingRequest?.drop_off_date;
  const pendingCollection = pendingRequest?.collection_date;
  const dropOffChanged =
    isPending &&
    pendingDropOff !== undefined &&
    toInputDate(pendingDropOff) !== toInputDate(originalDropOff);
  const collectionChanged =
    isPending &&
    pendingCollection !== undefined &&
    toInputDate(pendingCollection) !== toInputDate(originalCollection);

  return (
    <section className="rounded-2xl border border-primary/10 bg-white p-5 transition-all sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-primary sm:text-lg">Dates</h3>
        {!editing && !isPending && (
          <button
            type="button"
            onClick={handleEdit}
            className="text-sm font-semibold text-action transition-colors hover:text-action/80"
          >
            Modify
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="modify-dropoff"
              className="mb-1.5 block text-sm font-semibold text-primary"
            >
              Drop-off Date
            </label>
            <input
              id="modify-dropoff"
              type="date"
              value={dropOff}
              onChange={(e) => {
                setDropOff(e.target.value);
                setValidationError(null);
              }}
              className="w-full rounded-lg border border-primary/10 bg-primary/[0.02] px-4 py-2.5 text-sm text-primary outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label
              htmlFor="modify-collection"
              className="mb-1.5 block text-sm font-semibold text-primary"
            >
              Pick-up Date
            </label>
            <input
              id="modify-collection"
              type="date"
              value={collection}
              onChange={(e) => {
                setCollection(e.target.value);
                setValidationError(null);
              }}
              className="w-full rounded-lg border border-primary/10 bg-primary/[0.02] px-4 py-2.5 text-sm text-primary outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          {validationError && <p className="text-sm text-action">{validationError}</p>}
          {error && <p className="text-sm text-action">{error}</p>}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center justify-center rounded-xl bg-action px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-action/90 disabled:opacity-60"
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
                "Submit Request"
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="text-sm font-semibold text-primary/60 transition-colors hover:text-primary"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-primary/10 bg-primary/[0.02] px-4 py-3">
            <span className="text-sm font-semibold text-primary">Drop-off</span>
            <div className="text-right">
              {dropOffChanged ? (
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-sm text-primary/40 line-through">
                    {formatDate(originalDropOff)}
                  </span>
                  <span className="text-sm font-semibold text-action">
                    Pending request: {formatDate(pendingDropOff!)}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-primary/70">
                  {formatDate(originalDropOff)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-primary/10 bg-primary/[0.02] px-4 py-3">
            <span className="text-sm font-semibold text-primary">Pick-up</span>
            <div className="text-right">
              {collectionChanged ? (
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-sm text-primary/40 line-through">
                    {formatDate(originalCollection)}
                  </span>
                  <span className="text-sm font-semibold text-action">
                    Pending request: {formatDate(pendingCollection!)}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-primary/70">
                  {formatDate(originalCollection)}
                </span>
              )}
            </div>
          </div>

          {isPending && (
            <div className="mt-4 rounded-xl bg-action/10 px-4 py-3">
              <p className="text-sm font-semibold text-action">
                Date modification request submitted — waiting for host approval
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
