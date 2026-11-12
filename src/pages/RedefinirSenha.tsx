/* Redefinição de senha: acessada pelo link do e-mail (/redefinir-senha?token=...).
   Chama o confirmPasswordReset nativo do PocketBase e, em caso de sucesso, leva ao login. */
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import logo from '@/planejamento/assets/logo-consulting.png'

export default function RedefinirSenha() {
  const nav = useNavigate()
  const [busca] = useSearchParams()
  const token = busca.get('token') || ''
  const [nova, setNova] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  async function salvar(ev: React.FormEvent) {
    ev.preventDefault()
    setErro('')
    if (nova.length < 8) return setErro('A nova senha precisa ter pelo menos 8 caracteres.')
    if (nova !== confirmar) return setErro('As senhas não conferem.')
    setEnviando(true)
    try {
      await pb.collection('users').confirmPasswordReset(token, nova, confirmar)
      setSucesso(true)
      setTimeout(() => nav('/login', { replace: true }), 2500)
    } catch {
      setErro('Não foi possível redefinir a senha. O link pode estar inválido ou expirado.')
    } finally {
      setEnviando(false)
    }
  }

  const semToken = !token

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
        <div className="space-y-4 rounded-2xl bg-card p-6 text-card-foreground shadow-xl">
          <h1 className="text-xl font-bold">Redefinir senha</h1>

          {semToken ? (
            <div className="space-y-3">
              <p className="rounded-md bg-risco/10 px-3 py-2 text-sm text-risco">
                Link inválido. Peça um novo link de redefinição.
              </p>
              <Link to="/login" className="block text-center text-sm underline">
                Voltar ao login
              </Link>
            </div>
          ) : sucesso ? (
            <div className="space-y-3">
              <p className="rounded-md bg-muted px-3 py-2 text-sm">
                Senha redefinida com sucesso. Você será levado para o login…
              </p>
              <Link to="/login" className="block text-center text-sm underline">
                Ir para o login
              </Link>
            </div>
          ) : (
            <form onSubmit={salvar} className="space-y-4">
              <p className="text-sm text-muted-foreground">Escolha a nova senha do seu acesso.</p>
              <label className="block space-y-1.5 text-sm font-medium">
                <span>Nova senha</span>
                <Input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={nova}
                  onChange={(e) => setNova(e.target.value)}
                  required
                  autoFocus
                />
              </label>
              <label className="block space-y-1.5 text-sm font-medium">
                <span>Confirmar nova senha</span>
                <Input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  required
                />
              </label>
              {erro && (
                <p className="rounded-md bg-risco/10 px-3 py-2 text-sm text-risco">
                  {erro}{' '}
                  {erro.includes('expirado') && (
                    <Link to="/login" className="underline">
                      Pedir outro link
                    </Link>
                  )}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={enviando}>
                {enviando ? 'Aguarde…' : 'Salvar nova senha'}
              </Button>
              <Link to="/login" className="block text-center text-sm underline">
                Voltar ao login
              </Link>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
