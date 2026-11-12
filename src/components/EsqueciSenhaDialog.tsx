/* Diálogo "Esqueci minha senha" da tela de login: pede o e-mail e dispara o e-mail nativo de redefinição do PocketBase.
   A resposta é sempre neutra (não revela se a conta existe). */
import { useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function EsqueciSenhaDialog({
  aberto,
  onAbertoChange,
  emailInicial,
}: {
  aberto: boolean
  onAbertoChange: (aberto: boolean) => void
  emailInicial: string
}) {
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  function mudarAberto(v: boolean) {
    onAbertoChange(v)
    if (v) {
      setEmail(emailInicial)
      setEnviado(false)
    }
  }

  async function enviar(ev: React.FormEvent) {
    ev.preventDefault()
    setEnviando(true)
    try {
      await pb.collection('users').requestPasswordReset(email.trim().toLowerCase())
    } catch {
      // Resposta neutra sempre: não revelar se o e-mail existe nem falhas de envio ao usuário.
    } finally {
      setEnviando(false)
      setEnviado(true)
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={mudarAberto}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Esqueci minha senha</DialogTitle>
          <DialogDescription>
            Informe o e-mail cadastrado. Enviaremos um link para você criar uma nova senha.
          </DialogDescription>
        </DialogHeader>
        {enviado ? (
          <div className="space-y-4">
            <p className="rounded-md bg-muted px-3 py-2 text-sm">
              Se este e-mail estiver cadastrado, você receberá um link para redefinir a senha.
              Verifique também a caixa de spam.
            </p>
            <DialogFooter>
              <Button type="button" onClick={() => onAbertoChange(false)}>
                Voltar ao login
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={enviar} className="space-y-4">
            <label className="block space-y-1.5 text-sm font-medium">
              <span>E-mail cadastrado</span>
              <Input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </label>
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={enviando}>
                {enviando ? 'Enviando…' : 'Enviar link de redefinição'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
