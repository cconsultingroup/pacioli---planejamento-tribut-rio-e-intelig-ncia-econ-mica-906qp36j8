/* Usuários do sistema: lista e cadastro de novos acessos (só quem está logado). */
import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Usuario {
  id: string
  nome: string
  email: string
  criado: string
}

async function pedir<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(pb.buildURL(url), {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: pb.authStore.token },
  })
  const d = (await r.json().catch(() => ({}))) as T & { erro?: string; message?: string }
  if (!r.ok) throw new Error(d.erro || d.message || 'Falha na operação.')
  return d
}

export default function Usuarios() {
  const [lista, setLista] = useState<Usuario[] | null>(null)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [ok, setOk] = useState('')
  const [enviando, setEnviando] = useState(false)

  const carregar = () =>
    pedir<Usuario[]>('/backend/v1/pt/usuarios')
      .then(setLista)
      .catch((e: Error) => setErro(e.message))
  useEffect(() => {
    carregar()
  }, [])

  async function criar(ev: React.FormEvent) {
    ev.preventDefault()
    setErro('')
    setOk('')
    setEnviando(true)
    try {
      await pedir('/backend/v1/pt/usuarios', {
        method: 'POST',
        body: JSON.stringify({ nome, email, senha }),
      })
      setOk(`Acesso criado para ${email}. Passe a senha à pessoa por um canal seguro.`)
      setNome('')
      setEmail('')
      setSenha('')
      carregar()
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Usuários</h1>
        <p className="text-sm text-muted-foreground">
          Quem pode acessar o sistema de planejamento tributário.
        </p>
      </div>

      <form
        onSubmit={criar}
        className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-4 sm:items-end"
      >
        <label className="space-y-1.5 text-sm font-medium">
          <span>Nome</span>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} required />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          <span>E-mail</span>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          <span>Senha inicial (mín. 8)</span>
          <Input
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </label>
        <Button type="submit" disabled={enviando}>
          {enviando ? 'Criando…' : 'Criar acesso'}
        </Button>
      </form>
      {erro && <p className="rounded-md bg-risco/10 px-3 py-2 text-sm text-risco">{erro}</p>}
      {ok && <p className="rounded-md bg-ok/10 px-3 py-2 text-sm text-ok">{ok}</p>}

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">E-mail</th>
              <th className="px-4 py-2">Desde</th>
            </tr>
          </thead>
          <tbody>
            {(lista || []).map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="px-4 py-2">{u.nome || '—'}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">
                  {u.criado ? new Date(u.criado.replace(' ', 'T')).toLocaleDateString('pt-BR') : ''}
                </td>
              </tr>
            ))}
            {lista && !lista.length && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-muted-foreground">
                  Nenhum usuário.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
