const MIN_INSTALLMENT = 15;

const TIER_LIMITS: [number, number][] = [
  [50, 10],
  [200, 6],
  [Infinity, 10],
];

export function calcInstallments(price: number): { count: number; value: number } {
  if (price <= 0) return { count: 1, value: price };

  // For low-ticket items (≤ R$50), allow up to 10x for aggressive conversion
  const tierMax = TIER_LIMITS.find(([cap]) => price <= cap)![1];
  const calculated = Math.floor(price / MIN_INSTALLMENT);
  // For low-ticket, don't enforce MIN_INSTALLMENT — allow full 10x
  const count = price <= 50
    ? Math.max(1, tierMax)
    : Math.max(1, Math.min(calculated, tierMax));
  const value = price / count;

  return { count, value };
}

export type PriceTier = 'friction' | 'roi' | 'identity';

export function getPriceTier(price: number): PriceTier {
  if (price <= 60) return 'friction';
  if (price <= 200) return 'roi';
  return 'identity';
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
