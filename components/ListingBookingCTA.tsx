"use client";

import { useState } from "react";
import BookingModal from "@/components/BookingModal";

interface ListingBookingCTAProps {
  listingTitle: string;
  listingId: string;
  hostId: string;
}

export default function ListingBookingCTA({
  listingTitle,
  listingId,
  hostId,
}: ListingBookingCTAProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full rounded-xl bg-action py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-action/90 hover:shadow-md sm:w-auto sm:px-10"
      >
        Request to Book
      </button>

      <BookingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        listingTitle={listingTitle}
        listingId={listingId}
        hostId={hostId}
      />
    </>
  );
}
