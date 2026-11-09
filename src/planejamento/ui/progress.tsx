import { cn } from '@/planejamento/lib/utils'

/** Barra de progresso (0 a 1). `tom` pinta pela faixa: ok, aviso ou risco. */
export function Progress({
  value,
  tom,
  className,
}: {
  value: number
  tom?: 'ok' | 'aviso' | 'risco' | 'primary'
  className?: string
}) {
  const cor = { ok: 'bg-ok', aviso: 'bg-aviso', risco: 'bg-risco', primary: 'bg-primary' }[
    tom ?? 'primary'
  ]
  const v = Math.max(0, Math.min(1, value || 0))
  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-secondary', className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v * 100)}
    >
      <div
        className={cn('h-full rounded-full transition-all', cor)}
        style={{ width: `${v * 100}%` }}
      />
    </div>
  )
}
