import { useEffect, useState } from 'react'
import { FileSpreadsheet, FileText, Printer, Send } from 'lucide-react'
import { Button } from '@/planejamento/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/planejamento/ui/card'
import { Aviso } from '@/planejamento/components/comuns'
import { listarPropostas, pedir } from '@/planejamento/lib/dados'
import { respostasObrigatorias } from '@/planejamento/lib/respostas'
import type { Estrategia, Manual, Planejamento } from '@/planejamento/lib/tipos'

function baixar(blob: Blob, nome: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = nome
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 5000)
}
const nomeArquivo = (pl: Planejamento, tipo: string, ext: string) =>
  `${tipo} - ${pl.nome.replace(/[\\/:*?"<>|]/g, '').slice(0, 60)} - ${new Date().toISOString().slice(0, 10)}.${ext}`

export function AbaRelatorios({
  pl,
  manual,
  mapa,
  salvarAntes,
}: {
  pl: Planejamento
  manual: Manual
  mapa: Map<number, Estrategia>
  salvarAntes: () => Promise<void>
}) {
  const [ocupado, setOcupado] = useState('')
  const [erro, setErro] = useState('')
  const [ok, setOk] = useState('')
  const [oportunidades, setOportunidades] = useState<string[]>([])

  useEffect(() => {
    listarPropostas()
      .then((ps) =>
        setOportunidades(
          ps
            .filter((p) => p.situacao === 'aprovada' || p.situacao === 'implantada')
            .map((p) => `${p.mes} — ${p.nome}: ${p.beneficiados}`),
        ),
      )
      .catch(() => setOportunidades([]))
  }, [])

  async function executar(rotulo: string, f: () => Promise<void>) {
    setOcupado(rotulo)
    setErro('')
    setOk('')
    try {
      await f()
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setOcupado('')
    }
  }

  const respostas = respostasObrigatorias(pl, mapa, oportunidades)

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gerar documentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={!!ocupado}
              onClick={() =>
                executar('executivo', async () => {
                  const { abrirRelatorioExecutivo } =
                    await import('@/planejamento/lib/relatorio-executivo')
                  abrirRelatorioExecutivo(pl, mapa)
                })
              }
            >
              <Printer /> Relatório executivo (PDF)
            </Button>
            <Button
              variant="outline"
              disabled={!!ocupado}
              onClick={() =>
                executar('dossie', async () => {
                  const { gerarDossieWord } = await import('@/planejamento/lib/dossie-word')
                  baixar(
                    await gerarDossieWord(pl, manual, mapa),
                    nomeArquivo(pl, 'Dossie tecnico', 'docx'),
                  )
                })
              }
            >
              <FileText /> {ocupado === 'dossie' ? 'Gerando…' : 'Dossiê técnico (Word)'}
            </Button>
            <Button
              variant="outline"
              disabled={!!ocupado}
              onClick={() =>
                executar('planilha', async () => {
                  const { gerarPlanilha } = await import('@/planejamento/lib/planilha')
                  baixar(await gerarPlanilha(pl, mapa), nomeArquivo(pl, 'Simulacoes', 'xlsx'))
                })
              }
            >
              <FileSpreadsheet />{' '}
              {ocupado === 'planilha' ? 'Gerando…' : 'Planilha Excel (fórmulas)'}
            </Button>
            <Button
              variant="outline"
              disabled={!!ocupado}
              onClick={() =>
                executar('envio', async () => {
                  if (
                    !confirm(
                      'Enviar aos destinatários cadastrados (perfis com relatório executivo/técnico) o aviso com o link autenticado deste planejamento? O conteúdo sigiloso não vai no e-mail.',
                    )
                  )
                    return
                  await salvarAntes()
                  const r = await pedir<{ enviados: number; falhas: number; detalhe?: string }>(
                    `/backend/v1/pt/enviar-planejamento/${pl.id}`,
                    { method: 'POST', body: JSON.stringify({}) },
                  )
                  setOk(
                    `Avisos enviados: ${r.enviados}. Falhas: ${r.falhas}.${r.detalhe ? ' ' + r.detalhe : ''}`,
                  )
                })
              }
            >
              <Send /> Avisar destinatários
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            O relatório executivo abre pronto para imprimir (escolha "Salvar como PDF"): privilegia
            resultados e decisões. O dossiê técnico (fundamentos, riscos e memórias) e a planilha
            ficam com os profissionais autorizados. Por sigilo, o envio por e-mail leva só o aviso
            com o link do sistema (acesso autenticado).
          </p>
          {erro && <Aviso tom="risco">{erro}</Aviso>}
          {ok && <Aviso tom="info">{ok}</Aviso>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Respostas obrigatórias do planejamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {respostas.map((r, i) => (
            <div key={i}>
              <div className="font-semibold">
                {i + 1}. {r.pergunta}
              </div>
              <p className="text-sm text-muted-foreground">{r.resposta}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
