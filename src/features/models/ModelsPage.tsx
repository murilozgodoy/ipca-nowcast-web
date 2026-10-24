import { useState } from "react";
import { BarChart3, Info } from "lucide-react";

import { Badge, Card, EmptyState, ErrorBanner, LoadingBar } from "@/components/Card";
import { formatNumber, modelLabel, subperiodLabel } from "@/lib/format";
import { useBacktestMetrics } from "@/lib/hooks";

const SUBPERIODS = ["full", "pre_2020", "pandemic", "post_2022"];

export function ModelsPage() {
  const [horizon, setHorizon] = useState(0);
  const [subperiod, setSubperiod] = useState("full");
  const metrics = useBacktestMetrics(horizon, subperiod);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-display tracking-tight text-foreground">Modelos</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Leaderboard dos modelos vs. Focus. O <strong>RMSE relativo</strong> abaixo de 1 significa
          que o modelo foi melhor que o consenso. O <strong>teste de Diebold-Mariano</strong> indica
          se a diferença é estatisticamente significativa.
        </p>
      </header>

      <Card
        title="Métricas de backtest"
        subtitle="Expanding-window out-of-sample"
        icon={BarChart3}
        action={
          <div className="flex gap-2">
            <select
              value={horizon}
              onChange={(e) => setHorizon(Number(e.target.value))}
              className="control-select"
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
              className="control-select"
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
            <table className="table-pro">
              <thead>
                <tr>
                  <th>Modelo</th>
                  <th className="text-right">N</th>
                  <th className="text-right">RMSE</th>
                  <th className="text-right">MAE</th>
                  <th className="text-right">Viés</th>
                  <th className="text-right">RMSE / Focus</th>
                  <th className="text-right">DM</th>
                  <th className="text-right">p-valor</th>
                </tr>
              </thead>
              <tbody>
                {[...metrics.data]
                  .sort((a, b) => (a.rmse ?? Infinity) - (b.rmse ?? Infinity))
                  .map((m, index) => {
                    const beatsFocus = m.rmse_vs_focus != null && m.rmse_vs_focus < 1;
                    const significant = m.dm_pvalue_vs_focus != null && m.dm_pvalue_vs_focus < 0.05;
                    return (
                      <tr key={`${m.model}-${m.horizon}-${m.subperiod}`}>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-muted text-[0.68rem] font-semibold text-muted-foreground">
                              {index + 1}
                            </span>
                            <span className="font-medium text-foreground">
                              {modelLabel(m.model)}
                            </span>
                          </div>
                        </td>
                        <td className="nums text-right text-muted-foreground">{m.n}</td>
                        <td className="nums text-right font-medium">{formatNumber(m.rmse, 4)}</td>
                        <td className="nums text-right text-muted-foreground">
                          {formatNumber(m.mae, 4)}
                        </td>
                        <td className="nums text-right text-muted-foreground">
                          {formatNumber(m.bias, 4)}
                        </td>
                        <td className="nums text-right">
                          {m.rmse_vs_focus != null ? (
                            <Badge tone={beatsFocus ? "success" : "neutral"}>
                              {formatNumber(m.rmse_vs_focus, 3)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="nums text-right text-muted-foreground">
                          {formatNumber(m.dm_stat_vs_focus, 2)}
                        </td>
                        <td className="nums text-right">
                          {m.dm_pvalue_vs_focus != null ? (
                            <span
                              className={
                                significant
                                  ? "font-semibold text-foreground"
                                  : "text-muted-foreground"
                              }
                            >
                              {formatNumber(m.dm_pvalue_vs_focus, 3)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Como interpretar o Diebold-Mariano?" icon={Info}>
        <div className="grid gap-3 text-sm text-foreground/80 sm:grid-cols-3">
          <div>
            <p className="mb-1 font-semibold text-foreground">O que ele testa</p>
            Compara os erros quadrados do modelo contra os erros do Focus mês a mês. A hipótese nula
            é que ambos têm a mesma acurácia esperada.
          </div>
          <div>
            <p className="mb-1 font-semibold text-foreground">Sinal do estat. DM</p>
            <span className="font-medium text-success">DM &lt; 0</span>: modelo erra menos que o
            Focus. <span className="font-medium text-danger">DM &gt; 0</span>: modelo erra mais.
          </div>
          <div>
            <p className="mb-1 font-semibold text-foreground">p-valor</p>
            <code className="rounded bg-muted px-1 py-0.5 text-xs">p &lt; 0.05</code> rejeita a
            hipótese nula (diferença estatisticamente significativa a 5%).
          </div>
        </div>
      </Card>
    </div>
  );
}
