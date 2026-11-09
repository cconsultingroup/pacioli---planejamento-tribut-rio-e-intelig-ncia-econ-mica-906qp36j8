import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/planejamento/ui/card'
import { Aviso, Kpi, brl, brlCurto } from '@/planejamento/components/comuns'
import { consolidar } from '@/planejamento/lib/calculo'
import type { Estrategia, Planejamento, Tributo } from '@/planejamento/lib/tipos'
import { NOME_ETAPA, NOME_TRIBUTO } from '@/planejamento/lib/tipos'

const COR = {
  atual: 'hsl(var(--chart-3))',
  plan: 'hsl(var(--chart-1))',
  eco: 'hsl(var(--chart-2))',
}
const RISCO_NUM: Record<string, number> = { baixo: 1, medio: 2, alto: 3, critico: 4 }

export function AbaConsolidacao({
  pl,
  mapa,
  abrir,
}: {
  pl: Planejamento
  mapa: Map<number, Estrategia>
  abrir: (n: number) => void
}) {
  const cons = consolidar(pl, mapa)
  const potencial = consolidar(pl, mapa, (a) => a.etapa === 'em-analise')
  const totalAtual = Object.values(pl.atual.valores).reduce((s, v) => s + (v || 0), 0)
  const porTributo = (
    Object.entries(cons.porTributo) as [
      Tributo,
      { atual: number; economia: number; planejado: number },
    ][]
  ).filter(([, v]) => v.atual || v.economia)
  const graficoTributo = porTributo.map(([t, v]) => ({
    t,
    atual: v.atual,
    planejado: Math.max(v.atual - v.economia, 0),
    economia: v.economia,
  }))
  const graficoEstrategia = cons.itens
    .map((i) => ({
      nome: String(i.numero).padStart(3, '0'),
      economia: i.economiaConsiderada,
      liquido: i.economiaConsiderada - i.custosAnuais,
    }))
    .sort((a, b) => b.economia - a.economia)
  const matriz = cons.itens.map((i) => ({
    nome: `${String(i.numero).padStart(3, '0')} ${i.titulo}`,
    risco: RISCO_NUM[pl.analises[i.numero]?.grauRisco || 'medio'],
    beneficio: i.economiaConsiderada - i.custosAnuais,
    z: 1,
  }))

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi
          titulo="Carga de referência (ano)"
          valor={brl(totalAtual)}
          detalhe={`Exercício ${pl.atual.anoReferencia}`}
        />
        <Kpi
          titulo="Economia tributária consolidada"
          valor={brl(cons.economiaTributaria)}
          detalhe={`${cons.itens.length} estratégias recomendadas ou aprovadas`}
          destaque
        />
        <Kpi
          titulo="Custos anuais + implantação"
          valor={brl(cons.custosAnuais)}
          detalhe={`Implantação ${brl(cons.custoImplantacao)}`}
        />
        <Kpi
          titulo="Benefício econômico líquido (1º ano)"
          valor={brl(cons.beneficioLiquido)}
          detalhe={`Mensal ≈ ${brl((cons.economiaTributaria - cons.custosAnuais) / 12)}`}
        />
      </div>
      {!cons.itens.length && (
        <Aviso tom="info">
          Nenhuma estratégia na etapa "Recomendada ao cliente" ou posterior. Em análise:{' '}
          {potencial.itens.length} (potencial {brl(potencial.economiaTributaria)}/ano, ainda não
          consolidado).
        </Aviso>
      )}
      {cons.avisos.map((a) => (
        <Aviso key={a}>{a}</Aviso>
      ))}

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tributos atuais × planejados</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <BarChart data={graficoTributo}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="t" fontSize={11} />
                <YAxis tickFormatter={(v) => brlCurto(v)} fontSize={11} width={80} />
                <Tooltip formatter={(v: number) => brl(v)} />
                <Legend />
                <Bar dataKey="atual" name="Atual" fill={COR.atual} radius={[4, 4, 0, 0]} />
                <Bar dataKey="planejado" name="Planejado" fill={COR.plan} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Economia por estratégia (ano cheio)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <BarChart data={graficoEstrategia} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => brlCurto(v)} fontSize={11} />
                <YAxis type="category" dataKey="nome" fontSize={11} width={40} />
                <Tooltip formatter={(v: number) => brl(v)} />
                <Legend />
                <Bar
                  dataKey="economia"
                  name="Economia tributária"
                  fill={COR.eco}
                  radius={[0, 4, 4, 0]}
                />
                <Bar
                  dataKey="liquido"
                  name="Benefício líquido"
                  fill={COR.plan}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Economia por tributo</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <BarChart data={graficoTributo}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="t" fontSize={11} />
                <YAxis tickFormatter={(v) => brlCurto(v)} fontSize={11} width={80} />
                <Tooltip formatter={(v: number) => brl(v)} />
                <Bar dataKey="economia" name="Economia" fill={COR.eco} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Matriz risco × benefício econômico</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="risco"
                  name="Risco"
                  domain={[0.5, 4.5]}
                  ticks={[1, 2, 3, 4]}
                  tickFormatter={(v) => ['', 'Baixo', 'Médio', 'Alto', 'Crítico'][v]}
                  fontSize={11}
                />
                <YAxis
                  type="number"
                  dataKey="beneficio"
                  name="Benefício líquido"
                  tickFormatter={(v) => brlCurto(v)}
                  fontSize={11}
                  width={80}
                />
                <ZAxis dataKey="z" range={[90, 90]} />
                <Tooltip
                  formatter={(v: number, n: string) =>
                    n === 'Risco' ? ['', 'Baixo', 'Médio', 'Alto', 'Crítico'][v] : brl(v)
                  }
                  labelFormatter={() => ''}
                  content={({ payload }) =>
                    payload?.[0] ? (
                      <div className="rounded border bg-card p-2 text-xs shadow">
                        {(payload[0].payload as { nome: string }).nome}
                        <br />
                        {brl((payload[0].payload as { beneficio: number }).beneficio)}
                      </div>
                    ) : null
                  }
                />
                <Scatter data={matriz} fill={COR.plan} />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comparativo antes e depois, por tributo</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Tributo</th>
                <th className="px-4 py-2 text-right">Atual</th>
                <th className="px-4 py-2 text-right">Economia</th>
                <th className="px-4 py-2 text-right">Planejado</th>
              </tr>
            </thead>
            <tbody>
              {porTributo.map(([t, v]) => (
                <tr key={t} className="border-b last:border-0">
                  <td className="px-4 py-2">{NOME_TRIBUTO[t]}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{brl(v.atual)}</td>
                  <td
                    className={
                      'px-4 py-2 text-right tabular-nums ' +
                      (v.economia < 0 ? 'text-risco' : 'text-ok')
                    }
                  >
                    {brl(v.economia)}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">{brl(v.atual - v.economia)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estratégias consolidadas (sem dupla contagem)</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Estratégia</th>
                <th className="px-4 py-2">Etapa</th>
                <th className="px-4 py-2 text-right">Economia isolada</th>
                <th className="px-4 py-2 text-right">Considerada no conjunto</th>
                <th className="px-4 py-2 text-right">Custos/ano</th>
                <th className="px-4 py-2">Notas</th>
              </tr>
            </thead>
            <tbody>
              {cons.itens.map((i) => (
                <tr key={i.numero} className="border-b align-top last:border-0">
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      className="text-left text-primary hover:underline"
                      onClick={() => abrir(i.numero)}
                    >
                      {String(i.numero).padStart(3, '0')} · {i.titulo}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-xs">{NOME_ETAPA[pl.analises[i.numero].etapa]}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{brl(i.economiaBruta)}</td>
                  <td className="px-4 py-2 text-right font-medium tabular-nums">
                    {brl(i.economiaConsiderada)}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">{brl(i.custosAnuais)}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">
                    {i.notas.join(' ') || '—'}
                    {!i.recorrente ? ' Efeito único.' : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
