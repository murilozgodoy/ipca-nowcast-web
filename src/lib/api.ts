import { z } from "zod";

export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000";

export const Health = z.object({
  status: z.enum(["ok", "degraded"]),
  version: z.string(),
  database: z.enum(["up", "down"]),
});
export type Health = z.infer<typeof Health>;

export const Series = z.object({
  code: z.string(),
  name: z.string(),
  source: z.string(),
  unit: z.string(),
  frequency: z.string(),
  publication_lag_days: z.number(),
  is_target: z.boolean(),
});
export type Series = z.infer<typeof Series>;
export const SeriesList = z.array(Series);

export const Observation = z.object({
  reference_date: z.string(),
  value: z.number().nullable(),
});
export type Observation = z.infer<typeof Observation>;

export const SeriesDetail = Series.extend({
  first_date: z.string().nullable(),
  last_date: z.string().nullable(),
  n: z.number(),
  observations: z.array(Observation),
});
export type SeriesDetail = z.infer<typeof SeriesDetail>;

export const NowcastRow = z.object({
  model: z.string(),
  prediction: z.number(),
  pi_lower: z.number().nullable().optional(),
  pi_upper: z.number().nullable().optional(),
});
export type NowcastRow = z.infer<typeof NowcastRow>;

export const NowcastLatest = z.object({
  origin_date: z.string(),
  target_month: z.string(),
  horizon: z.number(),
  models: z.array(NowcastRow),
  focus_median: z.number().nullable(),
});
export type NowcastLatest = z.infer<typeof NowcastLatest>;

export const BacktestMetric = z.object({
  model: z.string(),
  horizon: z.number(),
  subperiod: z.string(),
  n: z.number(),
  rmse: z.number().nullable(),
  mae: z.number().nullable(),
  bias: z.number().nullable(),
  rmse_vs_focus: z.number().nullable(),
  dm_stat_vs_focus: z.number().nullable(),
  dm_pvalue_vs_focus: z.number().nullable(),
});
export type BacktestMetric = z.infer<typeof BacktestMetric>;
export const BacktestMetrics = z.array(BacktestMetric);

export const ForecastPoint = z.object({
  model: z.string(),
  origin_date: z.string(),
  reference_date: z.string(),
  horizon: z.number(),
  prediction: z.number(),
  pi_lower: z.number().nullable().optional(),
  pi_upper: z.number().nullable().optional(),
});
export type ForecastPoint = z.infer<typeof ForecastPoint>;
export const ForecastPoints = z.array(ForecastPoint);

export const FocusLatestPoint = z.object({
  reference_date: z.string(),
  collected_at: z.string(),
  median: z.number().nullable(),
  mean: z.number().nullable(),
  std_dev: z.number().nullable(),
  n_respondents: z.number().nullable(),
});
export type FocusLatestPoint = z.infer<typeof FocusLatestPoint>;
export const FocusLatestList = z.array(FocusLatestPoint);

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, parser: z.ZodType<T>): Promise<T> {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new ApiError(res.status, `GET ${path} failed with ${res.status}`);
  }
  const raw = await res.json();
  return parser.parse(raw);
}

export const api = {
  health: () => request("/health", Health),
  series: () => request("/series", SeriesList),
  seriesDetail: (code: string) => request(`/series/${encodeURIComponent(code)}`, SeriesDetail),
  nowcastLatest: (horizon = 0) => request(`/nowcast/latest?horizon=${horizon}`, NowcastLatest),
  backtestMetrics: (params: { horizon?: number; subperiod?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.horizon !== undefined) q.set("horizon", String(params.horizon));
    if (params.subperiod) q.set("subperiod", params.subperiod);
    const suffix = q.toString() ? `?${q.toString()}` : "";
    return request(`/backtest/metrics${suffix}`, BacktestMetrics);
  },
  backtestForecasts: (params: { model?: string; horizon?: number; limit?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.model) q.set("model", params.model);
    if (params.horizon !== undefined) q.set("horizon", String(params.horizon));
    if (params.limit !== undefined) q.set("limit", String(params.limit));
    const suffix = q.toString() ? `?${q.toString()}` : "";
    return request(`/backtest/forecasts${suffix}`, ForecastPoints);
  },
  focusLatest: (limit = 12) => request(`/focus/latest?limit=${limit}`, FocusLatestList),
};
