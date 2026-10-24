import { http, HttpResponse } from "msw";
import { API_URL } from "@/lib/api";
import health from "./fixtures/health.json";
import series from "./fixtures/series.json";
import seriesSgs1 from "./fixtures/series_sgs1.json";
import seriesSgs13522 from "./fixtures/series_sgs13522.json";
import seriesSgs432 from "./fixtures/series_sgs432.json";
import seriesSgs433 from "./fixtures/series_sgs433.json";
import nowcastH0 from "./fixtures/nowcast_latest_h0.json";
import nowcastH1 from "./fixtures/nowcast_latest_h1.json";
import backtestMetrics from "./fixtures/backtest_metrics.json";
import backtestForecasts from "./fixtures/backtest_forecasts.json";
import focusLatest from "./fixtures/focus_latest.json";
import ipcaGroups from "./fixtures/ipca_groups.json";

const seriesMap: Record<string, unknown> = {
  "sgs.1": seriesSgs1,
  "sgs.432": seriesSgs432,
  "sgs.433": seriesSgs433,
  "sgs.13522": seriesSgs13522,
};

export const handlers = [
  http.get(`${API_URL}/health`, () => HttpResponse.json(health)),
  http.get(`${API_URL}/series`, () => HttpResponse.json(series)),
  http.get(`${API_URL}/series/:code`, ({ params }) => {
    const code = params.code as string;
    const payload = seriesMap[code];
    if (payload) return HttpResponse.json(payload);
    return HttpResponse.json({ detail: `Series '${code}' not found.` }, { status: 404 });
  }),
  http.get(`${API_URL}/nowcast/latest`, ({ request }) => {
    const horizon = new URL(request.url).searchParams.get("horizon") ?? "0";
    const payload = horizon === "0" ? nowcastH0 : nowcastH1;
    return HttpResponse.json(payload);
  }),
  http.get(`${API_URL}/backtest/metrics`, ({ request }) => {
    const url = new URL(request.url);
    const horizon = url.searchParams.get("horizon");
    const subperiod = url.searchParams.get("subperiod");
    const all = backtestMetrics as Array<{ horizon: number; subperiod: string }>;
    const filtered = all.filter((m) => {
      if (horizon !== null && m.horizon !== Number(horizon)) return false;
      if (subperiod && m.subperiod !== subperiod) return false;
      return true;
    });
    return HttpResponse.json(filtered);
  }),
  http.get(`${API_URL}/backtest/forecasts`, ({ request }) => {
    const url = new URL(request.url);
    const horizon = url.searchParams.get("horizon");
    const model = url.searchParams.get("model");
    const limit = Number(url.searchParams.get("limit") ?? 200);
    const all = backtestForecasts as Array<{ horizon: number; model: string }>;
    const filtered = all.filter((f) => {
      if (horizon !== null && f.horizon !== Number(horizon)) return false;
      if (model && f.model !== model) return false;
      return true;
    });
    return HttpResponse.json(filtered.slice(0, limit));
  }),
  http.get(`${API_URL}/focus/latest`, () => HttpResponse.json(focusLatest)),
  http.get(`${API_URL}/ipca/groups`, () => HttpResponse.json(ipcaGroups)),
];
