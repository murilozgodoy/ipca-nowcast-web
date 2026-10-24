import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

export const healthQuery = () => ({
  queryKey: ["health"] as const,
  queryFn: () => api.health(),
  staleTime: 30_000,
});

export const useHealth = () => useQuery(healthQuery());

export const useSeries = () =>
  useQuery({ queryKey: ["series"] as const, queryFn: () => api.series() });

export const useSeriesDetail = (code: string | null) =>
  useQuery({
    queryKey: ["series", code] as const,
    queryFn: () => api.seriesDetail(code as string),
    enabled: Boolean(code),
  });

export const useNowcast = (horizon = 0) =>
  useQuery({
    queryKey: ["nowcast", horizon] as const,
    queryFn: () => api.nowcastLatest(horizon),
  });

export const useBacktestMetrics = (horizon?: number, subperiod?: string) =>
  useQuery({
    queryKey: ["backtest-metrics", horizon, subperiod] as const,
    queryFn: () => api.backtestMetrics({ horizon, subperiod }),
  });

export const useBacktestForecasts = (model?: string, horizon?: number) =>
  useQuery({
    queryKey: ["backtest-forecasts", model, horizon] as const,
    queryFn: () => api.backtestForecasts({ model, horizon, limit: 500 }),
  });

export const useFocusLatest = (limit = 12) =>
  useQuery({
    queryKey: ["focus-latest", limit] as const,
    queryFn: () => api.focusLatest(limit),
  });
