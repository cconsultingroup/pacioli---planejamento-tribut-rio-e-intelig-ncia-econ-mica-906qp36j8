import { useEffect, useMemo, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { lerCsv, lerXlsx } from '@/lib/xlsx-lite'
import { cnpjFmt, linhasParaTexto, type Previa } from '@/lib/importar-empresas'

type Empresa = {
  id: string
  cnpj: string
  nome: string
  situacao: string
  regime_tributacao?: string
  procuracao: string
  procuracao_validade: string
  vendedor_responsavel?: string
  cadastrado_em?: string
  observacao?: string
  created: string
}

const ROTULO_PROCURACAO: Record<string, string> = { sim: 'Tem', nao: 'Não tem' }
const ROTULO_REGIME: Record<string, string> = {
  simples_nacional: 'Simples Nacional',
  lucro_presumido: 'Lucro Presumido',
  lucro_real: 'Lucro Real',
  nao_informado: 'Não informado',
}

const OPCOES_PROCURACAO = [
  ['sim', 'Com procuração'],
  ['nao', 'Sem procuração'],
  ['', 'Não informar (mantém como está)'],
] as const

export default function Empresas() {
  const [lista, setLista] = useState<Empresa[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [erro, setErro] = useState('')
  const [painel, setPainel] = useState(false)
  const [previa, setPrevia] = useState<Previa | null>(null)
  const [nomeArquivo, setNomeArquivo] = useState('')
  // procuracao: 'sim' = marcar todas como com procuração, 'nao' = sem procuração, '' = não informar
  // Nenhum campo é obrigatório: o padrão é não informar nada.
  const [procuracao, setProcuracao] = useState<'' | 'sim' | 'nao'>('')
  const [validade, setValidade] = useState('')
  const [situacao, setSituacao] = useState('ativa')
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState('')

  const carregar = async () => {
    setCarregando(true)
    try {
      setLista(await pb.collection('empresas').getFullList<Empresa>({ sort: 'nome' }))
      setErro('')
    } catch {
      setErro('Não foi possível carregar as empresas.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    void carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const escolherArquivo = async (f: File | null) => {
    setPrevia(null)
    setResultado('')
    setErro('')
    if (!f) return
    setNomeArquivo(f.name)
    try {
      const linhas = /\.xlsx$/i.test(f.name) ? await lerXlsx(f) : await lerCsv(f)
      setPrevia(linhasParaTexto(linhas))
    } catch (e) {
      setErro(
        'Não consegui ler o arquivo: ' + (e instanceof Error ? e.message : 'formato inválido'),
      )
    }
  }

  const importar = async () => {
    setEnviando(true)
    setResultado('')
    setErro('')
    try {
      const r = await pb.send<{
        novas: number
        atualizadas: number
        invalidas: { linha: number; conteudo: string; erro?: string }[]
      }>('/backend/v1/empresas/importar', {
        method: 'POST',
        body: {
          itens: previa?.itens ?? [],
          texto: previa?.texto ?? '',
          situacao,
          procuracao: procuracao === '' ? null : procuracao,
          procuracao_validade: validade || null,
        },
      })
      setResultado(
        `${r.novas} nova(s), ${r.atualizadas} atualizada(s)` +
          (r.invalidas.length ? `, ${r.invalidas.length} linha(s) inválida(s)` : '') +
          '.',
      )
      setPrevia(null)
      setNomeArquivo('')
      await carregar()
    } catch (e) {
      const msg = (e as { response?: { erro?: string } }).response?.erro
      setErro(msg ?? 'Falha na importação.')
    } finally {
      setEnviando(false)
    }
  }

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return lista
    const digitos = q.replace(/\D/g, '')
    return lista.filter(
      (e) => e.nome.toLowerCase().includes(q) || (digitos !== '' && e.cnpj.includes(digitos)),
    )
  }, [lista, busca])

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Cadastro de empresas</h1>
          <p className="text-sm text-muted-foreground">{lista.length} empresa(s) cadastrada(s)</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setPainel((p) => !p)}>
            {painel ? 'Fechar importação' : 'Importar planilha'}
          </Button>
        </div>
      </div>

      {painel && (
        <section className="space-y-4 rounded-lg border border-primary/40 p-4">
          <div>
            <h2 className="font-medium">Importar lista de empresas</h2>
            <p className="text-sm text-muted-foreground">
              Envie uma planilha Excel (.xlsx) ou CSV com as colunas <code>CNPJ</code>,{' '}
              <code>Nome</code> e <code>Situação</code> (nenhum campo é obrigatório). Quem já está
              no cadastro é atualizado, sem apagar o que já havia. Escolha abaixo se todas as
              empresas importadas ficam com ou sem procuração (opcional).
            </p>
          </div>
          <input
            type="file"
            accept=".xlsx,.csv,.txt"
            aria-label="Planilha de empresas (opcional)"
            onChange={(e) => void escolherArquivo(e.target.files?.[0] ?? null)}
            className="block text-sm"
          />
          {previa && (
            <p className="text-sm">
              <strong>{nomeArquivo}</strong>: {previa.validas} empresa(s) encontrada(s)
              {previa.ignoradas ? `, ${previa.ignoradas} linha(s) em branco (ignorada(s))` : ''}.
            </p>
          )}
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">
              Procuração — aplicar a todas as empresas importadas
            </legend>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {OPCOES_PROCURACAO.map(([valor, rotulo]) => (
                <label key={valor || 'vazio'} className="flex cursor-pointer items-center gap-1.5">
                  <input
                    type="radio"
                    name="procuracao-importacao"
                    value={valor}
                    checked={procuracao === valor}
                    onChange={() => setProcuracao(valor)}
                    className="accent-primary"
                  />
                  {rotulo}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-wrap items-end gap-3">
            <label className="space-y-1 text-sm font-medium">
              <span>Validade da procuração (opcional)</span>
              <input
                type="date"
                className="block w-40 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={validade}
                onChange={(e) => setValidade(e.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm font-medium">
              <span>Situação padrão (opcional)</span>
              <select
                className="block w-40 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={situacao}
                onChange={(e) => setSituacao(e.target.value)}
              >
                <option value="">Não informar</option>
                <option value="ativa">ATIVA</option>
                <option value="inativa">INATIVA</option>
              </select>
            </label>
            <Button disabled={enviando} onClick={() => void importar()}>
              {enviando
                ? 'Importando…'
                : `Importar${previa && previa.validas ? ` ${previa.validas}` : ''} empresa(s)`}
            </Button>
          </div>
        </section>
      )}

      {resultado && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">{resultado}</p>
      )}
      {erro && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}

      <input
        type="search"
        placeholder="Buscar nome ou CNPJ"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />

      {carregando ? (
        <p className="text-sm text-muted-foreground">Carregando empresas…</p>
      ) : filtradas.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {lista.length === 0
            ? 'Nenhuma empresa cadastrada. Use "Importar planilha" para começar.'
            : 'Nenhuma empresa encontrada para esta busca.'}
        </p>
      ) : (
        <div className="overflow-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-3 py-2 font-medium">CNPJ</th>
                <th className="px-3 py-2 font-medium">Nome / Razão social</th>
                <th className="px-3 py-2 font-medium">Regime</th>
                <th className="px-3 py-2 font-medium">Situação</th>
                <th className="px-3 py-2 font-medium">Procuração</th>
                <th className="px-3 py-2 font-medium">Vendedor</th>
                <th className="px-3 py-2 font-medium">Cadastrada em</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((e) => {
                const procTexto =
                  e.procuracao === 'sim'
                    ? e.procuracao_validade
                      ? `Sim (val. ${e.procuracao_validade.slice(0, 10)})`
                      : 'Sim'
                    : e.procuracao === 'nao'
                      ? 'Não tem'
                      : '-'

                const dataCadastro = e.cadastrado_em
                  ? e.cadastrado_em.slice(0, 10)
                  : e.created
                    ? e.created.slice(0, 10)
                    : '-'

                return (
                  <tr key={e.id} className="border-t">
                    <td className="px-3 py-2 font-mono">{cnpjFmt(e.cnpj)}</td>
                    <td className="px-3 py-2">
                      <div className="font-medium">
                        {e.nome || <span className="text-muted-foreground">(sem nome)</span>}
                      </div>
                      {e.observacao && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {e.observacao}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {e.regime_tributacao
                        ? (ROTULO_REGIME[e.regime_tributacao] ?? e.regime_tributacao)
                        : '-'}
                    </td>
                    <td className="px-3 py-2">{e.situacao ? e.situacao.toUpperCase() : '-'}</td>
                    <td className="px-3 py-2">{procTexto}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {e.vendedor_responsavel || '-'}
                    </td>
                    <td className="px-3 py-2">{dataCadastro}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
