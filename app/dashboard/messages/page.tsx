"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";
import { getUserThreads, type ThreadSummary } from "@/lib/messaging";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getLastReadTimestamp(threadId: string): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(`thread_read_${threadId}`);
  return stored ? parseInt(stored, 10) : 0;
}

function ThreadSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl p-3 animate-pulse">
      <div className="h-12 w-12 shrink-0 rounded-full bg-primary/10" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 rounded bg-primary/10" />
        <div className="h-3 w-48 rounded bg-primary/5" />
      </div>
      <div className="h-3 w-12 rounded bg-primary/5" />
    </div>
  );
}

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThreads = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getUserThreads(supabase, user.id);
      setThreads(data);
    } catch {
      // silently fail — empty state shown
    } finally {
      setLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth");
      return;
    }
    fetchThreads();
  }, [user, authLoading, router, fetchThreads]);

  // Real-time: subscribe to new messages for the user's threads
  useEffect(() => {
    if (!user || threads.length === 0) return;

    const threadIds = threads.map((t) => t.threadId);
    const channel = supabase
      .channel("threads-list")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg = payload.new as {
            thread_id: string;
            content: string;
            created_at: string;
            sender_id: string;
          };
          if (!threadIds.includes(newMsg.thread_id)) return;

          setThreads((prev) => {
            const updated = prev.map((t) =>
              t.threadId === newMsg.thread_id
                ? {
                    ...t,
                    lastMessage: newMsg.content,
                    lastMessageAt: newMsg.created_at,
                    lastMessageSenderId: newMsg.sender_id,
                  }
                : t
            );
            updated.sort(
              (a, b) =>
                new Date(b.lastMessageAt).getTime() -
                new Date(a.lastMessageAt).getTime()
            );
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user, threads.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-primary">Messages</h1>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ThreadSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-primary">Messages</h1>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-primary/10 bg-white p-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 className="mb-2 text-lg font-semibold text-primary">
            No messages yet
          </h2>
          <p className="max-w-sm text-sm text-primary/50">
            Messages will appear here when you make or receive a booking
            request.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-primary">Messages</h1>
      <div className="divide-y divide-primary/5 rounded-2xl border border-primary/10 bg-white">
        {threads.map((thread) => {
          const isUnread =
            thread.lastMessageSenderId !== user?.id &&
            new Date(thread.lastMessageAt).getTime() >
              getLastReadTimestamp(thread.threadId);
          const preview =
            thread.lastMessage.length > 50
              ? thread.lastMessage.slice(0, 50) + "…"
              : thread.lastMessage;

          return (
            <button
              key={thread.threadId}
              onClick={() =>
                router.push(`/dashboard/messages/${thread.threadId}`)
              }
              className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-primary/[0.02] active:bg-primary/5"
            >
              {/* Avatar */}
              {thread.otherUser.photo_url ? (
                <img
                  src={thread.otherUser.photo_url}
                  alt={thread.otherUser.name}
                  className="h-12 w-12 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {getInitials(thread.otherUser.name)}
                </div>
              )}

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`truncate text-sm ${
                      isUnread
                        ? "font-bold text-primary"
                        : "font-medium text-primary"
                    }`}
                  >
                    {thread.otherUser.name}
                  </span>
                  <span className="shrink-0 text-xs text-primary/40">
                    {formatTime(thread.lastMessageAt)}
                  </span>
                </div>
                <p className="truncate text-xs text-primary/40">
                  {thread.listingTitle}
                </p>
                <div className="flex items-center gap-2">
                  <p
                    className={`truncate text-sm ${
                      isUnread
                        ? "font-semibold text-primary/80"
                        : "text-primary/50"
                    }`}
                  >
                    {thread.lastMessageSenderId === user?.id
                      ? `You: ${preview}`
                      : preview}
                  </p>
                  {isUnread && (
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-action" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
