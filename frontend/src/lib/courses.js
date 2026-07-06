import { supabase } from "@/lib/supabase";

// Estrae l'ID video da un URL YouTube (watch?v=, youtu.be/, embed/) o da un ID nudo.
export function parseYouTubeId(input) {
  if (!input) return "";
  const s = input.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) return m[1];
  }
  return /^[\w-]{11}$/.test(s) ? s : "";
}

// ---- Playlist ----
// section: "private" (Corsi Privati, gated) | "base" (Corso Base, gratuito)
export async function listPlaylists(section = "private") {
  const { data, error } = await supabase
    .from("playlists")
    .select("*")
    .eq("section", section)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createPlaylist({ title, description, section = "private" }) {
  const { error } = await supabase.from("playlists").insert({ title, description, section });
  if (error) throw error;
}

export async function updatePlaylist(id, fields) {
  const { error } = await supabase.from("playlists").update(fields).eq("id", id);
  if (error) throw error;
}

export async function deletePlaylist(id) {
  const { error } = await supabase.from("playlists").delete().eq("id", id);
  if (error) throw error;
}

// ---- Video ----
export async function listVideos(playlistId) {
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("playlist_id", playlistId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createVideo({ playlist_id, title, description, youtube_id }) {
  const { error } = await supabase.from("videos").insert({ playlist_id, title, description, youtube_id });
  if (error) throw error;
}

export async function updateVideo(id, fields) {
  const { error } = await supabase.from("videos").update(fields).eq("id", id);
  if (error) throw error;
}

export async function deleteVideo(id) {
  const { error } = await supabase.from("videos").delete().eq("id", id);
  if (error) throw error;
}

// ---- Quiz ----
export async function listQuestions(videoId) {
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("video_id", videoId)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createQuestion({ video_id, question, options, correct_index, correct_indexes }) {
  const { error } = await supabase
    .from("quiz_questions")
    .insert({ video_id, question, options, correct_index, correct_indexes });
  if (error) throw error;
}

export async function deleteQuestion(id) {
  const { error } = await supabase.from("quiz_questions").delete().eq("id", id);
  if (error) throw error;
}

// ---- Commenti ----
export async function listComments(videoId) {
  const { data, error } = await supabase
    .from("video_comments")
    .select("*")
    .eq("video_id", videoId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createComment({ video_id, body, author_name }) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("video_comments")
    .insert({ video_id, body, author_name, user_id: user.id });
  if (error) throw error;
}

export async function deleteComment(id) {
  const { error } = await supabase.from("video_comments").delete().eq("id", id);
  if (error) throw error;
}

// ---- Progressi (video visti) ----
// Segna un video come visto dall'utente corrente (no-op se già segnato).
export async function markWatched(videoId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("video_progress")
    .upsert({ user_id: user.id, video_id: videoId }, { onConflict: "user_id,video_id", ignoreDuplicates: true });
}

// Set degli ID video visti dall'utente corrente.
export async function getWatchedVideoIds() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data, error } = await supabase
    .from("video_progress")
    .select("video_id")
    .eq("user_id", user.id);
  if (error) return new Set();
  return new Set((data ?? []).map((r) => r.video_id));
}

// Video di una sezione (base/private) con playlist di appartenenza, per calcolare l'avanzamento complessivo.
export async function listSectionVideos(section) {
  const { data, error } = await supabase
    .from("videos")
    .select("id, playlist_id, playlists!inner(section)")
    .eq("playlists.section", section);
  if (error) throw error;
  return data ?? [];
}

// Admin: numero di video visti per ciascun utente -> Map(user_id -> count).
export async function getWatchedCountsByUser() {
  const { data, error } = await supabase.from("video_progress").select("user_id");
  if (error) return {};
  const counts = {};
  for (const r of data ?? []) counts[r.user_id] = (counts[r.user_id] || 0) + 1;
  return counts;
}
