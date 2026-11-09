/* Main App Component - Handles routing (using react-router-dom), query client and other providers - use this file to add all routes */
import { lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Empresas from './pages/Empresas'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Usuarios from './pages/Usuarios'
import Layout from './components/Layout'

// Planejamento Tributário 2026–2033 (src/planejamento): carregado só quando aberto.
const PlanejamentoTributario = lazy(() => import('@/planejamento/Modulo'))

// ONLY IMPORT AND RENDER WORKING PAGES, NEVER ADD PLACEHOLDER COMPONENTS OR PAGES IN THIS FILE
// AVOID REMOVING ANY CONTEXT PROVIDERS FROM THIS FILE (e.g. TooltipProvider, Toaster, Sonner)

const App = () => (
  <BrowserRouter>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/planejamento-tributario" replace />} />
          <Route path="/planejamento-tributario/*" element={<PlanejamentoTributario />} />
          <Route path="/empresas" element={<Empresas />} />
          <Route path="/usuarios" element={<Usuarios />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
