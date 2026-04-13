"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";
import { canTransition } from "@/lib/booking-status";
import type { BookingStatus } from "@/lib/booking-status";

interface BookingRequestActionsProps {
  requestId: string;
  currentStatus: BookingStatus;
  threadId: string;
  onAction: () => void;
}

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
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
  );
}

export default function BookingRequestActions({
  requestId,
  currentStatus,
  threadId,
  onAction,
}: BookingRequestActionsProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showAccept = canTransition(currentStatus, "accepted");
  const showDecline = canTransition(currentStatus, "declined");

  if (!showAccept && !showDecline) return null;

  const handleAccept = async () => {
    if (!user) return;
    setLoading("accept");
    setFeedback(null);

    try {
      const supabase = createClient();

      const { error: updateError } = await supabase
        .from("booking_requests")
        .update({ status: "accepted" })
        .eq("id", requestId);

      if (updateError) throw updateError;

      const { error: bookingError } = await supabase
        .from("bookings")
        .insert({
          request_id: requestId,
          payment_status: "pending",
          payout_status: "pending",
          dispute_state: "none",
        });

      if (bookingError) throw bookingError;

      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          thread_id: threadId,
          sender_id: user.id,
          booking_request_id: requestId,
          content:
            "Booking request accepted! The storer can now confirm their booking.",
          moderation_flag: false,
        });

      if (messageError) throw messageError;

      setFeedback({ type: "success", message: "Request accepted" });
      onAction();
    } catch {
      setFeedback({
        type: "error",
        message: "Failed to accept. Please try again.",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleDecline = async () => {
    if (!user) return;
    setLoading("decline");
    setFeedback(null);

    try {
      const supabase = createClient();

      const { error: updateError } = await supabase
        .from("booking_requests")
        .update({ status: "declined" })
        .eq("id", requestId);

      if (updateError) throw updateError;

      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          thread_id: threadId,
          sender_id: user.id,
          booking_request_id: requestId,
          content: "Booking request declined.",
          moderation_flag: false,
        });

      if (messageError) throw messageError;

      setFeedback({ type: "success", message: "Request declined" });
      onAction();
    } catch {
      setFeedback({
        type: "error",
        message: "Failed to decline. Please try again.",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {showAccept && (
          <button
            type="button"
            onClick={handleAccept}
            disabled={loading !== null}
            className="inline-flex items-center gap-1.5 rounded-md bg-green-500 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-50"
          >
            {loading === "accept" ? <Spinner /> : null}
            Accept
          </button>
        )}
        {showDecline && (
          <button
            type="button"
            onClick={handleDecline}
            disabled={loading !== null}
            className="inline-flex items-center gap-1.5 rounded-md bg-red-500 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
          >
            {loading === "decline" ? <Spinner /> : null}
            Decline
          </button>
        )}
      </div>
      {feedback && (
        <span
          className={`text-xs font-medium ${
            feedback.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {feedback.message}
        </span>
      )}
    </div>
  );
}
