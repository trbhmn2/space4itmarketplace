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
  hostName: string;
  hostPhotoUrl: string | null;
  availabilityStart: string;
  availabilityEnd: string;
  acceptsBulky: boolean;
  onBookingConfirmed: () => void;
}

const PRICES = {
  standardBoxes: 24,
  smallBulky: 13,
  largeBulky: 32,
};

export default function BookingModal({
  isOpen,
  onClose,
  listingTitle,
  listingId,
  hostId,
  hostName,
  hostPhotoUrl,
  availabilityStart,
  availabilityEnd,
  acceptsBulky,
  onBookingConfirmed,
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
  const [errorMessage, setErrorMessage] = useState("");
  const [selfBookError, setSelfBookError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setSelfBookError(false);
      setErrorMessage("");
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const resetForm = useCallback(() => {
    setStandardBoxes(0);
    setSmallBulky(0);
    setLargeBulky(0);
    setDropOffDate("");
    setPickUpDate("");
    setNotes("");
    setSubmitting(false);
    setErrorMessage("");
    setSelfBookError(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  if (!isOpen) return null;

  const total =
    standardBoxes * PRICES.standardBoxes +
    smallBulky * PRICES.smallBulky +
    largeBulky * PRICES.largeBulky;

  const deposit = Math.ceil(total * 0.2);
  const balance = total - deposit;
  const hasItems = standardBoxes + smallBulky + largeBulky > 0;
  const canBook = hasItems && dropOffDate !== "" && pickUpDate !== "";

  const handleBook = async () => {
    if (!canBook) return;

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

      resetForm();
      onClose();
      onBookingConfirmed();
    } catch {
      setErrorMessage(
        "Something went wrong while submitting your request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const hostInitials = hostName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[4px] md:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl transition-all duration-300 md:max-w-3xl md:rounded-2xl lg:max-w-4xl">
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

        {/* Two-panel layout */}
        <div className="flex flex-col md:flex-row">
          {/* LEFT PANEL — Listing Details */}
          <div className="border-b border-primary/10 bg-primary/[0.02] px-5 py-5 md:w-2/5 md:border-b-0 md:border-r md:px-6 md:py-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary/40">
              Listing Details
            </h3>

            {/* Host */}
            <div className="mb-5 flex items-center gap-3">
              {hostPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={hostPhotoUrl}
                  alt={hostName}
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {hostInitials}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-primary">{hostName}</p>
                <p className="text-xs text-primary/50">Host</p>
              </div>
            </div>

            {/* Drop-off date range */}
            <div className="mb-4">
              <p className="mb-1 text-xs font-semibold text-primary/60">
                Drop-off Window
              </p>
              <div className="flex items-center gap-2 text-sm text-primary">
                <svg
                  className="h-4 w-4 shrink-0 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                  />
                </svg>
                <span>{formatDate(availabilityStart)}</span>
              </div>
            </div>

            {/* Pick-up date range */}
            <div className="mb-4">
              <p className="mb-1 text-xs font-semibold text-primary/60">
                Pick-up Window
              </p>
              <div className="flex items-center gap-2 text-sm text-primary">
                <svg
                  className="h-4 w-4 shrink-0 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                  />
                </svg>
                <span>{formatDate(availabilityEnd)}</span>
              </div>
            </div>

            {/* Large Bulk indicator */}
            {acceptsBulky && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent">
                <svg
                  className="h-3.5 w-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Accepts Large Bulky Items
              </div>
            )}
          </div>

          {/* RIGHT PANEL — Confirm Your Booking */}
          <div className="flex-1 px-5 py-5 md:px-6 md:py-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-primary/40">
              Confirm Your Booking
            </h3>

            <div className="space-y-5">
              {/* Self-booking error */}
              {selfBookError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  You cannot book your own listing.
                </div>
              )}

              {/* Submission error */}
              {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              {/* Item Counters */}
              <div>
                <p className="mb-2 text-xs font-semibold text-primary/60">
                  Select Items
                </p>
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

              {/* Notes */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-primary/60">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions for the host?"
                  rows={2}
                  className="w-full resize-none rounded-xl border border-primary/10 bg-primary/[0.02] px-3 py-2.5 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>

              {/* Price Summary */}
              {hasItems && (
                <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
                  <div className="space-y-1.5 text-sm">
                    {standardBoxes > 0 && (
                      <div className="flex justify-between text-primary/70">
                        <span>{standardBoxes}&times; Standard Boxes</span>
                        <span>&pound;{standardBoxes * PRICES.standardBoxes}</span>
                      </div>
                    )}
                    {smallBulky > 0 && (
                      <div className="flex justify-between text-primary/70">
                        <span>{smallBulky}&times; Small Bulky</span>
                        <span>&pound;{smallBulky * PRICES.smallBulky}</span>
                      </div>
                    )}
                    {largeBulky > 0 && (
                      <div className="flex justify-between text-primary/70">
                        <span>{largeBulky}&times; Large Bulky</span>
                        <span>&pound;{largeBulky * PRICES.largeBulky}</span>
                      </div>
                    )}
                    <div className="border-t border-accent/20 pt-2">
                      <div className="flex justify-between font-bold text-primary">
                        <span>Total</span>
                        <span>&pound;{total}</span>
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
                      20% deposit (&pound;{deposit}) due before drop-off. Remaining
                      80% (&pound;{balance}) due before pick-up.
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
                disabled={!canBook || submitting}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-sm transition-all duration-200 ${
                  canBook
                    ? "bg-action text-white hover:bg-action/90 hover:shadow-md"
                    : "cursor-not-allowed bg-gray-300 text-gray-500"
                }`}
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
                    Submitting&hellip;
                  </>
                ) : canBook ? (
                  `Book Now — £${total}`
                ) : (
                  "Select items & dates to continue"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
