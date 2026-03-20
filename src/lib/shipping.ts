export function normalizeCep(v: string) {
  return v.replace(/\D/g, "").slice(0, 8);
}

export function formatCep(v: string) {
  const digits = normalizeCep(v);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
}

export function formatDateRange(minDays: number, maxDays: number) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() + minDays);
  const end = new Date(now);
  end.setDate(end.getDate() + maxDays);
  const fmt = (d: Date) => {
    const day = d.getDate();
    const months = ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
    return `${day} de ${months[d.getMonth()]}`;
  };
  return `${fmt(start)}–${fmt(end)}`;
}

export function getShippingRegion(cepValue: string) {
  const prefix = parseInt(cepValue.substring(0, 2), 10);
  if (prefix >= 1 && prefix <= 39) return { type: "Envio Rápido", dateRange: formatDateRange(2, 5) };
  if (prefix >= 70 && prefix <= 76 || prefix >= 78 && prefix <= 79) return { type: "Envio Rápido", dateRange: formatDateRange(2, 5) };
  if (prefix >= 80 && prefix <= 99) return { type: "Envio Rápido", dateRange: formatDateRange(2, 5) };
  return { type: "Envio Normal", dateRange: formatDateRange(4, 12) };
}
