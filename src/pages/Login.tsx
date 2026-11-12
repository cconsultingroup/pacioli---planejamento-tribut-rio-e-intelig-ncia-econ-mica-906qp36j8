/* Entrada no sistema: usuários da tabela users do PocketBase (e-mail e senha).
   Enquanto não existir nenhum usuário, a tela oferece o "primeiro acesso" para criar o seu. */
import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import logo from '@/planejamento/assets/logo-consulting.png'
import EsqueciSenhaDialog from '@/components/EsqueciSenhaDialog'

export default function Login() {
  const nav = useNavigate()
  const [busca] = useSearchParams()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [esqueciAberto, setEsqueciAberto] = useState(false)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [primeiro, setPrimeiro] = useState(false)
  const destino = busca.get('voltar') || '/planejamento-tributario'

  useEffect(() => {
    fetch(pb.buildURL('/backend/v1/pt/primeiro-acesso'))
      .then((r) => (r.ok ? r.json() : { livre: false }))
      .then((d: { livre?: boolean }) => setPrimeiro(!!d.livre))
      .catch(() => setPrimeiro(false))
  }, [])

  if (pb.authStore.isValid) return <Navigate to={destino} replace />

  async function entrar(ev: React.FormEvent) {
    ev.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      if (primeiro) {
        const r = await fetch(pb.buildURL('/backend/v1/pt/primeiro-acesso'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, email, senha }),
        })
        const d = (await r.json().catch(() => ({}))) as { erro?: string }
        if (!r.ok) throw new Error(d.erro || 'Não foi possível criar o acesso.')
      }
      await pb.collection('users').authWithPassword(email.trim().toLowerCase(), senha)
      nav(destino, { replace: true })
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      setErro(
        primeiro && msg ? msg : msg.includes('desativado') ? msg : 'E-mail ou senha inválidos.',
      )
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
            <h1 className="text-xl font-bold">
              {primeiro ? 'Primeiro acesso' : 'Acesso ao sistema'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {primeiro
                ? 'Ainda não há nenhum usuário. Crie o seu acesso: depois você cadastra a equipe em Usuários.'
                : 'Entre com seu e-mail e sua senha.'}
            </p>
          </div>
          {primeiro && (
            <label className="block space-y-1.5 text-sm font-medium">
              <span>Nome</span>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} required autoFocus />
            </label>
          )}
          <label className="block space-y-1.5 text-sm font-medium">
            <span>E-mail</span>
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus={!primeiro}
            />
          </label>
          <label className="block space-y-1.5 text-sm font-medium">
            <span>{primeiro ? 'Senha (mínimo de 8 caracteres)' : 'Senha'}</span>
            <div className="relative">
              <Input
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete={primeiro ? 'new-password' : 'current-password'}
                minLength={primeiro ? 8 : undefined}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground outline-none transition-colors hover:text-foreground"
                tabIndex={0}
              >
                {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>
          {erro && <p className="rounded-md bg-risco/10 px-3 py-2 text-sm text-risco">{erro}</p>}
          <Button type="submit" className="w-full" disabled={enviando}>
            {enviando ? 'Aguarde…' : primeiro ? 'Criar acesso e entrar' : 'Entrar'}
          </Button>
          {!primeiro && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setEsqueciAberto(true)}
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Esqueci minha senha
              </button>
            </div>
          )}
          <p className="border-t pt-2 text-center text-xs text-muted-foreground">
            Acesso exclusivo da equipe C Consulting Group
          </p>
        </form>
        {!primeiro && (
          <EsqueciSenhaDialog
            aberto={esqueciAberto}
            onAbertoChange={setEsqueciAberto}
            emailInicial={email}
          />
        )}
      </div>
    </main>
  )
}
