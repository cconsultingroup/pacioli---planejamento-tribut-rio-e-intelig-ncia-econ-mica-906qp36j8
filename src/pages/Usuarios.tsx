import { default as Layout } from '@/components/Layout'
import { default as pb } from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { ehAdmin, useUsuariosAdmin, type Usuario } from './UsuariosAdmin'
import { Navigate } from 'react-router-dom'
import { ShieldCheck, KeyRound, Pencil, Trash2 } from 'lucide-react'

export function Usuarios() {
  const admin = ehAdmin()
  const c = useUsuariosAdmin()

  if (!admin) return <Navigate to="/empresas" replace />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
        <p className="text-sm text-muted-foreground">Gestão de acessos — administrador geral.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo usuário</CardTitle>
          <CardDescription>
            Cadastre o acesso de uma pessoa da equipe. A senha deve ter ao menos 8 caracteres.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
            onSubmit={c.criar}
          >
            <div className="space-y-1.5">
              <Label htmlFor="novo-nome">Nome</Label>
              <Input
                id="novo-nome"
                value={c.form.nome}
                onChange={(e) => c.setForm({ ...c.form, nome: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="novo-email">E-mail</Label>
              <Input
                id="novo-email"
                type="email"
                value={c.form.email}
                onChange={(e) => c.setForm({ ...c.form, email: e.target.value })}
                placeholder="pessoa@empresa.com.br"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nova-senha">Senha</Label>
              <Input
                id="nova-senha"
                type="password"
                value={c.form.senha}
                onChange={(e) => c.setForm({ ...c.form, senha: e.target.value })}
                placeholder="Mínimo de 8 caracteres"
              />
            </div>
            <Button type="submit" disabled={c.ocupado}>
              Cadastrar usuário
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuários cadastrados</CardTitle>
          <CardDescription>
            Editar, ativar/desativar, excluir e trocar a senha de qualquer acesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {c.lista.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.nome}
                    {u.id === idLogado() && (
                      <span className="ml-2 text-xs text-muted-foreground">(você)</span>
                    )}
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    {u.admin ? (
                      <Badge className="gap-1">
                        <ShieldCheck className="h-3 w-3" /> Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline">Usuário</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={u.ativo} onCheckedChange={() => void c.alternarAtivo(u)} />
                      <span className="text-sm text-muted-foreground">
                        {u.ativo ? 'Ativo' : 'Desativado'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Editar"
                        onClick={() => {
                          c.setEditForm({ nome: u.nome, email: u.email })
                          c.setEditando(u)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Trocar senha"
                        onClick={() => {
                          c.setSenhaForm({ nova: '', confirmar: '' })
                          c.setTrocandoSenha(u)
                        }}
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Excluir"
                        className="text-destructive"
                        onClick={() => void c.excluir(u)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!c.carregando && c.lista.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alterar a minha senha</CardTitle>
          <CardDescription>Informe a senha atual e a nova senha.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-3 lg:items-end" onSubmit={c.salvarMinhaSenha}>
            <div className="space-y-1.5">
              <Label htmlFor="senha-atual">Senha atual</Label>
              <Input
                id="senha-atual"
                type="password"
                value={c.minhaSenha.atual}
                onChange={(e) => c.setMinhaSenha({ ...c.minhaSenha, atual: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minha-nova">Nova senha</Label>
              <Input
                id="minha-nova"
                type="password"
                value={c.minhaSenha.nova}
                onChange={(e) => c.setMinhaSenha({ ...c.minhaSenha, nova: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minha-confirmar">Confirmar nova senha</Label>
              <Input
                id="minha-confirmar"
                type="password"
                value={c.minhaSenha.confirmar}
                onChange={(e) => c.setMinhaSenha({ ...c.minhaSenha, confirmar: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={c.ocupado} className="sm:col-span-3 lg:col-span-1">
              Alterar minha senha
            </Button>
          </form>
        </CardContent>
      </Card>
      {/* Editar usuário */}
      <Dialog open={!!c.editando} onOpenChange={(v) => !v && c.setEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuário</DialogTitle>
            <DialogDescription>Nome e e-mail de acesso.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-nome">Nome</Label>
              <Input
                id="edit-nome"
                value={c.editForm.nome}
                onChange={(e) => c.setEditForm({ ...c.editForm, nome: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-email">E-mail</Label>
              <Input
                id="edit-email"
                type="email"
                value={c.editForm.email}
                onChange={(e) => c.setEditForm({ ...c.editForm, email: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => c.setEditando(null)}>
              Cancelar
            </Button>
            <Button onClick={() => void c.salvarEdicao()} disabled={c.ocupado}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Trocar senha de um usuário */}
      <Dialog open={!!c.trocandoSenha} onOpenChange={(v) => !v && c.setTrocandoSenha(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trocar senha</DialogTitle>
            <DialogDescription>
              {c.trocandoSenha && `${c.trocandoSenha.nome} — ${c.trocandoSenha.email}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nova-senha-user">Nova senha</Label>
              <Input
                id="nova-senha-user"
                type="password"
                value={c.senhaForm.nova}
                onChange={(e) => c.setSenhaForm({ ...c.senhaForm, nova: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmar-senha-user">Confirmar nova senha</Label>
              <Input
                id="confirmar-senha-user"
                type="password"
                value={c.senhaForm.confirmar}
                onChange={(e) => c.setSenhaForm({ ...c.senhaForm, confirmar: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => c.setTrocandoSenha(null)}>
              Cancelar
            </Button>
            <Button onClick={() => void c.salvarSenha()} disabled={c.ocupado}>
              Salvar senha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Usuarios
export type { Usuario }

function idLogado() {
  return pb.authStore.record?.id ?? ''
}
