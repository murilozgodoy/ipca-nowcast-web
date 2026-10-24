/**
 * Brazilian-locale formatting helpers.
 */

const PT_BR = "pt-BR";

export function formatPercent(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${new Intl.NumberFormat(PT_BR, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)}%`;
}

export function formatNumber(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat(PT_BR, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

const MONTHS_PT: Record<number, string> = {
  1: "jan",
  2: "fev",
  3: "mar",
  4: "abr",
  5: "mai",
  6: "jun",
  7: "jul",
  8: "ago",
  9: "set",
  10: "out",
  11: "nov",
  12: "dez",
};

export function formatMonth(isoDate: string): string {
  const [year, month] = isoDate.split("-").map(Number);
  const label = MONTHS_PT[month ?? 0] ?? String(month);
  return `${label}/${String(year).slice(-2)}`;
}

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat(PT_BR, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

const MODEL_LABELS: Record<string, string> = {
  random_walk: "Random walk",
  historical_mean: "Média histórica (12m)",
  seasonal_naive: "Sazonal ingênuo",
  focus_median: "Boletim Focus (mediana)",
  elasticnet: "ElasticNet",
  sarima: "SARIMA",
  gradient_boosting: "Gradient Boosting",
  combo_mean: "Combinação (média)",
};

export function modelLabel(model: string): string {
  return MODEL_LABELS[model] ?? model;
}

export function subperiodLabel(subperiod: string): string {
  switch (subperiod) {
    case "full":
      return "Toda a amostra";
    case "pre_2020":
      return "Pré-2020";
    case "pandemic":
      return "Pandemia (2020-2021)";
    case "post_2022":
      return "A partir de 2022";
    default:
      return subperiod;
  }
}
