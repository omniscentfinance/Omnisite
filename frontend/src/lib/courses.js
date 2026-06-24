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
export async function listPlaylists() {
  const { data, error } = await supabase
    .from("playlists")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createPlaylist({ title, description }) {
  const { error } = await supabase.from("playlists").insert({ title, description });
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

export async function createQuestion({ video_id, question, options, correct_index }) {
  const { error } = await supabase
    .from("quiz_questions")
    .insert({ video_id, question, options, correct_index });
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
