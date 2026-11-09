/* Layout do sistema: menu lateral C CONT (Planejamento Tributário + Empresas) e área de conteúdo. Exige login. */
import { Suspense, useEffect, useState } from 'react'
import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import {
  BookOpen,
  BrainCircuit,
  Building2,
  ClipboardList,
  Gauge,
  Library,
  LogOut,
  Mail,
  Menu,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import logo from '@/planejamento/assets/logo-consulting.png'

const BASE = '/planejamento-tributario'

interface Item {
  rota: string
  rotulo: string
  icone: LucideIcon
  cor?: string
  ativo: (c: string) => boolean
}

const MODULOS: Item[] = [
  {
    rota: BASE,
    rotulo: 'Painel de indicadores',
    icone: Gauge,
    cor: 'text-[hsl(var(--lateral-ouro))]',
    ativo: (c) => c === BASE || c === BASE + '/',
  },
  {
    rota: BASE + '/planejamentos',
    rotulo: 'Planejamento Tributário',
    icone: ClipboardList,
    cor: 'text-[hsl(var(--lateral-teal))]',
    ativo: (c) => c.startsWith(BASE + '/planejamento'),
  },
  {
    rota: BASE + '/estrategias',
    rotulo: 'Base de estratégias',
    icone: Library,
    ativo: (c) => c.startsWith(BASE + '/estrategias'),
  },
  {
    rota: BASE + '/inteligencia',
    rotulo: 'Inteligência adaptativa',
    icone: BrainCircuit,
    cor: 'text-[hsl(var(--lateral-lilas))]',
    ativo: (c) => c.startsWith(BASE + '/inteligencia'),
  },
  {
    rota: BASE + '/destinatarios',
    rotulo: 'Destinatários',
    icone: Mail,
    ativo: (c) => c.startsWith(BASE + '/destinatarios'),
  },
  {
    rota: '/empresas',
    rotulo: 'Empresas',
    icone: Building2,
    cor: 'text-[hsl(var(--lateral-teal))]',
    ativo: (c) => c.startsWith('/empresas'),
  },
]
const APOIO: Item[] = [
  {
    rota: BASE + '/metodologia',
    rotulo: 'Metodologia e transição',
    icone: BookOpen,
    ativo: (c) => c.startsWith(BASE + '/metodologia'),
  },
  {
    rota: '/usuarios',
    rotulo: 'Usuários',
    icone: UserRound,
    ativo: (c) => c.startsWith('/usuarios'),
  },
]

function sair() {
  pb.authStore.clear()
  window.location.href = '/login'
}

function MenuLateral({ aoNavegar }: { aoNavegar?: () => void }) {
  const { pathname } = useLocation()
  const item = (m: Item) => {
    const ativo = m.ativo(pathname)
    return (
      <NavLink
        key={m.rota}
        to={m.rota}
        end
        onClick={aoNavegar}
        aria-current={ativo ? 'page' : undefined}
        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
          ativo
            ? 'bg-white text-[hsl(var(--lateral))] shadow-sm'
            : 'text-[hsl(var(--lateral-texto))] hover:bg-white/10 hover:text-white'
        }`}
      >
        <m.icone
          className={`size-[18px] shrink-0 ${ativo ? 'text-[hsl(var(--lateral))]' : m.cor || ''}`}
        />
        <span className="truncate">{m.rotulo}</span>
      </NavLink>
    )
  }
  const usuario = pb.authStore.record
  return (
    <div className="flex h-full flex-col px-3 py-5">
      <div className="mb-5 flex items-center gap-3 px-2">
        <img
          src={logo}
          alt="C Consulting Group"
          className="h-9 w-auto max-w-[110px] shrink-0 object-contain"
        />
        <div className="leading-tight">
          <div className="font-display text-lg font-bold tracking-tight text-white">C CONT</div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--lateral-texto))]">
            Planejamento Tributário
          </div>
        </div>
      </div>
      {usuario && (
        <div className="mb-4 truncate rounded-lg bg-white/5 p-2.5 text-xs text-[hsl(var(--lateral-texto))]">
          <div className="truncate font-semibold text-white">
            {(usuario.name as string) || (usuario.email as string)}
          </div>
          <div className="truncate opacity-90">{usuario.email as string}</div>
        </div>
      )}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto" aria-label="Menu">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--lateral-texto))]/70">
          Módulos
        </div>
        {MODULOS.map(item)}
        <div className="px-3 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--lateral-texto))]/70">
          Apoio
        </div>
        {APOIO.map(item)}
        <button
          type="button"
          onClick={sair}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[hsl(var(--lateral-texto))] transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="size-[18px] shrink-0" /> Sair
        </button>
      </nav>
      <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs leading-snug text-[hsl(var(--lateral-texto))]">
        <div className="font-semibold text-white">Planejar o futuro</div>
        Simulações para decisão. Nada aqui transmite declarações ou altera registros do cliente.
      </div>
    </div>
  )
}

export default function Layout() {
  const { pathname } = useLocation()
  const [aberta, setAberta] = useState(false)
  useEffect(() => setAberta(false), [pathname])
  if (!pb.authStore.isValid)
    return <Navigate to={`/login?voltar=${encodeURIComponent(pathname)}`} replace />
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-[hsl(var(--lateral))] lg:block print:hidden">
        <MenuLateral />
      </aside>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 bg-[hsl(var(--lateral))] px-4 lg:hidden print:hidden">
        <button
          type="button"
          onClick={() => setAberta(true)}
          aria-label="Abrir menu"
          className="rounded-md p-1.5 text-white hover:bg-white/10"
        >
          <Menu className="size-5" />
        </button>
        <span className="font-display font-bold text-white">C CONT</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--lateral-texto))]">
          Planejamento
        </span>
      </header>
      {aberta && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={() => setAberta(false)}
            aria-label="Fechar menu"
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-[hsl(var(--lateral))] shadow-xl">
            <button
              type="button"
              onClick={() => setAberta(false)}
              aria-label="Fechar menu"
              className="absolute right-3 top-6 rounded-md p-1.5 text-white hover:bg-white/10"
            >
              <X className="size-5" />
            </button>
            <MenuLateral aoNavegar={() => setAberta(false)} />
          </aside>
        </div>
      )}
      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6">
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </main>
        <footer className="mx-auto max-w-[1440px] px-4 pb-8 text-xs text-muted-foreground sm:px-6 print:hidden">
          Simulações de planejamento tributário com base no Manual Avançado 2026–2033. Valores
          potenciais não são economia realizada; alíquotas futuras de CBS/IBS são premissas
          explícitas. Nenhuma alteração fiscal é feita sem autorização humana.
        </footer>
      </div>
    </div>
  )
}
