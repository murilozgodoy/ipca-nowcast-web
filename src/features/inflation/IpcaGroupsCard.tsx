import { useMemo, useState } from "react";
import { PieChart } from "lucide-react";
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

import { Card, EmptyState, ErrorBanner, LoadingBar } from "@/components/Card";
import { formatMonth, formatPercent } from "@/lib/format";
import { useIpcaGroups } from "@/lib/hooks";

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
        name: g.group_name.replace(/^\d+\.?\s*/, "").trim(),
        value: g.monthly_pct,
      }));
  }, [groups.data, current]);

  return (
    <Card
      title="IPCA por grupos (IBGE/SIDRA)"
      subtitle={current ? `Variação mensal · ${formatMonth(current)}` : "Variação mensal por grupo"}
      icon={PieChart}
      action={
        months.length > 1 ? (
          <select
            value={current ?? ""}
            onChange={(e) => setSelected(e.target.value)}
            className="control-select"
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
            <BarChart data={rows} margin={{ left: 0, right: 8, top: 8, bottom: 48 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--grid))" vertical={false} />
              <XAxis
                dataKey="name"
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
                formatter={(v: number) => formatPercent(v)}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {rows.map((row) => (
                  <Cell
                    key={row.name}
                    fill={(row.value ?? 0) >= 0 ? "hsl(var(--chart-1))" : "hsl(var(--chart-6))"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
