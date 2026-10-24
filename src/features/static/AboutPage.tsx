import { Card } from "@/components/Card";

export const LINKEDIN_URL = "https://www.linkedin.com/in/murilozgodoy";

export function AboutPage() {
  return (
    <article className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Sobre</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          O projeto, o autor e como contribuir.
        </p>
      </header>
      <Card title="O projeto">
        <p className="text-sm">
          O <strong>Painel Macro Brasil</strong> é um projeto aberto de portfólio que mostra como é
          possível coletar dados macroeconômicos oficiais, prever o IPCA e comparar o modelo com o
          consenso do mercado com rigor estatístico — tudo com software livre e dados públicos.
        </p>
      </Card>
      <Card title="O autor">
        <p className="text-sm">
          Murilo Zampar Godoy, estudante do Insper. Interesse em dados, finanças e tecnologia.
          Projeto construído de ponta a ponta como material para entrevistas.
        </p>
      </Card>
      <Card title="Links">
        <ul className="list-disc space-y-1 pl-6 text-sm">
          <li>
            Backend —{" "}
            <a
              className="text-brand underline"
              href="https://github.com/murilozgodoy/ipca-nowcast-api"
            >
              github.com/murilozgodoy/ipca-nowcast-api
            </a>
          </li>
          <li>
            Frontend —{" "}
            <a
              className="text-brand underline"
              href="https://github.com/murilozgodoy/ipca-nowcast-web"
            >
              github.com/murilozgodoy/ipca-nowcast-web
            </a>
          </li>
          <li>
            LinkedIn —{" "}
            <a className="text-brand underline" href={LINKEDIN_URL}>
              linkedin.com/in/murilozgodoy
            </a>
          </li>
        </ul>
      </Card>
    </article>
  );
}
