import { Clock } from "lucide-react";
import { Badge } from "./Card";
import { ThemeToggle } from "./ThemeToggle";
import { useHealth } from "@/lib/hooks";

export function Header() {
  const health = useHealth();
  const status = health.data?.status;
  const version = health.data?.version;
  const now = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-foreground lg:hidden">Painel Macro Brasil</h1>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
            <Clock size={13} />
            <span>
              Atualizado em <span className="font-medium text-foreground">{now}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status && (
            <Badge tone={status === "ok" ? "success" : "warning"}>
              <span className="relative mr-1 inline-flex h-1.5 w-1.5">
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${
                    status === "ok" ? "bg-success" : "bg-warning"
                  }`}
                />
                <span
                  className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
                    status === "ok" ? "bg-success" : "bg-warning"
                  }`}
                />
              </span>
              API {status}
            </Badge>
          )}
          {version && <Badge tone="brand">v{version}</Badge>}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
