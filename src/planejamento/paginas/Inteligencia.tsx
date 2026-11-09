import { useEffect, useState } from 'react'
import { Plus, Printer, Send, Trash2 } from 'lucide-react'
import { Button } from '@/planejamento/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/planejamento/ui/card'
import { Input } from '@/planejamento/ui/input'
import { Badge } from '@/planejamento/ui/badge'
import {
  Aviso,
  Rotulo,
  classeSelect,
  classeTexto,
  useManual,
} from '@/planejamento/components/comuns'
import {
  excluirProposta,
  incorporarEstrategia,
  listarPropostas,
  pedir,
  recarregarManual,
  salvarProposta,
} from '@/planejamento/lib/dados'
import type { Estrategia, Proposta } from '@/planejamento/lib/tipos'

const mesAtual = () => new Date().toISOString().slice(0, 7)
const nomeMes = (m: string) => {
  const [a, mm] = m.split('-')
  return `${['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'][Number(mm) - 1]}/${a}`
}
const nova = (mes: string): Proposta => ({
  id: '',
  mes,
  nome: '',
  novidade: '',
  fonte: '',
  beneficiados: '',
  exemploCalculo: '',
  risco: 'medio',
  alteracoesIA: '',
  recomendacao: 'aprofundar',
  estrategiaRelacionada: null,
  aprovacoes: { controladoria: '', juridico: '', desenvolvimento: '' },
  situacao: 'proposta',
  testes: '',
})
const SIT: Record<Proposta['situacao'], string> = {
  proposta: 'Proposta',
  'em-validacao': 'Em validação',
  aprovada: 'Aprovada',
  rejeitada: 'Rejeitada',
  implantada: 'Implantada na base',
}
const esc = (s: unknown) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

