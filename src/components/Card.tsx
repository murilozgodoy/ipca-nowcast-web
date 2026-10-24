import type { ReactNode } from "react";
import { clsx } from "clsx";

export function Card({
  title,
  subtitle,
  children,
  className,
  action,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section
      className={clsx(
        "rounded-xl border border-neutral-200 bg-white p-4 shadow-sm",
        "dark:border-neutral-800 dark:bg-neutral-900",
        className,
      )}
    >
      {(title || action) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-semibold">{title}</h2>}
            {subtitle && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>
            )}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-neutral-500 dark:text-neutral-400">{label}</span>
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        {hint && <span className="text-xs text-neutral-500 dark:text-neutral-400">{hint}</span>}
      </div>
    </Card>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
      {message}
    </div>
  );
}

export function LoadingBar() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="h-1 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800"
    />
  );
}

export function ErrorBanner({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "Erro inesperado";
  return (
    <div
      role="alert"
      className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200"
    >
      {message}
    </div>
  );
}
