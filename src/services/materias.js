import { supabase, getCurrentUser, ensureProfile } from "./supabase.js";

export const materias = [];

export function getMaterias() {
  return materias;
}

export function getMateriaById(id) {
  return materias.find((materia) => materia.id === id);
}

export function getResumenMaterias() {
  const total = materias.length;
  if (!total) {
    return {
      total: 0,
      promedio: "0.0",
      progreso: 0,
      asistencia: 0
    };
  }

  const promedio = materias.reduce((acc, materia) => acc + materia.promedio, 0) / total;
  const progreso = materias.reduce((acc, materia) => acc + materia.progreso, 0) / total;
  const asistencia = materias.reduce((acc, materia) => acc + materia.asistencia, 0) / total;

  return {
    total,
    promedio: promedio.toFixed(1),
    progreso: Math.round(progreso),
    asistencia: Math.round(asistencia)
  };
}

export async function getCarrerasActuales() {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("carreras")
    .select("*")
    .eq("usuario_id", user.id)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getOrCreateCarrera() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Necesitas iniciar sesion para crear materias.");

  await ensureProfile(user);
  const carreras = await getCarrerasActuales();
  if (carreras.length) return carreras[0];

  const { data, error } = await supabase
    .from("carreras")
    .insert({
      usuario_id: user.id,
      nombre: "Mi carrera",
      universidad: ""
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMateriasFromSupabase() {
  const carreras = await getCarrerasActuales();
  if (!carreras.length) return [];

  const carreraIds = carreras.map((carrera) => carrera.id);
  const { data, error } = await supabase
    .from("materias")
    .select("*")
    .in("carrera_id", carreraIds)
    .order("anio", { ascending: true, nullsFirst: false })
    .order("cuatrimestre", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createMateria(input) {
  const carrera = await getOrCreateCarrera();
  const { data, error } = await supabase
    .from("materias")
    .insert({
      carrera_id: carrera.id,
      nombre: input.nombre,
      anio: input.anio ? Number(input.anio) : null,
      cuatrimestre: input.cuatrimestre ? Number(input.cuatrimestre) : null,
      estado: input.estado || "cursando",
      nota_final: input.nota_final ? Number(input.nota_final) : null
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMateriaEstado(id, estado) {
  const { data, error } = await supabase
    .from("materias")
    .update({ estado })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
