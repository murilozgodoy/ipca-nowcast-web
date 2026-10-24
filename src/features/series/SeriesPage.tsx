import { useState } from "react";
import { Database, Download } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, EmptyState, ErrorBanner, LoadingBar } from "@/components/Card";
import { formatDate, formatNumber } from "@/lib/format";
import { useSeries, useSeriesDetail } from "@/lib/hooks";

export function SeriesPage() {
  const list = useSeries();
  const [code, setCode] = useState<string>("sgs.433");
  const detail = useSeriesDetail(code);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-display tracking-tight text-foreground">Séries</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Explore as séries macroeconômicas ingeridas pelo pipeline, com visualização e download em
          CSV.
        </p>
      </header>

      <Card title="Séries disponíveis" icon={Database}>
        {list.isLoading && <LoadingBar />}
        {list.isError && <ErrorBanner error={list.error} />}
        {list.data && list.data.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {list.data.map((s) => (
              <button
                key={s.code}
                type="button"
                onClick={() => setCode(s.code)}
                className={`chip ${s.code === code ? "chip-active" : ""}`}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card
        title={detail.data?.name ?? "Carregando..."}
        subtitle={
          detail.data
            ? `Frequência ${detail.data.frequency} · defasagem ${detail.data.publication_lag_days} dias · ${detail.data.n} observações`
            : undefined
        }
        icon={Database}
        action={
          detail.data && detail.data.observations.length > 0 ? (
            <DownloadCsv series={detail.data} />
          ) : null
        }
      >
        {detail.isLoading && <LoadingBar />}
        {detail.isError && <ErrorBanner error={detail.error} />}
        {detail.data && detail.data.observations.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={detail.data.observations}
                margin={{ left: 0, right: 8, top: 8, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--grid))" vertical={false} />
                <XAxis
                  dataKey="reference_date"
                  tickFormatter={(v: string) => v.slice(0, 7)}
                  minTickGap={16}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <YAxis
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
                  labelFormatter={(v: string) => formatDate(v)}
                  formatter={(v: number) => formatNumber(v, 4)}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          !detail.isLoading && <EmptyState message="Sem observações para esta série." />
        )}
      </Card>
    </div>
  );
}

function DownloadCsv({
  series,
}: {
  series: NonNullable<ReturnType<typeof useSeriesDetail>["data"]>;
}) {
  const onClick = () => {
    const header = "reference_date,value";
    const rows = series.observations.map((o) => `${o.reference_date},${o.value ?? ""}`);
    const blob = new Blob([`${header}\n${rows.join("\n")}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${series.code}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button type="button" onClick={onClick} className="btn-ghost">
      <Download size={14} />
      Baixar CSV
    </button>
  );
}
