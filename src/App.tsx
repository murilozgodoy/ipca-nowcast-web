import { Routes, Route, Link } from "react-router-dom";

export default function App(): JSX.Element {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-brand text-brand-foreground">
        <div className="container flex items-center justify-between py-3">
          <Link to="/" className="font-semibold">
            Painel Macro Brasil
          </Link>
          <nav aria-label="Primária" className="flex gap-4 text-sm">
            <Link to="/">Visão geral</Link>
            <Link to="/inflacao">Inflação</Link>
            <Link to="/modelos">Modelos</Link>
            <Link to="/series">Séries</Link>
            <Link to="/metodologia">Metodologia</Link>
            <Link to="/sobre">Sobre</Link>
          </nav>
        </div>
      </header>
      <main className="container py-6">
        <Routes>
          <Route path="/" element={<Placeholder title="Visão geral" />} />
          <Route path="/inflacao" element={<Placeholder title="Inflação" />} />
          <Route path="/modelos" element={<Placeholder title="Modelos" />} />
          <Route path="/series" element={<Placeholder title="Séries" />} />
          <Route path="/metodologia" element={<Placeholder title="Metodologia" />} />
          <Route path="/sobre" element={<Placeholder title="Sobre" />} />
        </Routes>
      </main>
    </div>
  );
}

function Placeholder({ title }: { title: string }): JSX.Element {
  return (
    <section>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Página em construção — veja o progresso em{" "}
        <code>ipca-nowcast-api/docs/project/PROGRESS.md</code>.
      </p>
    </section>
  );
}
