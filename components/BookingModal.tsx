"use client";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingTitle: string;
}

export default function BookingModal({
  isOpen,
  onClose,
  listingTitle,
}: BookingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-primary">
          Book: {listingTitle}
        </h2>
        <p className="mt-2 text-sm text-primary/60">
          Booking form will be implemented here.
        </p>
        <button
          onClick={onClose}
          className="mt-6 rounded-lg bg-action px-6 py-2 text-sm font-semibold text-white hover:bg-action/90"
        >
          Close
        </button>
      </div>
    </div>
  );
}
