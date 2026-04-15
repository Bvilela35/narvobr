export interface FocusInputs {
  rendaMensal: number;
  horasDia: number;
  pctBaixoValor: number;
  interrupcoes: number;
}

export interface FocusResult {
  custoAnual: number;
  custoDist: number;
  custoBaixo: number;
  custoHora: number;
  score: number;
  scoreLabel: string;
  horasFocoProfundo: number;
  horasDistracoes: number;
  horasOverhead: number;
  ganho20: number;
  // Productivity-focused metrics
  horasPerdidasDia: number;
  horasPerdidasMes: number;
  horasPerdidasAno: number;
  diasPerdidasAno: number;
  horasRecuperaveisMes: number;
}

export function calcFocus(inputs: FocusInputs): FocusResult {
  const { rendaMensal, horasDia, pctBaixoValor, interrupcoes } = inputs;

  const custoHora = rendaMensal / (horasDia * 22);

  // Custo de interrupções: cada uma consome 23min para retomar foco
  // 240 dias úteis (5 dias × 48 semanas)
  const custoDist = interrupcoes * (23 / 60) * 240 * custoHora;

  // Custo de tarefas de baixo valor: apenas 30% é recuperável
  // 264 dias úteis (22 dias × 12 meses)
  const custoBaixo = horasDia * (pctBaixoValor / 100) * 0.30 * custoHora * 264;

  const custoAnual = custoDist + custoBaixo;

  // Distribuição de horas por dia
  const horasDistracoes = Math.min(interrupcoes * (23 / 60), horasDia);
  const horasOverhead = Math.min(horasDia * (pctBaixoValor / 100), horasDia - horasDistracoes);
  const horasFocoProfundo = Math.max(horasDia - horasDistracoes - horasOverhead, 0);

  // Score de foco: 0–10
  const focoPct = horasFocoProfundo / horasDia;
  const intPenalty = Math.min(interrupcoes / 30, 1);
  const score = Math.round(Math.max(0, Math.min(10, focoPct * 10 - intPenalty * 3)));

  const scoreLabel =
    score < 4 ? "Crítico" :
    score <= 6 ? "Regular" :
    score <= 8 ? "Bom" :
    "Alto Desempenho";

  const ganho20 = custoAnual * 0.20;

  // Productivity hours
  const horasPerdidasDia = horasDistracoes + horasOverhead;
  const horasPerdidasMes = horasPerdidasDia * 22;
  const horasPerdidasAno = horasPerdidasDia * 264;
  const diasPerdidasAno = Math.round(horasPerdidasAno / horasDia);
  const horasRecuperaveisMes = horasPerdidasMes * 0.20;

  return {
    custoAnual,
    custoDist,
    custoBaixo,
    custoHora,
    score,
    scoreLabel,
    horasFocoProfundo,
    horasDistracoes,
    horasOverhead,
    ganho20,
    horasPerdidasDia,
    horasPerdidasMes,
    horasPerdidasAno,
    diasPerdidasAno,
    horasRecuperaveisMes,
  };
}

export function getCollectionByScore(score: number): string {
  if (score < 5) return "/colecao/construir-setup";
  if (score <= 7) return "/colecao/insight";
  return "/colecao/outsight";
}
