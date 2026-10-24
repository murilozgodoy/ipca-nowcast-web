import { Banknote, DollarSign, Gauge, LineChart as LineIcon, Percent, Target } from "lucide-react";

import { Badge, Card, EmptyState, ErrorBanner, Kpi, LoadingBar, Skeleton } from "@/components/Card";
import { formatMonth, formatNumber, formatPercent, modelLabel } from "@/lib/format";
import { useFocusLatest, useNowcast, useSeriesDetail } from "@/lib/hooks";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

  const momObs = ipcaMom.data?.observations ?? [];
  const lastIpcaMom = momObs.at(-1)?.value ?? null;
  const prevIpcaMom = momObs.at(-2)?.value ?? null;
  const lastIpcaMomDate = momObs.at(-1)?.reference_date ?? null;
  const momTrend =
    lastIpcaMom != null && prevIpcaMom != null
      ? ({
          trend: lastIpcaMom > prevIpcaMom ? "up" : lastIpcaMom < prevIpcaMom ? "down" : "flat",
          label: formatPercent(lastIpcaMom - prevIpcaMom, 2),
          tone: lastIpcaMom > prevIpcaMom ? "negative" : "positive",
        } as const)
      : null;

  const last12 = ipca12m.data?.observations.at(-1)?.value ?? null;
  const prev12 = ipca12m.data?.observations.at(-2)?.value ?? null;
  const trend12 =
    last12 != null && prev12 != null
      ? ({
          trend: last12 > prev12 ? "up" : last12 < prev12 ? "down" : "flat",
          label: formatPercent(last12 - prev12, 2),
          tone: last12 > prev12 ? "negative" : "positive",
        } as const)
      : null;

  const lastSelic = selic.data?.observations.at(-1)?.value ?? null;
  const prevSelic = selic.data?.observations.at(-2)?.value ?? null;
  const trendSelic =
    lastSelic != null && prevSelic != null
      ? ({
          trend: lastSelic > prevSelic ? "up" : lastSelic < prevSelic ? "down" : "flat",
          label: formatPercent(lastSelic - prevSelic, 2),
          tone: "neutral",
        } as const)
      : null;

  const lastDollar = dollar.data?.observations.at(-1)?.value ?? null;
  const prevDollar = dollar.data?.observations.at(-2)?.value ?? null;
  const trendDollar =
    lastDollar != null && prevDollar != null
      ? ({
          trend: lastDollar > prevDollar ? "up" : lastDollar < prevDollar ? "down" : "flat",
          label: formatNumber(lastDollar - prevDollar, 4),
          tone: "neutral",
        } as const)
      : null;

  const anyLoading =
    nowcast.isLoading ||
    focusList.isLoading ||
    ipcaMom.isLoading ||
    ipca12m.isLoading ||
    selic.isLoading ||
    dollar.isLoading;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Badge tone="brand">Nowcast IPCA</Badge>
          {lastIpcaMomDate && (
            <span className="text-xs text-muted-foreground">
              Último IPCA divulgado · {formatMonth(lastIpcaMomDate)}
            </span>
          )}
        </div>
        <h1 className="text-display tracking-tight text-foreground">Painel Macro Brasil</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Previsão do IPCA com dados públicos (BCB SGS, Boletim Focus, IBGE SIDRA e ANP) e
          comparação honesta e rigorosa com o consenso do mercado.
        </p>
      </header>

      {anyLoading && <LoadingBar />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="IPCA mensal"
          value={formatPercent(lastIpcaMom)}
          hint={lastIpcaMomDate ? `${formatMonth(lastIpcaMomDate)} · variação m/m` : undefined}
          icon={Percent}
          trend={momTrend?.trend ?? null}
          trendLabel={momTrend?.label}
          trendTone={momTrend?.tone}
        />
        <Kpi
          label="IPCA 12 meses"
          value={formatPercent(last12)}
          hint="Acumulado últimos 12 meses"
          icon={Target}
          trend={trend12?.trend ?? null}
          trendLabel={trend12?.label}
          trendTone={trend12?.tone}
        />
        <Kpi
          label="Selic meta"
          value={formatPercent(lastSelic, 2)}
          hint="BCB · taxa anualizada"
          icon={Gauge}
          trend={trendSelic?.trend ?? null}
          trendLabel={trendSelic?.label}
          trendTone={trendSelic?.tone}
        />
        <Kpi
          label="Dólar PTAX"
          value={lastDollar != null ? `R$ ${formatNumber(lastDollar, 4)}` : "—"}
          hint="Fechamento mais recente"
          icon={DollarSign}
          trend={trendDollar?.trend ?? null}
          trendLabel={trendDollar?.label}
          trendTone={trendDollar?.tone}
        />
      </div>

      <Card
        title="Previsão do mês corrente: modelos vs. Focus"
        subtitle={
          nowcast.data
            ? `Mês-alvo ${formatMonth(nowcast.data.target_month)} · origem ${nowcast.data.origin_date}`
            : "Executando previsão com dados mais recentes…"
        }
        icon={LineIcon}
      >
        {nowcast.isError && <ErrorBanner error={nowcast.error} />}
        {nowcast.isLoading && !nowcast.data && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        )}
        {nowcast.data && <NowcastChart data={nowcast.data} />}
        {!nowcast.data && !nowcast.isLoading && !nowcast.isError && (
          <EmptyState message="Sem dados de nowcast disponíveis." />
        )}
      </Card>

      <Card
        title="Expectativas Focus"
        subtitle="Mediana dos economistas para os próximos meses de referência"
        icon={Banknote}
      >
        {focusList.data && focusList.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table-pro">
              <thead>
                <tr>
                  <th>Mês</th>
                  <th className="text-right">Mediana</th>
                  <th className="text-right">Média</th>
                  <th className="text-right">Desvio-padrão</th>
                  <th>Data da coleta</th>
                  <th className="text-right">N</th>
                </tr>
              </thead>
              <tbody>
                {focusList.data.map((row) => (
                  <tr key={`${row.reference_date}-${row.collected_at}`}>
                    <td className="font-medium">{formatMonth(row.reference_date)}</td>
                    <td className="nums text-right">{formatPercent(row.median)}</td>
                    <td className="nums text-right">{formatPercent(row.mean)}</td>
                    <td className="nums text-right text-muted-foreground">
                      {formatNumber(row.std_dev, 3)}
                    </td>
                    <td className="text-muted-foreground">{row.collected_at}</td>
                    <td className="nums text-right">{row.n_respondents ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !focusList.isLoading && <EmptyState message="Sem expectativas carregadas." />
        )}
      </Card>
    </div>
  );
}

function NowcastChart({ data }: { data: NonNullable<ReturnType<typeof useNowcast>["data"]> }) {
  const rows = data.models.map((m) => ({
    model: modelLabel(m.model),
    prediction: Number(m.prediction.toFixed(3)),
    key: m.model,
  }));
  if (data.focus_median !== null) {
    rows.push({
      model: modelLabel("focus_median"),
      prediction: Number(data.focus_median.toFixed(3)),
      key: "focus_median",
    });
  }
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ left: 0, right: 8, top: 8, bottom: 48 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--grid))" vertical={false} />
          <XAxis
            dataKey="model"
            interval={0}
            angle={-20}
            textAnchor="end"
            height={60}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          />
          <YAxis
            unit="%"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
            contentStyle={{
              borderRadius: 10,
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
              color: "hsl(var(--card-foreground))",
              fontSize: 12,
            }}
            formatter={(v: number) => formatPercent(v, 3)}
            labelFormatter={(label: string) => `Modelo: ${label}`}
          />
          <Bar dataKey="prediction" radius={[6, 6, 0, 0]}>
            {rows.map((row) => (
              <Cell
                key={row.key}
                fill={
                  row.key === "focus_median"
                    ? "hsl(var(--chart-6))"
                    : row.key === "combo_mean"
                      ? "hsl(var(--chart-2))"
                      : "hsl(var(--chart-1))"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
