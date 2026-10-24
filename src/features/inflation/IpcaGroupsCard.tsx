import { useMemo, useState } from "react";
import { Card, EmptyState, ErrorBanner, LoadingBar } from "@/components/Card";
import { useIpcaGroups } from "@/lib/hooks";
import { formatPercent, formatMonth } from "@/lib/format";
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

export function IpcaGroupsCard() {
  const groups = useIpcaGroups();
  const months = useMemo(() => {
    if (!groups.data) return [] as string[];
    return Array.from(new Set(groups.data.map((g) => g.reference_date)))
      .sort()
      .reverse();
  }, [groups.data]);
  const [selected, setSelected] = useState<string | null>(null);
  const current = selected ?? months[0] ?? null;
  const rows = useMemo(() => {
    if (!groups.data || !current) return [];
    return groups.data
      .filter((g) => g.reference_date === current)
      .map((g) => ({
        name: g.group_name.replace(/^\d+\./, "").trim(),
        value: g.monthly_pct,
      }));
  }, [groups.data, current]);

  return (
    <Card
      title="IPCA por grupos (IBGE/SIDRA)"
      subtitle={
        current
          ? `Variação mensal · ${formatMonth(current)}`
          : "Variação mensal por grupo de consumo"
      }
      action={
        months.length > 1 ? (
          <select
            value={current ?? ""}
            onChange={(e) => setSelected(e.target.value)}
            className="rounded border border-neutral-300 bg-white p-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            aria-label="Mês de referência"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {formatMonth(m)}
              </option>
            ))}
          </select>
        ) : null
      }
    >
      {groups.isLoading && <LoadingBar />}
      {groups.isError && <ErrorBanner error={groups.error} />}
      {!groups.isLoading && rows.length === 0 && (
        <EmptyState message="SIDRA indisponível. Tente novamente mais tarde." />
      )}
      {rows.length > 0 && (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ left: 8, right: 8, top: 12, bottom: 48 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis unit="%" />
              <Tooltip formatter={(v: number) => formatPercent(v)} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {rows.map((row) => (
                  <Cell key={row.name} fill={(row.value ?? 0) >= 0 ? "#005B96" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
