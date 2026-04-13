import type { SupabaseClient } from "@supabase/supabase-js";

export async function createThread(
  supabase: SupabaseClient,
  bookingRequestId: string,
  senderId: string,
  content: string
): Promise<string> {
  const threadId = crypto.randomUUID();

  const { error } = await supabase.from("messages").insert({
    thread_id: threadId,
    sender_id: senderId,
    booking_request_id: bookingRequestId,
    content,
    moderation_flag: false,
  });

  if (error) throw error;
  return threadId;
}

export async function sendMessage(
  supabase: SupabaseClient,
  threadId: string,
  senderId: string,
  bookingRequestId: string,
  content: string
) {
  const { error } = await supabase.from("messages").insert({
    thread_id: threadId,
    sender_id: senderId,
    booking_request_id: bookingRequestId,
    content,
    moderation_flag: false,
  });

  if (error) throw error;
}

export interface ThreadMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  booking_request_id: string;
  content: string;
  created_at: string;
  moderation_flag: boolean;
  sender?: {
    id: string;
    name: string;
    photo_url: string | null;
  };
}

export async function getThreadMessages(
  supabase: SupabaseClient,
  threadId: string
): Promise<ThreadMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*, sender:users!sender_id(id, name, photo_url)")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ThreadMessage[];
}

export interface ThreadSummary {
  threadId: string;
  bookingRequestId: string;
  lastMessage: string;
  lastMessageAt: string;
  lastMessageSenderId: string;
  otherUser: {
    id: string;
    name: string;
    photo_url: string | null;
  };
  listingTitle: string;
}

export async function getUserThreads(
  supabase: SupabaseClient,
  userId: string
): Promise<ThreadSummary[]> {
  // Get all distinct threads involving this user via messages they sent
  const { data: sentThreads } = await supabase
    .from("messages")
    .select("thread_id, booking_request_id")
    .eq("sender_id", userId);

  // Get threads from booking requests where user is the storer
  const { data: storerRequests } = await supabase
    .from("booking_requests")
    .select("id")
    .eq("storer_id", userId);

  const storerRequestIds = (storerRequests ?? []).map((r) => r.id);

  // Get threads from booking requests involving the user's listings (as host)
  const { data: hostListings } = await supabase
    .from("listings")
    .select("id")
    .eq("host_id", userId);

  const hostListingIds = (hostListings ?? []).map((l) => l.id);

  let hostRequestIds: string[] = [];
  if (hostListingIds.length > 0) {
    const { data: hostRequests } = await supabase
      .from("booking_requests")
      .select("id")
      .in("listing_id", hostListingIds);
    hostRequestIds = (hostRequests ?? []).map((r) => r.id);
  }

  const allRequestIds = Array.from(new Set([...storerRequestIds, ...hostRequestIds]));

  // Get messages for these booking requests to find threads
  let requestThreads: { thread_id: string; booking_request_id: string }[] = [];
  if (allRequestIds.length > 0) {
    const { data } = await supabase
      .from("messages")
      .select("thread_id, booking_request_id")
      .in("booking_request_id", allRequestIds);
    requestThreads = data ?? [];
  }

  // Combine all thread_id + booking_request_id pairs
  const threadMap = new Map<string, string>();
  for (const t of sentThreads ?? []) {
    threadMap.set(t.thread_id, t.booking_request_id);
  }
  for (const t of requestThreads) {
    threadMap.set(t.thread_id, t.booking_request_id);
  }

  if (threadMap.size === 0) return [];

  const threads: ThreadSummary[] = [];

  for (const [threadId, bookingRequestId] of Array.from(threadMap.entries())) {
    // Last message
    const { data: lastMsg } = await supabase
      .from("messages")
      .select("content, created_at, sender_id")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!lastMsg) continue;

    // Get all participants in this thread
    const { data: participants } = await supabase
      .from("messages")
      .select("sender_id")
      .eq("thread_id", threadId);

    const participantIds = Array.from(
      new Set((participants ?? []).map((p) => p.sender_id))
    );
    const otherUserId = participantIds.find((id) => id !== userId);

    // If no other participant found, try to find from booking request
    let otherUser = { id: "", name: "Unknown", photo_url: null as string | null };

    if (otherUserId) {
      const { data: userData } = await supabase
        .from("users")
        .select("id, name, photo_url")
        .eq("id", otherUserId)
        .single();
      if (userData) otherUser = userData;
    } else {
      // Find the other party from the booking request
      const { data: br } = await supabase
        .from("booking_requests")
        .select("storer_id, listing:listings!listing_id(host_id)")
        .eq("id", bookingRequestId)
        .single();

      if (br) {
        const listing = br.listing as unknown as { host_id: string } | null;
        const otherId =
          br.storer_id === userId ? listing?.host_id : br.storer_id;
        if (otherId) {
          const { data: userData } = await supabase
            .from("users")
            .select("id, name, photo_url")
            .eq("id", otherId)
            .single();
          if (userData) otherUser = userData;
        }
      }
    }

    // Get listing title from booking request
    let listingTitle = "Storage Booking";
    const { data: brData } = await supabase
      .from("booking_requests")
      .select("listing:listings!listing_id(title)")
      .eq("id", bookingRequestId)
      .single();

    if (brData) {
      const listing = brData.listing as unknown as { title: string } | null;
      if (listing?.title) listingTitle = listing.title;
    }

    threads.push({
      threadId,
      bookingRequestId,
      lastMessage: lastMsg.content,
      lastMessageAt: lastMsg.created_at,
      lastMessageSenderId: lastMsg.sender_id,
      otherUser,
      listingTitle,
    });
  }

  // Sort by last message time, newest first
  threads.sort(
    (a, b) =>
      new Date(b.lastMessageAt).getTime() -
      new Date(a.lastMessageAt).getTime()
  );

  return threads;
}
