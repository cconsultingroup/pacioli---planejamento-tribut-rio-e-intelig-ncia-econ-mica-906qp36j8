import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { toast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export type Usuario = {
  id: string
  nome: string
  email: string
  admin: boolean
  ativo: boolean
  criado: string
}

export const ehAdmin = () => {
  const u = pb.authStore.record as { admin?: boolean } | null
  return !!u && u.admin === true
}

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())

export function useUsuariosAdmin() {
  const [lista, setLista] = useState<Usuario[]>([])
  const [carregando, setCarregando] = useState(true)
  const [form, setForm] = useState({ nome: '', email: '', senha: '', admin: false })
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [editForm, setEditForm] = useState({ nome: '', email: '' })
  const [trocandoSenha, setTrocandoSenha] = useState<Usuario | null>(null)
  const [senhaForm, setSenhaForm] = useState({ nova: '', confirmar: '' })
  const [minhaSenha, setMinhaSenha] = useState({ atual: '', nova: '', confirmar: '' })
  const [ocupado, setOcupado] = useState(false)

  const carregar = async () => {
    setCarregando(true)
    try {
      const r = await pb.send('/backend/v1/pt/usuarios', { method: 'GET' })
      const d = r as { usuarios?: Usuario[] }
      setLista(Array.isArray(r) ? r : (d.usuarios ?? []))
    } catch (e) {
      toast({
        title: 'Não foi possível carregar os usuários',
        description: getErrorMessage(e),
        variant: 'destructive',
      })
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    void carregar()
  }, [])

  const criar = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!form.nome.trim()) return toast({ title: 'Informe o nome.', variant: 'destructive' })
    if (!emailOk(form.email)) return toast({ title: 'E-mail inválido.', variant: 'destructive' })
    if (form.senha.length < 8)
      return toast({
        title: 'A senha precisa ter pelo menos 8 caracteres.',
        variant: 'destructive',
      })
    setOcupado(true)
    try {
      await pb.send('/backend/v1/pt/usuarios', { method: 'POST', body: form })
      toast({ title: 'Usuário cadastrado.' })
      setForm({ nome: '', email: '', senha: '', admin: false })
      await carregar()
    } catch (e) {
      toast({ title: 'Erro ao cadastrar', description: getErrorMessage(e), variant: 'destructive' })
    } finally {
      setOcupado(false)
    }
  }

  const salvarEdicao = async () => {
    if (!editando) return
    if (!editForm.nome.trim()) return toast({ title: 'Informe o nome.', variant: 'destructive' })
    if (!emailOk(editForm.email))
      return toast({ title: 'E-mail inválido.', variant: 'destructive' })
    setOcupado(true)
    try {
      await pb.send(`/backend/v1/pt/usuarios/${editando.id}`, {
        method: 'PATCH',
        body: editForm,
      })
      toast({ title: 'Usuário atualizado.' })
      setEditando(null)
      await carregar()
    } catch (e) {
      toast({ title: 'Erro ao salvar', description: getErrorMessage(e), variant: 'destructive' })
    } finally {
      setOcupado(false)
    }
  }

  const alternarAtivo = async (u: Usuario) => {
    try {
      await pb.send(`/backend/v1/pt/usuarios/${u.id}`, {
        method: 'PATCH',
        body: { ativo: !u.ativo },
      })
      await carregar()
    } catch (e) {
      toast({ title: 'Erro', description: getErrorMessage(e), variant: 'destructive' })
    }
  }

  const alternarAdmin = async (u: Usuario) => {
    try {
      await pb.send(`/backend/v1/pt/usuarios/${u.id}`, {
        method: 'PATCH',
        body: { admin: !u.admin },
      })
      await carregar()
    } catch (e) {
      toast({ title: 'Erro', description: getErrorMessage(e), variant: 'destructive' })
    }
  }

  const excluir = async (u: Usuario) => {
    if (!confirm(`Excluir o usuário ${u.nome}? Esta ação não tem volta.`)) return
    try {
      await pb.send(`/backend/v1/pt/usuarios/${u.id}`, { method: 'DELETE' })
      toast({ title: 'Usuário excluído.' })
      await carregar()
    } catch (e) {
      toast({ title: 'Erro ao excluir', description: getErrorMessage(e), variant: 'destructive' })
    }
  }

  const salvarSenha = async () => {
    if (!trocandoSenha) return
    if (senhaForm.nova.length < 8)
      return toast({
        title: 'A nova senha precisa ter pelo menos 8 caracteres.',
        variant: 'destructive',
      })
    if (senhaForm.nova !== senhaForm.confirmar)
      return toast({ title: 'As senhas não conferem.', variant: 'destructive' })
    setOcupado(true)
    try {
      await pb.send(`/backend/v1/pt/usuarios/${trocandoSenha.id}/senha`, {
        method: 'POST',
        body: { senha: senhaForm.nova },
      })
      toast({ title: `Senha de ${trocandoSenha.nome} alterada.` })
      setTrocandoSenha(null)
      setSenhaForm({ nova: '', confirmar: '' })
    } catch (e) {
      toast({
        title: 'Erro ao alterar a senha',
        description: getErrorMessage(e),
        variant: 'destructive',
      })
    } finally {
      setOcupado(false)
    }
  }

  const salvarMinhaSenha = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (minhaSenha.nova.length < 8)
      return toast({
        title: 'A nova senha precisa ter pelo menos 8 caracteres.',
        variant: 'destructive',
      })
    if (minhaSenha.nova !== minhaSenha.confirmar)
      return toast({ title: 'As senhas não conferem.', variant: 'destructive' })
    setOcupado(true)
    try {
      await pb.send('/backend/v1/minha-senha', {
        method: 'POST',
        body: { atual: minhaSenha.atual, nova: minhaSenha.nova },
      })
      toast({ title: 'Sua senha foi alterada.' })
      setMinhaSenha({ atual: '', nova: '', confirmar: '' })
    } catch (e) {
      toast({
        title: 'Erro ao alterar a sua senha',
        description: getErrorMessage(e),
        variant: 'destructive',
      })
    } finally {
      setOcupado(false)
    }
  }

  return {
    lista,
    carregando,
    form,
    editando,
    editForm,
    trocandoSenha,
    senhaForm,
    minhaSenha,
    ocupado,
    setForm,
    setEditando,
    setEditForm,
    setTrocandoSenha,
    setSenhaForm,
    setMinhaSenha,
    carregar,
    criar,
    salvarEdicao,
    alternarAtivo,
    alternarAdmin,
    excluir,
    salvarSenha,
    salvarMinhaSenha,
  }
}
