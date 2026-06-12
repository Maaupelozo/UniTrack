import { supabase, getCurrentUser } from "./supabase.js";
import { getMateriasFromSupabase } from "./materias.js";

export const parciales = [];

export const tareas = [];

export function getParciales() {
  return parciales;
}

export function getTareas() {
  return tareas;
}

export function getProximoParcial() {
  return parciales[0] ?? null;
}

function sortByDate(items, key) {
  return [...items].sort((a, b) => new Date(a[key] ?? 0) - new Date(b[key] ?? 0));
}

export async function getParcialesFromSupabase() {
  const materias = await getMateriasFromSupabase();
  if (!materias.length) return [];

  const materiaById = new Map(materias.map((materia) => [materia.id, materia]));
  const { data, error } = await supabase
    .from("parciales")
    .select("*")
    .in("materia_id", materias.map((materia) => materia.id))
    .order("fecha", { ascending: true, nullsFirst: false });

  if (error) throw error;

  return (data ?? []).map((parcial) => ({
    ...parcial,
    materia: materiaById.get(parcial.materia_id)?.nombre ?? "Materia"
  }));
}

export async function getTrabajosFromSupabase() {
  const materias = await getMateriasFromSupabase();
  if (!materias.length) return [];

  const materiaById = new Map(materias.map((materia) => [materia.id, materia]));
  const { data, error } = await supabase
    .from("trabajos_practicos")
    .select("*")
    .in("materia_id", materias.map((materia) => materia.id))
    .order("fecha_entrega", { ascending: true, nullsFirst: false });

  if (error) throw error;

  return (data ?? []).map((trabajo) => ({
    ...trabajo,
    materia: materiaById.get(trabajo.materia_id)?.nombre ?? "Materia"
  }));
}

export async function getEventosFromSupabase() {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("eventos")
    .select("*")
    .eq("usuario_id", user.id)
    .order("fecha_inicio", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createParcial(input) {
  const { data, error } = await supabase
    .from("parciales")
    .insert({
      materia_id: input.materia_id,
      titulo: input.titulo,
      fecha: input.fecha,
      estado: input.estado || "pendiente",
      observaciones: input.observaciones || null
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateNotaParcial(materiaId, nota) {
  const { data, error } = await supabase
    .from("materias")
    .update({ nota_parcial_promedio: Number(nota) })
    .eq("id", materiaId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateNotaTrabajo(materiaId, nota) {
  const { data, error } = await supabase
    .from("materias")
    .update({ nota_tp_promedio: Number(nota) })
    .eq("id", materiaId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTrabajoPractico(trabajoId) {
  const { data, error } = await supabase
    .from("trabajos_practicos")
    .delete()
    .eq("id", trabajoId)
    .select();

  if (error) throw error;
  return data;
}

export async function createPendiente(input) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Necesitas iniciar sesion.");

  const tipo = input.tipo;

  if (tipo === "tp") {
    const { data, error } = await supabase
      .from("trabajos_practicos")
      .insert({
        materia_id: input.materia_id,
        titulo: input.titulo,
        fecha_entrega: input.fecha,
        estado: "pendiente"
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  } else if (tipo === "parcial") {
    const { data, error } = await supabase
      .from("parciales")
      .insert({
        materia_id: input.materia_id,
        titulo: input.titulo,
        fecha: input.fecha,
        estado: "pendiente"
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  throw new Error("Tipo de pendiente no valido: " + tipo);
}

export async function getAgendaAcademica() {
  const [parcialesDb, trabajosDb, eventosDb] = await Promise.all([
    getParcialesFromSupabase(),
    getTrabajosFromSupabase(),
    getEventosFromSupabase()
  ]);

  return sortByDate(
    [
      ...parcialesDb.map((item) => ({
        id: item.id,
        tipo: "parcial",
        titulo: item.titulo,
        materia: item.materia,
        fecha: item.fecha,
        estado: item.estado
      })),
      ...trabajosDb.map((item) => ({
        id: item.id,
        tipo: "tp",
        titulo: item.titulo,
        materia: item.materia,
        fecha: item.fecha_entrega,
        estado: item.estado
      })),
      ...eventosDb.map((item) => ({
        id: item.id,
        tipo: item.tipo || "evento",
        titulo: item.titulo,
        materia: "Personal",
        fecha: item.fecha_inicio,
        estado: item.tipo || "otro"
      }))
    ],
    "fecha"
  );
}
