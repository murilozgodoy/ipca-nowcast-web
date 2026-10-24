import { useMemo, useState } from "react";
import { Activity, CheckCircle2, Target, TrendingUp } from "lucide-react";
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

import { Card, EmptyState, ErrorBanner, Kpi, LoadingBar } from "@/components/Card";
import { formatMonth, formatNumber, formatPercent, modelLabel } from "@/lib/format";
import { useBacktestForecasts, useSeriesDetail } from "@/lib/hooks";

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
    return forecasts.data
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

  const hitTone =
    stats.hitRate != null
      ? stats.hitRate >= 0.7
        ? "positive"
        : stats.hitRate >= 0.5
          ? "neutral"
          : "negative"
      : "neutral";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-display tracking-tight text-foreground">Acompanhamento ao vivo</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Histórico das previsões feitas pelo sistema, confrontadas com o IPCA realizado após a
          divulgação. Mostra o modelo em uso real — não apenas em backtest.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Previsões avaliadas" value={formatNumber(stats.n, 0)} icon={Target} />
        <Kpi
          label="RMSE"
          value={formatNumber(stats.rmse, 3)}
          hint="Raiz do erro quadrático médio"
          icon={Activity}
        />
        <Kpi
          label="MAE"
          value={formatNumber(stats.mae, 3)}
          hint="Erro absoluto médio"
          icon={TrendingUp}
        />
        <Kpi
          label="Taxa de direção correta"
          value={stats.hitRate !== null ? formatPercent(stats.hitRate * 100, 1) : "—"}
          hint="Previsão e realizado com o mesmo sinal"
          icon={CheckCircle2}
          trend={stats.hitRate != null && stats.hitRate >= 0.5 ? "up" : "down"}
          trendLabel={
            stats.hitRate != null ? formatPercent((stats.hitRate - 0.5) * 100, 1) : undefined
          }
          trendTone={hitTone}
        />
      </div>

      <Card
        title="Previsão vs. realizado"
        subtitle={`Horizonte 0 · ${modelLabel(model)}`}
        icon={Activity}
        action={
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="control-select"
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
                  dataKey="actual"
                  name="Realizado"
                  stroke="hsl(var(--foreground))"
                  strokeWidth={2.25}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="prediction"
                  name={modelLabel(model)}
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={1.75}
                  dot={false}
                  connectNulls
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card title="Erro por mês" subtitle="Erro = previsão − realizado" icon={TrendingUp}>
        {chartData.length === 0 ? (
          <EmptyState message="Sem erros para plotar ainda." />
        ) : (
          <div className="h-60 w-full">
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
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.5} />
                <Line
                  type="monotone"
                  dataKey="error"
                  name="Erro"
                  stroke="hsl(var(--chart-6))"
                  strokeWidth={1.75}
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
