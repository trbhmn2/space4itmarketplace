"use client";

import { useState } from "react";

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export default function SectionCard({
  title,
  children,
  collapsible = false,
  defaultOpen = true,
}: SectionCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-primary/10 bg-white shadow-sm">
      <button
        type="button"
        className={`flex w-full items-center justify-between px-6 py-4 text-left ${
          collapsible ? "cursor-pointer" : "cursor-default"
        }`}
        onClick={() => collapsible && setOpen((prev) => !prev)}
        disabled={!collapsible}
      >
        <h2 className="text-lg font-bold text-primary">{title}</h2>
        {collapsible && (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-primary/40 transition-transform ${open ? "rotate-180" : ""}`}
          >
            <polyline points="6 8 10 12 14 8" />
          </svg>
        )}
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}
