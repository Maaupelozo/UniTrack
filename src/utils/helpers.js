export function formatDate(dateString) {
  return new Intl.DateTimeFormat("es-PY", {
    weekday: "short",
    day: "numeric",
    month: "short"
  }).format(new Date(`${dateString}T12:00:00`));
}

export function daysUntil(dateString) {
  const today = new Date("2026-06-10T12:00:00");
  const target = new Date(`${dateString}T12:00:00`);
  return Math.max(0, Math.ceil((target - today) / 86400000));
}

export function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}
