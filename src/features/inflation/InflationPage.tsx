import { useMemo, useState } from "react";
import { Card, EmptyState, ErrorBanner, LoadingBar } from "@/components/Card";
import { useBacktestForecasts, useSeriesDetail } from "@/lib/hooks";
import { formatMonth, formatPercent, modelLabel } from "@/lib/format";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { IpcaGroupsCard } from "./IpcaGroupsCard";

const MODELS = [
  "random_walk",
  "seasonal_naive",
  "elasticnet",
  "sarima",
  "gradient_boosting",
  "combo_mean",
  "focus_median",
];
const COLORS: Record<string, string> = {
  realized: "#111827",
  random_walk: "#6b7280",
  seasonal_naive: "#9ca3af",
  elasticnet: "#0ea5e9",
  sarima: "#f59e0b",
  gradient_boosting: "#8b5cf6",
  combo_mean: "#10b981",
  focus_median: "#ef4444",
};

export function InflationPage() {
  const [horizon, setHorizon] = useState(0);
  const [selected, setSelected] = useState<string[]>(["combo_mean", "focus_median"]);
  const [bandModel, setBandModel] = useState<string>("sarima");
  const forecasts = useBacktestForecasts(undefined, horizon);
  const ipca = useSeriesDetail("sgs.433");

  const chartData = useMemo(() => {
    if (!forecasts.data || !ipca.data) return [];
    const months = new Set<string>();
    for (const point of forecasts.data) months.add(point.reference_date);
    for (const obs of ipca.data.observations) months.add(obs.reference_date);
    const index = Array.from(months).sort();
    const realizedByMonth: Record<string, number | null> = Object.fromEntries(
      ipca.data.observations.map((o) => [o.reference_date, o.value]),
    );
    const bandByMonth: Record<string, { lo: number | null; hi: number | null }> = {};
    for (const p of forecasts.data) {
      if (p.model === bandModel) {
        bandByMonth[p.reference_date] = {
          lo: p.pi_lower ?? null,
          hi: p.pi_upper ?? null,
        };
      }
    }
    return index
      .map((month) => {
        const row: Record<string, number | string | null> = {
          month,
          label: formatMonth(month),
          realized: realizedByMonth[month] ?? null,
          pi_lower: bandByMonth[month]?.lo ?? null,
          pi_upper: bandByMonth[month]?.hi ?? null,
        };
        for (const model of MODELS) {
          row[model] = null;
        }
        return row;
      })
      .map((row) => {
        for (const point of forecasts.data ?? []) {
          if (point.reference_date === row.month) {
            row[point.model] = point.prediction;
          }
        }
        return row;
      });
  }, [forecasts.data, ipca.data, bandModel]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Inflação</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          IPCA realizado versus previsões dos modelos e do Focus, com intervalo de 80% em volta do
          modelo selecionado.
        </p>
      </header>
      <Card
        title="Previsões vs. realizado"
        action={
          <div className="flex flex-wrap gap-2 text-sm">
            <select
              value={horizon}
              onChange={(e) => setHorizon(Number(e.target.value))}
              className="rounded border border-neutral-300 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-900"
              aria-label="Horizonte"
            >
              <option value={0}>Horizonte 0 (nowcast)</option>
              <option value={1}>Horizonte 1</option>
              <option value={2}>Horizonte 2</option>
              <option value={3}>Horizonte 3</option>
            </select>
            <select
              value={bandModel}
              onChange={(e) => setBandModel(e.target.value)}
              className="rounded border border-neutral-300 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-900"
              aria-label="Modelo com intervalo"
            >
              {["sarima", "elasticnet", "gradient_boosting"].map((m) => (
                <option key={m} value={m}>
                  Intervalo: {modelLabel(m)}
                </option>
              ))}
            </select>
          </div>
        }
      >
        {(forecasts.isLoading || ipca.isLoading) && <LoadingBar />}
        {forecasts.isError && <ErrorBanner error={forecasts.error} />}
        {chartData.length === 0 && !forecasts.isLoading ? (
          <EmptyState message="Rode o backtest para preencher este gráfico." />
        ) : (
          <>
            <div className="mb-3 flex flex-wrap gap-2 text-xs">
              {MODELS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() =>
                    setSelected((prev) =>
                      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
                    )
                  }
                  className={`rounded-full border px-3 py-1 ${
                    selected.includes(m)
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-neutral-300 text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
                  }`}
                >
                  {modelLabel(m)}
                </button>
              ))}
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="label" minTickGap={16} />
                  <YAxis unit="%" />
                  <Tooltip formatter={(v: number) => formatPercent(v)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="realized"
                    name="Realizado"
                    stroke={COLORS.realized}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  {selected.map((m) => (
                    <Line
                      key={m}
                      type="monotone"
                      dataKey={m}
                      name={modelLabel(m)}
                      stroke={COLORS[m] ?? "#333"}
                      strokeWidth={1.5}
                      dot={false}
                      connectNulls
                      isAnimationActive={false}
                    />
                  ))}
                  <Line
                    type="monotone"
                    dataKey="pi_lower"
                    name={`PI 80% inf. (${modelLabel(bandModel)})`}
                    stroke={COLORS[bandModel] ?? "#8884d8"}
                    strokeDasharray="4 4"
                    strokeOpacity={0.5}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="pi_upper"
                    name={`PI 80% sup. (${modelLabel(bandModel)})`}
                    stroke={COLORS[bandModel] ?? "#8884d8"}
                    strokeDasharray="4 4"
                    strokeOpacity={0.5}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </Card>
      <IpcaGroupsCard />
    </div>
  );
}
