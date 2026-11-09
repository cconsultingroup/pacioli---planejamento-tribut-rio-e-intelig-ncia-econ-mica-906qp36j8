import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Button } from '@/planejamento/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/planejamento/ui/card'
import { Aviso, Kpi, brl, brlCurto } from '@/planejamento/components/comuns'
import { novaAnalise } from '@/planejamento/lib/calculo'
import { anexoProvavel, compararRegimes } from '@/planejamento/lib/comparativo'
import type { Estrategia, Planejamento } from '@/planejamento/lib/tipos'
import { NOME_TRIBUTO } from '@/planejamento/lib/tipos'
import type { Alterar } from '@/planejamento/paginas/Planejamento'

const COR = {
  melhor: 'hsl(var(--chart-2))',
  atual: 'hsl(var(--chart-1))',
  outro: 'hsl(var(--chart-3))',
}

export function AbaRegimes({
  pl,
  mapa,
  alterar,
  abrir,
}: {
  pl: Planejamento
  mapa: Map<number, Estrategia>
  alterar: Alterar
  abrir: (n: number) => void
}) {
  const c = compararRegimes(pl.perfil, pl.atual)
  const disp = c.regimes.filter((r) => r.disponivel || r.modelo)
  const grafico = disp.map((r) => ({ nome: r.nome.replace(' (', '\n('), total: r.total, id: r.id }))
  const tom =
    c.situacao === 'trocar'
      ? 'border-ok bg-ok/10'
      : c.situacao === 'ideal'
        ? 'border-primary bg-primary/10'
        : 'border-amber-400 bg-amber-50'
  const titulo =
    c.situacao === 'ideal'
      ? 'A tributação atual já é a ideal'
      : c.situacao === 'trocar'
        ? `Outra tributação seria melhor: ${c.melhor!.nome}`
        : c.situacao === 'equivalente'
          ? 'Tributações praticamente equivalentes'
          : 'Comparativo incompleto'

  /** Leva o resultado para a estratégia 001 (troca de regime), que entra na consolidação quando recomendada. */
  function levarParaEstrategia() {
    const e = mapa.get(1)
    if (!e || !c.melhor) return
    alterar((x) => {
      const base =
        x.analises[1] ||
        novaAnalise(e, { perfil: x.perfil, premissas: x.premissas, atual: x.atual })
      return {
        ...x,
        analises: {
          ...x.analises,
          1: {
            ...base,
            entradas: {
              ...base.entradas,
              regimePlanejado: c.melhor!.id,
              anexo: anexoProvavel(x.perfil),
            },
            etapa: base.etapa === 'identificada' ? 'em-analise' : base.etapa,
            situacao: base.situacao || 'aplicavel',
            atualizadoEm: new Date().toISOString(),
            notas:
              (base.notas ? base.notas + '\n' : '') +
              `Comparativo de regimes (${new Date().toLocaleDateString('pt-BR')}): ${c.conclusao}`,
          },
        },
      }
    })
    abrir(1)
  }

  return (
    <div className="space-y-5">
      <div className={`rounded-lg border-2 p-4 ${tom}`}>
        <div className="text-lg font-semibold">{titulo}</div>
        <p className="mt-1 text-sm">{c.conclusao}</p>
        {c.conclusao2027 && <p className="mt-2 text-sm text-muted-foreground">{c.conclusao2027}</p>}
        {c.situacao === 'trocar' && mapa.get(1) && (
          <Button size="sm" className="mt-3" onClick={levarParaEstrategia}>
            Levar para a estratégia 001 (troca de regime)
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi
          titulo="Tributação atual"
          valor={c.atual ? brl(c.atual.disponivel ? c.atual.total : null) : 'Não informada'}
          detalhe={c.atual?.nome || 'Preencha o regime no perfil'}
        />
        <Kpi
          titulo="Melhor tributação"
          valor={c.melhor ? brl(c.melhor.total) : '—'}
          detalhe={c.melhor?.nome || 'Dados insuficientes'}
          destaque
        />
        <Kpi
          titulo="Economia por ano"
          valor={brl(c.situacao === 'trocar' || c.situacao === 'equivalente' ? c.economia : 0)}
          detalhe={
            c.situacao === 'ideal'
              ? 'Já está no melhor regime'
              : `${(c.economiaPct * 100).toFixed(1).replace('.', ',')}% da carga comparada`
          }
        />
        <Kpi
          titulo="Economia por mês"
          valor={brl(c.situacao === 'trocar' || c.situacao === 'equivalente' ? c.economia / 12 : 0)}
          detalhe={
            c.situacao === 'trocar' ? `Em 5 anos ≈ ${brl(c.economia * 5)} (regras atuais)` : '—'
          }
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Carga anual por tributação</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <BarChart data={grafico} margin={{ top: 24 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="nome" fontSize={11} interval={0} />
                <YAxis tickFormatter={(v) => brlCurto(v)} fontSize={11} width={80} />
                <Tooltip formatter={(v: number) => brl(v)} />
                <Bar dataKey="total" name="Carga anual" radius={[4, 4, 0, 0]}>
                  {grafico.map((g) => (
                    <Cell
                      key={g.id}
                      fill={
                        g.id === c.melhor?.id
                          ? COR.melhor
                          : g.id === c.atualId
                            ? COR.atual
                            : COR.outro
                      }
                    />
                  ))}
                  <LabelList
                    dataKey="total"
                    position="top"
                    formatter={(v: number) => brlCurto(v)}
                    fontSize={11}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Observações sobre os regimes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {c.regimes
              .filter((r) => !r.disponivel)
              .map((r) => (
                <p key={r.id}>
                  <b>{r.nome}:</b> {r.motivo}
                </p>
              ))}
            {c.regimes.every((r) => r.disponivel) && (
              <p>Todos os regimes foram simulados e podem ser escolhidos.</p>
            )}
            <p className="pt-2 text-xs text-muted-foreground">
              Verde = menor carga entre os regimes permitidos · azul = tributação atual · cinza =
              outras opções e modelos.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Comparativo por tributo (valores anuais, mesmas bases do perfil)
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Tributo</th>
                {c.regimes.map((r) => (
                  <th key={r.id} className="px-4 py-2 text-right">
                    {r.nome}
                    {r.atual ? ' · atual' : ''}
                    {r.id === c.melhor?.id ? ' · melhor' : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {c.linhasTributo.map((t) => (
                <tr key={t} className="border-b">
                  <td className="px-4 py-2">{NOME_TRIBUTO[t]}</td>
                  {c.regimes.map((r) => (
                    <td key={r.id} className="px-4 py-2 text-right tabular-nums">
                      {r.disponivel || r.modelo ? (r.tributos[t] ? brl(r.tributos[t]) : '—') : ''}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-b bg-muted/30 font-semibold">
                <td className="px-4 py-2">Total</td>
                {c.regimes.map((r) => (
                  <td key={r.id} className="px-4 py-2 text-right tabular-nums">
                    {r.disponivel || r.modelo ? brl(r.total) : 'indisponível'}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2">Diferença para a tributação atual</td>
                {c.regimes.map((r) => {
                  const d =
                    c.atual?.disponivel && (r.disponivel || r.modelo)
                      ? r.total - c.atual.total
                      : null
                  return (
                    <td
                      key={r.id}
                      className={
                        'px-4 py-2 text-right tabular-nums ' +
                        (d == null ? '' : d < 0 ? 'text-ok font-medium' : d > 0 ? 'text-risco' : '')
                      }
                    >
                      {d == null
                        ? ''
                        : d === 0
                          ? '—'
                          : (r.modelo ? 'modelo: ' : '') +
                            (d < 0 ? 'economia ' : 'a mais ') +
                            brl(Math.abs(d))}
                    </td>
                  )
                })}
              </tr>
              <tr>
                <td className="px-4 py-2 text-muted-foreground">
                  A partir de 2027 (IRPJ + CSLL + patronal)
                </td>
                {c.regimes.map((r) => (
                  <td
                    key={r.id}
                    className="px-4 py-2 text-right tabular-nums text-muted-foreground"
                  >
                    {r.total2027 != null ? brl(r.total2027) : ''}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          {c.pagoSped != null && c.atual && (
            <p className="px-4 py-3 text-xs text-muted-foreground">
              Conferência ({c.pagoSped.tributos.map((t) => NOME_TRIBUTO[t]).join(', ')}): apurados
              na situação atual (SPED) {brl(c.pagoSped.pago)}, simulados no {c.atual.nome}{' '}
              {brl(c.pagoSped.simulado)}. Diferenças vêm de créditos, ajustes do e-Lalur,
              monofásicos e outros itens que a simulação simplificada não capta.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-3">
        {c.regimes
          .filter((r) => r.disponivel || r.modelo)
          .map((r) => (
            <Card key={r.id}>
              <CardHeader>
                <CardTitle className="text-base">Memória de cálculo — {r.nome}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs">
                {r.memoria.map((m, i) => (
                  <div key={i} className="flex justify-between gap-3 border-b py-1 last:border-0">
                    <div>
                      <div className="font-medium">{m.etapa}</div>
                      <div className="text-muted-foreground">
                        {m.formula}
                        {m.nota ? ` · ${m.nota}` : ''}
                      </div>
                    </div>
                    <div className="whitespace-nowrap tabular-nums">
                      {m.valor == null ? '' : brl(m.valor)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
      </div>

      {c.avisos.map((a) => (
        <Aviso key={a}>{a}</Aviso>
      ))}
    </div>
  )
}
