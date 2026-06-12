import { createClient } from "@supabase/supabase-js";

export const supabaseConfig = {
  url: import.meta.env.PUBLIC_SUPABASE_URL ?? "",
  anonKey: import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? ""
};

export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

export function isSupabaseReady() {
  return Boolean(supabaseConfig.url && supabaseConfig.anonKey);
}

export function getSupabaseStatus() {
  return isSupabaseReady()
    ? "Conectado a Supabase"
    : "Modo demo con datos locales";
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

export async function ensureProfile(user, profile = {}) {
  if (!user) return null;

  const fallbackName = user.email?.split("@")[0] ?? "Estudiante";
  const payload = {
    id: user.id,
    nombre: profile.nombre || user.user_metadata?.nombre || fallbackName,
    apellido: profile.apellido || user.user_metadata?.apellido || "",
    universidad: profile.universidad || user.user_metadata?.universidad || ""
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}
