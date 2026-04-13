"use client";

interface ItemCounterProps {
  label: string;
  price: number;
  count: number;
  onChange: (count: number) => void;
  max?: number;
}

export default function ItemCounter({
  label,
  price,
  count,
  onChange,
  max = 20,
}: ItemCounterProps) {
  const decrement = () => {
    if (count > 0) onChange(count - 1);
  };

  const increment = () => {
    if (count < max) onChange(count + 1);
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-primary/10 bg-primary/[0.02] px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-primary">{label}</p>
        <p className="text-xs text-primary/50">£{price} each</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={decrement}
          disabled={count === 0}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/10 bg-white text-primary transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label={`Decrease ${label}`}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
          </svg>
        </button>
        <span className="w-6 text-center text-sm font-bold text-primary">
          {count}
        </span>
        <button
          type="button"
          onClick={increment}
          disabled={count >= max}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/10 bg-white text-primary transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label={`Increase ${label}`}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
