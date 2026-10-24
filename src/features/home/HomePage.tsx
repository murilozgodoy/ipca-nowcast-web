import { Card, EmptyState, ErrorBanner, Kpi, LoadingBar } from "@/components/Card";
import { useFocusLatest, useNowcast, useSeriesDetail } from "@/lib/hooks";
import { formatMonth, formatPercent, modelLabel } from "@/lib/format";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const SELIC_CODE = "sgs.432";
const USD_CODE = "sgs.1";
const IPCA_12M = "sgs.13522";
const IPCA_MOM = "sgs.433";

export function HomePage() {
  const nowcast = useNowcast(0);
  const focusList = useFocusLatest(6);
  const ipcaMom = useSeriesDetail(IPCA_MOM);
  const ipca12m = useSeriesDetail(IPCA_12M);
  const selic = useSeriesDetail(SELIC_CODE);
  const dollar = useSeriesDetail(USD_CODE);

  const lastIpcaMom = ipcaMom.data?.observations.at(-1)?.value ?? null;
  const lastIpcaMomDate = ipcaMom.data?.observations.at(-1)?.reference_date ?? null;
  const lastIpca12m = ipca12m.data?.observations.at(-1)?.value ?? null;
  const lastSelic = selic.data?.observations.at(-1)?.value ?? null;
  const lastDollar = dollar.data?.observations.at(-1)?.value ?? null;

  const anyLoading =
    nowcast.isLoading ||
    focusList.isLoading ||
    ipcaMom.isLoading ||
    ipca12m.isLoading ||
    selic.isLoading ||
    dollar.isLoading;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Painel Macro Brasil</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Nowcasting do IPCA com dados públicos (BCB SGS, Focus e IBGE) e comparação honesta com o
          consenso do mercado.
        </p>
      </header>
      {anyLoading && <LoadingBar />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="IPCA mensal (último)"
          value={formatPercent(lastIpcaMom)}
          hint={lastIpcaMomDate ? formatMonth(lastIpcaMomDate) : undefined}
        />
        <Kpi label="IPCA 12 meses" value={formatPercent(lastIpca12m)} />
        <Kpi label="Selic meta" value={formatPercent(lastSelic)} />
        <Kpi label="Dólar PTAX" value={formatPercent(lastDollar, 4).replace("%", "")} />
      </div>

      <Card
        title="Previsão do mês corrente: modelos vs. Focus"
        subtitle={
          nowcast.data
            ? `Mês-alvo ${formatMonth(nowcast.data.target_month)} · origem ${nowcast.data.origin_date}`
            : undefined
        }
      >
        {nowcast.isError && <ErrorBanner error={nowcast.error} />}
        {nowcast.data && <NowcastChart data={nowcast.data} />}
        {!nowcast.data && !nowcast.isLoading && !nowcast.isError && (
          <EmptyState message="Sem dados de nowcast disponíveis." />
        )}
      </Card>

      <Card title="Expectativas Focus — últimos meses de referência">
        {focusList.data && focusList.data.length > 0 ? (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-500 dark:text-neutral-400">
                <th className="py-2">Mês</th>
                <th className="py-2">Mediana</th>
                <th className="py-2">Média</th>
                <th className="py-2">Coleta</th>
                <th className="py-2">N</th>
              </tr>
            </thead>
            <tbody>
              {focusList.data.map((row) => (
                <tr
                  key={`${row.reference_date}-${row.collected_at}`}
                  className="border-t border-neutral-200 dark:border-neutral-800"
                >
                  <td className="py-2 font-medium">{formatMonth(row.reference_date)}</td>
                  <td className="py-2 tabular-nums">{formatPercent(row.median)}</td>
                  <td className="py-2 tabular-nums">{formatPercent(row.mean)}</td>
                  <td className="py-2">{row.collected_at}</td>
                  <td className="py-2 tabular-nums">{row.n_respondents ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState message="Sem expectativas carregadas." />
        )}
      </Card>
    </div>
  );
}

function NowcastChart({ data }: { data: NonNullable<ReturnType<typeof useNowcast>["data"]> }) {
  const rows = data.models.map((m) => ({
    model: modelLabel(m.model),
    prediction: Number(m.prediction.toFixed(3)),
    isFocus: m.model === "focus_median",
  }));
  if (data.focus_median !== null) {
    rows.push({
      model: modelLabel("focus_median"),
      prediction: Number(data.focus_median.toFixed(3)),
      isFocus: true,
    });
  }
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ left: 8, right: 8, top: 12, bottom: 32 }}>
          <XAxis dataKey="model" interval={0} angle={-20} textAnchor="end" height={60} />
          <YAxis unit="%" />
          <Tooltip
            formatter={(value: number) => formatPercent(value, 3)}
            labelFormatter={(label: string) => `Modelo: ${label}`}
          />
          <Bar dataKey="prediction" radius={[6, 6, 0, 0]} fill="#005B96" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
