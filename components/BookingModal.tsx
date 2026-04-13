"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ItemCounter from "./ui/ItemCounter";
import { useAuth } from "./AuthProvider";
import { createClient } from "@/lib/supabase";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingTitle: string;
  listingId: string;
  hostId: string;
}

const PRICES = {
  standardBoxes: 24,
  smallBulky: 13,
  largeBulky: 32,
};

type ModalView = "form" | "success" | "error";

export default function BookingModal({
  isOpen,
  onClose,
  listingTitle,
  listingId,
  hostId,
}: BookingModalProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [standardBoxes, setStandardBoxes] = useState(0);
  const [smallBulky, setSmallBulky] = useState(0);
  const [largeBulky, setLargeBulky] = useState(0);
  const [dropOffDate, setDropOffDate] = useState("");
  const [pickUpDate, setPickUpDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [view, setView] = useState<ModalView>("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [selfBookError, setSelfBookError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setView("form");
      setSelfBookError(false);
      setErrorMessage("");
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (view !== "success") return;
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [view, onClose]);

  const resetForm = useCallback(() => {
    setStandardBoxes(0);
    setSmallBulky(0);
    setLargeBulky(0);
    setDropOffDate("");
    setPickUpDate("");
    setNotes("");
    setSubmitting(false);
    setView("form");
    setErrorMessage("");
    setSelfBookError(false);
  }, []);

  if (!isOpen) return null;

  const total =
    standardBoxes * PRICES.standardBoxes +
    smallBulky * PRICES.smallBulky +
    largeBulky * PRICES.largeBulky;

  const deposit = Math.ceil(total * 0.2);
  const balance = total - deposit;
  const hasItems = standardBoxes + smallBulky + largeBulky > 0;

  const handleBook = async () => {
    if (!user) {
      onClose();
      router.push(`/auth?redirect=/listing/${listingId}`);
      return;
    }

    if (user.id === hostId) {
      setSelfBookError(true);
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const supabase = createClient();
      const threadId = crypto.randomUUID();

      const { error } = await supabase.from("booking_requests").insert({
        storer_id: user.id,
        listing_id: listingId,
        thread_id: threadId,
        standard_boxes: standardBoxes,
        small_bulky: smallBulky,
        large_bulky: largeBulky,
        bikes: 0,
        drop_off_date: dropOffDate,
        collection_date: pickUpDate,
        notes: notes.trim() || null,
        status: "pending",
      });

      if (error) throw error;

      setView("success");
    } catch {
      setView("error");
      setErrorMessage(
        "Something went wrong while submitting your request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (view === "success") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm md:items-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl md:max-w-lg md:rounded-2xl">
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-primary">
              Booking request sent!
            </h2>
            <p className="mt-2 text-sm text-primary/60">
              The host will review your request and get back to you soon.
            </p>
            <button
              onClick={() => {
                handleClose();
                router.push("/dashboard/storer");
              }}
              className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90"
            >
              View My Requests
            </button>
            <p className="mt-3 text-xs text-primary/40">
              This window will close automatically
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (view === "error") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm md:items-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl md:max-w-lg md:rounded-2xl">
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-primary">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-primary/60">{errorMessage}</p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setView("form")}
                className="rounded-xl bg-action px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-action/90"
              >
                Try Again
              </button>
              <button
                onClick={handleClose}
                className="rounded-xl bg-primary/10 px-6 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm md:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl md:max-w-lg md:rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-primary/10 bg-white px-5 py-4 md:px-6">
          <div>
            <h2 className="text-lg font-bold text-primary">Book Storage</h2>
            <p className="text-sm text-primary/50">{listingTitle}</p>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-primary/40 transition-colors hover:bg-primary/5 hover:text-primary"
            aria-label="Close modal"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-6 px-5 py-5 md:px-6">
          {/* Self-booking error */}
          {selfBookError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              You cannot book your own listing.
            </div>
          )}

          {/* Item Counters */}
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-primary/40">
              Select Items
            </h3>
            <div className="space-y-2">
              <ItemCounter
                label="Standard Boxes"
                price={PRICES.standardBoxes}
                count={standardBoxes}
                onChange={setStandardBoxes}
              />
              <ItemCounter
                label="Small Bulky Items"
                price={PRICES.smallBulky}
                count={smallBulky}
                onChange={setSmallBulky}
              />
              <ItemCounter
                label="Large Bulky Items"
                price={PRICES.largeBulky}
                count={largeBulky}
                onChange={setLargeBulky}
              />
            </div>
          </div>

          {/* Dates */}
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-primary/40">
              Schedule
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-primary/60">
                  Drop-off Date
                </label>
                <input
                  type="date"
                  value={dropOffDate}
                  onChange={(e) => setDropOffDate(e.target.value)}
                  className="w-full rounded-xl border border-primary/10 bg-primary/[0.02] px-3 py-2.5 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-primary/60">
                  Pick-up Date
                </label>
                <input
                  type="date"
                  value={pickUpDate}
                  onChange={(e) => setPickUpDate(e.target.value)}
                  min={dropOffDate}
                  className="w-full rounded-xl border border-primary/10 bg-primary/[0.02] px-3 py-2.5 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-primary/40">
              Notes
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions for the host? (optional)"
              rows={3}
              className="w-full resize-none rounded-xl border border-primary/10 bg-primary/[0.02] px-3 py-2.5 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          {/* Price Summary */}
          {hasItems && (
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
              <div className="space-y-1.5 text-sm">
                {standardBoxes > 0 && (
                  <div className="flex justify-between text-primary/70">
                    <span>
                      {standardBoxes}× Standard Boxes
                    </span>
                    <span>£{standardBoxes * PRICES.standardBoxes}</span>
                  </div>
                )}
                {smallBulky > 0 && (
                  <div className="flex justify-between text-primary/70">
                    <span>
                      {smallBulky}× Small Bulky
                    </span>
                    <span>£{smallBulky * PRICES.smallBulky}</span>
                  </div>
                )}
                {largeBulky > 0 && (
                  <div className="flex justify-between text-primary/70">
                    <span>
                      {largeBulky}× Large Bulky
                    </span>
                    <span>£{largeBulky * PRICES.largeBulky}</span>
                  </div>
                )}
                <div className="border-t border-accent/20 pt-2">
                  <div className="flex justify-between font-bold text-primary">
                    <span>Total</span>
                    <span>£{total}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Note */}
          <div className="flex gap-2 rounded-xl bg-primary/[0.03] px-4 py-3">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-accent"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              />
            </svg>
            <div className="text-xs leading-relaxed text-primary/60">
              <span className="font-semibold text-primary/80">
                Reserve now, pay later.
              </span>{" "}
              {hasItems ? (
                <>
                  20% deposit (£{deposit}) due before drop-off. Remaining 80%
                  (£{balance}) due before pick-up.
                </>
              ) : (
                <>
                  20% deposit due before drop-off. Remaining 80% due before
                  pick-up.
                </>
              )}
            </div>
          </div>

          {/* Book Button */}
          <button
            onClick={handleBook}
            disabled={!hasItems || !dropOffDate || !pickUpDate || submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-action py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-action/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
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
                Submitting…
              </>
            ) : hasItems ? (
              `Book Now — £${total}`
            ) : (
              "Select items to continue"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
