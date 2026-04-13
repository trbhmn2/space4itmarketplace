"use client";

import { useState } from "react";
import BookingModal from "./BookingModal";

interface ListingCardProps {
  hostName: string;
  area: string;
  capacity: number;
  rating: number;
  pricePerBox: number;
}

export default function ListingCard({
  hostName,
  area,
  capacity,
  rating,
  pricePerBox,
}: ListingCardProps) {
  const [showModal, setShowModal] = useState(false);

  const initials = hostName
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <>
      <div className="group overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        {/* Host photo area */}
        <div className="relative h-36 bg-gradient-to-br from-accent/20 to-primary/10">
          <div className="absolute -bottom-6 left-4 flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-white bg-primary text-lg font-bold text-white shadow-md">
            {initials}
          </div>
        </div>

        <div className="px-4 pb-4 pt-8">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-primary">{hostName}</h3>
              <p className="flex items-center gap-1 text-sm text-primary/50">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                  />
                </svg>
                {area}
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-primary/5 px-2 py-0.5 text-sm">
              <svg
                className="h-4 w-4 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="font-semibold text-primary">{rating}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 text-xs text-primary/50">
            <span className="flex items-center gap-1">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                />
              </svg>
              Up to {capacity} items
            </span>
            <span className="text-primary/30">|</span>
            <span className="font-semibold text-action">
              From £{pricePerBox}/box
            </span>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="mt-4 w-full rounded-lg border border-primary/10 bg-primary/[0.03] py-2.5 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary hover:text-white"
          >
            View Details
          </button>
        </div>
      </div>

      <BookingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        listingTitle={`${hostName} — ${area}`}
      />
    </>
  );
}
