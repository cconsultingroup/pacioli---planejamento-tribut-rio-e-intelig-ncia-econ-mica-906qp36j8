import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/planejamento/ui/card'
import { Aviso, Kpi, brl, brlCurto, useManual } from '@/planejamento/components/comuns'
import { avaliar, consolidar, projetar } from '@/planejamento/lib/calculo'
import { listarPlanejamentos, listarPropostas } from '@/planejamento/lib/dados'
import type { Planejamento, Proposta } from '@/planejamento/lib/tipos'
import { NOME_ETAPA } from '@/planejamento/lib/tipos'

export default function Indicadores() {
  const { manual, mapa } = useManual()
  const [pls, setPls] = useState<Planejamento[] | null>(null)
  const [props, setProps] = useState<Proposta[]>([])
  const [erro, setErro] = useState('')
  useEffect(() => {
    listarPlanejamentos()
      .then(setPls)
      .catch((e) => setErro(e.message))
    listarPropostas()
      .then(setProps)
      .catch(() => setProps([]))
  }, [])

  const r = useMemo(() => {
    if (!pls || !manual) return null
    let identificadas = 0,
      emAnalise = 0,
      recomendadas = 0,
      aprovadas = 0,
      implementadas = 0,
      realizada = 0,
      potencial = 0,
      aprovado = 0,
      acumulado = 0
    const porEstrategia = new Map<number, { n: number; eco: number }>()
    const linhas = pls.map((pl) => {
      const cons = consolidar(pl, mapa)
      const proj = projetar(pl, cons)
      const apr = consolidar(pl, mapa, (a) =>
        ['aprovada', 'implementada', 'realizada'].includes(a.etapa),
      )
      for (const a of Object.values(pl.analises)) {
        const e = mapa.get(a.numero)
        if (!e) continue
        if (a.etapa === 'descartada') continue
        identificadas++
        if (a.etapa === 'em-analise') emAnalise++
        if (a.etapa === 'recomendada') recomendadas++
        if (a.etapa === 'aprovada') aprovadas++
        if (a.etapa === 'implementada' || a.etapa === 'realizada') implementadas++
        realizada += a.economiaRealizada || 0
        if (a.etapa !== 'identificada') {
          const av = avaliar(a, {
            perfil: pl.perfil,
            premissas: pl.premissas,
            atual: pl.atual,
            estrategia: e,
          })
          const x = porEstrategia.get(a.numero) || { n: 0, eco: 0 }
          x.n++
          x.eco += Math.max(av.beneficioLiquidoRecorrente, 0)
          porEstrategia.set(a.numero, x)
        }
      }
      potencial += cons.economiaTributaria
      aprovado += apr.economiaTributaria
      const ac = proj.anos.reduce((s, a) => s + a.beneficioLiquido, 0)
      acumulado += ac
      return { pl, cons, ac }
    })
    const ranking = [...porEstrategia.entries()]
      .sort((a, b) => b[1].eco - a[1].eco)
      .slice(0, 10)
      .map(([n, x]) => ({
        nome: String(n).padStart(3, '0'),
        titulo: mapa.get(n)?.titulo || '',
        eco: x.eco,
        n: x.n,
      }))
    return {
      identificadas,
      emAnalise,
      recomendadas,
      aprovadas,
      implementadas,
      realizada,
      potencial,
      aprovado,
      acumulado,
      linhas,
      ranking,
    }
  }, [pls, manual, mapa])

  const pendentes = props.filter(
    (p) => p.situacao === 'proposta' || p.situacao === 'em-validacao',
  ).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Painel de indicadores</h1>
        <p className="text-sm text-muted-foreground">
          Oportunidades identificadas, aprovadas, implementadas e economias realizadas em toda a
          carteira de planejamento.
        </p>
      </div>
      {erro && <Aviso tom="risco">{erro}</Aviso>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <Kpi titulo="Planejamentos tributários" valor={String(pls?.length ?? '…')} />
        <Kpi
          titulo="Oportunidades"
          valor={String(r?.identificadas ?? '…')}
          detalhe={`${r?.emAnalise ?? 0} em análise`}
        />
        <Kpi titulo="Recomendadas" valor={String(r?.recomendadas ?? '…')} />
        <Kpi titulo="Aprovadas" valor={String(r?.aprovadas ?? '…')} />
        <Kpi titulo="Implementadas" valor={String(r?.implementadas ?? '…')} />
        <Kpi
          titulo="Economia potencial/ano"
          valor={brlCurto(r?.potencial)}
          detalhe="recomendadas em diante"
          destaque
        />
        <Kpi titulo="Economia aprovada/ano" valor={brlCurto(r?.aprovado)} />
        <Kpi
          titulo="Economia realizada"
          valor={brlCurto(r?.realizada)}
          detalhe="comprovada em guia/apuração"
        />
      </div>
      {pendentes > 0 && (
        <Aviso tom="info">
          <Link to="/planejamento-tributario/inteligencia" className="underline">
            {pendentes} proposta(s) da inteligência adaptativa
          </Link>{' '}
          aguardando validação da Controladoria e do Jurídico.
        </Aviso>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estratégias com maior benefício na carteira</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {r?.ranking.length ? (
              <ResponsiveContainer>
                <BarChart data={r.ranking} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => brlCurto(v)} fontSize={11} />
                  <YAxis type="category" dataKey="nome" fontSize={11} width={40} />
                  <Tooltip
                    formatter={(v: number) => brl(v)}
                    labelFormatter={(l) => r.ranking.find((x) => x.nome === l)?.titulo || l}
                  />
                  <Bar
                    dataKey="eco"
                    name="Benefício líquido/ano"
                    fill="hsl(var(--chart-1))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">Sem estratégias em análise ainda.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Carteira</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">Cliente</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Economia/ano</th>
                  <th className="px-4 py-2 text-right">Líquido 2026–33</th>
                </tr>
              </thead>
              <tbody>
                {r?.linhas.map(({ pl, cons, ac }) => (
                  <tr key={pl.id} className="border-b last:border-0">
                    <td className="px-4 py-2">
                      <Link
                        to={`/planejamento-tributario/planejamento/${pl.id}`}
                        className="text-primary hover:underline"
                      >
                        {pl.nome}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {Object.values(pl.analises)
                          .filter((a) => a.etapa !== 'identificada')
                          .map(
                            (a) =>
                              `${String(a.numero).padStart(3, '0')} ${NOME_ETAPA[a.etapa].toLowerCase()}`,
                          )
                          .slice(0, 4)
                          .join(' · ')}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-xs">{pl.status}</td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {brl(cons.economiaTributaria)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">{brl(ac)}</td>
                  </tr>
                ))}
                {r && !r.linhas.length && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-muted-foreground">
                      <Link
                        className="text-primary underline"
                        to="/planejamento-tributario/planejamentos"
                      >
                        Crie o primeiro planejamento
                      </Link>
                      .
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
      <p className="text-xs text-muted-foreground">
        Economia potencial não é economia realizada. Só entra em "realizada" o valor comprovado em
        guia ou apuração após a implantação.
      </p>
    </div>
  )
}
