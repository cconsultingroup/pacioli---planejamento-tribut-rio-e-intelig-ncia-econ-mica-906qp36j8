// Painel de leitura completa do servidor ReceitanetBX (aba do planejamento):
// cadastro, escriturações (SPED), documentos declarados, NF-e e créditos recuperáveis.
// Só leitura — não dispara importação nem consulta cobrada; erro não derruba o resto da página.
import { useEffect, useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/planejamento/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/planejamento/ui/card'
import { Aviso, brl } from '@/planejamento/components/comuns'
import { pedir } from '@/planejamento/lib/dados'
import { cnpjFmt } from '@/planejamento/lib/utils'
import type { Planejamento } from '@/planejamento/lib/tipos'

interface Escrituracao {
  id: string | number
  nome: string | null
  tipo: string
  de: string | null
  ate: string | null
  importadoEm: string | null
}

interface Resposta {
  cnpj: string
  matriz: string
  empresa: Record<string, unknown> | null
  escrituracoes: Escrituracao[]
  documentosResumo: unknown
  nfeResumo: unknown
  creditosTeses: unknown
  creditosCalculo: unknown
  avisos: string[]
  erros: { secao: string; mensagem: string }[]
}

/** Linha de rótulo: valor; esconder quando vazio. */
function Item({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(120px,auto)_1fr] gap-2 py-0.5 text-sm">
      <span className="text-muted-foreground">{rotulo}</span>
      <span>{children}</span>
    </div>
  )
}

/** Acha o primeiro número em objetos da forma {total} ou {valor}/{quantidade}. */
function numero(obj: unknown, chaves: string[]): number | null {
  if (obj == null || typeof obj !== 'object') return null
  const o = obj as Record<string, unknown>
  for (const k of chaves) {
    const v = o[k]
    if (typeof v === 'number' && isFinite(v)) return v
  }
  return null
}

/** Mostra um blob desconhecido da API de forma legível (chave: valor). */
function Blob({ dados }: { dados: unknown }) {
  if (dados == null) return null
  if (typeof dados !== 'object') return <p className="text-sm">{String(dados)}</p>
  const o = dados as Record<string, unknown>
  const chaves = Object.keys(o)
  if (!chaves.length) return <p className="text-sm text-muted-foreground">Sem dados.</p>
  return (
    <div className="space-y-0.5">
      {chaves.map((k) => {
        const v = o[k]
        if (v == null || v === '') return null
        const n = typeof v === 'number' ? v : null
        return (
          <Item key={k} rotulo={k}>
            {n != null ? brl(n) : typeof v === 'object' ? JSON.stringify(v) : String(v)}
          </Item>
        )
      })}
    </div>
  )
}

export function AbaServidor({ pl }: { pl: Planejamento }) {
  const [dados, setDados] = useState<Resposta | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  const tentou = useRef(false)
  function carregar() {
    setCarregando(true)
    setErro('')
    pedir<Resposta>(`/backend/v1/pt/dados-completos/${pl.cnpj}`)
      .then(setDados)
      .catch((e) => setErro((e as Error).message))
      .finally(() => setCarregando(false))
  }
  useEffect(() => {
    if (tentou.current) return
    tentou.current = true
    carregar()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fora = erro !== ''
  const semNada =
    !fora &&
    dados != null &&
    !dados.empresa &&
    !dados.escrituracoes.length &&
    dados.documentosResumo == null &&
    dados.nfeResumo == null &&
    dados.creditosCalculo == null

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-base">
            Servidor ReceitanetBX — tudo que há registrado
          </CardTitle>
          <Button size="sm" variant="outline" onClick={carregar} disabled={carregando}>
            <RefreshCw /> {carregando ? 'Consultando…' : 'Consultar novamente'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Lê tudo que já está no servidor (cadastro, SPED, documentos declarados, NF-e e
            créditos). Não dispara nova importação nem consulta cobrada no SERPRO.
          </p>
          {carregando && !dados && <p>Consultando o servidor ReceitanetBX…</p>}
          {fora && (
            <Aviso tom="risco">
              Não foi possível consultar o servidor ReceitanetBX agora ({erro}). O restante da
              página continua funcionando normalmente; tente novamente mais tarde.
            </Aviso>
          )}
          {semNada && (
            <Aviso tom="info">
              Esta empresa não tem nada registrado no servidor ReceitanetBX ainda (nem escriturações
              SPED). Envie os arquivos pela aba de importação do servidor para que apareçam aqui.
            </Aviso>
          )}
          {dados && !semNada && (
            <>
              {dados.avisos.map((a) => (
                <Aviso key={a}>{a}</Aviso>
              ))}
              {dados.erros.length > 0 && (
                <Aviso tom="info">
                  Partes da consulta falharam:{' '}
                  {dados.erros.map((x) => `${x.secao} (${x.mensagem})`).join('; ')}. O resto foi
                  carregado.
                </Aviso>
              )}

              <div className="grid gap-4 lg:grid-cols-2">
                {dados.empresa && (
                  <div className="rounded-lg border p-3">
                    <div className="mb-1 text-sm font-semibold">Cadastro no servidor</div>
                    <Blob dados={dados.empresa} />
                  </div>
                )}
                {dados.escrituracoes.length > 0 && (
                  <div className="rounded-lg border p-3 lg:col-span-2">
                    <div className="mb-1 text-sm font-semibold">
                      Escriturações (SPED) — {dados.escrituracoes.length} arquivo(s)
                    </div>
                    <table className="w-full text-sm">
                      <thead className="text-left text-xs uppercase text-muted-foreground">
                        <tr>
                          <th className="py-1">Tipo</th>
                          <th className="py-1">Período</th>
                          <th className="py-1">Arquivo</th>
                          <th className="py-1">Importado em</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dados.escrituracoes.map((x) => (
                          <tr key={String(x.id)} className="border-t">
                            <td className="py-1.5 pr-2 font-medium">{x.tipo}</td>
                            <td className="py-1.5 pr-2">
                              {x.de ? `${x.de.slice(0, 10)} a ${x.ate?.slice(0, 10)}` : '—'}
                            </td>
                            <td className="py-1.5 pr-2 truncate">{x.nome || x.id}</td>
                            <td className="py-1.5 text-xs text-muted-foreground">
                              {x.importadoEm ? x.importadoEm.slice(0, 10) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {dados.documentosResumo != null && (
                  <div className="rounded-lg border p-3">
                    <div className="mb-1 text-sm font-semibold">Documentos declarados (EFDs)</div>
                    <Blob dados={dados.documentosResumo} />
                  </div>
                )}
                {dados.nfeResumo != null && (
                  <div className="rounded-lg border p-3">
                    <div className="mb-1 text-sm font-semibold">NF-e (resumo)</div>
                    <Blob dados={dados.nfeResumo} />
                  </div>
                )}
                {dados.creditosTeses != null && (
                  <div className="rounded-lg border p-3">
                    <div className="mb-1 text-sm font-semibold">Teses de crédito disponíveis</div>
                    <Blob dados={dados.creditosTeses} />
                  </div>
                )}
                {dados.creditosCalculo != null && (
                  <div className="rounded-lg border p-3">
                    <div className="mb-1 text-sm font-semibold">
                      Crédito recuperável (cálculo do servidor)
                    </div>
                    <Blob dados={dados.creditosCalculo} />
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
