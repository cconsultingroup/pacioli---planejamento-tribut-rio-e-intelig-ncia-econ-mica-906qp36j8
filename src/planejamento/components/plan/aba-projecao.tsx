import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/planejamento/ui/card'
import {
  Aviso,
  CampoMoeda,
  Rotulo,
  brl,
  brlCurto,
  classeTexto,
} from '@/planejamento/components/comuns'
import { consolidar, projetar } from '@/planejamento/lib/calculo'
import type { Estrategia, Planejamento, Premissas } from '@/planejamento/lib/tipos'
import type { Alterar } from '@/planejamento/paginas/Planejamento'

export function AbaProjecao({
  pl,
  mapa,
  alterar,
}: {
  pl: Planejamento
  mapa: Map<number, Estrategia>
  alterar: Alterar
}) {
  const cons = consolidar(pl, mapa)
  const { anos, avisos } = projetar(pl, cons)
  const setP = <K extends keyof Premissas>(k: K, v: Premissas[K]) =>
    alterar((p) => ({ ...p, premissas: { ...p.premissas, [k]: v } }))
  const total = anos.reduce(
    (s, a) => ({ ref: s.ref + a.referencia, eco: s.eco + a.economia, cus: s.cus + a.custos }),
    { ref: 0, eco: 0, cus: 0 },
  )
  const receita = pl.perfil.receitaAnual
  const g = (pl.premissas.crescimentoReceita || 0) / 100

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Premissas explícitas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Rotulo texto="Crescimento da receita (% a.a.)">
            <CampoMoeda
              sufixo="%"
              valor={pl.premissas.crescimentoReceita}
              aoMudar={(v) => setP('crescimentoReceita', v || 0)}
            />
          </Rotulo>
          <Rotulo texto="CBS de referência (premissa)">
            <CampoMoeda
              sufixo="%"
              valor={pl.premissas.aliquotaCbs}
              aoMudar={(v) => setP('aliquotaCbs', v || 0)}
            />
          </Rotulo>
          <Rotulo texto="IBS de referência (premissa)">
            <CampoMoeda
              sufixo="%"
              valor={pl.premissas.aliquotaIbs}
              aoMudar={(v) => setP('aliquotaIbs', v || 0)}
            />
          </Rotulo>
          <Rotulo texto="Sensibilidade CBS+IBS (± p.p.)">
            <CampoMoeda
              sufixo="pp"
              valor={pl.premissas.sensibilidade}
              aoMudar={(v) => setP('sensibilidade', v || 0)}
            />
          </Rotulo>
          <Rotulo texto="IRRF sobre JCP (premissa)">
            <CampoMoeda
              sufixo="%"
              valor={pl.premissas.aliquotaJcpIrrf}
              aoMudar={(v) => setP('aliquotaJcpIrrf', v || 0)}
            />
          </Rotulo>
          <Rotulo texto="Ano-base das estratégias">
            <CampoMoeda
              sufixo="ano"
              valor={pl.premissas.anoBase}
              aoMudar={(v) => setP('anoBase', v || 2026)}
            />
          </Rotulo>
          <div className="sm:col-span-3 lg:col-span-6">
            <Rotulo texto="Observações sobre as premissas">
              <textarea
                className={classeTexto}
                rows={2}
                value={pl.premissas.observacao}
                onChange={(e) => setP('observacao', e.target.value)}
              />
            </Rotulo>
          </div>
        </CardContent>
      </Card>
      {avisos.map((a) => (
        <Aviso key={a}>{a}</Aviso>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evolução da carga tributária 2026–2033</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer>
            <ComposedChart
              data={anos.map((a) => ({
                ...a,
                cargaRef: receita
                  ? (a.referencia / (receita * Math.pow(1 + g, a.ano - pl.atual.anoReferencia))) *
                    100
                  : null,
                cargaPlan: receita
                  ? (a.planejado / (receita * Math.pow(1 + g, a.ano - pl.atual.anoReferencia))) *
                    100
                  : null,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="ano" fontSize={11} />
              <YAxis yAxisId="r" tickFormatter={(v) => brlCurto(v)} fontSize={11} width={80} />
              <YAxis
                yAxisId="p"
                orientation="right"
                tickFormatter={(v) => `${Number(v).toFixed(1)}%`}
                fontSize={11}
                width={48}
              />
              <Tooltip
                formatter={(v: number, n: string) =>
                  n.startsWith('Carga') ? `${v.toFixed(2)}%` : brl(v)
                }
              />
              <Legend />
              <Bar
                yAxisId="r"
                dataKey="referencia"
                name="Tributos de referência"
                fill="hsl(var(--chart-3))"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="r"
                dataKey="planejado"
                name="Tributos planejados"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
              />
              {receita ? (
                <Line
                  yAxisId="p"
                  dataKey="cargaRef"
                  name="Carga de referência (% receita)"
                  stroke="hsl(var(--chart-5))"
                  dot
                />
              ) : null}
              {receita ? (
                <Line
                  yAxisId="p"
                  dataKey="cargaPlan"
                  name="Carga planejada (% receita)"
                  stroke="hsl(var(--chart-2))"
                  dot
                />
              ) : null}
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Planejamento por exercício</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Ano</th>
                <th className="px-4 py-2 text-right">Tributos atuais ou de referência</th>
                <th className="px-4 py-2 text-right">Tributos planejados</th>
                <th className="px-4 py-2 text-right">Economia estimada</th>
                <th className="px-4 py-2 text-right">Custos</th>
                <th className="px-4 py-2 text-right">Líquido</th>
                <th className="px-4 py-2 text-right">Sensibilidade (referência)</th>
                <th className="px-4 py-2">Regra do ano</th>
              </tr>
            </thead>
            <tbody>
              {anos.map((a) => (
                <tr key={a.ano} className="border-b align-top last:border-0">
                  <td className="px-4 py-2 font-medium">{a.ano}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{brl(a.referencia)}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{brl(a.planejado)}</td>
                  <td className="px-4 py-2 text-right font-medium tabular-nums text-ok">
                    {brl(a.economia)}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">{brl(a.custos)}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{brl(a.beneficioLiquido)}</td>
                  <td className="px-4 py-2 text-right text-xs tabular-nums text-muted-foreground">
                    {a.ano >= 2027
                      ? `${brlCurto(a.sensibilidade.menor)} a ${brlCurto(a.sensibilidade.maior)}`
                      : '—'}
                  </td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{a.nota}</td>
                </tr>
              ))}
              <tr className="bg-muted/40 font-semibold">
                <td className="px-4 py-2">Total</td>
                <td className="px-4 py-2 text-right">{brl(total.ref)}</td>
                <td className="px-4 py-2 text-right">{brl(total.ref - total.eco)}</td>
                <td className="px-4 py-2 text-right">{brl(total.eco)}</td>
                <td className="px-4 py-2 text-right">{brl(total.cus)}</td>
                <td className="px-4 py-2 text-right">{brl(total.eco - total.cus)}</td>
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">
        Exercício de referência {pl.atual.anoReferencia} (valores históricos). Anos futuros: valores
        atuais × crescimento, com PIS/COFINS e IPI até 2026, ICMS/ISS a 90/80/70/60% de 2029 a 2032
        e extintos em 2033, CBS a partir de 2027 e IBS a 10/20/30/40% de 2029 a 2032 e integral em
        2033 (EC 132/2023, LC 214/2025). CBS/IBS de referência = (receita − compras com crédito) ×
        alíquota-premissa. Economias de estratégias de PIS/COFINS valem só em 2026; as de ICMS
        seguem os fatores de transição.
      </p>
    </div>
  )
}
