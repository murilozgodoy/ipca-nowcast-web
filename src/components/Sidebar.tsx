import { NavLink } from "react-router-dom";
import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";
import { Activity, BarChart3, Compass, Database, Home, Info, LineChart } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  end?: boolean;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Visão geral", end: true, icon: Home },
  { to: "/inflacao", label: "Inflação", icon: LineChart },
  { to: "/modelos", label: "Modelos", icon: BarChart3 },
  { to: "/acompanhamento", label: "Acompanhamento", icon: Activity },
  { to: "/series", label: "Séries", icon: Database },
  { to: "/metodologia", label: "Metodologia", icon: Compass },
  { to: "/sobre", label: "Sobre", icon: Info },
];

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-card/50 lg:flex lg:flex-col">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <div className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 text-brand-foreground shadow-soft">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              d="M4 22 L11 14 L16 19 L28 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
            Painel
          </span>
          <span className="text-sm font-semibold leading-tight text-foreground">Macro Brasil</span>
        </div>
      </div>
      <nav aria-label="Primária" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  clsx(
                    "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-brand/10 text-brand"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={16}
                      className={clsx(
                        "transition",
                        isActive
                          ? "text-brand"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-border px-5 py-4 text-[0.68rem] leading-relaxed text-muted-foreground">
        <p className="font-medium text-foreground/80">Open-source</p>
        <p>Dados BCB · IBGE · ANP</p>
        <p className="mt-1">pt-BR · MIT</p>
      </div>
    </aside>
  );
}

export function MobileNav() {
  return (
    <nav
      aria-label="Primária"
      className="flex overflow-x-auto border-b border-border bg-card lg:hidden"
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            clsx(
              "flex min-w-fit items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition",
              isActive
                ? "border-brand text-brand"
                : "border-transparent text-foreground/70 hover:text-foreground",
            )
          }
        >
          <item.icon size={14} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
