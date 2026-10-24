import { Card } from "@/components/Card";

export function MethodologyPage() {
  return (
    <article className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Metodologia</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Como construímos os dados, prevemos o IPCA e comparamos com o Focus — sem vazamento de
          informação futura.
        </p>
      </header>
      <Card title="1. Pergunta de pesquisa">
        <p className="text-sm">
          <em>
            Um modelo aberto, usando apenas dados públicos, consegue prever o IPCA tão bem quanto o
            consenso dos economistas do mercado (Boletim Focus)? Em quais horizontes e em quais
            períodos?
          </em>
        </p>
      </Card>
      <Card title="2. Dados">
        <p className="text-sm">
          Todas as séries são públicas e sem chave: BCB SGS (IPCA mensal/12m, Selic meta, PTAX,
          IGP-M, INPC, IBC-Br), Olinda Focus para a mediana do mercado e, opcionalmente, IBGE SIDRA.
          As séries diárias são paginadas em janelas de ≤ 10 anos.
        </p>
      </Card>
      <Card title="3. Prevenção de look-ahead bias (o ponto central)">
        <p className="mb-3 text-sm">
          Cada série carrega uma <strong>defasagem de publicação</strong> no
          <code> config/series.yaml</code>: para séries mensais ela é contada a partir do fim do mês
          de referência; para séries diárias, a partir da própria data. A função{" "}
          <code>build_dataset(origin_date, horizon)</code> remove todas as observações cuja data de
          publicação é posterior à data de origem.
        </p>
        <p className="text-sm">
          O benchmark Focus é a <strong>mediana conhecida na data de origem</strong>, nunca uma
          coleta posterior. Esse invariante é verificado por testes dedicados no backend.
        </p>
      </Card>
      <Card title="4. Modelos">
        <ul className="list-disc space-y-1 pl-6 text-sm">
          <li>
            <strong>Benchmarks:</strong> random walk, média histórica (12 meses), sazonal ingênuo
            (mesmo mês do ano anterior) e Focus (mediana).
          </li>
          <li>
            <strong>Modelos:</strong> SARIMA (<code>statsmodels.SARIMAX</code>), ElasticNet com
            validação cruzada e Gradient Boosting.
          </li>
          <li>
            <strong>Combinação:</strong> média simples dos modelos — frequentemente supera modelos
            individuais.
          </li>
        </ul>
      </Card>
      <Card title="5. Avaliação">
        <p className="mb-3 text-sm">
          Backtest expanding-window com origens mensais e horizontes h = 0, 1, 2, 3 meses. Métricas
          por horizonte e subperíodo: RMSE, MAE, viés e RMSE relativo ao Focus.
        </p>
        <p className="text-sm">
          O teste de <strong>Diebold-Mariano</strong> (com correção Harvey-Leybourne-Newbold) testa
          se a diferença de acurácia contra o Focus é estatisticamente significativa.
        </p>
      </Card>
      <Card title="6. Limitações">
        <ul className="list-disc space-y-1 pl-6 text-sm">
          <li>Não ajustamos revisões do IPCA — comparamos a primeira divulgação.</li>
          <li>Focus é um alvo movediço; usamos a mediana por ser mais robusta.</li>
          <li>
            Nowcast curto se beneficia de dados em alta frequência; preços semanais da ANP são fase
            bônus.
          </li>
        </ul>
      </Card>
    </article>
  );
}
