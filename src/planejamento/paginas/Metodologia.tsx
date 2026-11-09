import { Card, CardContent, CardHeader, CardTitle } from '@/planejamento/ui/card'
import { Skeleton } from '@/planejamento/ui/skeleton'
import { useManual } from '@/planejamento/components/comuns'

export default function Metodologia() {
  const { manual } = useManual()
  if (!manual) return <Skeleton className="h-96 w-full" />
  const mostrar = manual.gerais.filter((g) => !/navegar no Word/i.test(g.titulo))
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Metodologia e transição</h1>
        <p className="text-sm text-muted-foreground">
          Diretriz central: a função não é auditar o passado, é planejar o futuro. Apurações atuais
          como ponto de partida, estratégias legais, resultados simulados com memória reproduzível.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Como o sistema calcula</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm leading-relaxed">
          <p>
            <b>Economia tributária</b> = tributo no cenário atual − tributo no cenário planejado.{' '}
            <b>Benefício econômico líquido</b> = economia consolidada − custos incrementais de
            implantação e manutenção − outros impactos negativos.
          </p>
          <p>
            <b>Sem dupla contagem:</b> quando duas estratégias atingem a mesma base do mesmo
            tributo, só a maior entra no total; a economia de um tributo não passa do valor pago
            hoje; troca de regime obriga a recalcular as demais estratégias no regime novo.
          </p>
          <p>
            <b>Efeitos cruzados:</b> créditos de PIS/COFINS e cortes de encargos reduzem despesa
            dedutível e aumentam IRPJ/CSLL no Lucro Real (o sistema desconta automaticamente).
          </p>
          <p>
            <b>Triagem:</b> sugestão automática pelo perfil (regime, setores, operações, estrutura).
            Situações: Aplicável (requisitos demonstrados), Condicionada, Inaplicável, Alto risco e
            Não recomendada. A decisão final é da equipe.
          </p>
          <p>
            <b>Projeção 2026–2033:</b> valores do exercício de referência × crescimento; PIS/COFINS
            e IPI até 2026; ICMS/ISS a 90/80/70/60% de 2029 a 2032 e extintos em 2033; CBS a partir
            de 2027; IBS a 10/20/30/40% de 2029 a 2032 e integral em 2033. CBS/IBS de referência =
            (receita − compras com crédito) × alíquota-premissa, com faixa de sensibilidade.
          </p>
          <p>
            <b>Limites:</b> o sistema não faz auditoria, recuperação de tributos nem retificação
            (painel de créditos e Caldas Advocacia); não transmite declarações nem altera registros
            do cliente.
          </p>
        </CardContent>
      </Card>
      {mostrar.map((g) => (
        <Card key={g.titulo}>
          <CardHeader>
            <CardTitle className="text-base">{g.titulo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-relaxed">
            {g.paragrafos
              .filter((p) => !/^\[[A-Z0-9_]+\]/.test(p))
              .map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            {g.tabelas.map((t, i) => (
              <table key={i} className="w-full text-sm">
                <tbody>
                  {t.map((l, j) => (
                    <tr key={j} className={j === 0 ? 'bg-muted/50 font-semibold' : 'border-t'}>
                      {l.map((c, k) => (
                        <td key={k} className="px-2 py-1 align-top">
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ))}
            {/^Referencias/i.test(g.titulo) && (
              <ul className="list-disc pl-5">
                {manual.referencias.map((r) => (
                  <li key={r.codigo}>
                    <b>{r.codigo}</b> — {r.descricao}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
