import { Github, GraduationCap, Linkedin, Mail } from "lucide-react";

import { Card } from "@/components/Card";

export const LINKEDIN_URL = "https://www.linkedin.com/in/murilozgodoy";

export function AboutPage() {
  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-display tracking-tight text-foreground">Sobre</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          O projeto, o autor e como contribuir.
        </p>
      </header>

      <Card title="O projeto">
        <p className="text-sm text-foreground/80">
          O <strong>Painel Macro Brasil</strong> é um projeto aberto de portfólio que mostra como é
          possível coletar dados macroeconômicos oficiais, prever o IPCA e comparar o modelo com o
          consenso do mercado com rigor estatístico — tudo com software livre e dados públicos.
        </p>
      </Card>

      <Card title="O autor" icon={GraduationCap}>
        <p className="text-sm text-foreground/80">
          Murilo Zampar Godoy, estudante do Insper. Interesse em dados, finanças e tecnologia.
          Projeto construído de ponta a ponta como material para entrevistas.
        </p>
      </Card>

      <Card title="Links">
        <div className="grid gap-3 sm:grid-cols-2">
          <a
            href="https://github.com/murilozgodoy/ipca-nowcast-api"
            className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition hover:border-brand hover:shadow-soft"
          >
            <Github size={18} className="text-muted-foreground group-hover:text-brand" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Backend
              </span>
              <span className="text-sm font-medium text-foreground">ipca-nowcast-api</span>
            </div>
          </a>
          <a
            href="https://github.com/murilozgodoy/ipca-nowcast-web"
            className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition hover:border-brand hover:shadow-soft"
          >
            <Github size={18} className="text-muted-foreground group-hover:text-brand" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Frontend
              </span>
              <span className="text-sm font-medium text-foreground">ipca-nowcast-web</span>
            </div>
          </a>
          <a
            href={LINKEDIN_URL}
            className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition hover:border-brand hover:shadow-soft"
          >
            <Linkedin size={18} className="text-muted-foreground group-hover:text-brand" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                LinkedIn
              </span>
              <span className="text-sm font-medium text-foreground">
                linkedin.com/in/murilozgodoy
              </span>
            </div>
          </a>
          <a
            href="mailto:murilozg@al.insper.edu.br"
            className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition hover:border-brand hover:shadow-soft"
          >
            <Mail size={18} className="text-muted-foreground group-hover:text-brand" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email
              </span>
              <span className="text-sm font-medium text-foreground">murilozg@al.insper.edu.br</span>
            </div>
          </a>
        </div>
      </Card>
    </article>
  );
}
