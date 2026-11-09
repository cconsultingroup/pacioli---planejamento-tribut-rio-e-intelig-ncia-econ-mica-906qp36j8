import { useEffect, useState } from 'react'
import { Badge } from '@/planejamento/ui/badge'
import { carregarManual } from '@/planejamento/lib/dados'
import type { Estrategia, Manual, Situacao } from '@/planejamento/lib/tipos'
import { NOME_SITUACAO } from '@/planejamento/lib/tipos'
import { cn } from '@/planejamento/lib/utils'

export function useManual() {
  const [manual, setManual] = useState<Manual | null>(null)
  const [erro, setErro] = useState('')
  useEffect(() => {
    carregarManual()
      .then(setManual)
      .catch((e) => setErro(e.message))
  }, [])
  const mapa = new Map<number, Estrategia>((manual?.estrategias || []).map((e) => [e.numero, e]))
  return { manual, mapa, erro }
}

export const brl = (v: number | null | undefined) =>
  v == null || !isFinite(v)
    ? '—'
    : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const brlCurto = (v: number | null | undefined) =>
  v == null || !isFinite(v)
    ? '—'
    : v.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        notation: 'compact',
        maximumFractionDigits: 1,
      })

/** Campo numérico em reais (aceita "1.234,56"). Vazio = null. */
export function CampoMoeda({
  valor,
  aoMudar,
  placeholder,
  className,
  sufixo,
}: {
  valor: number | null | undefined
  aoMudar: (v: number | null) => void
  placeholder?: string
  className?: string
  sufixo?: string
}) {
  const fmt = (v: number | null | undefined) =>
    v == null
      ? ''
      : sufixo
        ? String(v).replace('.', ',')
        : v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const [texto, setTexto] = useState(fmt(valor))
  const [foco, setFoco] = useState(false)
  useEffect(() => {
    if (!foco) setTexto(fmt(valor))
  }, [valor, foco]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className={cn('relative', className)}>
      {!sufixo && (
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          R$
        </span>
      )}
      <input
        inputMode="decimal"
        value={texto}
        placeholder={placeholder}
        onFocus={() => setFoco(true)}
        onBlur={() => {
          setFoco(false)
          setTexto(fmt(valor))
        }}
        onChange={(e) => {
          setTexto(e.target.value)
          const s = e.target.value.trim()
          if (!s) return aoMudar(null)
          const num = Number(s.replace(/\./g, '').replace(',', '.'))
          if (!isNaN(num)) aoMudar(num)
        }}
        className={cn(
          'h-9 w-full rounded-md border border-input bg-background py-1 text-right text-sm tabular-nums shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          sufixo ? 'pl-2 pr-7' : 'pl-8 pr-2',
        )}
      />
      {sufixo && (
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {sufixo}
        </span>
      )}
    </div>
  )
}

/** Sim / Não / Não informado. */
export function SimNaoCampo({
  rotulo,
  valor,
  aoMudar,
}: {
  rotulo: string
  valor: boolean | null
  aoMudar: (v: boolean | null) => void
}) {
  const op = (v: boolean | null, t: string) => (
    <button
      type="button"
      onClick={() => aoMudar(v)}
      className={cn(
        'px-2 py-1 text-xs transition-colors',
        valor === v
          ? v === true
            ? 'bg-ok text-white'
            : v === false
              ? 'bg-muted-foreground text-white'
              : 'bg-secondary'
          : 'hover:bg-accent',
      )}
    >
      {t}
    </button>
  )
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-sm">
      <span className="min-w-0 flex-1">{rotulo}</span>
      <div className="flex shrink-0 overflow-hidden rounded-md border">
        {op(true, 'Sim')}
        {op(false, 'Não')}
        {op(null, '?')}
      </div>
    </div>
  )
}

export function Rotulo({
  texto,
  children,
  ajuda,
}: {
  texto: string
  children: React.ReactNode
  ajuda?: string
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium">{texto}</span>
      {children}
      {ajuda && <span className="block text-xs text-muted-foreground">{ajuda}</span>}
    </label>
  )
}

export const classeSelect =
  'h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
export const classeTexto =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function SeloSituacao({ s, sugerida }: { s: Situacao; sugerida?: boolean }) {
  const v =
    s === 'aplicavel'
      ? 'ok'
      : s === 'condicionada'
        ? 'aviso'
        : s === 'alto-risco' || s === 'nao-recomendada'
          ? 'risco'
          : 'secondary'
  return (
    <Badge variant={v as 'ok'}>
      {NOME_SITUACAO[s]}
      {sugerida ? ' (sugestão)' : ''}
    </Badge>
  )
}

export function SeloRisco({ risco }: { risco: string }) {
  const v =
    risco === 'alto' || risco === 'critico'
      ? 'risco'
      : risco === 'medio-alto'
        ? 'aviso'
        : risco === 'baixo'
          ? 'ok'
          : 'secondary'
  const nome: Record<string, string> = {
    alto: 'Alto',
    'medio-alto': 'Médio/alto',
    medio: 'Médio',
    baixo: 'Baixo',
    critico: 'Crítico',
  }
  return <Badge variant={v as 'ok'}>Risco {nome[risco] || risco}</Badge>
}

export function Kpi({
  titulo,
  valor,
  detalhe,
  destaque,
}: {
  titulo: string
  valor: string
  detalhe?: string
  destaque?: boolean
}) {
  return (
    <div
      className={cn('rounded-xl border bg-card p-4', destaque && 'border-primary/40 bg-primary/5')}
    >
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {titulo}
      </div>
      <div className="mt-1 font-display text-2xl font-bold tabular-nums">{valor}</div>
      {detalhe && <div className="mt-0.5 text-xs text-muted-foreground">{detalhe}</div>}
    </div>
  )
}

export function Aviso({
  children,
  tom = 'aviso',
}: {
  children: React.ReactNode
  tom?: 'aviso' | 'risco' | 'info'
}) {
  return (
    <div
      className={cn(
        'rounded-lg border px-3 py-2 text-sm',
        tom === 'risco'
          ? 'border-risco/30 bg-risco/5 text-risco'
          : tom === 'info'
            ? 'border-primary/20 bg-primary/5'
            : 'border-aviso/30 bg-aviso/5 text-aviso',
      )}
    >
      {children}
    </div>
  )
}

export const cnpjFmt = (c: string) =>
  c && c.length === 14 ? c.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5') : c
export const dataFmt = (d?: string | null) =>
  d ? new Date(d.length === 10 ? d + 'T12:00:00' : d).toLocaleDateString('pt-BR') : '—'
