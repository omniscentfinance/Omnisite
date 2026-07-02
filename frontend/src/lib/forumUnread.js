import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

const KEY = "forum_last_read";
const POLL_MS = 20000;

function loadReads() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function saveReads(reads) {
  try { localStorage.setItem(KEY, JSON.stringify(reads)); } catch { /* ignore quota errors */ }
}

export function markChannelRead(channelId, iso = new Date().toISOString()) {
  const reads = loadReads();
  reads[channelId] = iso;
  saveReads(reads);
}

// Ultimo messaggio (created_at) per ciascun canale, in un'unica query.
async function getLatestPerChannel() {
  try {
    const { data, error } = await supabase
      .from("forum_messages")
      .select("channel_id, created_at")
      .order("created_at", { ascending: false });
    if (error) return {};
    const latest = {};
    for (const m of data ?? []) {
      if (!latest[m.channel_id]) latest[m.channel_id] = m.created_at;
    }
    return latest;
  } catch {
    return {};
  }
}

// Hook: { unreadChannelIds: Set, hasUnread: bool, refresh, markRead(channelId) }
// Controlla periodicamente (polling, nessun canale realtime) se ci sono
// messaggi più recenti dell'ultima lettura salvata in localStorage.
export function useForumUnread() {
  const [unreadChannelIds, setUnreadChannelIds] = useState(new Set());
  const reads = useRef(loadReads());
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    reads.current = loadReads();
    const latest = await getLatestPerChannel();
    if (!mounted.current) return;
    const next = new Set();
    for (const [channelId, ts] of Object.entries(latest)) {
      const lastRead = reads.current[channelId];
      if (!lastRead || new Date(ts) > new Date(lastRead)) next.add(channelId);
    }
    setUnreadChannelIds(next);
  }, []);

  useEffect(() => {
    mounted.current = true;
    refresh();
    const interval = setInterval(refresh, POLL_MS);
    return () => { mounted.current = false; clearInterval(interval); };
  }, [refresh]);

  const markRead = useCallback((channelId) => {
    markChannelRead(channelId);
    setUnreadChannelIds((prev) => {
      if (!prev.has(channelId)) return prev;
      const next = new Set(prev);
      next.delete(channelId);
      return next;
    });
  }, []);

  return { unreadChannelIds, hasUnread: unreadChannelIds.size > 0, refresh, markRead };
}
