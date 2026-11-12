import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/planejamento/ui/button'
import { Skeleton } from '@/planejamento/ui/skeleton'
import { Aviso, classeSelect, cnpjFmt, useManual } from '@/planejamento/components/comuns'
import { AbaPerfil } from '@/planejamento/components/plan/aba-perfil'
import { AbaServidor } from '@/planejamento/components/plan/aba-servidor'
import { AbaRegimes } from '@/planejamento/components/plan/aba-regimes'
import { AbaEstrategias } from '@/planejamento/components/plan/aba-estrategias'
import { AbaDossie } from '@/planejamento/components/plan/aba-dossie'
import { AbaConsolidacao } from '@/planejamento/components/plan/aba-consolidacao'
import { AbaProjecao } from '@/planejamento/components/plan/aba-projecao'
import { AbaPlano } from '@/planejamento/components/plan/aba-plano'
import { AbaRelatorios } from '@/planejamento/components/plan/aba-relatorios'
import { obterPlanejamento, salvarPlanejamento } from '@/planejamento/lib/dados'
import type { Planejamento } from '@/planejamento/lib/tipos'
import { STATUS_DEMANDA } from '@/planejamento/lib/tipos'
import { comStatusAutomatico, inferirStatus } from '@/planejamento/lib/status'
import { cn } from '@/planejamento/lib/utils'

const ABAS: [string, string][] = [
  ['perfil', '1. Perfil e situação atual'],
  ['regimes', '2. Comparativo de regimes'],
  ['estrategias', '3. Triagem das estratégias'],
  ['consolidacao', '4. Economia consolidada'],
  ['projecao', '5. Projeção 2026–2033'],
  ['plano', '6. Plano de implementação'],
  ['relatorios', '7. Relatórios e respostas'],
  ['servidor', '8. Servidor ReceitanetBX'],
]

export type Alterar = (f: (p: Planejamento) => Planejamento) => void

export default function PaginaPlanejamento() {
  const { id = '', aba = 'perfil' } = useParams()
  const nav = useNavigate()
  const { manual, mapa, erro: erroManual } = useManual()
  const [pl, setPl] = useState<Planejamento | null>(null)
  const [erro, setErro] = useState('')
  const [estado, setEstado] = useState<'salvo' | 'alterado' | 'salvando' | 'erro'>('salvo')
  const atual = useRef<Planejamento | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    obterPlanejamento(id)
      .then((p) => {
        setPl(p)
        atual.current = p
      })
      .catch((e) => setErro(e.message))
  }, [id])

  const salvar = useCallback(async () => {
    if (!atual.current) return
    window.clearTimeout(timer.current)
    setEstado('salvando')
    try {
      await salvarPlanejamento(atual.current)
      setEstado('salvo')
    } catch (e) {
      setEstado('erro')
      setErro('Não foi possível salvar: ' + (e as Error).message)
    }
  }, [])

  const alterar: Alterar = useCallback(
    (f) => {
      setPl((p) => {
        if (!p) return p
        const novo = comStatusAutomatico(f(p))
        atual.current = novo
        return novo
      })
      setEstado('alterado')
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(salvar, 1500)
    },
    [salvar],
  )

  useEffect(() => {
    const antes = (e: BeforeUnloadEvent) => {
      if (estado === 'alterado' || estado === 'salvando') e.preventDefault()
    }
    window.addEventListener('beforeunload', antes)
    return () => window.removeEventListener('beforeunload', antes)
  }, [estado])

  if (erro && !pl) return <Aviso tom="risco">{erro}</Aviso>
  if (!pl || !manual) return <Skeleton className="h-96 w-full" />

  const abaDossie = aba.startsWith('estrategia-') ? Number(aba.slice(11)) : null
  const ir = (a: string) => nav(`/planejamento-tributario/planejamento/${id}/${a}`)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            to="/planejamento-tributario/planejamentos"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3" /> Planejamento Tributário
          </Link>
          <h1 className="font-display text-xl font-bold sm:text-2xl">
            PLANEJAMENTO TRIBUTÁRIO ESTRATÉGICO — {pl.nome} — {pl.periodo}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="tabular-nums">{cnpjFmt(pl.cnpj)}</span>
            <span>·</span>
            <select
              className={cn(classeSelect, 'h-7 w-auto py-0 text-xs')}
              title={
                pl.statusManual
                  ? 'Status escolhido à mão'
                  : 'Automático: ' + inferirStatus(pl).motivo
              }
              value={pl.statusManual ? pl.status : '__auto'}
              onChange={(e) =>
                alterar((p) =>
                  e.target.value === '__auto'
                    ? { ...p, statusManual: false }
                    : {
                        ...p,
                        status: e.target.value as Planejamento['status'],
                        statusManual: true,
                      },
                )
              }
            >
              <option value="__auto">Automático: {inferirStatus(pl).status}</option>
              <optgroup label="Definir à mão">
                {STATUS_DEMANDA.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </optgroup>
            </select>
            <span>·</span>
            <span>
              [{pl.status}] | {pl.nome} | C CONT | Planejamento tributário
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn('text-xs', estado === 'erro' ? 'text-risco' : 'text-muted-foreground')}
          >
            {estado === 'salvo'
              ? 'Tudo salvo'
              : estado === 'salvando'
                ? 'Salvando…'
                : estado === 'erro'
                  ? 'Erro ao salvar'
                  : 'Alterações não salvas'}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={salvar}
            disabled={estado === 'salvo' || estado === 'salvando'}
          >
            <Save /> Salvar
          </Button>
        </div>
      </div>
      {erroManual && <Aviso tom="risco">{erroManual}</Aviso>}
      {erro && pl && <Aviso tom="risco">{erro}</Aviso>}

      <nav
        className="flex gap-1 overflow-x-auto border-b print:hidden"
        aria-label="Etapas do planejamento"
      >
        {ABAS.map(([k, t]) => (
          <button
            key={k}
            type="button"
            onClick={() => ir(k)}
            className={cn(
              'whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              aba === k || (k === 'estrategias' && abaDossie)
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t}
          </button>
        ))}
      </nav>

      {aba === 'perfil' && (
        <>
          <AbaPerfil pl={pl} alterar={alterar} />
          <AbaServidor pl={pl} />
        </>
      )}
      {aba === 'servidor' && <AbaServidor pl={pl} />}
      {aba === 'regimes' && (
        <AbaRegimes pl={pl} mapa={mapa} alterar={alterar} abrir={(n) => ir(`estrategia-${n}`)} />
      )}
      {aba === 'estrategias' && (
        <AbaEstrategias
          pl={pl}
          manual={manual}
          alterar={alterar}
          abrir={(n) => ir(`estrategia-${n}`)}
        />
      )}
      {abaDossie && mapa.get(abaDossie) && (
        <AbaDossie
          pl={pl}
          manual={manual}
          e={mapa.get(abaDossie)!}
          alterar={alterar}
          voltar={() => ir('estrategias')}
        />
      )}
      {aba === 'consolidacao' && (
        <AbaConsolidacao pl={pl} mapa={mapa} abrir={(n) => ir(`estrategia-${n}`)} />
      )}
      {aba === 'projecao' && <AbaProjecao pl={pl} mapa={mapa} alterar={alterar} />}
      {aba === 'plano' && <AbaPlano pl={pl} mapa={mapa} alterar={alterar} />}
      {aba === 'relatorios' && (
        <AbaRelatorios pl={pl} manual={manual} mapa={mapa} salvarAntes={salvar} />
      )}
    </div>
  )
}
