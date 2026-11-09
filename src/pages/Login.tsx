/* Entrada no sistema: usuários da tabela users do PocketBase (e-mail e senha). */
import { useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import logo from '@/planejamento/assets/logo-consulting.png'

export default function Login() {
  const nav = useNavigate()
  const [busca] = useSearchParams()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const destino = busca.get('voltar') || '/planejamento-tributario'
  if (pb.authStore.isValid) return <Navigate to={destino} replace />

  async function entrar(ev: React.FormEvent) {
    ev.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await pb.collection('users').authWithPassword(email.trim(), senha)
      nav(destino, { replace: true })
    } catch {
      setErro('E-mail ou senha inválidos.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[hsl(var(--lateral))] p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <img
            src={logo}
            alt="C Consulting Group"
            className="h-12 w-auto max-w-[280px] object-contain drop-shadow"
          />
          <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[hsl(var(--lateral-texto))]">
            Pacioli · Planejamento Tributário e Inteligência Econômica
          </div>
        </div>
        <form
          onSubmit={entrar}
          className="space-y-4 rounded-2xl bg-card p-6 text-card-foreground shadow-xl"
        >
          <div>
            <h1 className="text-xl font-bold">Acesso ao sistema</h1>
            <p className="text-sm text-muted-foreground">Entre com seu e-mail e sua senha.</p>
          </div>
          <label className="block space-y-1.5 text-sm font-medium">
            <span>E-mail</span>
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </label>
          <label className="block space-y-1.5 text-sm font-medium">
            <span>Senha</span>
            <Input
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </label>
          {erro && <p className="rounded-md bg-risco/10 px-3 py-2 text-sm text-risco">{erro}</p>}
          <Button type="submit" className="w-full" disabled={enviando}>
            {enviando ? 'Entrando…' : 'Entrar'}
          </Button>
          <p className="border-t pt-2 text-center text-xs text-muted-foreground">
            Acesso exclusivo da equipe C Consulting Group
          </p>
        </form>
      </div>
    </main>
  )
}
