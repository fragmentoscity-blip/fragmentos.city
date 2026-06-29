export function formatDateOnly(date: string, locale = "es-CO") {
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return "";

  return new Date(year, month - 1, day).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
