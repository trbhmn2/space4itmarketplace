export type BookingStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "confirmed"
  | "active"
  | "collection_due"
  | "completed"
  | "cancelled";

export type UserRole = "storer" | "host";

export type ActionVariant = "accept" | "decline" | "confirm" | "cancel";

export interface BookingAction {
  label: string;
  newStatus: BookingStatus;
  variant: ActionVariant;
}

const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ["accepted", "declined", "cancelled"],
  accepted: ["confirmed", "cancelled"],
  confirmed: ["active", "cancelled"],
  active: ["collection_due"],
  collection_due: ["completed"],
  declined: [],
  completed: [],
  cancelled: [],
};

export function canTransition(
  currentStatus: BookingStatus,
  newStatus: BookingStatus
): boolean {
  return VALID_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false;
}

export function getAvailableActions(
  status: BookingStatus,
  userRole: UserRole
): BookingAction[] {
  const actions: BookingAction[] = [];

  if (status === "pending" && userRole === "host") {
    actions.push(
      { label: "Accept", newStatus: "accepted", variant: "accept" },
      { label: "Decline", newStatus: "declined", variant: "decline" }
    );
  }

  if (status === "pending" && userRole === "storer") {
    actions.push({
      label: "Cancel Request",
      newStatus: "cancelled",
      variant: "cancel",
    });
  }

  if (status === "accepted" && userRole === "storer") {
    actions.push({
      label: "Confirm Booking",
      newStatus: "confirmed",
      variant: "confirm",
    });
  }

  if (status === "accepted" && userRole === "host") {
    actions.push({
      label: "Cancel Booking",
      newStatus: "cancelled",
      variant: "cancel",
    });
  }

  if (status === "confirmed") {
    actions.push({
      label: "Cancel Booking",
      newStatus: "cancelled",
      variant: "cancel",
    });
  }

  return actions;
}
