const MIN_INSTALLMENT = 15;

const TIER_LIMITS: [number, number][] = [
  [50, 3],
  [150, 6],
  [Infinity, 10],
];

export function calcInstallments(price: number): { count: number; value: number } {
  if (price <= 0) return { count: 1, value: price };

  const tierMax = TIER_LIMITS.find(([cap]) => price <= cap)![1];
  const calculated = Math.floor(price / MIN_INSTALLMENT);
  const count = Math.max(1, Math.min(calculated, tierMax));
  const value = price / count;

  return { count, value };
}

export function formatInstallmentText(price: number): string {
  const { count, value } = calcInstallments(price);
  if (count <= 1) return "";
  const formatted =
    value % 1 === 0
      ? value.toLocaleString("pt-BR")
      : value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${count}x de R$ ${formatted}`;
}
