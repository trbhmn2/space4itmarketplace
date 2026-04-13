"use client";

import { useState, useEffect } from "react";
import ItemCounter from "./ui/ItemCounter";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingTitle: string;
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
}: BookingModalProps) {
  const [standardBoxes, setStandardBoxes] = useState(0);
  const [smallBulky, setSmallBulky] = useState(0);
  const [largeBulky, setLargeBulky] = useState(0);
  const [dropOffDate, setDropOffDate] = useState("");
  const [pickUpDate, setPickUpDate] = useState("");

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

  const total =
    standardBoxes * PRICES.standardBoxes +
    smallBulky * PRICES.smallBulky +
    largeBulky * PRICES.largeBulky;

  const deposit = Math.ceil(total * 0.2);
  const balance = total - deposit;
  const hasItems = standardBoxes + smallBulky + largeBulky > 0;

  const handleBook = () => {
    const booking = {
      listingTitle,
      items: {
        standardBoxes,
        smallBulky,
        largeBulky,
      },
      dates: {
        dropOff: dropOffDate,
        pickUp: pickUpDate,
      },
      pricing: {
        total,
        deposit,
        balance,
      },
    };
    console.log("Booking details:", booking);
    alert("Booking submitted! Check the console for details.");
    onClose();
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
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-primary/10 bg-white px-5 py-4 md:px-6">
          <div>
            <h2 className="text-lg font-bold text-primary">Book Storage</h2>
            <p className="text-sm text-primary/50">{listingTitle}</p>
          </div>
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

        <div className="space-y-6 px-5 py-5 md:px-6">
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
            disabled={!hasItems || !dropOffDate || !pickUpDate}
            className="w-full rounded-xl bg-action py-3.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-action/90 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
          >
            {hasItems ? `Book Now — £${total}` : "Select items to continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
