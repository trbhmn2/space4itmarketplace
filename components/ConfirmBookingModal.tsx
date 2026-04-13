"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

interface ConfirmBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  threadId: string;
  details: {
    hostName: string;
    items: string;
    dropOffDate: string;
    collectionDate: string;
  };
  onConfirm: () => void;
}

export default function ConfirmBookingModal({
  isOpen,
  onClose,
  requestId,
  threadId,
  details,
  onConfirm,
}: ConfirmBookingModalProps) {
  const { user } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setError("");
      setSuccess(false);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!user) return;
    setConfirming(true);
    setError("");

    try {
      const supabase = createClient();

      const { data: booking, error: fetchError } = await supabase
        .from("bookings")
        .select("id")
        .eq("request_id", requestId)
        .single();

      if (fetchError || !booking) {
        throw new Error("Could not find booking record");
      }

      const { error: bookingUpdateError } = await supabase
        .from("bookings")
        .update({ payment_status: "reserved" })
        .eq("id", booking.id);

      if (bookingUpdateError) throw bookingUpdateError;

      const { error: requestUpdateError } = await supabase
        .from("booking_requests")
        .update({ status: "confirmed" })
        .eq("id", requestId);

      if (requestUpdateError) throw requestUpdateError;

      const { error: messageError } = await supabase.from("messages").insert({
        thread_id: threadId,
        sender_id: user.id,
        booking_request_id: requestId,
        content: "Booking confirmed! Drop-off details will follow.",
        moderation_flag: false,
      });

      if (messageError) throw messageError;

      setSuccess(true);
      setTimeout(() => {
        onConfirm();
        onClose();
      }, 2000);
    } catch {
      setError(
        "Something went wrong while confirming your booking. Please try again."
      );
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm md:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl md:max-w-lg md:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary/10 px-5 py-4 md:px-6">
          <h2 className="text-lg font-bold text-primary">
            Confirm Your Booking
          </h2>
          <button
            onClick={onClose}
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

        <div className="space-y-5 px-5 py-5 md:px-6">
          {success ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-7 w-7 text-green-600"
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
              <h3 className="text-lg font-bold text-primary">
                Booking Confirmed!
              </h3>
              <p className="mt-1 text-sm text-primary/60">
                Drop-off details will follow shortly.
              </p>
            </div>
          ) : (
            <>
              {/* Booking Details */}
              <div className="rounded-xl border border-primary/10 bg-primary/[0.02] p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-primary/60">Host</span>
                    <span className="font-medium text-primary">
                      {details.hostName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary/60">Items</span>
                    <span className="font-medium text-primary">
                      {details.items}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary/60">Drop-off</span>
                    <span className="font-medium text-primary">
                      {details.dropOffDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary/60">Collection</span>
                    <span className="font-medium text-primary">
                      {details.collectionDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="flex gap-2 rounded-xl bg-accent/5 border border-accent/20 px-4 py-3">
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
                <p className="text-xs leading-relaxed text-primary/60">
                  <span className="font-semibold text-primary/80">
                    Payment integration coming soon
                  </span>{" "}
                  — your space is reserved! You&apos;ll be notified when payment
                  is ready.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Confirm Button */}
              <button
                onClick={handleConfirm}
                disabled={confirming}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-action py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-action/90 hover:shadow-md disabled:opacity-50"
              >
                {confirming ? (
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
                    Confirming…
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
