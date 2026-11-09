import { useEffect, useRef, useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/planejamento/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/planejamento/ui/card'
import { Input } from '@/planejamento/ui/input'
import {
  Aviso,
  CampoMoeda,
  Rotulo,
  SimNaoCampo,
  brl,
  classeSelect,
  classeTexto,
} from '@/planejamento/components/comuns'
import { SeletorCrossSell } from '@/planejamento/components/cross-sell'
import { pedir } from '@/planejamento/lib/dados'
import { ICMS_UF, PREFIXO_FONTE_ICMS_UF } from '@/planejamento/lib/icms-uf'

const PREFIXO_FONTE_ISS = 'Alíquota padrão de ISS'
import type { Perfil, Planejamento, Regime, Tributo } from '@/planejamento/lib/tipos'
import { NOME_TRIBUTO } from '@/planejamento/lib/tipos'
import type { Alterar } from '@/planejamento/paginas/Planejamento'

const TRIB_ATUAIS: Tributo[] = [
  'IRPJ',
  'CSLL',
  'PIS',
  'COFINS',
  'ICMS',
  'IPI',
  'ISS',
  'DAS',
  'INSS',
  'FGTS',
  'IRRF',
  'IS',
  'OUTROS',
]

interface Importacao {
  empresa: { nome?: string | null; observacao?: string | null } | null
  ecf: {
    ano: string
    formaTributacao: string | null
    formaApuracao: string | null
    irpj: number | null
    csll: number | null
    arquivo: string
  } | null
  contrib: {
    de: string
    ate: string
    meses: number
    receitaBruta: number
    pis: number
    cofins: number
    creditosPis: number
    creditosCofins: number
    regime: string | null
    iss?: number
  } | null
  icms: {
    de: string
    ate: string
    meses: number
    icms: number
    ipi: number
    estabelecimentos: number
  } | null
  perfil?: Partial<Omit<Perfil, 'setores' | 'operacoes'>> & {
    setores?: Partial<Perfil['setores']>
    operacoes?: Partial<Perfil['operacoes']>
    fontes?: Record<string, string>
    codMun?: string
  }
  avisos: string[]
}

/** Faixas padrão de folha. Custo médio de R$ 4 mil por pessoa ao mês (salário + pró-labore, sem encargos);
 *  o cálculo usa o valor central de cada faixa. A faixa 3 começa no piso do perfil de cliente do grupo (50 empregados, R$ 200 mil/mês). */
const CUSTO_MEDIO_MES = 4_000
const PORTES_FOLHA = [
  {
    id: 'p1',
    nome: 'Faixa 1 — micro',
    faixaEmp: 'até 19 empregados',
    faixaFolha: 'até R$ 0,9 mi/ano',
    empregados: 10,
  },
  {
    id: 'p2',
    nome: 'Faixa 2 — pequena',
    faixaEmp: '20 a 49 empregados',
    faixaFolha: 'R$ 0,96 a 2,35 mi/ano',
    empregados: 35,
  },
  {
    id: 'p3',
    nome: 'Faixa 3 — média',
    faixaEmp: '50 a 99 empregados',
    faixaFolha: 'R$ 2,4 a 4,75 mi/ano',
    empregados: 75,
  },
  {
    id: 'p4',
    nome: 'Faixa 4 — grande',
    faixaEmp: '100 a 249 empregados',
    faixaFolha: 'R$ 4,8 a 11,95 mi/ano',
    empregados: 175,
  },
  {
    id: 'p5',
    nome: 'Faixa 5 — muito grande',
    faixaEmp: '250 empregados ou mais',
    faixaFolha: 'a partir de R$ 12 mi/ano',
    empregados: 350,
  },
].map((o) => ({ ...o, folhaAnual: o.empregados * CUSTO_MEDIO_MES * 12 }))
const PADRAO_ENCARGO = 28.8

const ROTULO_CAMPO: Record<string, string> = {
  regime: 'Regime',
  uf: 'UF',
  municipio: 'Município',
  cnae: 'CNAE',
  atividade: 'Atividade',
  receitaAnual: 'Receita anual',
  lucroContabil: 'Lucro (base do IRPJ)',
  comprasCreditaveis: 'Compras com crédito',
  folhaAnual: 'Folha anual',
  empregados: 'Empregados',
  encargoPatronal: 'Encargo patronal',
  prejuizoFiscal: 'Prejuízo fiscal',
  aliquotaIcms: 'Alíquota de ICMS',
  aliquotaIss: 'Alíquota de ISS',
  receitaServicos: 'Receita de serviços',
}

const SETORES: [keyof Perfil['setores'], string][] = [
  ['industria', 'Indústria'],
  ['comercio', 'Comércio'],
  ['servicos', 'Serviços'],
  ['transporte', 'Transporte'],
  ['construcao', 'Construção/obras'],
  ['saude', 'Saúde'],
  ['educacao', 'Educação'],
  ['agro', 'Agro/agroindústria'],
  ['imobiliario', 'Imobiliário'],
  ['alimentos', 'Alimentos'],
  ['bebidas', 'Bebidas'],
  ['veiculos', 'Veículos/bens do Imposto Seletivo'],
  ['hotelaria', 'Hotelaria/turismo'],
  ['restaurante', 'Bares/restaurantes'],
  ['tecnologia', 'Tecnologia da informação'],
  ['profIntelectual', 'Profissão intelectual regulamentada'],
  ['financeiro', 'Receitas financeiras relevantes'],
]
const OPERACOES: [keyof Perfil['operacoes'], string][] = [
  ['contribuinteIcms', 'Contribuinte do ICMS'],
  ['contribuinteIpi', 'Contribuinte do IPI'],
  ['contribuinteIss', 'Contribuinte do ISS'],
  ['exporta', 'Exporta'],
  ['importa', 'Importa'],
  ['interestadual', 'Operações interestaduais'],
  ['substituicaoTributaria', 'Substituição tributária'],
  ['monofasicos', 'Produtos monofásicos'],
  ['incentivoEstadual', 'Incentivo fiscal estadual'],
  ['filiais', 'Mais de um estabelecimento'],
  ['multiplasAtividades', 'Atividades com coeficientes diferentes'],
  ['intermediacao', 'Intermediação/agenciamento'],
  ['desoneracaoFolha', 'Desoneração da folha (CPRB)'],
]
const SOCIETARIO: [keyof Perfil['societario'], string][] = [
  ['grupoEconomico', 'Grupo econômico'],
  ['patrimonioImobiliarioPF', 'Imóveis na PF dos sócios'],
  ['sociosRecebemDividendos', 'Sócios PF recebem lucros'],
  ['reorganizacao', 'Reorganização/M&A em vista'],
  ['partesRelacionadasExterior', 'Partes relacionadas no exterior'],
  ['pesquisaDesenvolvimento', 'Pesquisa e desenvolvimento'],
]

export function AbaPerfil({ pl, alterar }: { pl: Planejamento; alterar: Alterar }) {
  const p = pl.perfil
  const set = <K extends keyof Perfil>(k: K, v: Perfil[K]) =>
    alterar((x) => ({ ...x, perfil: { ...x.perfil, [k]: v } }))
  function usarPorte(o: (typeof PORTES_FOLHA)[number]) {
    alterar((x) => {
      const imp = (x.importado || {}) as Record<string, unknown>
      const fontes = { ...((imp.fontesPerfil as Record<string, string>) || {}) }
      const nota = `Valor padrão escolhido: ${o.nome}, ${o.faixaEmp}, valor central (estimativa — substituir pela folha real)`
      fontes.folhaAnual = nota
      fontes.empregados = nota
      const encargoVazio = x.perfil.encargoPatronal == null
      if (encargoVazio)
        fontes.encargoPatronal = `Valor padrão: ${PADRAO_ENCARGO}% (CPP 20% + RAT 3% + terceiros 5,8%) — conferir FPAS e FAP`
      return {
        ...x,
        perfil: {
          ...x.perfil,
          empregados: o.empregados,
          folhaAnual: o.folhaAnual,
          encargoPatronal: encargoVazio ? PADRAO_ENCARGO : x.perfil.encargoPatronal,
        },
        importado: { ...imp, fontesPerfil: fontes } as Planejamento['importado'],
      }
    })
  }
  const setGrupo = <G extends 'setores' | 'operacoes' | 'societario'>(
    g: G,
    k: string,
    v: boolean | null,
  ) => alterar((x) => ({ ...x, perfil: { ...x.perfil, [g]: { ...x.perfil[g], [k]: v } } }))
  const setAtual = (t: Tributo, v: number | null, fonte = 'Informado pela equipe') =>
    alterar((x) => {
      const valores = { ...x.atual.valores }
      const fontes = { ...x.atual.fontes }
      if (v == null) {
        delete valores[t]
        delete fontes[t]
      } else {
        valores[t] = v
        fontes[t] = fonte
      }
      return { ...x, atual: { ...x.atual, valores, fontes } }
    })
  const totalAtual = Object.values(pl.atual.valores).reduce((s, v) => s + (v || 0), 0)
  const cargaSobreReceita = p.receitaAnual ? totalAtual / p.receitaAnual : null

  const [imp, setImp] = useState<Importacao | null>(null)
  const [importando, setImportando] = useState(false)
  const [erroImp, setErroImp] = useState('')

  async function importar() {
    setImportando(true)
    setErroImp('')
    try {
      setImp(await pedir<Importacao>(`/backend/v1/pt/dados/${pl.cnpj}`))
    } catch (e) {
      setErroImp((e as Error).message)
    } finally {
      setImportando(false)
    }
  }
  const [preenchidos, setPreenchidos] = useState<string[]>([])
  /** manual = clique em "Usar estes valores" (atualiza a situação atual); automático = só completa o que está vazio. */
  function aplicar(dados: Importacao, manual: boolean) {
    const lista: string[] = []
    alterar((x) => {
      const valores = { ...x.atual.valores }
      const fontes = { ...x.atual.fontes }
      const perfil: Perfil = {
        ...x.perfil,
        setores: { ...x.perfil.setores },
        operacoes: { ...x.perfil.operacoes },
      }
      let ano = x.atual.anoReferencia
      const valor = (t: Tributo, v: number | null | undefined, fonte: string) => {
        if (v == null) return
        if (!manual && valores[t] != null && !String(fontes[t] || '').startsWith('Estimativa'))
          return
        valores[t] = v
        fontes[t] = fonte
        lista.push(NOME_TRIBUTO[t])
      }
      if (dados.ecf) {
        valor('IRPJ', dados.ecf.irpj, `ECF ${dados.ecf.ano} (${dados.ecf.arquivo})`)
        valor('CSLL', dados.ecf.csll, `ECF ${dados.ecf.ano} (${dados.ecf.arquivo})`)
        ano = Number(dados.ecf.ano) || ano
      }
      if (dados.contrib) {
        const per = `EFD-Contribuições ${dados.contrib.de.slice(0, 7)} a ${dados.contrib.ate.slice(0, 7)} (${dados.contrib.meses} meses)`
        valor('PIS', dados.contrib.pis, per + ', M200')
        valor('COFINS', dados.contrib.cofins, per + ', M600')
        if (dados.contrib.iss)
          valor(
            'ISS',
            dados.contrib.iss,
            per + ', A100 (ISS das notas de serviço emitidas — conferir com as guias do município)',
          )
      }
      if (dados.icms) {
        const per = `EFD ICMS/IPI ${dados.icms.de.slice(0, 7)} a ${dados.icms.ate.slice(0, 7)} (${dados.icms.meses} meses)`
        if (dados.icms.icms) valor('ICMS', dados.icms.icms, per + ', E110')
        if (dados.icms.ipi) valor('IPI', dados.icms.ipi, per + ', E520')
      }
      const pf = dados.perfil || {}
      for (const k of Object.keys(ROTULO_CAMPO) as (keyof Perfil)[]) {
        const v = (pf as Record<string, unknown>)[k]
        const atual = perfil[k]
        if (v == null || v === '' || (atual != null && atual !== '')) continue
        ;(perfil as unknown as Record<string, unknown>)[k] = v
        lista.push(ROTULO_CAMPO[k])
      }
      for (const g of ['setores', 'operacoes'] as const) {
        const origem = (pf[g] || {}) as Record<string, boolean | null>
        for (const [k, v] of Object.entries(origem)) {
          if (v == null || (perfil[g] as Record<string, boolean | null>)[k] != null) continue
          ;(perfil[g] as Record<string, boolean | null>)[k] = v
          lista.push((g === 'setores' ? SETORES : OPERACOES).find(([c]) => c === k)?.[1] || k)
        }
      }
      return {
        ...x,
        perfil,
        atual: { ...x.atual, anoReferencia: ano, valores, fontes },
        importado: {
          em: new Date().toISOString(),
          fontesPerfil: {
            ...((x.importado as { fontesPerfil?: Record<string, string> } | null)?.fontesPerfil ||
              {}),
            ...(pf.fontes || {}),
          },
          dados,
        },
      }
    })
    setPreenchidos(lista)
    setImp(null)
  }

  // Primeira abertura: lê o servidor e completa o perfil sozinho (só o que está vazio).
  const tentou = useRef(false)
  useEffect(() => {
    if (
      tentou.current ||
      ((pl.importado as { fontesPerfil?: unknown; dados?: unknown } | null)?.fontesPerfil &&
        (pl.importado as { dados?: unknown }).dados)
    )
      return // também reprocessa importações antigas, que não liam o perfil
    tentou.current = true
    setImportando(true)
    pedir<Importacao>(`/backend/v1/pt/dados/${pl.cnpj}`)
      .then((d) => aplicar(d, false))
      .catch((e) => setErroImp((e as Error).message))
      .finally(() => setImportando(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const fontesPerfil =
    (pl.importado as { fontesPerfil?: Record<string, string> } | null)?.fontesPerfil || {}

  /** Grava um campo do perfil junto com a origem do dado (lista "De onde veio cada dado"). */
  function setComFonte<K extends keyof Perfil>(k: K, v: Perfil[K], fonte: string) {
    alterar((x) => {
      const imp = (x.importado || {}) as Record<string, unknown>
      const fontes = { ...((imp.fontesPerfil as Record<string, string>) || {}), [k]: fonte }
      return {
        ...x,
        perfil: { ...x.perfil, [k]: v },
        importado: { ...imp, fontesPerfil: fontes } as Planejamento['importado'],
      }
    })
  }

  // Alíquota de ICMS pelo estado: preenche se estiver vazia ou se veio de cálculo automático (média do SPED ou tabela de outra UF).
  // Valor digitado pela equipe nunca é trocado.
  const fonteIcms = fontesPerfil.aliquotaIcms || ''
  useEffect(() => {
    const t = ICMS_UF[(p.uf || '').toUpperCase()]
    if (!t) return
    const daTabela = fonteIcms.startsWith(PREFIXO_FONTE_ICMS_UF)
    const mediaSped = fonteIcms.startsWith('EFD ICMS/IPI')
    if (p.aliquotaIcms != null && !daTabela && !mediaSped) return
    const fonte =
      `${PREFIXO_FONTE_ICMS_UF} de ${p.uf.toUpperCase()}: ${t.aliquota.toLocaleString('pt-BR')}% (${t.base})` +
      (mediaSped && p.aliquotaIcms != null
        ? `. Média das saídas internas no SPED: ${p.aliquotaIcms.toLocaleString('pt-BR')}% (pode refletir redução de base)`
        : '') +
      '. Conferir produtos com alíquota própria.'
    if (
      daTabela &&
      p.aliquotaIcms === t.aliquota &&
      fonteIcms.includes(` de ${p.uf.toUpperCase()}:`)
    )
      return
    setComFonte('aliquotaIcms', t.aliquota, fonte)
  }, [p.uf, p.aliquotaIcms, fonteIcms]) // eslint-disable-line react-hooks/exhaustive-deps

  // ISS: padrão de 5% para todas as empresas (decisão do usuário em 07/11/2026; teto da LC 116/2003). A alíquota efetiva
  // das notas no SPED fica só citada na origem. Valor digitado pela equipe não é trocado.
  const fonteIss = fontesPerfil.aliquotaIss || ''
  useEffect(() => {
    const padrao = fonteIss.startsWith(PREFIXO_FONTE_ISS)
    const efetivaSped = fonteIss.startsWith('EFD')
    if (p.aliquotaIss != null && !padrao && !efetivaSped) return
    const obsSped =
      efetivaSped && p.aliquotaIss != null
        ? ` Alíquota efetiva nas notas emitidas (SPED A100): ${p.aliquotaIss.toLocaleString('pt-BR')}%.`
        : padrao
          ? fonteIss.split('item de serviço prestado.')[1] || ''
          : ''
    const local = p.municipio
      ? `${p.municipio}${p.uf ? '/' + p.uf.toUpperCase() : ''}`
      : 'o município da empresa'
    const fonte = `${PREFIXO_FONTE_ISS}: 5% (teto da LC 116/2003, art. 8º; mínimo 2%, art. 8º-A). Conferir na lei do ISS de ${local} a alíquota do item de serviço prestado.${obsSped}`
    if (padrao && p.aliquotaIss === 5 && fonteIss === fonte) return
    setComFonte('aliquotaIss', 5, fonte)
  }, [p.municipio, p.uf, p.aliquotaIss, fonteIss]) // eslint-disable-line react-hooks/exhaustive-deps

  // ISS anual estimado (receita de serviços × alíquota) quando não houver o valor pago; o ISS real do SPED substitui a estimativa.
  const fonteIssAtual = pl.atual.fontes.ISS || ''
  useEffect(() => {
    if (
      p.regime === 'simples' ||
      !(p.receitaServicos && p.receitaServicos > 0) ||
      p.aliquotaIss == null
    )
      return
    const atualIss = pl.atual.valores.ISS
    if (atualIss != null && !fonteIssAtual.startsWith('Estimativa')) return
    const v = Math.round(p.receitaServicos * p.aliquotaIss) / 100
    if (atualIss === v) return
    alterar((x) => ({
      ...x,
      atual: {
        ...x.atual,
        valores: { ...x.atual.valores, ISS: v },
        fontes: {
          ...x.atual.fontes,
          ISS: `Estimativa: receita de serviços × alíquota de ISS (${p.aliquotaIss!.toLocaleString('pt-BR')}%). Substituir pelo ISS efetivamente pago.`,
        },
      },
    }))
  }, [p.regime, p.receitaServicos, p.aliquotaIss, pl.atual.valores.ISS, fonteIssAtual]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-base">Dados já disponíveis no servidor</CardTitle>
          <Button size="sm" variant="outline" onClick={importar} disabled={importando}>
            <Download /> {importando ? 'Lendo SPED…' : 'Ler ECF e EFDs do servidor'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Lê apenas o SPED que já está no servidor (ECF, EFD-Contribuições, EFD ICMS/IPI). Não
            consulta o SERPRO (cobrado) nem pede arquivos à Receita. As apurações recebidas são
            usadas como referência, sem nova auditoria.
          </p>
          {erroImp && <Aviso tom="risco">{erroImp}</Aviso>}
          {importando && !imp && (
            <p className="text-sm">Lendo o SPED do servidor e completando o perfil…</p>
          )}
          {preenchidos.length > 0 && (
            <Aviso tom="info">
              Preenchido a partir do servidor: {preenchidos.join(', ')}. Confira; campos que a
              equipe já tinha preenchido não foram alterados.
            </Aviso>
          )}
          {Object.keys(fontesPerfil).length > 0 && (
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer">De onde veio cada dado do perfil</summary>
              <ul className="mt-1 list-disc pl-5">
                {Object.entries(fontesPerfil).map(([k, v]) => (
                  <li key={k}>
                    <b>
                      {ROTULO_CAMPO[k] ||
                        [...SETORES, ...OPERACOES].find(([c]) => k.endsWith('.' + c))?.[1] ||
                        k}
                      :
                    </b>{' '}
                    {v}
                  </li>
                ))}
              </ul>
            </details>
          )}
          {imp && (
            <div className="space-y-2 rounded-lg border p-3">
              {imp.ecf ? (
                <div>
                  <b>ECF {imp.ecf.ano}</b>: {imp.ecf.formaTributacao || 'forma não identificada'}
                  {imp.ecf.formaApuracao ? `, apuração ${imp.ecf.formaApuracao}` : ''} · IRPJ{' '}
                  {brl(imp.ecf.irpj)} · CSLL {brl(imp.ecf.csll)}
                </div>
              ) : (
                <div className="text-muted-foreground">Sem ECF no servidor.</div>
              )}
              {imp.contrib ? (
                <div>
                  <b>EFD-Contribuições</b> ({imp.contrib.meses} meses até{' '}
                  {imp.contrib.ate.slice(0, 7)}): receita bruta {brl(imp.contrib.receitaBruta)} ·
                  PIS {brl(imp.contrib.pis)} · COFINS {brl(imp.contrib.cofins)} · créditos
                  descontados {brl(imp.contrib.creditosPis + imp.contrib.creditosCofins)}
                </div>
              ) : (
                <div className="text-muted-foreground">Sem EFD-Contribuições no servidor.</div>
              )}
              {imp.icms ? (
                <div>
                  <b>EFD ICMS/IPI</b> ({imp.icms.meses} meses até {imp.icms.ate.slice(0, 7)}): ICMS
                  a recolher {brl(imp.icms.icms)} · IPI {brl(imp.icms.ipi)}
                </div>
              ) : (
                <div className="text-muted-foreground">Sem EFD ICMS/IPI no servidor.</div>
              )}
              {imp.avisos.map((a) => (
                <Aviso key={a}>{a}</Aviso>
              ))}
              <div className="flex gap-2">
                <Button size="sm" onClick={() => aplicar(imp, true)}>
                  Usar estes valores
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setImp(null)}>
                  Descartar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Perfil da empresa</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Rotulo texto="Regime tributário">
              <select
                className={classeSelect}
                value={p.regime || ''}
                onChange={(e) => set('regime', (e.target.value || null) as Regime | null)}
              >
                <option value="">— não informado —</option>
                <option value="simples">Simples Nacional</option>
                <option value="presumido">Lucro Presumido</option>
                <option value="real-anual">Lucro Real anual (estimativas)</option>
                <option value="real-trimestral">Lucro Real trimestral</option>
                <option value="arbitrado">Lucro Arbitrado</option>
                <option value="imune">Imune/isenta</option>
              </select>
            </Rotulo>
            {p.regime === 'simples' && (
              <Rotulo texto="Anexo do Simples">
                <select
                  className={classeSelect}
                  value={p.anexoSimples || ''}
                  onChange={(e) =>
                    set('anexoSimples', (e.target.value || null) as Perfil['anexoSimples'])
                  }
                >
                  <option value="">—</option>
                  {['I', 'II', 'III', 'IV', 'V'].map((a) => (
                    <option key={a} value={a}>
                      Anexo {a}
                    </option>
                  ))}
                </select>
              </Rotulo>
            )}
            <Rotulo texto="UF">
              <Input
                value={p.uf}
                maxLength={2}
                onChange={(e) => set('uf', e.target.value.toUpperCase())}
              />
            </Rotulo>
            <Rotulo texto="Município">
              <Input value={p.municipio} onChange={(e) => set('municipio', e.target.value)} />
            </Rotulo>
            <Rotulo texto="CNAE principal">
              <Input value={p.cnae} onChange={(e) => set('cnae', e.target.value)} />
            </Rotulo>
            <Rotulo texto="Atividade (descrição)">
              <Input value={p.atividade} onChange={(e) => set('atividade', e.target.value)} />
            </Rotulo>
            <Rotulo texto="Receita bruta anual">
              <CampoMoeda valor={p.receitaAnual} aoMudar={(v) => set('receitaAnual', v)} />
            </Rotulo>
            <Rotulo texto="Parte da receita que é serviço">
              <CampoMoeda valor={p.receitaServicos} aoMudar={(v) => set('receitaServicos', v)} />
            </Rotulo>
            <Rotulo
              texto="Lucro antes do IRPJ/CSLL"
              ajuda="Base para simular o Lucro Real (ajustes do e-Lalur à parte)."
            >
              <CampoMoeda valor={p.lucroContabil} aoMudar={(v) => set('lucroContabil', v)} />
            </Rotulo>
            <Rotulo
              texto="Compras/insumos com direito a crédito"
              ajuda="Usado em PIS/COFINS não cumulativos e na CBS/IBS de referência."
            >
              <CampoMoeda
                valor={p.comprasCreditaveis}
                aoMudar={(v) => set('comprasCreditaveis', v)}
              />
            </Rotulo>
            <div className="sm:col-span-2 rounded-md border border-dashed p-3 space-y-2">
              <div className="text-sm font-medium">Folha e empregados — valores padrão</div>
              <p className="text-xs text-muted-foreground">
                Sem a folha real em mãos, escolha a faixa da empresa. O cálculo usa o valor central
                da faixa (custo médio de {brl(CUSTO_MEDIO_MES)} por pessoa ao mês). Os valores
                entram no cálculo (INSS patronal, Fator R, desoneração, triagem e cross-sell) e
                podem ser corrigidos nos campos abaixo. Se o encargo patronal estiver vazio, entra{' '}
                {PADRAO_ENCARGO.toLocaleString('pt-BR')}% (CPP 20% + RAT 3% + terceiros 5,8%).
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {PORTES_FOLHA.map((o) => {
                  const ativo = p.empregados === o.empregados && p.folhaAnual === o.folhaAnual
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => usarPorte(o)}
                      className={`rounded-md border px-3 py-2 text-left text-sm transition ${ativo ? 'border-primary bg-primary/10' : 'hover:bg-muted'}`}
                    >
                      <div className="font-medium">
                        {o.nome}
                        {ativo ? ' ✓' : ''}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {o.faixaEmp} · {o.faixaFolha}
                      </div>
                      <div className="mt-1">
                        Usa: <b>{o.empregados}</b> empregados
                      </div>
                      <div>
                        <b>{brl(o.folhaAnual)}</b>/ano{' '}
                        <span className="text-xs text-muted-foreground">
                          ({brl(o.folhaAnual / 12)}/mês)
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
              {fontesPerfil.folhaAnual?.startsWith('Valor padrão') && (
                <p className="text-xs text-amber-700">
                  Folha e empregados estão com valor padrão (estimativa). Substitua pela folha real
                  quando a empresa enviar.
                </p>
              )}
            </div>
            <Rotulo texto="Folha anual (salários + pró-labore)">
              <CampoMoeda valor={p.folhaAnual} aoMudar={(v) => set('folhaAnual', v)} />
            </Rotulo>
            <Rotulo texto="Empregados">
              <CampoMoeda
                sufixo="pes."
                valor={p.empregados}
                aoMudar={(v) => set('empregados', v)}
              />
            </Rotulo>
            <Rotulo
              texto="Encargo patronal (CPP + RAT×FAP + terceiros)"
              ajuda="Conferir FPAS e FAP; FGTS à parte."
            >
              <CampoMoeda
                sufixo="%"
                valor={p.encargoPatronal}
                aoMudar={(v) => set('encargoPatronal', v)}
              />
            </Rotulo>
            <Rotulo
              texto="Alíquota interna de ICMS de referência"
              ajuda={
                ICMS_UF[(p.uf || '').toUpperCase()] && fonteIcms.startsWith(PREFIXO_FONTE_ICMS_UF)
                  ? `Padrão de ${p.uf.toUpperCase()} (alíquota modal). Altere se o produto principal tiver alíquota própria.`
                  : 'Lei estadual / produto principal.'
              }
            >
              <CampoMoeda
                sufixo="%"
                valor={p.aliquotaIcms}
                aoMudar={(v) => setComFonte('aliquotaIcms', v, 'Informado pela equipe')}
              />
            </Rotulo>
            <Rotulo
              texto="Alíquota de ISS do município"
              ajuda={
                fonteIss.startsWith(PREFIXO_FONTE_ISS)
                  ? `Padrão de 5%: conferir na lei de ${p.municipio || 'do município'} o item do serviço.`
                  : 'Lei municipal / item de serviço principal (2% a 5%).'
              }
            >
              <CampoMoeda
                sufixo="%"
                valor={p.aliquotaIss}
                aoMudar={(v) => setComFonte('aliquotaIss', v, 'Informado pela equipe')}
              />
            </Rotulo>
            <Rotulo texto="Investimento anual em imobilizado">
              <CampoMoeda
                valor={p.investimentoAnual}
                aoMudar={(v) => set('investimentoAnual', v)}
              />
            </Rotulo>
            <Rotulo texto="Passivo tributário">
              <CampoMoeda
                valor={p.passivoTributario}
                aoMudar={(v) => set('passivoTributario', v)}
              />
            </Rotulo>
            <Rotulo texto="Prejuízo fiscal / base negativa acumulados">
              <CampoMoeda valor={p.prejuizoFiscal} aoMudar={(v) => set('prejuizoFiscal', v)} />
            </Rotulo>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Situação tributária atual (valores anuais)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Rotulo texto="Exercício de referência">
                <CampoMoeda
                  sufixo="ano"
                  valor={pl.atual.anoReferencia}
                  aoMudar={(v) =>
                    alterar((x) => ({ ...x, atual: { ...x.atual, anoReferencia: v || 2025 } }))
                  }
                />
              </Rotulo>
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <div className="text-xs uppercase text-muted-foreground">Carga de referência</div>
                <div className="font-display text-xl font-bold">{brl(totalAtual)}</div>
                <div className="text-xs text-muted-foreground">
                  {cargaSobreReceita != null
                    ? `${(cargaSobreReceita * 100).toFixed(2).replace('.', ',')}% da receita`
                    : 'informe a receita para ver o percentual'}
                </div>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-1">Tributo</th>
                  <th className="py-1">Valor anual</th>
                  <th className="py-1">Fonte</th>
                </tr>
              </thead>
              <tbody>
                {TRIB_ATUAIS.map((t) => (
                  <tr key={t} className="border-t">
                    <td className="py-1.5 pr-2">{NOME_TRIBUTO[t]}</td>
                    <td className="w-44 py-1.5 pr-2">
                      <CampoMoeda
                        valor={pl.atual.valores[t] ?? null}
                        aoMudar={(v) => setAtual(t, v)}
                      />
                    </td>
                    <td className="py-1.5 text-xs text-muted-foreground">
                      {pl.atual.fontes[t] || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Rotulo texto="Observações / limitações informadas pelo módulo de coleta">
              <textarea
                className={classeTexto}
                rows={3}
                value={pl.atual.observacao}
                onChange={(e) =>
                  alterar((x) => ({ ...x, atual: { ...x.atual, observacao: e.target.value } }))
                }
              />
            </Rotulo>
            <Aviso tom="info">
              Folha (INSS/FGTS) e Simples (DAS) vêm da DCTFWeb/PGDAS-D, que são consultas cobradas
              no SERPRO: informe pelos relatórios já existentes ou pelo sistema Domínio.
            </Aviso>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Atividades, operações e estrutura</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-1.5">
            <div className="text-xs font-semibold uppercase text-muted-foreground">Setores</div>
            {SETORES.map(([k, t]) => (
              <SimNaoCampo
                key={k}
                rotulo={t}
                valor={p.setores[k]}
                aoMudar={(v) => setGrupo('setores', k, v)}
              />
            ))}
          </div>
          <div className="space-y-1.5">
            <div className="text-xs font-semibold uppercase text-muted-foreground">Operações</div>
            {OPERACOES.map(([k, t]) => (
              <SimNaoCampo
                key={k}
                rotulo={t}
                valor={p.operacoes[k]}
                aoMudar={(v) => setGrupo('operacoes', k, v)}
              />
            ))}
          </div>
          <div className="space-y-1.5">
            <div className="text-xs font-semibold uppercase text-muted-foreground">
              Societário e patrimonial
            </div>
            {SOCIETARIO.map(([k, t]) => (
              <SimNaoCampo
                key={k}
                rotulo={t}
                valor={p.societario[k]}
                aoMudar={(v) => setGrupo('societario', k, v)}
              />
            ))}
            <div className="pt-3">
              <Rotulo texto="Responsável técnico">
                <Input
                  value={pl.responsavel}
                  onChange={(e) => alterar((x) => ({ ...x, responsavel: e.target.value }))}
                />
              </Rotulo>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Possível cross-sell (obrigatório)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">
            O cliente é do grupo. As sugestões em amarelo vêm do perfil acima; quem originou
            continua dono do relacionamento e o especialista entra como apoio.
          </p>
          <SeletorCrossSell
            valor={pl.crossSell}
            aoMudar={(v) => alterar((x) => ({ ...x, crossSell: v }))}
            perfil={p}
            atual={pl.atual}
          />
        </CardContent>
      </Card>
    </div>
  )
}
