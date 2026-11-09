import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/planejamento/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/planejamento/ui/card'
import { Input } from '@/planejamento/ui/input'
import { Aviso, Rotulo, classeSelect, cnpjFmt, dataFmt } from '@/planejamento/components/comuns'
import { SeletorCrossSell } from '@/planejamento/components/cross-sell'
import {
  atualVazio,
  criarPlanejamento,
  excluirPlanejamento,
  listarPlanejamentos,
  pedir,
  perfilVazio,
  premissasPadrao,
} from '@/planejamento/lib/dados'
import type { Planejamento } from '@/planejamento/lib/tipos'
import { STATUS_DEMANDA } from '@/planejamento/lib/tipos'

interface EmpresaServidor {
  cnpj: string
  nome: string | null
  observacao?: string | null
  situacao?: string
}

export default function Planejamentos() {
  const nav = useNavigate()
  const [lista, setLista] = useState<Planejamento[] | null>(null)
  const [erro, setErro] = useState('')
  const [novo, setNovo] = useState(false)
  const [empresas, setEmpresas] = useState<EmpresaServidor[]>([])
  const [f, setF] = useState({
    cnpj: '',
    nome: '',
    periodo: '2026–2033',
    responsavel: 'C CONT',
    crossSell: '',
  })
  const [salvando, setSalvando] = useState(false)

  const carregar = () =>
    listarPlanejamentos()
      .then(setLista)
      .catch((e) => setErro(e.message))
  useEffect(() => {
    carregar()
  }, [])
  useEffect(() => {
    if (novo && !empresas.length)
      pedir<EmpresaServidor[]>('/backend/v1/pt/empresas')
        .then(setEmpresas)
        .catch(() => setEmpresas([]))
  }, [novo, empresas.length])

  async function criar(e: React.FormEvent) {
    e.preventDefault()
    const cnpj = f.cnpj.replace(/\D/g, '')
    if (cnpj.length !== 14) return setErro('CNPJ deve ter 14 dígitos.')
    if (!f.crossSell.trim())
      return setErro('Preencha o campo Possível cross-sell (obrigatório no grupo).')
    setSalvando(true)
    setErro('')
    try {
      const p = await criarPlanejamento({
        cnpj,
        nome: f.nome.trim() || cnpj,
        periodo: f.periodo,
        responsavel: f.responsavel,
        status: 'Nova',
        crossSell: f.crossSell,
        perfil: perfilVazio(),
        atual: atualVazio(),
        premissas: premissasPadrao(),
        analises: {},
        tarefas: [],
        importado: null,
      })
      nav(`/planejamento-tributario/planejamento/${p.id}`)
    } catch (err) {
      setErro((err as Error).message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Planejamento Tributário</h1>
          <p className="text-sm text-muted-foreground">
            Um planejamento por cliente (CNPJ) e período. Nomenclatura: [STATUS] | [CLIENTE] | C
            CONT | Planejamento tributário.
          </p>
        </div>
        <Button onClick={() => setNovo((v) => !v)}>
          <Plus /> Novo planejamento
        </Button>
      </div>
      {erro && <Aviso tom="risco">{erro}</Aviso>}

      {novo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Novo planejamento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={criar} className="grid gap-4 md:grid-cols-2">
              <Rotulo
                texto="Empresa cadastrada no servidor"
                ajuda="Lista da Central (API ReceitanetBX). Ou digite o CNPJ abaixo."
              >
                <select
                  className={classeSelect}
                  value={f.cnpj}
                  onChange={(e) => {
                    const emp = empresas.find((x) => x.cnpj === e.target.value)
                    setF({ ...f, cnpj: e.target.value, nome: emp?.nome || f.nome })
                  }}
                >
                  <option value="">— escolher —</option>
                  {empresas.map((x) => (
                    <option key={x.cnpj} value={x.cnpj}>
                      {x.nome || '(sem nome)'} · {cnpjFmt(x.cnpj)}
                    </option>
                  ))}
                </select>
              </Rotulo>
              <Rotulo texto="CNPJ">
                <Input
                  value={f.cnpj}
                  onChange={(e) => setF({ ...f, cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                  required
                />
              </Rotulo>
              <Rotulo texto="Cliente (razão social)">
                <Input
                  value={f.nome}
                  onChange={(e) => setF({ ...f, nome: e.target.value })}
                  required
                />
              </Rotulo>
              <Rotulo texto="Período">
                <Input
                  value={f.periodo}
                  onChange={(e) => setF({ ...f, periodo: e.target.value })}
                />
              </Rotulo>
              <Rotulo texto="Responsável técnico">
                <Input
                  value={f.responsavel}
                  onChange={(e) => setF({ ...f, responsavel: e.target.value })}
                />
              </Rotulo>
              <div className="space-y-1 text-sm md:col-span-2">
                <span className="font-medium">Possível cross-sell (obrigatório)</span>
                <SeletorCrossSell
                  valor={f.crossSell}
                  aoMudar={(v) => setF({ ...f, crossSell: v })}
                />
                <span className="block text-xs text-muted-foreground">
                  Clique para marcar. Depois de preencher o perfil, a aba 1 mostra sugestões
                  específicas para o cliente.
                </span>
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={salvando}>
                  {salvando ? 'Criando…' : 'Criar e abrir'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">Demanda</th>
                  <th className="px-4 py-2">CNPJ</th>
                  <th className="px-4 py-2">Responsável</th>
                  <th className="px-4 py-2">Estratégias em análise</th>
                  <th className="px-4 py-2">Atualizado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {lista === null && (
                  <tr>
                    <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                      Carregando…
                    </td>
                  </tr>
                )}
                {lista?.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-muted-foreground" colSpan={6}>
                      Nenhum planejamento ainda.
                    </td>
                  </tr>
                )}
                {lista?.map((p) => {
                  const emAnalise = Object.values(p.analises).filter(
                    (a) => a.etapa !== 'identificada' && a.etapa !== 'descartada',
                  ).length
                  return (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-2">
                        <Link
                          className="font-medium text-primary hover:underline"
                          to={`/planejamento-tributario/planejamento/${p.id}`}
                        >
                          [{p.status}] | {p.nome} | C CONT | Planejamento tributário
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {p.periodo}
                          {p.crossSell ? ` · cross-sell: ${p.crossSell}` : ''}
                        </div>
                      </td>
                      <td className="px-4 py-2 tabular-nums">{cnpjFmt(p.cnpj)}</td>
                      <td className="px-4 py-2">{p.responsavel || '—'}</td>
                      <td className="px-4 py-2">{emAnalise}</td>
                      <td className="px-4 py-2">{dataFmt(p.updated)}</td>
                      <td className="px-4 py-2 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Excluir"
                          onClick={async () => {
                            if (
                              !confirm(`Excluir o planejamento de ${p.nome}? Não há como desfazer.`)
                            )
                              return
                            await excluirPlanejamento(p.id)
                            carregar()
                          }}
                        >
                          <Trash2 />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">Status válidos: {STATUS_DEMANDA.join(' · ')}.</p>
    </div>
  )
}
