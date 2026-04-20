"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase";
import type { BookingRequest } from "@/lib/types";
import ItemCounter from "@/components/ui/ItemCounter";
import { useModificationStatus } from "./useModificationStatus";

const PRICES = {
  standard_boxes: 24,
  small_bulky: 36,
  large_bulky: 48,
  bikes: 30,
} as const;

const LABELS: Record<keyof typeof PRICES, string> = {
  standard_boxes: "Standard Boxes",
  small_bulky: "Small Bulky Items",
  large_bulky: "Large Bulky Items",
  bikes: "Bikes",
};

type ItemKey = keyof typeof PRICES;
const ITEM_KEYS: ItemKey[] = ["standard_boxes", "small_bulky", "large_bulky", "bikes"];

interface ModifyStorageNeedsProps {
  bookingRequest: BookingRequest;
  onUpdate: () => void;
}

function computeTotal(counts: Record<ItemKey, number>): number {
  return ITEM_KEYS.reduce((sum, key) => sum + counts[key] * PRICES[key], 0);
}

export default function ModifyStorageNeeds({
  bookingRequest,
  onUpdate,
}: ModifyStorageNeedsProps) {
  const supabase = useMemo(() => createClient(), []);

  const originalCounts: Record<ItemKey, number> = useMemo(
    () => ({
      standard_boxes: bookingRequest.standard_boxes,
      small_bulky: bookingRequest.small_bulky,
      large_bulky: bookingRequest.large_bulky,
      bikes: bookingRequest.bikes,
    }),
    [bookingRequest]
  );

  const { state: modState, pendingRequest } = useModificationStatus({
    bookingRequest,
    notesFilter: "Modification request: updated storage needs",
    onApproved: onUpdate,
  });

  const [editing, setEditing] = useState(false);
  const [editCounts, setEditCounts] = useState<Record<ItemKey, number>>(originalCounts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPending = modState === "pending";
  const showReadonly = !editing;

  const handleEdit = () => {
    setEditCounts({ ...originalCounts });
    setError(null);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditCounts({ ...originalCounts });
    setError(null);
    setEditing(false);
  };

  const handleCountChange = (key: ItemKey, value: number) => {
    setEditCounts((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase
      .from("booking_requests")
      .insert({
        storer_id: bookingRequest.storer_id,
        listing_id: bookingRequest.listing_id,
        standard_boxes: editCounts.standard_boxes,
        small_bulky: editCounts.small_bulky,
        large_bulky: editCounts.large_bulky,
        bikes: editCounts.bikes,
        drop_off_date: bookingRequest.drop_off_date,
        collection_date: bookingRequest.collection_date,
        status: "pending",
        notes: "Modification request: updated storage needs",
      });

    setLoading(false);

    if (insertError) {
      setError(insertError.message ?? "Failed to submit modification request.");
      return;
    }

    setEditing(false);
    onUpdate();
  };

  const editTotal = computeTotal(editCounts);
  const originalTotal = computeTotal(originalCounts);

  return (
    <section className="rounded-2xl border border-primary/10 bg-white p-5 transition-all sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-primary sm:text-lg">Storage Needs</h3>
        {showReadonly && !isPending && (
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
        <div className="space-y-3">
          {ITEM_KEYS.map((key) => (
            <ItemCounter
              key={key}
              label={LABELS[key]}
              price={PRICES[key]}
              count={editCounts[key]}
              onChange={(val) => handleCountChange(key, val)}
            />
          ))}

          <div className="mt-4 flex items-center justify-between border-t border-primary/10 pt-4">
            <span className="text-sm font-semibold text-primary">Total Cost</span>
            <span className="text-lg font-bold text-action">£{editTotal}</span>
          </div>

          {error && <p className="text-sm text-action">{error}</p>}

          <div className="mt-4 flex items-center gap-3">
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
          {ITEM_KEYS.map((key) => {
            const originalVal = originalCounts[key];
            const pendingVal = pendingRequest?.[key];
            const changed = isPending && pendingVal !== undefined && pendingVal !== originalVal;

            return (
              <div
                key={key}
                className="flex items-center justify-between rounded-xl border border-primary/10 bg-primary/[0.02] px-4 py-3"
              >
                <span className="text-sm font-semibold text-primary">{LABELS[key]}</span>
                <div className="text-right">
                  {changed ? (
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-sm text-primary/40 line-through">
                        {originalVal} × £{PRICES[key]}
                      </span>
                      <span className="text-sm font-semibold text-action">
                        Pending request: {pendingVal}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-primary/70">
                      {originalVal} × £{PRICES[key]}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          <div className="mt-4 flex items-center justify-between border-t border-primary/10 pt-4">
            <span className="text-sm font-semibold text-primary">Total Cost</span>
            <span className="text-lg font-bold text-action">£{originalTotal}</span>
          </div>

          {isPending && (
            <div className="mt-4 rounded-xl bg-action/10 px-4 py-3">
              <p className="text-sm font-semibold text-action">
                Modification request submitted — waiting for host approval
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
