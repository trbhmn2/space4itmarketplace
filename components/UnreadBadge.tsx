"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase";

function getLastReadTimestamp(threadId: string): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(`thread_read_${threadId}`);
  return stored ? parseInt(stored, 10) : 0;
}

export default function UnreadBadge() {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function checkUnread() {
      // Fetch all messages where this user is NOT the sender, grouped by thread
      const { data: messages } = await supabase
        .from("messages")
        .select("thread_id, created_at")
        .neq("sender_id", user!.id)
        .order("created_at", { ascending: false });

      if (cancelled || !messages) return;

      // Determine which threads have unread messages
      const threadLatest = new Map<string, number>();
      for (const msg of messages) {
        const ts = new Date(msg.created_at).getTime();
        const existing = threadLatest.get(msg.thread_id);
        if (!existing || ts > existing) {
          threadLatest.set(msg.thread_id, ts);
        }
      }

      let count = 0;
      for (const [threadId, latestTs] of threadLatest) {
        const lastRead = getLastReadTimestamp(threadId);
        if (latestTs > lastRead) count++;
      }

      setUnreadCount(count);
    }

    checkUnread();

    // Subscribe to new messages
    const channel = supabase
      .channel("unread-badge")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg = payload.new as {
            sender_id: string;
            thread_id: string;
            created_at: string;
          };
          if (newMsg.sender_id === user!.id) return;

          const msgTs = new Date(newMsg.created_at).getTime();
          const lastRead = getLastReadTimestamp(newMsg.thread_id);
          if (msgTs > lastRead) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    // Periodically re-check in case localStorage was updated from another tab
    const interval = setInterval(checkUnread, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [supabase, user]);

  if (unreadCount === 0) return null;

  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-action px-1 text-[10px] font-bold text-white">
      {unreadCount > 9 ? "9+" : unreadCount}
    </span>
  );
}
