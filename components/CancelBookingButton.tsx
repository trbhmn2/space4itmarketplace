"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";
import { canTransition } from "@/lib/booking-status";
import type { BookingStatus, UserRole } from "@/lib/booking-status";

interface CancelBookingButtonProps {
  requestId: string;
  threadId: string;
  currentStatus: BookingStatus;
  userRole: UserRole;
  onCancel: () => void;
}

export default function CancelBookingButton({
  requestId,
  threadId,
  currentStatus,
  userRole,
  onCancel,
}: CancelBookingButtonProps) {
  const { user } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  if (!canTransition(currentStatus, "cancelled")) return null;

  const label =
    currentStatus === "pending" ? "Cancel Request" : "Cancel Booking";

  const handleCancel = async () => {
    if (!user) return;
    setCancelling(true);
    setFeedback(null);

    try {
      const supabase = createClient();

      const { error: updateError } = await supabase
        .from("booking_requests")
        .update({ status: "cancelled" })
        .eq("id", requestId);

      if (updateError) throw updateError;

      const cancelledBy = userRole === "host" ? "host" : "storer";
      const { error: messageError } = await supabase.from("messages").insert({
        thread_id: threadId,
        sender_id: user.id,
        booking_request_id: requestId,
        content: `Booking ${currentStatus === "pending" ? "request" : ""} cancelled by the ${cancelledBy}.`,
        moderation_flag: false,
      });

      if (messageError) throw messageError;

      setFeedback({ type: "success", message: "Cancelled successfully" });
      setShowConfirm(false);
      onCancel();
    } catch {
      setFeedback({
        type: "error",
        message: "Failed to cancel. Please try again.",
      });
    } finally {
      setCancelling(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex flex-col gap-2">
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-xs font-medium text-red-700">
            Are you sure you want to cancel? This cannot be undone.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelling}
              className="inline-flex items-center gap-1.5 rounded-md bg-red-500 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
            >
              {cancelling ? (
                <svg
                  className="h-3.5 w-3.5 animate-spin"
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
              ) : null}
              Yes, Cancel
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              disabled={cancelling}
              className="rounded-md bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
            >
              Go Back
            </button>
          </div>
        </div>
        {feedback?.type === "error" && (
          <span className="text-xs font-medium text-red-600">
            {feedback.message}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200"
      >
        {label}
      </button>
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
