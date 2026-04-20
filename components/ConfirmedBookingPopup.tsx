"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ConfirmedBookingPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConfirmedBookingPopup({
  isOpen,
  onClose,
}: ConfirmedBookingPopupProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[4px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative mx-4 w-full max-w-[480px] rounded-2xl bg-white px-6 py-10 shadow-2xl transition-all duration-300">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-primary/40 transition-colors hover:bg-primary/5 hover:text-primary"
          aria-label="Close"
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

        <div className="flex flex-col items-center text-center">
          {/* Material Icon */}
          <span
            className="material-icons mb-5"
            style={{ fontSize: "64px", color: "#E06B6B" }}
          >
            partner_exchange
          </span>

          <h2 className="text-xl font-bold text-primary">
            You&apos;ve got your summer storage sorted!
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-primary/60">
            View your booking details in the{" "}
            <Link
              href="/dashboard/storer"
              className="font-semibold text-action underline underline-offset-2 transition-colors hover:text-action/80"
            >
              User Dashboard
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
