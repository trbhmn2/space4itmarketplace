type Status =
  | "pending"
  | "accepted"
  | "declined"
  | "confirmed"
  | "active"
  | "collection_due"
  | "completed"
  | "cancelled"
  | "reserved"
  | "deposit_paid"
  | "fully_paid"
  | "refunded"
  | "paid";

const statusConfig: Record<
  Status,
  { bg: string; text: string; dot: string }
> = {
  pending: { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-400" },
  accepted: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-400" },
  declined: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400" },
  confirmed: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  active: { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-400" },
  collection_due: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400" },
  completed: { bg: "bg-gray-50", text: "text-gray-600", dot: "bg-gray-400" },
  cancelled: { bg: "bg-gray-50", text: "text-gray-500", dot: "bg-gray-400" },
  reserved: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-400" },
  deposit_paid: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  fully_paid: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-400" },
  refunded: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400" },
  paid: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-400" },
};

function formatLabel(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface StatusChipProps {
  status: Status;
}

export default function StatusChip({ status }: StatusChipProps) {
  const config = statusConfig[status] ?? {
    bg: "bg-gray-50",
    text: "text-gray-600",
    dot: "bg-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.bg} ${config.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {formatLabel(status)}
    </span>
  );
}
