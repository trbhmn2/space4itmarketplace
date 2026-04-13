type BookingStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "confirmed"
  | "active"
  | "collection_due"
  | "completed";

interface StatusChipProps {
  status: BookingStatus;
}

const statusConfig: Record<
  BookingStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  pending: {
    label: "Pending",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    dot: "bg-yellow-400",
  },
  accepted: {
    label: "Accepted",
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-400",
  },
  declined: {
    label: "Declined",
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-400",
  },
  confirmed: {
    label: "Confirmed",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-400",
  },
  active: {
    label: "Active",
    bg: "bg-teal-50",
    text: "text-teal-700",
    dot: "bg-teal-400",
  },
  collection_due: {
    label: "Collection Due",
    bg: "bg-orange-50",
    text: "text-orange-700",
    dot: "bg-orange-400",
  },
  completed: {
    label: "Completed",
    bg: "bg-gray-50",
    text: "text-gray-600",
    dot: "bg-gray-400",
  },
};

export default function StatusChip({ status }: StatusChipProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.bg} ${config.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
