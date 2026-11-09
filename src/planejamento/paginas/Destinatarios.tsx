import { useEffect, useState } from 'react'
import { MailCheck, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/planejamento/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/planejamento/ui/card'
import { Input } from '@/planejamento/ui/input'
import { Badge } from '@/planejamento/ui/badge'
import { Aviso, classeSelect } from '@/planejamento/components/comuns'
import {
  excluirDestinatario,
  listarDestinatarios,
  listarEnvios,
  pedir,
  salvarDestinatario,
} from '@/planejamento/lib/dados'
import type { Destinatario, Envio, TipoRelatorio } from '@/planejamento/lib/tipos'
import { TIPOS_RELATORIO } from '@/planejamento/lib/tipos'

const vazio = (grupo = ''): Destinatario => ({
  id: '',
  grupo,
  nome: '',
  email: '',
  relatorios: [],
  periodicidade: 'mensal',
  ativo: true,
})
const emailValido = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

export default function Destinatarios() {
  const [lista, setLista] = useState<Destinatario[]>([])
  const [envios, setEnvios] = useState<Envio[]>([])
  const [edit, setEdit] = useState<Destinatario | null>(null)
  const [erro, setErro] = useState('')
  const [ok, setOk] = useState('')
  const [smtp, setSmtp] = useState<{ configurado: boolean; remetente?: string } | null>(null)
  const carregar = () => {
    listarDestinatarios()
      .then(setLista)
      .catch((e) => setErro(e.message))
    listarEnvios()
      .then(setEnvios)
      .catch(() => setEnvios([]))
  }
  useEffect(() => {
    carregar()
    pedir<{ configurado: boolean; remetente?: string }>('/backend/v1/pt/email-estado')
      .then(setSmtp)
      .catch(() => setSmtp(null))
  }, [])
  const grupos = [...new Set(lista.map((d) => d.grupo))]

  async function salvar() {
    if (!edit) return
    if (!edit.grupo.trim() || !edit.nome.trim()) return setErro('Informe grupo e nome.')
    if (edit.email && !emailValido(edit.email)) return setErro('E-mail inválido.')
    if (edit.ativo && !edit.email)
      return setErro('Destinatário ativo precisa de e-mail (ou desative até cadastrar).')
    try {
      await salvarDestinatario(edit)
      setEdit(null)
      setErro('')
      carregar()
    } catch (e) {
      setErro((e as Error).message)
    }
  }
  async function testar(d: Destinatario) {
    if (!confirm(`Enviar uma mensagem de teste para ${d.email}?`)) return
    setErro('')
    setOk('')
    try {
      await pedir(`/backend/v1/pt/email-teste/${d.id}`, { method: 'POST', body: '{}' })
      setOk(`Teste enviado para ${d.email}.`)
    } catch (e) {
      setErro((e as Error).message)
    }
    carregar()
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">
            GESTÃO DE DESTINATÁRIOS — RELATÓRIOS DE INTELIGÊNCIA TRIBUTÁRIA
          </h1>
          <p className="text-sm text-muted-foreground">
            Cada destinatário recebe só os tipos de relatório permitidos para o seu perfil.
            Relatórios de clientes vão como aviso com link autenticado, nunca com o conteúdo
            sigiloso no e-mail.
          </p>
        </div>
        <Button onClick={() => setEdit(vazio())}>
          <Plus /> Destinatário
        </Button>
      </div>
      {smtp && !smtp.configurado && (
        <Aviso>
          Serviço de e-mail ainda não configurado no servidor: os disparos ficam registrados como
          falha até a configuração (SMTP do PocketBase). Cadastros e permissões já funcionam.
        </Aviso>
      )}
      {smtp?.configurado && (
        <Aviso tom="info">E-mail configurado. Remetente: {smtp.remetente}.</Aviso>
      )}
      {erro && <Aviso tom="risco">{erro}</Aviso>}
      {ok && <Aviso tom="info">{ok}</Aviso>}

      {edit && (
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle className="text-base">
              {edit.id ? 'Editar destinatário' : 'Novo destinatário'}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-medium">Grupo</span>
              <Input
                list="grupos"
                value={edit.grupo}
                onChange={(e) => setEdit({ ...edit, grupo: e.target.value })}
              />
              <datalist id="grupos">
                {grupos.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">Nome</span>
              <Input
                value={edit.nome}
                onChange={(e) => setEdit({ ...edit, nome: e.target.value })}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">E-mail</span>
              <Input
                type="email"
                value={edit.email}
                onChange={(e) => setEdit({ ...edit, email: e.target.value.trim() })}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium">Periodicidade</span>
              <select
                className={classeSelect}
                value={edit.periodicidade}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    periodicidade: e.target.value as Destinatario['periodicidade'],
                  })
                }
              >
                <option value="mensal">Mensal (inteligência adaptativa, dia 1º)</option>
                <option value="por-planejamento">A cada planejamento concluído</option>
                <option value="manual">Só envio manual</option>
              </select>
            </label>
            <div className="space-y-1 text-sm md:col-span-2">
              <span className="font-medium">Relatórios permitidos</span>
              <div className="flex flex-wrap gap-3">
                {(Object.keys(TIPOS_RELATORIO) as TipoRelatorio[]).map((t) => (
                  <label key={t} className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={edit.relatorios.includes(t)}
                      onChange={(e) =>
                        setEdit({
                          ...edit,
                          relatorios: e.target.checked
                            ? [...edit.relatorios, t]
                            : edit.relatorios.filter((x) => x !== t),
                        })
                      }
                    />{' '}
                    {TIPOS_RELATORIO[t]}
                  </label>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={edit.ativo}
                onChange={(e) => setEdit({ ...edit, ativo: e.target.checked })}
              />{' '}
              Ativo
            </label>
            <div className="flex gap-2 md:col-span-2">
              <Button onClick={salvar}>Salvar</Button>
              <Button variant="ghost" onClick={() => setEdit(null)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {grupos.map((g) => (
        <Card key={g}>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">{g}</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setEdit(vazio(g))}>
              <Plus /> Contato no grupo
            </Button>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <tbody>
                {lista
                  .filter((d) => d.grupo === g)
                  .map((d) => (
                    <tr key={d.id} className="border-t">
                      <td className="px-4 py-2 font-medium">{d.nome}</td>
                      <td className="px-4 py-2">
                        {d.email || <span className="text-aviso">[A CADASTRAR]</span>}
                      </td>
                      <td className="px-4 py-2 text-xs">
                        {d.relatorios.map((r) => TIPOS_RELATORIO[r]).join(', ') || '—'}
                      </td>
                      <td className="px-4 py-2 text-xs">{d.periodicidade}</td>
                      <td className="px-4 py-2">
                        {d.ativo ? (
                          <Badge variant="ok">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={!d.email}
                          onClick={() => testar(d)}
                        >
                          <MailCheck /> Testar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEdit(d)}>
                          Editar
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Remover"
                          onClick={async () => {
                            if (
                              confirm(
                                `Remover ${d.nome}? Para só pausar, edite e desmarque "Ativo".`,
                              )
                            ) {
                              await excluirDestinatario(d.id)
                              carregar()
                            }
                          }}
                        >
                          <Trash2 />
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico de distribuição</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Quando</th>
                <th className="px-4 py-2">Destinatário</th>
                <th className="px-4 py-2">Relatório</th>
                <th className="px-4 py-2">Assunto</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {!envios.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-muted-foreground">
                    Nenhum envio ainda.
                  </td>
                </tr>
              )}
              {envios.map((e) => (
                <tr key={e.id} className="border-b last:border-0">
                  <td className="px-4 py-2 text-xs">
                    {new Date(e.created).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-2">
                    {e.destinatario}{' '}
                    <span className="text-xs text-muted-foreground">{e.email}</span>
                  </td>
                  <td className="px-4 py-2 text-xs">{e.relatorio}</td>
                  <td className="px-4 py-2 text-xs">{e.assunto}</td>
                  <td className="px-4 py-2">
                    <Badge variant={e.status === 'falhou' ? 'risco' : 'ok'}>{e.status}</Badge>
                    {e.detalhe && <div className="text-xs text-muted-foreground">{e.detalhe}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
