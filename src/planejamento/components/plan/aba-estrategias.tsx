import { useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/planejamento/ui/button'
import { Card, CardContent } from '@/planejamento/ui/card'
import { Input } from '@/planejamento/ui/input'
import {
  Aviso,
  Kpi,
  SeloRisco,
  SeloSituacao,
  brl,
  classeSelect,
} from '@/planejamento/components/comuns'
import { avaliar, novaAnalise } from '@/planejamento/lib/calculo'
import { triar } from '@/planejamento/lib/triagem'
import type { Etapa, Manual, Planejamento, Situacao } from '@/planejamento/lib/tipos'
import { NOME_ETAPA, NOME_SITUACAO } from '@/planejamento/lib/tipos'
import type { Alterar } from '@/planejamento/paginas/Planejamento'

export function AbaEstrategias({
  pl,
  manual,
  alterar,
  abrir,
}: {
  pl: Planejamento
  manual: Manual
  alterar: Alterar
  abrir: (n: number) => void
}) {
  const [busca, setBusca] = useState('')
  const [bloco, setBloco] = useState('')
  const [filtroSit, setFiltroSit] = useState<string>('relevantes')

  const linhas = useMemo(
    () =>
      manual.estrategias.map((e) => {
        const t = triar(e, pl.perfil)
        const a = pl.analises[e.numero]
        const final: Situacao = a?.situacao || t.sugestao
        const av = a
          ? avaliar(a, {
              perfil: pl.perfil,
              premissas: pl.premissas,
              atual: pl.atual,
              estrategia: e,
            })
          : null
        return { e, t, a, final, av }
      }),
    [manual, pl],
  )

  const visiveis = linhas.filter(({ e, final }) => {
    if (bloco && String(e.bloco) !== bloco) return false
    if (filtroSit === 'relevantes' && final === 'inaplicavel') return false
    if (filtroSit && filtroSit !== 'relevantes' && final !== filtroSit) return false
    if (busca) {
      const b = busca.toLowerCase()
      return (
        e.titulo.toLowerCase().includes(b) ||
        e.codigo.includes(b) ||
        e.modelo.toLowerCase().includes(b)
      )
    }
    return true
  })

  const cont = (s: Situacao) => linhas.filter((l) => l.final === s).length
  const semPerfil = !pl.perfil.regime

  function iniciar(n: number) {
    const e = manual.estrategias.find((x) => x.numero === n)!
    alterar((p) =>
      p.analises[n]
        ? p
        : {
            ...p,
            analises: {
              ...p.analises,
              [n]: {
                ...novaAnalise(e, { perfil: p.perfil, premissas: p.premissas, atual: p.atual }),
                etapa: 'em-analise',
              },
            },
          },
    )
    abrir(n)
  }
  function mudarEtapa(n: number, etapa: Etapa) {
    const e = manual.estrategias.find((x) => x.numero === n)!
    alterar((p) => {
      const a =
        p.analises[n] ||
        novaAnalise(e, { perfil: p.perfil, premissas: p.premissas, atual: p.atual })
      return {
        ...p,
        analises: { ...p.analises, [n]: { ...a, etapa, atualizadoEm: new Date().toISOString() } },
      }
    })
  }

  return (
    <div className="space-y-4">
      {semPerfil && (
        <Aviso>
          Preencha o perfil (regime, setores, operações) para a triagem automática ficar precisa.
          Sem informação, a estratégia fica "Condicionada".
        </Aviso>
      )}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Kpi
          titulo="Aplicáveis"
          valor={String(cont('aplicavel'))}
          detalhe="perfil atende; confirmar documentos"
        />
        <Kpi
          titulo="Condicionadas"
          valor={String(cont('condicionada'))}
          detalhe="dependem de dados ou documentos"
        />
        <Kpi
          titulo="Alto risco"
          valor={String(cont('alto-risco'))}
          detalhe="parecer jurídico prévio"
        />
        <Kpi titulo="Não recomendadas" valor={String(cont('nao-recomendada'))} />
        <Kpi titulo="Inaplicáveis" valor={String(cont('inaplicavel'))} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          className="w-64"
          placeholder="Buscar por nome, número ou modelo"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <select
          className={classeSelect + ' w-auto'}
          value={bloco}
          onChange={(e) => setBloco(e.target.value)}
        >
          <option value="">Todos os blocos</option>
          {manual.blocos.map((b) => (
            <option key={b.numero} value={b.numero}>
              Bloco {String(b.numero).padStart(2, '0')} · {b.nome}
            </option>
          ))}
        </select>
        <select
          className={classeSelect + ' w-auto'}
          value={filtroSit}
          onChange={(e) => setFiltroSit(e.target.value)}
        >
          <option value="relevantes">Todas, exceto inaplicáveis</option>
          <option value="">Todas</option>
          {(Object.keys(NOME_SITUACAO) as Situacao[]).map((s) => (
            <option key={s} value={s}>
              {NOME_SITUACAO[s]}
            </option>
          ))}
        </select>
        <span className="self-center text-sm text-muted-foreground">
          {visiveis.length} estratégias
        </span>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Estratégia</th>
                  <th className="px-3 py-2">Situação</th>
                  <th className="px-3 py-2">Motivo da triagem</th>
                  <th className="px-3 py-2">Etapa</th>
                  <th className="px-3 py-2 text-right">Economia/ano</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visiveis.map(({ e, t, a, final, av }) => (
                  <tr key={e.numero} className="border-b align-top last:border-0 hover:bg-muted/30">
                    <td className="max-w-sm px-3 py-2">
                      <div className="font-medium">
                        {e.codigo} · {e.titulo}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className="text-xs text-muted-foreground">{e.modelo}</span>
                        <SeloRisco risco={e.risco} />
                        {e.origem === 'inteligencia' && (
                          <span className="text-xs text-primary">nova (inteligência)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <SeloSituacao s={final} sugerida={!a?.situacao} />
                    </td>
                    <td className="max-w-md px-3 py-2 text-xs text-muted-foreground">
                      {t.motivos.slice(-2).join(' ')}
                      {t.vigencia ? ` ${t.vigencia}` : ''}
                    </td>
                    <td className="px-3 py-2">
                      <select
                        className={classeSelect + ' h-8 w-40 text-xs'}
                        value={a?.etapa || 'identificada'}
                        onChange={(ev) => mudarEtapa(e.numero, ev.target.value as Etapa)}
                      >
                        {(Object.keys(NOME_ETAPA) as Etapa[]).map((k) => (
                          <option key={k} value={k}>
                            {NOME_ETAPA[k]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {av ? brl(av.beneficioLiquidoRecorrente) : '—'}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        size="sm"
                        variant={a ? 'outline' : 'ghost'}
                        onClick={() => (a ? abrir(e.numero) : iniciar(e.numero))}
                        disabled={t.foraEscopo}
                      >
                        {a ? 'Dossiê' : 'Analisar'} <ChevronRight />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">
        A triagem é uma sugestão a partir do perfil. "Aplicável" só vale com requisitos demonstrados
        em documento (evidências e contraprova do manual). Recuperação de tributos e contencioso
        (Bloco 09, exceto negociação de passivo) ficam com o painel de créditos e a Caldas
        Advocacia.
      </p>
    </div>
  )
}
