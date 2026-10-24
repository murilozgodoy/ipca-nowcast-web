import type { ReactNode } from "react";
import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp, Minus, AlertCircle } from "lucide-react";

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  icon?: LucideIcon;
  compact?: boolean;
}

export function Card({
  title,
  subtitle,
  children,
  className,
  action,
  icon: Icon,
  compact,
}: CardProps) {
  return (
    <section className={clsx("card-surface", compact ? "p-4" : "p-5 sm:p-6", className)}>
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {Icon && (
              <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Icon size={16} />
              </span>
            )}
            <div>
              {title && (
                <h2 className="text-[0.95rem] font-semibold leading-tight tracking-tight text-foreground">
                  {title}
                </h2>
              )}
              {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

interface KpiProps {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "flat" | null;
  trendLabel?: string;
  trendTone?: "positive" | "negative" | "neutral";
}

export function Kpi({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  trendLabel,
  trendTone = "neutral",
}: KpiProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : trend === "flat" ? Minus : null;
  const toneClass =
    trendTone === "positive"
      ? "text-success"
      : trendTone === "negative"
        ? "text-danger"
        : "text-muted-foreground";
  return (
    <div className="card-surface p-5 transition hover:shadow-pop">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[0.78rem] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {Icon && (
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Icon size={14} />
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="nums text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
          {value}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        {TrendIcon && trendLabel && (
          <span className={clsx("inline-flex items-center gap-1 font-medium", toneClass)}>
            <TrendIcon size={12} />
            <span>{trendLabel}</span>
          </span>
        )}
        {hint && <span>{hint}</span>}
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
      <AlertCircle size={20} className="text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function LoadingBar() {
  return (
    <div role="status" aria-live="polite" className="h-1 w-full overflow-hidden rounded bg-muted">
      <div className="h-full w-1/3 animate-pulse rounded bg-brand/60" />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse rounded-md bg-muted", className)} />;
}

export function ErrorBanner({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "Erro inesperado";
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger"
    >
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "success" | "warning" | "danger" | "brand";
  children: ReactNode;
}) {
  const map: Record<string, string> = {
    neutral: "bg-muted text-muted-foreground",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    danger: "bg-danger/15 text-danger",
    brand: "bg-brand/15 text-brand",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide",
        map[tone],
      )}
    >
      {children}
    </span>
  );
}
