import { Link, NavLink, Route, Routes } from "react-router-dom";
import { HomePage } from "@/features/home/HomePage";
import { InflationPage } from "@/features/inflation/InflationPage";
import { ModelsPage } from "@/features/models/ModelsPage";
import { SeriesPage } from "@/features/series/SeriesPage";
import { TrackingPage } from "@/features/tracking/TrackingPage";
import { MethodologyPage } from "@/features/static/MethodologyPage";
import { AboutPage } from "@/features/static/AboutPage";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV = [
  { to: "/", label: "Visão geral", end: true },
  { to: "/inflacao", label: "Inflação", end: false },
  { to: "/modelos", label: "Modelos", end: false },
  { to: "/acompanhamento", label: "Acompanhamento", end: false },
  { to: "/series", label: "Séries", end: false },
  { to: "/metodologia", label: "Metodologia", end: false },
  { to: "/sobre", label: "Sobre", end: false },
];

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-brand text-brand-foreground">
        <div className="container flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="text-base font-semibold tracking-tight">
            Painel Macro Brasil
          </Link>
          <nav aria-label="Primária" className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded px-2 py-1 ${
                    isActive ? "bg-white/15 font-semibold" : "hover:bg-white/10"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>
      <main className="container py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/inflacao" element={<InflationPage />} />
          <Route path="/modelos" element={<ModelsPage />} />
          <Route path="/acompanhamento" element={<TrackingPage />} />
          <Route path="/series" element={<SeriesPage />} />
          <Route path="/metodologia" element={<MethodologyPage />} />
          <Route path="/sobre" element={<AboutPage />} />
        </Routes>
      </main>
      <footer className="border-t border-neutral-200 py-4 text-center text-xs text-neutral-500 dark:border-neutral-800">
        Projeto open-source · Dados do BCB (SGS/Focus) e IBGE · pt-BR
      </footer>
    </div>
  );
}
