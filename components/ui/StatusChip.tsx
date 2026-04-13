type Status =
  | "pending"
  | "accepted"
  | "declined"
  | "confirmed"
  | "active"
  | "collection_due"
  | "completed"
  | "deposit_paid"
  | "fully_paid"
  | "refunded"
  | "paid";

const statusStyles: Record<Status, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-500 text-white",
  declined: "bg-red-500 text-white",
  confirmed: "bg-blue-500 text-white",
  active: "bg-accent text-white",
  collection_due: "bg-orange-400 text-orange-900",
  completed: "bg-gray-400 text-white",
  deposit_paid: "bg-blue-500 text-white",
  fully_paid: "bg-green-500 text-white",
  refunded: "bg-red-500 text-white",
  paid: "bg-green-500 text-white",
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
  const style = statusStyles[status] ?? "bg-gray-200 text-gray-700";

  return (
    <span
      className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${style}`}
    >
      {formatLabel(status)}
    </span>
  );
}
