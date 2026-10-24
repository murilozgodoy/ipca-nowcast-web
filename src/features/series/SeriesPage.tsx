import { useState } from "react";
import { Card, EmptyState, ErrorBanner, LoadingBar } from "@/components/Card";
import { useSeries, useSeriesDetail } from "@/lib/hooks";
import { formatDate, formatNumber } from "@/lib/format";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function SeriesPage() {
  const list = useSeries();
  const [code, setCode] = useState<string>("sgs.433");
  const detail = useSeriesDetail(code);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Séries</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Explore as séries macroeconômicas ingeridas, com download em CSV.
        </p>
      </header>
      <Card title="Séries disponíveis">
        {list.isLoading && <LoadingBar />}
        {list.isError && <ErrorBanner error={list.error} />}
        {list.data && list.data.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {list.data.map((s) => (
              <button
                key={s.code}
                type="button"
                onClick={() => setCode(s.code)}
                className={`rounded-md border px-3 py-1 text-sm ${
                  s.code === code
                    ? "border-brand bg-brand text-brand-foreground"
                    : "border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900"
                }`}
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
              <LineChart data={detail.data.observations}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="reference_date"
                  tickFormatter={(v: string) => v.slice(0, 7)}
                  minTickGap={16}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(v: string) => formatDate(v)}
                  formatter={(v: number) => formatNumber(v, 4)}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#005B96"
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          !detail.isLoading && <EmptyState message="Sem observações." />
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
    <button
      type="button"
      onClick={onClick}
      className="rounded border border-neutral-300 bg-white px-3 py-1 text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900"
    >
      Baixar CSV
    </button>
  );
}
