import { useMemo, useState } from "react";
import { LineChart as LineIcon } from "lucide-react";
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

import { Card, EmptyState, ErrorBanner, LoadingBar } from "@/components/Card";
import { formatMonth, formatPercent, modelLabel } from "@/lib/format";
import { useBacktestForecasts, useSeriesDetail } from "@/lib/hooks";
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
  realized: "hsl(var(--foreground))",
  random_walk: "hsl(var(--muted-foreground))",
  seasonal_naive: "hsl(215 16% 65%)",
  elasticnet: "hsl(var(--chart-5))",
  sarima: "hsl(var(--chart-3))",
  gradient_boosting: "hsl(var(--chart-4))",
  combo_mean: "hsl(var(--chart-2))",
  focus_median: "hsl(var(--chart-6))",
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
      <header className="flex flex-col gap-1">
        <h1 className="text-display tracking-tight text-foreground">Inflação</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          IPCA realizado versus previsões dos modelos e do Focus. Intervalo de 80% em volta do
          modelo selecionado (resíduos empíricos para SARIMA/ElasticNet/GBM).
        </p>
      </header>

      <Card
        title="Previsões vs. realizado"
        subtitle="Painel completo do backtest expanding-window"
        icon={LineIcon}
        action={
          <div className="flex flex-wrap gap-2">
            <select
              value={horizon}
              onChange={(e) => setHorizon(Number(e.target.value))}
              className="control-select"
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
              className="control-select"
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
            <div className="mb-4 flex flex-wrap gap-2">
              {MODELS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() =>
                    setSelected((prev) =>
                      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
                    )
                  }
                  className={`chip ${selected.includes(m) ? "chip-active" : ""}`}
                >
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: COLORS[m] }}
                  />
                  {modelLabel(m)}
                </button>
              ))}
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--grid))" vertical={false} />
                  <XAxis
                    dataKey="label"
                    minTickGap={16}
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <YAxis
                    unit="%"
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--card))",
                      color: "hsl(var(--card-foreground))",
                      fontSize: 12,
                    }}
                    formatter={(v: number) => formatPercent(v)}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Line
                    type="monotone"
                    dataKey="realized"
                    name="Realizado"
                    stroke={COLORS.realized}
                    strokeWidth={2.25}
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
                    strokeOpacity={0.55}
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
                    strokeOpacity={0.55}
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
