import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/planejamento/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/planejamento/ui/card'
import { Input } from '@/planejamento/ui/input'
import { classeSelect, dataFmt } from '@/planejamento/components/comuns'
import { ETAPAS_CONSOLIDADAS } from '@/planejamento/lib/calculo'
import type { Estrategia, Planejamento, Tarefa } from '@/planejamento/lib/tipos'
import { NOME_ETAPA, STATUS_DEMANDA } from '@/planejamento/lib/tipos'
import type { Alterar } from '@/planejamento/paginas/Planejamento'

const AREAS: Tarefa['area'][] = ['C CONT', 'Caldas Advocacia', 'C Capital']

export function AbaPlano({
  pl,
  mapa,
  alterar,
}: {
  pl: Planejamento
  mapa: Map<number, Estrategia>
  alterar: Alterar
}) {
  const set = (id: string, patch: Partial<Tarefa>) =>
    alterar((p) => ({
      ...p,
      tarefas: p.tarefas.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }))
  const recomendadas = Object.values(pl.analises).filter(
    (a) => ETAPAS_CONSOLIDADAS.includes(a.etapa) && mapa.has(a.numero),
  )
  const ordenadas = [...pl.tarefas].sort((a, b) =>
    (a.prazo || '9999').localeCompare(b.prazo || '9999'),
  )
  const datas = ordenadas
    .filter((t) => t.prazo)
    .map((t) => new Date(t.prazo + 'T12:00:00').getTime())
  const ini = datas.length ? Math.min(Date.now(), ...datas) : Date.now()
  const fim = datas.length ? Math.max(...datas) : Date.now()
  const span = Math.max(fim - ini, 86400000 * 30)

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estratégias recomendadas ou aprovadas</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {!recomendadas.length && (
            <p className="text-muted-foreground">
              Nenhuma ainda. Mude a etapa da estratégia para "Recomendada ao cliente" no dossiê.
            </p>
          )}
          <ul className="space-y-1">
            {recomendadas.map((a) => (
              <li key={a.numero}>
                <b>{String(a.numero).padStart(3, '0')}</b> {mapa.get(a.numero)!.titulo} ·{' '}
                {NOME_ETAPA[a.etapa]} · responsável {a.responsavel || '—'} · aprovação{' '}
                {a.aprovador || '—'} · prazo {dataFmt(a.prazo)}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">
            Tarefas · [STATUS] | {pl.nome} | ÁREA | SERVIÇO
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              alterar((p) => ({
                ...p,
                tarefas: [
                  ...p.tarefas,
                  {
                    id: String(Date.now()),
                    descricao: '',
                    responsavel: '',
                    area: 'C CONT',
                    prazo: '',
                    status: 'Nova',
                    dependencia: '',
                  },
                ],
              }))
            }
          >
            <Plus /> Tarefa
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {!pl.tarefas.length && (
            <p className="text-sm text-muted-foreground">
              Sem tarefas. No dossiê de cada estratégia, use "Levar o roteiro ao plano de
              implementação".
            </p>
          )}
          {ordenadas.map((t) => (
            <div
              key={t.id}
              className="grid items-center gap-2 rounded-lg border p-2 lg:grid-cols-[1fr_160px_150px_150px_170px_40px]"
            >
              <div className="space-y-1">
                <Input
                  value={t.descricao}
                  placeholder="Serviço / ação"
                  onChange={(e) => set(t.id, { descricao: e.target.value })}
                />
                <div className="truncate text-[11px] text-muted-foreground">
                  [{t.status}] | {pl.nome} | {t.area} | {t.descricao || '—'}
                  {t.dependencia ? ` · depende de: ${t.dependencia}` : ''}
                </div>
              </div>
              <Input
                value={t.responsavel}
                placeholder="Responsável"
                onChange={(e) => set(t.id, { responsavel: e.target.value })}
              />
              <select
                className={classeSelect}
                value={t.area}
                onChange={(e) => set(t.id, { area: e.target.value as Tarefa['area'] })}
              >
                {AREAS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
              <Input
                type="date"
                value={t.prazo}
                onChange={(e) => set(t.id, { prazo: e.target.value })}
              />
              <select
                className={classeSelect}
                value={t.status}
                onChange={(e) => set(t.id, { status: e.target.value as Tarefa['status'] })}
              >
                {STATUS_DEMANDA.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Remover"
                onClick={() =>
                  alterar((p) => ({ ...p, tarefas: p.tarefas.filter((x) => x.id !== t.id) }))
                }
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {datas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cronograma de implementação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {ordenadas
              .filter((t) => t.prazo)
              .map((t) => {
                const x = (new Date(t.prazo + 'T12:00:00').getTime() - ini) / span
                return (
                  <div
                    key={t.id}
                    className="grid grid-cols-[minmax(0,260px)_1fr] items-center gap-3 text-xs"
                  >
                    <span className="truncate">{t.descricao || '—'}</span>
                    <div className="relative h-4 rounded bg-muted">
                      <div
                        className={
                          'absolute inset-y-0 left-0 rounded ' +
                          (t.status === 'Concluída' || t.status === 'Faturada'
                            ? 'bg-ok/70'
                            : 'bg-primary/60')
                        }
                        style={{ width: `${Math.max(x * 100, 2)}%` }}
                      />
                      <span className="absolute right-1 top-0 text-[10px] leading-4">
                        {dataFmt(t.prazo)}
                      </span>
                    </div>
                  </div>
                )
              })}
          </CardContent>
        </Card>
      )}
      <p className="text-xs text-muted-foreground">
        Movimentação interna não substitui contato com o cliente. Nenhuma alteração fiscal,
        transmissão de declaração ou compromisso em nome do cliente sem autorização humana.
      </p>
    </div>
  )
}
