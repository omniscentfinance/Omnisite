import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

const KEY = "forum_last_read";

function loadReads() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function saveReads(reads) {
  localStorage.setItem(KEY, JSON.stringify(reads));
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

let watchCount = 0;

// Hook: { unreadChannelIds: Set, hasUnread: bool, refresh, markRead(channelId) }
// Si aggiorna in realtime quando arriva un nuovo messaggio in un canale qualsiasi.
export function useForumUnread() {
  const [unreadChannelIds, setUnreadChannelIds] = useState(new Set());
  const reads = useRef(loadReads());

  const refresh = useCallback(async () => {
    reads.current = loadReads();
    const latest = await getLatestPerChannel();
    const next = new Set();
    for (const [channelId, ts] of Object.entries(latest)) {
      const lastRead = reads.current[channelId];
      if (!lastRead || new Date(ts) > new Date(lastRead)) next.add(channelId);
    }
    setUnreadChannelIds(next);
  }, []);

  useEffect(() => {
    refresh();
    // Nome canale univoco per istanza: evita che due componenti montati
    // insieme (es. Sidebar + pagina Forum) condividano lo stesso canale
    // realtime e se lo distruggano a vicenda allo smontaggio.
    const topic = `forum-unread-watch-${watchCount++}`;
    let sub;
    try {
      sub = supabase
        .channel(topic)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "forum_messages" }, () => refresh())
        .subscribe();
    } catch {
      sub = null;
    }
    return () => { if (sub) supabase.removeChannel(sub); };
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
