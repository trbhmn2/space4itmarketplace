"use client";

import { useState } from "react";
import BookingModal from "@/components/BookingModal";
import ConfirmedBookingPopup from "@/components/ConfirmedBookingPopup";

interface ListingBookingCTAProps {
  listingTitle: string;
  listingId: string;
  hostId: string;
  hostName: string;
  hostPhotoUrl: string | null;
  availabilityStart: string;
  availabilityEnd: string;
  acceptsBulky: boolean;
}

export default function ListingBookingCTA({
  listingTitle,
  listingId,
  hostId,
  hostName,
  hostPhotoUrl,
  availabilityStart,
  availabilityEnd,
  acceptsBulky,
}: ListingBookingCTAProps) {
  const [showModal, setShowModal] = useState(false);
  const [showConfirmed, setShowConfirmed] = useState(false);

  const handleBookingConfirmed = () => {
    setShowModal(false);
    setShowConfirmed(true);
  };

  const handleConfirmedClose = () => {
    setShowConfirmed(false);
  };

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
        hostName={hostName}
        hostPhotoUrl={hostPhotoUrl}
        availabilityStart={availabilityStart}
        availabilityEnd={availabilityEnd}
        acceptsBulky={acceptsBulky}
        onBookingConfirmed={handleBookingConfirmed}
      />

      <ConfirmedBookingPopup
        isOpen={showConfirmed}
        onClose={handleConfirmedClose}
      />
    </>
  );
}
