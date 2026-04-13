"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import {
  getThreadMessages,
  sendMessage,
  type ThreadMessage,
} from "@/lib/messaging";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatMessageTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (today.getTime() - msgDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

const SYSTEM_PATTERNS = [
  /^Booking request/i,
  /^Booking confirmed/i,
  /^Booking cancelled/i,
  /^Booking completed/i,
  /^Payment received/i,
  /^Storage period/i,
];

function isSystemMessage(content: string): boolean {
  return SYSTEM_PATTERNS.some((p) => p.test(content));
}

function markThreadAsRead(threadId: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(`thread_read_${threadId}`, Date.now().toString());
  }
}

interface OtherUser {
  id: string;
  name: string;
  photo_url: string | null;
}

export default function ConversationPage() {
  const params = useParams();
  const threadId = params.threadId as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [listingTitle, setListingTitle] = useState("");
  const [bookingRequestId, setBookingRequestId] = useState("");
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Fetch messages and thread metadata
  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const msgs = await getThreadMessages(supabase, threadId);
      setMessages(msgs);

      if (msgs.length > 0) {
        setBookingRequestId(msgs[0].booking_request_id);

        // Find the other user
        const otherMsg = msgs.find((m) => m.sender_id !== user.id);
        if (otherMsg?.sender) {
          setOtherUser(otherMsg.sender);
        } else if (msgs[0].sender && msgs[0].sender_id === user.id) {
          // Only our messages — look up the other party from the booking request
          const { data: br } = await supabase
            .from("booking_requests")
            .select(
              "storer_id, listing:listings!listing_id(host_id, title)"
            )
            .eq("id", msgs[0].booking_request_id)
            .single();

          if (br) {
            const listing = br.listing as unknown as {
              host_id: string;
              title: string;
            } | null;
            const otherId =
              br.storer_id === user.id ? listing?.host_id : br.storer_id;
            if (otherId) {
              const { data: userData } = await supabase
                .from("users")
                .select("id, name, photo_url")
                .eq("id", otherId)
                .single();
              if (userData) setOtherUser(userData);
            }
          }
        }

        // Fetch listing title
        const { data: brData } = await supabase
          .from("booking_requests")
          .select("listing:listings!listing_id(title)")
          .eq("id", msgs[0].booking_request_id)
          .single();

        if (brData) {
          const listing = brData.listing as unknown as {
            title: string;
          } | null;
          if (listing?.title) setListingTitle(listing.title);
        }
      }

      markThreadAsRead(threadId);
    } catch {
      // error handling — stay on page with empty state
    } finally {
      setLoading(false);
    }
  }, [supabase, threadId, user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth");
      return;
    }
    fetchData();
  }, [user, authLoading, router, fetchData]);

  // Scroll to bottom when messages load or change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(loading ? "instant" : "smooth");
    }
  }, [messages.length, loading, scrollToBottom]);

  // Supabase Realtime subscription
  useEffect(() => {
    if (!threadId) return;

    const channel = supabase
      .channel(`thread-${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `thread_id=eq.${threadId}`,
        },
        async (payload) => {
          const newMsg = payload.new as ThreadMessage;

          // Fetch sender info for the new message
          if (newMsg.sender_id) {
            const { data: senderData } = await supabase
              .from("users")
              .select("id, name, photo_url")
              .eq("id", newMsg.sender_id)
              .single();

            if (senderData) {
              newMsg.sender = senderData;
            }
          }

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });

          markThreadAsRead(threadId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, threadId]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || !user || !bookingRequestId || sending) return;

    setSending(true);
    setInputValue("");

    try {
      await sendMessage(supabase, threadId, user.id, bookingRequestId, text);
    } catch {
      setInputValue(text);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages by date for date separators
  let lastDateLabel = "";

  if (authLoading || loading) {
    return (
      <div className="flex h-[calc(100vh-57px)] flex-col">
        {/* Header skeleton */}
        <div className="flex items-center gap-3 border-b border-primary/10 bg-white px-4 py-3">
          <div className="h-5 w-5 rounded bg-primary/10 animate-pulse" />
          <div className="h-10 w-10 rounded-full bg-primary/10 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-4 w-28 rounded bg-primary/10 animate-pulse" />
            <div className="h-3 w-40 rounded bg-primary/5 animate-pulse" />
          </div>
        </div>
        {/* Messages skeleton */}
        <div className="flex-1 space-y-4 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`h-10 rounded-2xl animate-pulse ${
                  i % 2 === 0 ? "w-48 bg-primary/5" : "w-40 bg-action/10"
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-57px)] flex-col md:h-[calc(100vh-57px)]">
      {/* Chat Header */}
      <div className="flex items-center gap-3 border-b border-primary/10 bg-white px-4 py-3">
        <Link
          href="/dashboard/messages"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-primary/60 transition-colors hover:bg-primary/5 hover:text-primary"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>

        {otherUser?.photo_url ? (
          <img
            src={otherUser.photo_url}
            alt={otherUser.name}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {otherUser ? getInitials(otherUser.name) : "?"}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-primary">
            {otherUser?.name ?? "Loading…"}
          </p>
          {listingTitle && (
            <p className="truncate text-xs text-primary/40">{listingTitle}</p>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto bg-background px-4 py-4"
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-2">
          {messages.map((msg) => {
            const dateLabel = getDateLabel(msg.created_at);
            const showDateSep = dateLabel !== lastDateLabel;
            lastDateLabel = dateLabel;

            const isOwn = msg.sender_id === user?.id;
            const isSystem = isSystemMessage(msg.content);

            return (
              <div key={msg.id}>
                {showDateSep && (
                  <div className="my-4 flex items-center justify-center">
                    <span className="rounded-full bg-primary/5 px-4 py-1 text-xs font-medium text-primary/40">
                      {dateLabel}
                    </span>
                  </div>
                )}

                {isSystem ? (
                  <div className="my-2 flex justify-center">
                    <span className="rounded-full bg-primary/10 px-4 py-1 text-xs text-primary/60">
                      {msg.content}
                    </span>
                  </div>
                ) : isOwn ? (
                  <div className="flex justify-end">
                    <div className="max-w-[80%]">
                      <div className="rounded-2xl rounded-tr-sm bg-action px-4 py-2.5 text-sm text-white">
                        {msg.content}
                      </div>
                      <p className="mt-0.5 text-right text-[10px] text-primary/30">
                        {formatMessageTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-start">
                    <div className="max-w-[80%]">
                      <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-2.5 text-sm text-primary shadow-sm">
                        {msg.content}
                      </div>
                      <p className="mt-0.5 text-[10px] text-primary/30">
                        {formatMessageTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t border-primary/10 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-primary/10 bg-background px-4 py-2.5 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            style={{ maxHeight: "120px" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height =
                Math.min(target.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || sending}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-white transition-all duration-200 hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending ? (
              <svg
                className="h-5 w-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
