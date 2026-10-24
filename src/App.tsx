import { Route, Routes } from "react-router-dom";
import { HomePage } from "@/features/home/HomePage";
import { InflationPage } from "@/features/inflation/InflationPage";
import { ModelsPage } from "@/features/models/ModelsPage";
import { SeriesPage } from "@/features/series/SeriesPage";
import { TrackingPage } from "@/features/tracking/TrackingPage";
import { MethodologyPage } from "@/features/static/MethodologyPage";
import { AboutPage } from "@/features/static/AboutPage";
import { Sidebar, MobileNav } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export default function App() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <MobileNav />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/inflacao" element={<InflationPage />} />
              <Route path="/modelos" element={<ModelsPage />} />
              <Route path="/acompanhamento" element={<TrackingPage />} />
              <Route path="/series" element={<SeriesPage />} />
              <Route path="/metodologia" element={<MethodologyPage />} />
              <Route path="/sobre" element={<AboutPage />} />
            </Routes>
          </div>
        </main>
        <footer className="border-t border-border bg-card/40 px-4 py-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
          Projeto open-source · Dados do BCB (SGS/Focus), IBGE e ANP · pt-BR · MIT
        </footer>
      </div>
    </div>
  );
}