export function montarRelatorioMensal(mes: string, lista: Proposta[]) {
  const itens = lista.filter((p) => p.mes === mes)
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Novas oportunidades ${mes}</title><style>
  body{font-family:"IBM Plex Sans",Arial,sans-serif;color:#132420;font-size:12px;line-height:1.5;margin:0} @page{size:A4;margin:14mm}
  h1{font-size:18px;color:#0b4f4a} h2{font-size:14px;margin:18px 0 6px;border-bottom:2px solid #d5dfdb} td{padding:4px 6px;border-bottom:1px solid #e3e8e6;vertical-align:top} td:first-child{width:200px;font-weight:600}
  table{width:100%;border-collapse:collapse}</style></head><body>
  <h1>NOVAS OPORTUNIDADES DE PLANEJAMENTO TRIBUTÁRIO — ${nomeMes(mes)}</h1>
  <p>C Consulting Group · C CONT Contabilidade Estratégica · inteligência adaptativa supervisionada. Nenhuma estratégia entra na base de cálculo sem aprovação técnica e testes.</p>
  ${
    itens.length
      ? itens
          .map(
            (p, i) => `<h2>${i + 1}. ${esc(p.nome)}</h2><table>
    <tr><td>O que há de novo</td><td>${esc(p.novidade)}</td></tr><tr><td>Fonte e fundamento</td><td>${esc(p.fonte)}</td></tr>
    <tr><td>Empresas e regimes beneficiados</td><td>${esc(p.beneficiados)}</td></tr><tr><td>Exemplo de cálculo</td><td>${esc(p.exemploCalculo)}</td></tr>
    <tr><td>Grau de risco</td><td>${esc(p.risco)}</td></tr><tr><td>Alterações na IA</td><td>${esc(p.alteracoesIA)}</td></tr>
    <tr><td>Recomendação</td><td>${esc(p.recomendacao)}</td></tr>
    <tr><td>Aprovações</td><td>Controladoria: ${esc(p.aprovacoes.controladoria || 'pendente')} · Jurídico: ${esc(p.aprovacoes.juridico || 'pendente')} · Desenvolvimento: ${esc(p.aprovacoes.desenvolvimento || 'pendente')}</td></tr>
    <tr><td>Situação de implantação</td><td>${esc(SIT[p.situacao])}${p.testes ? ' · testes: ' + esc(p.testes) : ''}</td></tr></table>`,
          )
          .join('')
      : '<p><b>Não foram encontradas novidades relevantes neste mês.</b> Conclusão registrada pela inteligência adaptativa.</p>'
  }
  <p style="font-size:9px;color:#6b7a76;margin-top:16px">Fontes oficiais e verificáveis prevalecem; IBET, universidades e publicações técnicas servem para levantar hipóteses a confirmar.</p></body></html>`
}

export default function Inteligencia() {
  const { manual } = useManual()
  const [lista, setLista] = useState<Proposta[]>([])
  const [mes, setMes] = useState(mesAtual())
  const [edit, setEdit] = useState<Proposta | null>(null)
  const [erro, setErro] = useState('')
  const [ok, setOk] = useState('')
  const carregar = () =>
    listarPropostas()
      .then(setLista)
      .catch((e) => setErro(e.message))
  useEffect(() => {
    carregar()
  }, [])

  const doMes = lista.filter((p) => p.mes === mes)
  const meses = [...new Set([mesAtual(), ...lista.map((p) => p.mes)])].sort().reverse()

  async function salvar() {
    if (!edit) return
    if (!edit.nome.trim()) return setErro('Dê um nome à proposta.')
    try {
      await salvarProposta(edit)
      setEdit(null)
      setErro('')
      carregar()
    } catch (e) {
      setErro((e as Error).message)
    }
  }
  async function incorporar(p: Proposta) {
    if (!manual) return
    if (!p.aprovacoes.controladoria || !p.aprovacoes.juridico)
      return setErro('Incorporação exige aprovação da Controladoria e do Jurídico.')
    if (!p.testes.trim()) return setErro('Registre os testes realizados antes de incorporar.')
    if (
      !confirm(
        `Incorporar "${p.nome}" à base de estratégias? Ela passará a aparecer na triagem de todos os planejamentos (como "condicionada").`,
      )
    )
      return
    const numero = Math.max(...manual.estrategias.map((e) => e.numero)) + 1
    const e: Estrategia = {
      numero,
      codigo: String(numero).padStart(3, '0'),
      titulo: p.nome,
      bloco: null,
      risco: p.risco === 'baixo' ? 'baixo' : p.risco === 'medio' ? 'medio' : 'alto',
      riscoTexto: `Risco ${p.risco} (inteligência adaptativa ${p.mes})`,
      modelo: 'INTELIGÊNCIA',
      mecanismo: [p.novidade],
      baseLegal: [p.fonte],
      evidencias: '',
      contraprova: '',
      bloqueio: '',
      memoria: {
        aviso: '',
        linhas: [],
        economiaIlustrativa: null,
        materialidade: '',
        formula: p.exemploCalculo,
      },
      fluxo: [],
      pontoControle: '',
      lancamentos: [],
      declaracoes: [],
      alerta: '',
      riscoExtrapolacao: '',
      mitigacao: '',
      matrizAnual: [],
      matrizNota: '',
      roteiro: [p.alteracoesIA].filter(Boolean),
      handoff: '',
      parecerConclusao: '',
      fontes: [],
      fontesTexto: p.fonte,
      origem: 'inteligencia',
    }
    try {
      await incorporarEstrategia(e)
      await salvarProposta({ ...p, situacao: 'implantada' })
      await recarregarManual()
      setOk(`Estratégia ${e.codigo} incorporada à base.`)
      carregar()
    } catch (err) {
      setErro((err as Error).message)
    }
  }
  function imprimir() {
    const w = window.open('', '_blank')
    if (!w) return setErro('Permita pop-ups para gerar o relatório.')
    w.document.write(montarRelatorioMensal(mes, lista))
    w.document.close()
    setTimeout(() => w.print(), 300)
  }
  async function enviar() {
    if (
      !confirm(
        `Enviar o relatório "Novas oportunidades — ${nomeMes(mes)}" aos destinatários com perfil de inteligência adaptativa?`,
      )
    )
      return
    try {
      const r = await pedir<{ enviados: number; falhas: number; detalhe?: string }>(
        `/backend/v1/pt/enviar-inteligencia/${mes}`,
        { method: 'POST', body: JSON.stringify({ html: montarRelatorioMensal(mes, lista) }) },
      )
      setOk(`Enviados: ${r.enviados}. Falhas: ${r.falhas}.${r.detalhe ? ' ' + r.detalhe : ''}`)
    } catch (e) {
      setErro((e as Error).message)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Inteligência adaptativa mensal</h1>
          <p className="text-sm text-muted-foreground">
            Novidades legislativas, regulamentares e jurisprudenciais → propostas → validação
            (Controladoria e Jurídico) → testes → Desenvolvimento → base de estratégias.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className={classeSelect + ' w-auto'}
            value={mes}
            onChange={(e) => setMes(e.target.value)}
          >
            {meses.map((m) => (
              <option key={m} value={m}>
                {nomeMes(m)}
              </option>
            ))}
          </select>
          <Button variant="outline" onClick={imprimir}>
            <Printer /> Relatório do mês
          </Button>
          <Button variant="outline" onClick={enviar}>
            <Send /> Enviar
          </Button>
          <Button onClick={() => setEdit(nova(mes))}>
            <Plus /> Nova proposta
          </Button>
        </div>
      </div>
      {erro && <Aviso tom="risco">{erro}</Aviso>}
      {ok && <Aviso tom="info">{ok}</Aviso>}
      <Aviso tom="info">
        Nenhuma proposta altera os cálculos em produção automaticamente: a incorporação só é
        liberada com aprovação da Controladoria e do Jurídico e com testes registrados. Se o mês não
        tiver novidades, o relatório registra essa conclusão.
      </Aviso>

      {edit && (
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle className="text-base">
              {edit.id ? 'Editar proposta' : 'Nova proposta'} · {nomeMes(edit.mes)}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <Rotulo texto="Nome da estratégia ou melhoria">
              <Input
                value={edit.nome}
                onChange={(e) => setEdit({ ...edit, nome: e.target.value })}
              />
            </Rotulo>
            <Rotulo texto="Estratégia relacionada (nº, se for melhoria)">
              <Input
                value={edit.estrategiaRelacionada ?? ''}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    estrategiaRelacionada: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </Rotulo>
            <Rotulo texto="O que há de novo">
              <textarea
                className={classeTexto}
                rows={3}
                value={edit.novidade}
                onChange={(e) => setEdit({ ...edit, novidade: e.target.value })}
              />
            </Rotulo>
            <Rotulo texto="Fonte e fundamento (oficial e verificável)">
              <textarea
                className={classeTexto}
                rows={3}
                value={edit.fonte}
                onChange={(e) => setEdit({ ...edit, fonte: e.target.value })}
              />
            </Rotulo>
            <Rotulo texto="Empresas e regimes potencialmente beneficiados">
              <textarea
                className={classeTexto}
                rows={2}
                value={edit.beneficiados}
                onChange={(e) => setEdit({ ...edit, beneficiados: e.target.value })}
              />
            </Rotulo>
            <Rotulo texto="Exemplo de cálculo da economia">
              <textarea
                className={classeTexto}
                rows={2}
                value={edit.exemploCalculo}
                onChange={(e) => setEdit({ ...edit, exemploCalculo: e.target.value })}
              />
            </Rotulo>
            <Rotulo texto="Alterações necessárias na IA / no sistema">
              <textarea
                className={classeTexto}
                rows={2}
                value={edit.alteracoesIA}
                onChange={(e) => setEdit({ ...edit, alteracoesIA: e.target.value })}
              />
            </Rotulo>
            <Rotulo texto="Testes realizados">
              <textarea
                className={classeTexto}
                rows={2}
                value={edit.testes}
                onChange={(e) => setEdit({ ...edit, testes: e.target.value })}
              />
            </Rotulo>
            <div className="grid grid-cols-3 gap-2 md:col-span-2">
              <Rotulo texto="Grau de risco">
                <select
                  className={classeSelect}
                  value={edit.risco}
                  onChange={(e) => setEdit({ ...edit, risco: e.target.value as Proposta['risco'] })}
                >
                  <option value="baixo">Baixo</option>
                  <option value="medio">Médio</option>
                  <option value="alto">Alto</option>
                  <option value="critico">Crítico</option>
                </select>
              </Rotulo>
              <Rotulo texto="Recomendação">
                <select
                  className={classeSelect}
                  value={edit.recomendacao}
                  onChange={(e) =>
                    setEdit({ ...edit, recomendacao: e.target.value as Proposta['recomendacao'] })
                  }
                >
                  <option value="incorporar">Incorporar</option>
                  <option value="aprofundar">Aprofundar</option>
                  <option value="revisar">Revisar</option>
                  <option value="rejeitar">Rejeitar</option>
                </select>
              </Rotulo>
              <Rotulo texto="Situação">
                <select
                  className={classeSelect}
                  value={edit.situacao}
                  onChange={(e) =>
                    setEdit({ ...edit, situacao: e.target.value as Proposta['situacao'] })
                  }
                >
                  {Object.entries(SIT)
                    .filter(([k]) => k !== 'implantada')
                    .map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                </select>
              </Rotulo>
            </div>
            <div className="grid grid-cols-1 gap-2 md:col-span-2 md:grid-cols-3">
              <Rotulo texto="Aprovação Controladoria (nome e data)">
                <Input
                  value={edit.aprovacoes.controladoria}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      aprovacoes: { ...edit.aprovacoes, controladoria: e.target.value },
                    })
                  }
                />
              </Rotulo>
              <Rotulo texto="Aprovação Jurídico (nome e data)">
                <Input
                  value={edit.aprovacoes.juridico}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      aprovacoes: { ...edit.aprovacoes, juridico: e.target.value },
                    })
                  }
                />
              </Rotulo>
              <Rotulo texto="Desenvolvimento (recebido em)">
                <Input
                  value={edit.aprovacoes.desenvolvimento}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      aprovacoes: { ...edit.aprovacoes, desenvolvimento: e.target.value },
                    })
                  }
                />
              </Rotulo>
            </div>
            <div className="flex gap-2 md:col-span-2">
              <Button onClick={salvar}>Salvar</Button>
              <Button variant="ghost" onClick={() => setEdit(null)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {!doMes.length && (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              Nenhuma proposta em {nomeMes(mes)}. Se a pesquisa do mês não encontrar novidades, o
              relatório mensal registra essa conclusão.
            </CardContent>
          </Card>
        )}
        {doMes.map((p) => (
          <Card key={p.id}>
            <CardContent className="space-y-2 pt-5 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{p.nome}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.estrategiaRelacionada
                      ? `Melhoria da estratégia ${String(p.estrategiaRelacionada).padStart(3, '0')} · `
                      : ''}
                    Risco {p.risco} · recomendação: {p.recomendacao}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      p.situacao === 'aprovada' || p.situacao === 'implantada'
                        ? 'ok'
                        : p.situacao === 'rejeitada'
                          ? 'risco'
                          : 'aviso'
                    }
                  >
                    {SIT[p.situacao]}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => setEdit(p)}>
                    Editar
                  </Button>
                  {p.situacao === 'aprovada' && !p.estrategiaRelacionada && (
                    <Button size="sm" onClick={() => incorporar(p)}>
                      Incorporar à base
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Excluir"
                    onClick={async () => {
                      if (confirm('Excluir esta proposta?')) {
                        await excluirProposta(p.id)
                        carregar()
                      }
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
              <p>{p.novidade}</p>
              <p className="text-xs text-muted-foreground">
                <b>Fonte:</b> {p.fonte} · <b>Beneficiados:</b> {p.beneficiados}
              </p>
              <p className="text-xs text-muted-foreground">
                Controladoria: {p.aprovacoes.controladoria || 'pendente'} · Jurídico:{' '}
                {p.aprovacoes.juridico || 'pendente'} · Desenvolvimento:{' '}
                {p.aprovacoes.desenvolvimento || 'pendente'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
