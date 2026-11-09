// Rotas do Planejamento Tributário 2026–2033 (/planejamento-tributario/*). O menu fica em components/Layout.tsx.
import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Skeleton } from '@/planejamento/ui/skeleton'
import { TooltipProvider } from '@/planejamento/ui/tooltip'

const Indicadores = lazy(() => import('@/planejamento/paginas/Indicadores'))
const Planejamentos = lazy(() => import('@/planejamento/paginas/Planejamentos'))
const PlanejamentoPagina = lazy(() => import('@/planejamento/paginas/Planejamento'))
const Estrategias = lazy(() => import('@/planejamento/paginas/Estrategias'))
const EstrategiaPagina = lazy(() => import('@/planejamento/paginas/EstrategiaManual'))
const Inteligencia = lazy(() => import('@/planejamento/paginas/Inteligencia'))
const Destinatarios = lazy(() => import('@/planejamento/paginas/Destinatarios'))
const Metodologia = lazy(() => import('@/planejamento/paginas/Metodologia'))

export const BASE_PT = '/planejamento-tributario'

export default function PlanejamentoTributario() {
  return (
    <TooltipProvider delayDuration={150}>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <Routes>
          <Route index element={<Indicadores />} />
          <Route path="planejamentos" element={<Planejamentos />} />
          <Route path="planejamento/:id" element={<PlanejamentoPagina />} />
          <Route path="planejamento/:id/:aba" element={<PlanejamentoPagina />} />
          <Route path="estrategias" element={<Estrategias />} />
          <Route path="estrategias/:numero" element={<EstrategiaPagina />} />
          <Route path="inteligencia" element={<Inteligencia />} />
          <Route path="destinatarios" element={<Destinatarios />} />
          <Route path="metodologia" element={<Metodologia />} />
          <Route path="*" element={<Navigate to={BASE_PT} replace />} />
        </Routes>
      </Suspense>
    </TooltipProvider>
  )
}
