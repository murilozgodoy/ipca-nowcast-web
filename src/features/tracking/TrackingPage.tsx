import { useMemo, useState } from "react";
import { Card, EmptyState, ErrorBanner, Kpi, LoadingBar } from "@/components/Card";
import { useBacktestForecasts, useSeriesDetail } from "@/lib/hooks";
import { formatMonth, formatNumber, formatPercent, modelLabel } from "@/lib/format";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const MODELS = [
  "random_walk",
  "seasonal_naive",
  "elasticnet",
  "sarima",
  "gradient_boosting",
  "combo_mean",
  "focus_median",
];

export function TrackingPage() {
  const [model, setModel] = useState<string>("combo_mean");
  const forecasts = useBacktestForecasts(undefined, 0);
  const ipca = useSeriesDetail("sgs.433");

  const perModel = useMemo(() => {
    if (!forecasts.data || !ipca.data)
      return [] as Array<{
        month: string;
        prediction: number | null;
        actual: number | null;
        error: number | null;
      }>;
    const realized: Record<string, number | null> = Object.fromEntries(
      ipca.data.observations.map((o) => [o.reference_date, o.value]),
    );
    const rows = forecasts.data
      .filter((f) => f.model === model)
      .map((f) => {
        const actual = realized[f.reference_date] ?? null;
        const error = actual !== null && f.prediction !== null ? f.prediction - actual : null;
        return {
          month: f.reference_date,
          prediction: f.prediction,
          actual,
          error,
        };
      })
      .sort((a, b) => a.month.localeCompare(b.month));
    return rows;
  }, [forecasts.data, ipca.data, model]);

  const stats = useMemo(() => {
    const scored = perModel.filter((r) => r.error !== null) as Array<{
      month: string;
      prediction: number;
      actual: number;
      error: number;
    }>;
    if (scored.length === 0) {
      return { n: 0, rmse: null, mae: null, bias: null, hitRate: null };
    }
    const n = scored.length;
    const rmse = Math.sqrt(scored.reduce((s, r) => s + r.error * r.error, 0) / n);
    const mae = scored.reduce((s, r) => s + Math.abs(r.error), 0) / n;
    const bias = scored.reduce((s, r) => s + r.error, 0) / n;
    const hits = scored.filter((r) => Math.sign(r.prediction) === Math.sign(r.actual)).length;
    return { n, rmse, mae, bias, hitRate: hits / n };
  }, [perModel]);

  const chartData = perModel.map((r) => ({
    label: formatMonth(r.month),
    prediction: r.prediction,
    actual: r.actual,
    error: r.error,
  }));

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Acompanhamento ao vivo</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Histórico das previsões já feitas pelo sistema, confrontadas com o IPCA realizado após a
          divulgação. Mostra o modelo em uso real, não apenas em backtest.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Kpi label="Previsões avaliadas" value={formatNumber(stats.n, 0)} />
        <Kpi label="RMSE" value={formatNumber(stats.rmse, 3)} />
        <Kpi label="MAE" value={formatNumber(stats.mae, 3)} />
        <Kpi
          label="Taxa de direção correta"
          value={stats.hitRate !== null ? formatPercent(stats.hitRate * 100, 1) : "—"}
          hint="Previsão e realizado com o mesmo sinal"
        />
      </div>
      <Card
        title="Previsão vs. realizado"
        subtitle={`Horizonte 0 · ${modelLabel(model)}`}
        action={
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="rounded border border-neutral-300 bg-white p-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            aria-label="Modelo"
          >
            {MODELS.map((m) => (
              <option key={m} value={m}>
                {modelLabel(m)}
              </option>
            ))}
          </select>
        }
      >
        {(forecasts.isLoading || ipca.isLoading) && <LoadingBar />}
        {forecasts.isError && <ErrorBanner error={forecasts.error} />}
        {chartData.length === 0 && !forecasts.isLoading ? (
          <EmptyState message="Sem histórico suficiente para este modelo." />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="label" minTickGap={16} />
                <YAxis unit="%" />
                <Tooltip formatter={(v: number) => formatPercent(v)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Realizado"
                  stroke="#111827"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="prediction"
                  name={modelLabel(model)}
                  stroke="#005B96"
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
      <Card title="Erro por mês" subtitle="Erro = previsão − realizado">
        {chartData.length === 0 ? (
          <EmptyState message="Sem erros para plotar ainda." />
        ) : (
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="label" minTickGap={16} />
                <YAxis unit="%" />
                <Tooltip formatter={(v: number) => formatPercent(v)} />
                <ReferenceLine y={0} stroke="#9ca3af" />
                <Line
                  type="monotone"
                  dataKey="error"
                  name="Erro"
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
