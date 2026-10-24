import { useState } from "react";
import { Card, EmptyState, ErrorBanner, LoadingBar } from "@/components/Card";
import { useBacktestMetrics } from "@/lib/hooks";
import { formatNumber, modelLabel, subperiodLabel } from "@/lib/format";

const SUBPERIODS = ["full", "pre_2020", "pandemic", "post_2022"];

export function ModelsPage() {
  const [horizon, setHorizon] = useState(0);
  const [subperiod, setSubperiod] = useState("full");
  const metrics = useBacktestMetrics(horizon, subperiod);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Modelos</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Leaderboard dos modelos vs. Focus. O <strong>RMSE relativo</strong> abaixo de 1 significa
          que o modelo foi melhor que o consenso. O <strong>teste de Diebold-Mariano</strong> indica
          se a diferença de acurácia é estatisticamente significativa.
        </p>
      </header>
      <Card
        title="Métricas de backtest"
        action={
          <div className="flex gap-2 text-sm">
            <select
              value={horizon}
              onChange={(e) => setHorizon(Number(e.target.value))}
              className="rounded border border-neutral-300 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-900"
              aria-label="Horizonte"
            >
              <option value={0}>Horizonte 0</option>
              <option value={1}>Horizonte 1</option>
              <option value={2}>Horizonte 2</option>
              <option value={3}>Horizonte 3</option>
            </select>
            <select
              value={subperiod}
              onChange={(e) => setSubperiod(e.target.value)}
              className="rounded border border-neutral-300 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-900"
              aria-label="Subperíodo"
            >
              {SUBPERIODS.map((s) => (
                <option key={s} value={s}>
                  {subperiodLabel(s)}
                </option>
              ))}
            </select>
          </div>
        }
      >
        {metrics.isLoading && <LoadingBar />}
        {metrics.isError && <ErrorBanner error={metrics.error} />}
        {metrics.data && metrics.data.length === 0 && (
          <EmptyState message="Nenhuma métrica para esta combinação." />
        )}
        {metrics.data && metrics.data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-neutral-500 dark:text-neutral-400">
                  <th className="py-2">Modelo</th>
                  <th className="py-2 text-right">N</th>
                  <th className="py-2 text-right">RMSE</th>
                  <th className="py-2 text-right">MAE</th>
                  <th className="py-2 text-right">Viés</th>
                  <th className="py-2 text-right">RMSE / Focus</th>
                  <th className="py-2 text-right">DM</th>
                  <th className="py-2 text-right">p-valor</th>
                </tr>
              </thead>
              <tbody>
                {[...metrics.data]
                  .sort((a, b) => (a.rmse ?? Infinity) - (b.rmse ?? Infinity))
                  .map((m) => (
                    <tr
                      key={`${m.model}-${m.horizon}-${m.subperiod}`}
                      className="border-t border-neutral-200 dark:border-neutral-800"
                    >
                      <td className="py-2 font-medium">{modelLabel(m.model)}</td>
                      <td className="py-2 text-right tabular-nums">{m.n}</td>
                      <td className="py-2 text-right tabular-nums">{formatNumber(m.rmse, 4)}</td>
                      <td className="py-2 text-right tabular-nums">{formatNumber(m.mae, 4)}</td>
                      <td className="py-2 text-right tabular-nums">{formatNumber(m.bias, 4)}</td>
                      <td className="py-2 text-right tabular-nums">
                        {formatNumber(m.rmse_vs_focus, 3)}
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        {formatNumber(m.dm_stat_vs_focus, 2)}
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        {formatNumber(m.dm_pvalue_vs_focus, 3)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <Card title="O que é o teste de Diebold-Mariano?">
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          O teste compara os erros quadrados do modelo contra os erros do Focus para os mesmos
          meses. A hipótese nula é que os dois têm a mesma acurácia esperada. Um{" "}
          <strong>DM negativo</strong> indica que o modelo erra menos que o Focus. Se o{" "}
          <strong>p-valor</strong> for menor que <code>0,05</code> a diferença é estatisticamente
          significativa ao nível de 5%.
        </p>
      </Card>
    </div>
  );
}
