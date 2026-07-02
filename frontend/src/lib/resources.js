import { supabase } from "@/lib/supabase";

export const BUCKET = "resources";

// category: "indicatori" | "bot"
export async function listResources(category) {
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createResource({ category, title, content, file }) {
  let file_url = null;
  let file_name = null;
  if (file) {
    const { data: { user } } = await supabase.auth.getUser();
    const path = `${category}/${user.id}/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    file_url = data.publicUrl;
    file_name = file.name;
  }
  const { error } = await supabase.from("resources").insert({
    category, title, content: content || null, file_url, file_name,
  });
  if (error) throw error;
}

export async function updateResource(id, fields) {
  const { error } = await supabase.from("resources").update(fields).eq("id", id);
  if (error) throw error;
}

export async function deleteResource(id) {
  const { error } = await supabase.from("resources").delete().eq("id", id);
  if (error) throw error;
}
