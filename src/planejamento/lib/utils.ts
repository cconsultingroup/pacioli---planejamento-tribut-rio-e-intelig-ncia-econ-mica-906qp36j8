import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const BRL_CURTO = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
})

export const brl = (v: number | null | undefined) => (v == null ? '—' : BRL.format(v))
export const brlCurto = (v: number | null | undefined) => (v == null ? '—' : BRL_CURTO.format(v))
export const pct = (v: number | null | undefined, casas = 0) =>
  v == null
    ? '—'
    : `${(v * 100).toLocaleString('pt-BR', { maximumFractionDigits: casas, minimumFractionDigits: casas })}%`
export const cnpjFmt = (c: string) =>
  c && c.length === 14 ? c.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5') : c
export const mesFmt = (m: string) => {
  const [a, mm] = m.split('-')
  return `${mm}/${a}`
}
export const dataFmt = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString('pt-BR') : '—'
export const dataHoraFmt = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—'
