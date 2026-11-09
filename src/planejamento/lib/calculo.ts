// Motor de cálculo do planejamento: regimes, calculadoras por modelo de estratégia, consolidação sem dupla contagem
// e projeção 2026–2033. Tudo reproduzível: cada número sai de uma fórmula exibida na memória de cálculo.
// Regras do manual: economia = tributo atual − tributo planejado; benefício líquido = economia − custos − impactos;
// mesma base em duas estratégias não soma duas vezes; alíquota futura de CBS/IBS só como PREMISSA explícita.
import type {
  AnaliseEstrategia,
  Estrategia,
  LinhaEfeito,
  Perfil,
  Planejamento,
  Premissas,
  SituacaoAtual,
  Tributo,
} from './tipos'

export const ANOS = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033]
const r2 = (v: number) => Math.round(v * 100) / 100
const fmt = (v: number) =>
  (v < 0 ? '-' : '') +
  'R$ ' +
  Math.abs(r2(v))
    .toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
const pc = (v: number) => (Math.round(v * 10000) / 100).toString().replace('.', ',') + '%'

// ------------------------------------------------------------------ parâmetros legais vigentes (2026)
/** LC 123/2006, Anexos I a V: [limite da faixa, alíquota nominal, parcela a deduzir]. */
export const ANEXOS_SIMPLES: Record<string, [number, number, number][]> = {
  I: [
    [180000, 0.04, 0],
    [360000, 0.073, 5940],
    [720000, 0.095, 13860],
    [1800000, 0.107, 22500],
    [3600000, 0.143, 87300],
    [4800000, 0.19, 378000],
  ],
  II: [
    [180000, 0.045, 0],
    [360000, 0.078, 5940],
    [720000, 0.1, 13860],
    [1800000, 0.112, 22500],
    [3600000, 0.147, 85500],
    [4800000, 0.3, 720000],
  ],
  III: [
    [180000, 0.06, 0],
    [360000, 0.112, 9360],
    [720000, 0.135, 17640],
    [1800000, 0.16, 35640],
    [3600000, 0.21, 125640],
    [4800000, 0.33, 648000],
  ],
  IV: [
    [180000, 0.045, 0],
    [360000, 0.09, 8100],
    [720000, 0.102, 12420],
    [1800000, 0.14, 39780],
    [3600000, 0.22, 183780],
    [4800000, 0.33, 828000],
  ],
  V: [
    [180000, 0.155, 0],
    [360000, 0.18, 4500],
    [720000, 0.195, 9900],
    [1800000, 0.205, 17100],
    [3600000, 0.23, 62100],
    [4800000, 0.305, 540000],
  ],
}
export function aliquotaEfetivaSimples(anexo: string, rbt12: number) {
  const faixas = ANEXOS_SIMPLES[anexo]
  if (!faixas || rbt12 <= 0) return null
  const f = faixas.find((x) => rbt12 <= x[0])
  if (!f) return null // acima de R$ 4,8 milhões: fora do Simples
  return {
    nominal: f[1],
    deduzir: f[2],
    efetiva: (rbt12 * f[1] - f[2]) / rbt12,
    faixa: faixas.indexOf(f) + 1,
  }
}

/** Coeficientes de presunção (Lei 9.249/1995) por grupo de atividade: [IRPJ, CSLL]. */
export const PRESUNCOES: Record<string, { nome: string; irpj: number; csll: number }> = {
  geral: { nome: 'Comércio e indústria', irpj: 0.08, csll: 0.12 },
  servicos: { nome: 'Serviços em geral', irpj: 0.32, csll: 0.32 },
  hospitalar: { nome: 'Serviços hospitalares (requisitos legais)', irpj: 0.08, csll: 0.12 },
  'transporte-carga': { nome: 'Transporte de cargas', irpj: 0.08, csll: 0.12 },
  'transporte-passageiros': { nome: 'Transporte de passageiros', irpj: 0.16, csll: 0.12 },
  combustiveis: { nome: 'Revenda de combustíveis', irpj: 0.016, csll: 0.12 },
}
const LIMITE_LC224 = 5_000_000 // LC 224/2025: coeficiente acrescido de 10% sobre a receita que exceder R$ 5 milhões/ano
const ADICIONAL_LIMITE = 240_000 // adicional de 10% do IRPJ acima de R$ 20 mil/mês

export interface LinhaMemoria {
  etapa: string
  formula: string
  valor: number | null
  nota?: string
}
export interface Efeito {
  tributo: Tributo
  descricao: string
  atual: number
  planejado: number
  baseChave: string
}

/** IRPJ (15% + adicional 10%) e CSLL 9% sobre bases anuais. */
function irpjCsll(baseIrpj: number, baseCsll: number) {
  const irpj = Math.max(baseIrpj, 0) * 0.15 + Math.max(baseIrpj - ADICIONAL_LIMITE, 0) * 0.1
  const csll = Math.max(baseCsll, 0) * 0.09
  return { irpj, csll }
}
/** Alíquota marginal de IRPJ+CSLL no Lucro Real (adicional só se o lucro passa de R$ 240 mil). */
export function marginalReal(p: Perfil) {
  const lucro = p.lucroContabil ?? 0
  return { irpj: lucro > ADICIONAL_LIMITE ? 0.25 : 0.15, csll: 0.09 }
}
const ehReal = (p: Perfil) => p.regime === 'real-anual' || p.regime === 'real-trimestral'

/** Tributos sobre receita e lucro em cada regime (mesma base econômica: receita, lucro, compras e folha do perfil). */
export function tributosNoRegime(
  regime: string,
  p: Perfil,
  opc: { presuncao?: string; lc224?: boolean; anexo?: string; encargo?: number },
) {
  const receita = p.receitaAnual ?? 0
  const memoria: LinhaMemoria[] = []
  const t: Partial<Record<Tributo, number>> = {}
  const folha = p.folhaAnual ?? 0
  const encargo = (opc.encargo ?? p.encargoPatronal ?? 0) / 100
  if (regime === 'simples') {
    const anexo = opc.anexo || p.anexoSimples || 'I'
    const a = aliquotaEfetivaSimples(anexo, receita)
    if (!a) {
      memoria.push({
        etapa: 'Simples Nacional',
        formula: `Receita ${fmt(receita)} acima do limite de R$ 4.800.000,00 ou não informada`,
        valor: null,
        nota: 'Regime indisponível',
      })
      return { tributos: t, memoria, disponivel: false }
    }
    t.DAS = receita * a.efetiva
    memoria.push({
      etapa: `DAS — Anexo ${anexo}, faixa ${a.faixa}`,
      formula: `(${fmt(receita)} × ${pc(a.nominal)} − ${fmt(a.deduzir)}) ÷ ${fmt(receita)} = ${pc(a.efetiva)} efetiva; × receita`,
      valor: t.DAS,
    })
    if (anexo === 'IV') {
      t.INSS = folha * encargo
      memoria.push({
        etapa: 'CPP fora do DAS (Anexo IV)',
        formula: `${fmt(folha)} × ${pc(encargo)}`,
        valor: t.INSS,
      })
    }
    return { tributos: t, memoria, disponivel: true }
  }
  t.INSS = folha * encargo
  if (regime === 'presumido') {
    const pr = PRESUNCOES[opc.presuncao || 'geral']
    const ate = Math.min(receita, LIMITE_LC224)
    const exc = opc.lc224 === false ? 0 : Math.max(receita - LIMITE_LC224, 0)
    const baseIr = (opc.lc224 === false ? receita : ate) * pr.irpj + exc * pr.irpj * 1.1
    const baseCs = (opc.lc224 === false ? receita : ate) * pr.csll + exc * pr.csll * 1.1
    const { irpj, csll } = irpjCsll(baseIr, baseCs)
    t.IRPJ = irpj
    t.CSLL = csll
    t.PIS = receita * 0.0065
    t.COFINS = receita * 0.03
    memoria.push({
      etapa: `Base presumida IRPJ (${pr.nome})`,
      formula: exc
        ? `${fmt(ate)} × ${pc(pr.irpj)} + ${fmt(exc)} × ${pc(pr.irpj * 1.1)} (LC 224/2025)`
        : `${fmt(receita)} × ${pc(pr.irpj)}`,
      valor: baseIr,
    })
    memoria.push({
      etapa: 'IRPJ',
      formula: `15% × base + 10% × (base − R$ 240.000,00)`,
      valor: irpj,
    })
    memoria.push({
      etapa: 'Base presumida CSLL',
      formula: exc
        ? `${fmt(ate)} × ${pc(pr.csll)} + ${fmt(exc)} × ${pc(pr.csll * 1.1)}`
        : `${fmt(receita)} × ${pc(pr.csll)}`,
      valor: baseCs,
    })
    memoria.push({ etapa: 'CSLL', formula: '9% × base', valor: csll })
    memoria.push({
      etapa: 'PIS/COFINS cumulativos',
      formula: `${fmt(receita)} × (0,65% + 3%)`,
      valor: t.PIS + t.COFINS,
    })
  } else {
    const lucro = p.lucroContabil ?? 0
    const compras = p.comprasCreditaveis ?? 0
    const { irpj, csll } = irpjCsll(lucro, lucro)
    t.IRPJ = irpj
    t.CSLL = csll
    t.PIS = Math.max(receita - compras, 0) * 0.0165
    t.COFINS = Math.max(receita - compras, 0) * 0.076
    memoria.push({
      etapa: 'Lucro real (lucro antes do IR, ajustes a confirmar no e-Lalur)',
      formula: fmt(lucro),
      valor: lucro,
    })
    memoria.push({
      etapa: 'IRPJ',
      formula: '15% × lucro + 10% × (lucro − R$ 240.000,00)',
      valor: irpj,
    })
    memoria.push({ etapa: 'CSLL', formula: '9% × lucro', valor: csll })
    memoria.push({
      etapa: 'PIS/COFINS não cumulativos',
      formula: `(${fmt(receita)} − compras com crédito ${fmt(compras)}) × (1,65% + 7,6%)`,
      valor: t.PIS + t.COFINS,
    })
  }
  memoria.push({
    etapa: 'Contribuição patronal (CPP, RAT, terceiros)',
    formula: `${fmt(folha)} × ${pc(encargo)}`,
    valor: t.INSS,
  })
  return { tributos: t, memoria, disponivel: true }
}

// ------------------------------------------------------------------ calculadoras
export interface CampoCalc {
  id: string
  rotulo: string
  tipo: 'moeda' | 'pct' | 'numero' | 'bool' | 'opcao' | 'tributo'
  opcoes?: [string, string][]
  ajuda?: string
  padrao: (ctx: Contexto) => number | string | boolean | null
}
export interface Contexto {
  perfil: Perfil
  premissas: Premissas
  atual: SituacaoAtual
  estrategia: Estrategia
}
export interface ResultadoCalc {
  memoria: LinhaMemoria[]
  efeitos: Efeito[]
  avisos: string[]
}
export interface Calculadora {
  id: string
  nome: string
  descricao: string
  campos: CampoCalc[]
  calcular: (e: Record<string, number | string | boolean | null>, ctx: Contexto) => ResultadoCalc
}

const n = (v: unknown) =>
  typeof v === 'number' && isFinite(v)
    ? v
    : typeof v === 'string' && v.trim() && !isNaN(Number(v))
      ? Number(v)
      : 0
const OPCOES_TRIBUTO: [string, string][] = [
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
  'CBS',
  'IBS',
  'IS',
  'IRRF',
  'IRPF',
  'OUTROS',
].map((t) => [t, t])
const REGIMES: [string, string][] = [
  ['simples', 'Simples Nacional'],
  ['presumido', 'Lucro Presumido'],
  ['real', 'Lucro Real'],
]
const regimeAtual = (p: Perfil) =>
  p.regime === 'simples' ? 'simples' : p.regime === 'presumido' ? 'presumido' : 'real'

/** Efeito no IRPJ/CSLL de uma variação de despesa dedutível (Lucro Real): menos despesa = mais imposto. */
function efeitoIr(
  ctx: Contexto,
  variacaoDespesa: number,
  chave: string,
  descricao: string,
): { ef: Efeito[]; mem: LinhaMemoria[] } {
  if (!ehReal(ctx.perfil) || !variacaoDespesa) return { ef: [], mem: [] }
  const m = marginalReal(ctx.perfil)
  const irpj = variacaoDespesa * m.irpj
  const csll = variacaoDespesa * m.csll
  return {
    ef: [
      { tributo: 'IRPJ', descricao, atual: 0, planejado: irpj, baseChave: chave },
      { tributo: 'CSLL', descricao, atual: 0, planejado: csll, baseChave: chave },
    ],
    mem: [
      {
        etapa: descricao,
        formula: `${fmt(variacaoDespesa)} × (${pc(m.irpj)} IRPJ + 9% CSLL)`,
        valor: -(irpj + csll),
        nota: 'Efeito sobre outros tributos',
      },
    ],
  }
}

export const CALCULADORAS: Record<string, Calculadora> = {
  regime: {
    id: 'regime',
    nome: 'Comparativo de regimes (IRPJ, CSLL, PIS/COFINS, CPP e Simples)',
    descricao:
      'Recalcula os tributos sobre receita e lucro no regime atual e no regime planejado com as mesmas bases econômicas do perfil. ICMS/ISS fora do Simples não mudam com o regime e não entram na comparação.',
    campos: [
      {
        id: 'regimePlanejado',
        rotulo: 'Regime planejado',
        tipo: 'opcao',
        opcoes: REGIMES,
        padrao: (c) => (regimeAtual(c.perfil) === 'real' ? 'presumido' : 'real'),
      },
      {
        id: 'presuncao',
        rotulo: 'Grupo de presunção (Presumido)',
        tipo: 'opcao',
        opcoes: Object.entries(PRESUNCOES).map(([k, v]) => [k, v.nome]),
        padrao: (c) =>
          c.perfil.setores.servicos && !c.perfil.setores.comercio && !c.perfil.setores.industria
            ? 'servicos'
            : 'geral',
      },
      {
        id: 'lc224',
        rotulo: 'Aplicar acréscimo da LC 224/2025 (receita acima de R$ 5 mi)',
        tipo: 'bool',
        padrao: () => true,
      },
      {
        id: 'anexo',
        rotulo: 'Anexo do Simples (se for o caso)',
        tipo: 'opcao',
        opcoes: ['I', 'II', 'III', 'IV', 'V'].map((a) => [a, 'Anexo ' + a]),
        padrao: (c) => c.perfil.anexoSimples || 'I',
      },
    ],
    calcular: (e, ctx) => {
      const avisos: string[] = []
      const p = ctx.perfil
      if (!p.receitaAnual) avisos.push('Informe a receita anual no perfil.')
      if (!p.lucroContabil && (e.regimePlanejado === 'real' || regimeAtual(p) === 'real'))
        avisos.push('Informe o lucro antes do IRPJ/CSLL para simular o Lucro Real.')
      if (p.encargoPatronal == null)
        avisos.push(
          'Informe o percentual de encargo patronal (CPP + RAT×FAP + terceiros) para comparar com o Simples.',
        )
      const opc = {
        presuncao: String(e.presuncao || 'geral'),
        lc224: e.lc224 !== false,
        anexo: String(e.anexo || 'I'),
      }
      const A = tributosNoRegime(regimeAtual(p), p, opc)
      const B = tributosNoRegime(String(e.regimePlanejado), p, opc)
      if (!B.disponivel) avisos.push('Regime planejado indisponível para a receita informada.')
      const memoria: LinhaMemoria[] = [
        {
          etapa: `CENÁRIO ATUAL — ${REGIMES.find((r) => r[0] === regimeAtual(p))?.[1]}`,
          formula: '',
          valor: null,
        },
        ...A.memoria,
        {
          etapa: `CENÁRIO PLANEJADO — ${REGIMES.find((r) => r[0] === e.regimePlanejado)?.[1]}`,
          formula: '',
          valor: null,
        },
        ...B.memoria,
      ]
      const tribs = new Set<Tributo>([
        ...Object.keys(A.tributos),
        ...Object.keys(B.tributos),
      ] as Tributo[])
      const efeitos: Efeito[] = B.disponivel
        ? [...tribs].map((t) => ({
            tributo: t,
            descricao: 'Troca de regime',
            atual: A.tributos[t] || 0,
            planejado: B.tributos[t] || 0,
            baseChave: 'regime:' + t,
          }))
        : []
      if (p.regime === 'simples' || e.regimePlanejado === 'simples')
        avisos.push(
          'No Simples, ICMS/ISS/IPI estão dentro do DAS: confira se o cenário atual de ICMS/ISS também muda.',
        )
      avisos.push(
        'A opção de regime é anual e irretratável no exercício; a partir de 2027 recalcular com CBS/IBS (PIS/COFINS extintos).',
      )
      return { memoria, efeitos, avisos }
    },
  },
  simples: {
    id: 'simples',
    nome: 'Simples Nacional: anexo / Fator R',
    descricao:
      'DAS no anexo atual × anexo planejado (ex.: V → III pelo Fator R ≥ 28%), descontando o custo integral de folha real adicional, se houver.',
    campos: [
      {
        id: 'rbt12',
        rotulo: 'Receita bruta 12 meses (RBT12)',
        tipo: 'moeda',
        padrao: (c) => c.perfil.receitaAnual,
      },
      {
        id: 'anexoAtual',
        rotulo: 'Anexo atual',
        tipo: 'opcao',
        opcoes: ['I', 'II', 'III', 'IV', 'V'].map((a) => [a, 'Anexo ' + a]),
        padrao: (c) => c.perfil.anexoSimples || 'V',
      },
      {
        id: 'anexoPlanejado',
        rotulo: 'Anexo planejado',
        tipo: 'opcao',
        opcoes: ['I', 'II', 'III', 'IV', 'V'].map((a) => [a, 'Anexo ' + a]),
        padrao: () => 'III',
      },
      {
        id: 'folha12',
        rotulo: 'Folha de salários 12 meses (com pró-labore e encargos do Fator R)',
        tipo: 'moeda',
        padrao: (c) => c.perfil.folhaAnual,
      },
      {
        id: 'folhaAdicional',
        rotulo: 'Folha real adicional necessária (genuína)',
        tipo: 'moeda',
        padrao: () => 0,
      },
      {
        id: 'encargoFolha',
        rotulo: 'Encargos sobre a folha adicional (%)',
        tipo: 'pct',
        ajuda: 'FGTS e demais custos; no Anexo III a CPP está no DAS.',
        padrao: () => 8,
      },
    ],
    calcular: (e) => {
      const rbt = n(e.rbt12)
      const A = aliquotaEfetivaSimples(String(e.anexoAtual), rbt)
      const B = aliquotaEfetivaSimples(String(e.anexoPlanejado), rbt)
      const avisos: string[] = []
      const fatorR = rbt > 0 ? (n(e.folha12) + n(e.folhaAdicional)) / rbt : 0
      if (String(e.anexoPlanejado) === 'III' && String(e.anexoAtual) === 'V' && fatorR < 0.28)
        avisos.push(`Fator R ${pc(fatorR)} abaixo de 28%: o Anexo III não se aplica.`)
      avisos.push(
        'Aumento artificial de folha não é estratégia: só folha real, com trabalho efetivo.',
      )
      if (!A || !B)
        return {
          memoria: [
            { etapa: 'RBT12', formula: 'Informe a receita (até R$ 4,8 milhões)', valor: null },
          ],
          efeitos: [],
          avisos,
        }
      const custoFolha = n(e.folhaAdicional) * (1 + n(e.encargoFolha) / 100)
      return {
        memoria: [
          {
            etapa: 'Fator R',
            formula: `(${fmt(n(e.folha12))} + ${fmt(n(e.folhaAdicional))}) ÷ ${fmt(rbt)}`,
            valor: null,
            nota: pc(fatorR),
          },
          {
            etapa: `DAS Anexo ${e.anexoAtual}`,
            formula: `${fmt(rbt)} × ${pc(A.efetiva)} (faixa ${A.faixa}: ${pc(A.nominal)} − ${fmt(A.deduzir)})`,
            valor: rbt * A.efetiva,
          },
          {
            etapa: `DAS Anexo ${e.anexoPlanejado}`,
            formula: `${fmt(rbt)} × ${pc(B.efetiva)} (faixa ${B.faixa}: ${pc(B.nominal)} − ${fmt(B.deduzir)})`,
            valor: rbt * B.efetiva,
          },
          {
            etapa: "Custo da folha adicional (lançar em 'outros impactos')",
            formula: `${fmt(n(e.folhaAdicional))} × (1 + ${pc(n(e.encargoFolha) / 100)})`,
            valor: custoFolha,
          },
        ],
        efeitos: [
          {
            tributo: 'DAS',
            descricao: 'Mudança de anexo',
            atual: rbt * A.efetiva,
            planejado: rbt * B.efetiva,
            baseChave: 'simples:das',
          },
        ],
        avisos: custoFolha
          ? [
              ...avisos,
              `Lance ${fmt(custoFolha)} em "Outros impactos econômicos" para chegar ao benefício líquido.`,
            ]
          : avisos,
      }
    },
  },
  carga: {
    id: 'carga',
    nome: 'Base × carga atual versus carga planejada',
    descricao:
      'Para mudanças de coeficiente, classificação ou enquadramento: mesma base, alíquota/carga atual e alíquota/carga correta no cenário planejado.',
    campos: [
      {
        id: 'tributo',
        rotulo: 'Tributo afetado',
        tipo: 'tributo',
        padrao: (c) =>
          (
            ({
              REGIME: 'IRPJ',
              INDÚSTRIA: 'IPI',
              SETORES: 'IS',
              FOLHA: 'INSS',
              FINANCEIRO: 'IRPJ',
            }) as Record<string, string>
          )[c.estrategia.modelo] || 'OUTROS',
      },
      {
        id: 'base',
        rotulo: 'Base tributável documentada (R$/ano)',
        tipo: 'moeda',
        padrao: () => 0,
      },
      { id: 'cargaAtual', rotulo: 'Alíquota/carga atual (%)', tipo: 'pct', padrao: () => 0 },
      {
        id: 'cargaPlanejada',
        rotulo: 'Alíquota/carga planejada (%)',
        tipo: 'pct',
        padrao: () => 0,
      },
    ],
    calcular: (e, ctx) => {
      const b = n(e.base),
        a = n(e.cargaAtual) / 100,
        p = n(e.cargaPlanejada) / 100
      const t = String(e.tributo || 'OUTROS') as Tributo
      const avisos = b
        ? []
        : ['Informe a base documentada (não usar a base ilustrativa do manual).']
      return {
        memoria: [
          { etapa: 'Cenário atual', formula: `${fmt(b)} × ${pc(a)}`, valor: b * a },
          { etapa: 'Cenário planejado', formula: `${fmt(b)} × ${pc(p)}`, valor: b * p },
          { etapa: 'Economia tributária', formula: 'atual − planejado', valor: b * (a - p) },
        ],
        efeitos: b
          ? [
              {
                tributo: t,
                descricao: ctx.estrategia.titulo,
                atual: b * a,
                planejado: b * p,
                baseChave: `carga:${t}:${ctx.estrategia.bloco}`,
              },
            ]
          : [],
        avisos,
      }
    },
  },
  'credito-piscofins': {
    id: 'credito-piscofins',
    nome: 'Crédito de PIS/COFINS não cumulativos (2026)',
    descricao:
      'Gastos documentados × parcela elegível × 9,25%, menos o que já é aproveitado. Efeito no IRPJ/CSLL: o crédito reduz o custo e aumenta o lucro tributável.',
    campos: [
      {
        id: 'gasto',
        rotulo: 'Gastos/compras documentados no ano (R$)',
        tipo: 'moeda',
        padrao: () => 0,
      },
      {
        id: 'elegivel',
        rotulo: 'Parcela elegível comprovada (%)',
        tipo: 'pct',
        ajuda: 'Essencialidade/relevância (STJ Tema 779), com laudo.',
        padrao: () => 100,
      },
      {
        id: 'jaAproveitado',
        rotulo: 'Crédito já aproveitado hoje (R$)',
        tipo: 'moeda',
        padrao: () => 0,
      },
    ],
    calcular: (e, ctx) => {
      const base = n(e.gasto) * (n(e.elegivel) / 100)
      const pis = base * 0.0165,
        cof = base * 0.076
      const ja = n(e.jaAproveitado)
      const novoPis = Math.max(pis - ja * (1.65 / 9.25), 0),
        novoCof = Math.max(cof - ja * (7.6 / 9.25), 0)
      const avisos = ehReal(ctx.perfil)
        ? []
        : ['Crédito não cumulativo exige Lucro Real: no regime atual o efeito é zero.']
      if (!ehReal(ctx.perfil))
        return {
          memoria: [{ etapa: 'Regime', formula: 'Fora do Lucro Real', valor: 0 }],
          efeitos: [],
          avisos,
        }
      const ir = efeitoIr(
        ctx,
        novoPis + novoCof,
        'piscofins:credito-ir',
        'Redução de custo pelo crédito eleva IRPJ/CSLL',
      )
      return {
        memoria: [
          {
            etapa: 'Base elegível',
            formula: `${fmt(n(e.gasto))} × ${pc(n(e.elegivel) / 100)}`,
            valor: base,
          },
          { etapa: 'Crédito PIS', formula: `${fmt(base)} × 1,65%`, valor: pis },
          { etapa: 'Crédito COFINS', formula: `${fmt(base)} × 7,6%`, valor: cof },
          { etapa: 'Menos crédito já aproveitado', formula: fmt(ja), valor: -ja },
          ...ir.mem,
        ],
        efeitos: [
          {
            tributo: 'PIS',
            descricao: 'Crédito adicional',
            atual: novoPis,
            planejado: 0,
            baseChave: `piscofins:${ctx.estrategia.numero}`,
          },
          {
            tributo: 'COFINS',
            descricao: 'Crédito adicional',
            atual: novoCof,
            planejado: 0,
            baseChave: `piscofins:${ctx.estrategia.numero}`,
          },
          ...ir.ef,
        ],
        avisos: [
          ...avisos,
          'Vale para competências de 2026; a partir de 2027 o crédito segue as regras da CBS.',
        ],
      }
    },
  },
  credito: {
    id: 'credito',
    nome: 'Crédito documental (ICMS / IPI)',
    descricao:
      'Valor dos documentos × alíquota destacada × coeficiente de apropriação. Para o CIAP use 48 parcelas (o ano recebe 12/48).',
    campos: [
      {
        id: 'tributo',
        rotulo: 'Tributo',
        tipo: 'opcao',
        opcoes: [
          ['ICMS', 'ICMS'],
          ['IPI', 'IPI'],
        ],
        padrao: (c) => (/IPI/i.test(c.estrategia.titulo) ? 'IPI' : 'ICMS'),
      },
      {
        id: 'valor',
        rotulo: 'Valor das operações/aquisições documentadas no ano (R$)',
        tipo: 'moeda',
        padrao: () => 0,
      },
      {
        id: 'aliquota',
        rotulo: 'Alíquota destacada no documento (%)',
        tipo: 'pct',
        padrao: (c) => c.perfil.aliquotaIcms,
      },
      {
        id: 'coeficiente',
        rotulo: 'Coeficiente de apropriação / saídas tributadas (%)',
        tipo: 'pct',
        padrao: () => 100,
      },
      {
        id: 'parcelas',
        rotulo: 'Parcelas de apropriação (1 = integral; 48 = CIAP)',
        tipo: 'numero',
        padrao: (c) => (c.estrategia.numero === 41 ? 48 : 1),
      },
    ],
    calcular: (e, ctx) => {
      const t = (String(e.tributo) === 'IPI' ? 'IPI' : 'ICMS') as Tributo
      const parc = Math.max(n(e.parcelas) || 1, 1)
      const destacado = n(e.valor) * (n(e.aliquota) / 100)
      const anual =
        destacado * (n(e.coeficiente) / 100) * (parc > 1 ? Math.min(12, parc) / parc : 1)
      return {
        memoria: [
          {
            etapa: 'Imposto destacado',
            formula: `${fmt(n(e.valor))} × ${pc(n(e.aliquota) / 100)}`,
            valor: destacado,
          },
          {
            etapa: 'Crédito apropriável no ano',
            formula: `${fmt(destacado)} × ${pc(n(e.coeficiente) / 100)}${parc > 1 ? ` × ${Math.min(12, parc)}/${parc}` : ''}`,
            valor: anual,
          },
        ],
        efeitos: anual
          ? [
              {
                tributo: t,
                descricao: 'Crédito adicional',
                atual: anual,
                planejado: 0,
                baseChave: `${t}:${ctx.estrategia.numero}`,
              },
            ]
          : [],
        avisos: [
          ...(n(e.aliquota) ? [] : ['Informe a alíquota da nota/lei estadual (não presumir).']),
          t === 'ICMS'
            ? 'ICMS cai a 90/80/70/60% de 2029 a 2032 e é extinto em 2033 — a projeção aplica esses fatores.'
            : 'IPI vai a zero em 2027, salvo exceções legais (ZFM): efeito projetado só em 2026.',
        ],
      }
    },
  },
  'credito-ibscbs': {
    id: 'credito-ibscbs',
    nome: 'Crédito de IBS/CBS (a partir de 2027)',
    descricao:
      'Operações com DF-e idôneo × parcela elegível × alíquota de referência (PREMISSA). Só crédito com débito efetivamente extinto.',
    campos: [
      {
        id: 'valor',
        rotulo: 'Operações documentadas por ano (R$)',
        tipo: 'moeda',
        padrao: () => 0,
      },
      { id: 'elegivel', rotulo: 'Parcela elegível (%)', tipo: 'pct', padrao: () => 100 },
      {
        id: 'jaCreditado',
        rotulo: 'Já seria creditado sem a estratégia (%)',
        tipo: 'pct',
        ajuda: 'Na não cumulatividade ampla, boa parte já gera crédito: só conta o incremento.',
        padrao: () => 0,
      },
    ],
    calcular: (e, ctx) => {
      const base = n(e.valor) * (n(e.elegivel) / 100) * (1 - n(e.jaCreditado) / 100)
      const cbs = (base * ctx.premissas.aliquotaCbs) / 100,
        ibs = (base * ctx.premissas.aliquotaIbs) / 100
      return {
        memoria: [
          {
            etapa: 'Base incremental de crédito',
            formula: `${fmt(n(e.valor))} × ${pc(n(e.elegivel) / 100)} × (1 − ${pc(n(e.jaCreditado) / 100)})`,
            valor: base,
          },
          {
            etapa: 'CBS',
            formula: `${fmt(base)} × ${ctx.premissas.aliquotaCbs}% (premissa)`,
            valor: cbs,
          },
          {
            etapa: 'IBS (alíquota cheia; a projeção aplica 10–40% de 2029 a 2032)',
            formula: `${fmt(base)} × ${ctx.premissas.aliquotaIbs}% (premissa)`,
            valor: ibs,
          },
        ],
        efeitos: base
          ? [
              {
                tributo: 'CBS',
                descricao: 'Crédito incremental',
                atual: cbs,
                planejado: 0,
                baseChave: `ibscbs:${ctx.estrategia.numero}`,
              },
              {
                tributo: 'IBS',
                descricao: 'Crédito incremental',
                atual: ibs,
                planejado: 0,
                baseChave: `ibscbs:${ctx.estrategia.numero}`,
              },
            ]
          : [],
        avisos: [
          'Alíquotas de CBS/IBS são premissas até a fixação oficial; ver aba Premissas.',
          'Separar IBS e CBS: não compensar um com o outro.',
        ],
      }
    },
  },
  'reducao-setorial': {
    id: 'reducao-setorial',
    nome: 'Redução setorial de IBS/CBS (60%, 30% ou alíquota zero)',
    descricao:
      'Receita abrangida × alíquota de referência (premissa) × redução legal. O ganho final depende de preço, crédito na cadeia e destino do consumo.',
    campos: [
      {
        id: 'receita',
        rotulo: 'Receita das operações abrangidas (R$/ano)',
        tipo: 'moeda',
        padrao: () => 0,
      },
      {
        id: 'reducao',
        rotulo: 'Redução legal (%)',
        tipo: 'pct',
        padrao: (c) =>
          /zero/i.test(c.estrategia.titulo)
            ? 100
            : /30%/.test(c.estrategia.titulo)
              ? 30
              : /60%/.test(c.estrategia.titulo)
                ? 60
                : 0,
      },
      { id: 'jaConsiderada', rotulo: 'Redução já aplicada hoje (%)', tipo: 'pct', padrao: () => 0 },
    ],
    calcular: (e, ctx) => {
      const rec = n(e.receita),
        red = n(e.reducao) / 100,
        ja = n(e.jaConsiderada) / 100
      const cbsA = ((rec * ctx.premissas.aliquotaCbs) / 100) * (1 - ja),
        ibsA = ((rec * ctx.premissas.aliquotaIbs) / 100) * (1 - ja)
      const cbsB = ((rec * ctx.premissas.aliquotaCbs) / 100) * (1 - Math.max(red, ja)),
        ibsB = ((rec * ctx.premissas.aliquotaIbs) / 100) * (1 - Math.max(red, ja))
      return {
        memoria: [
          {
            etapa: 'Débito sem a redução',
            formula: `${fmt(rec)} × (${ctx.premissas.aliquotaCbs}% + ${ctx.premissas.aliquotaIbs}%) × (1 − ${pc(ja)})`,
            valor: cbsA + ibsA,
          },
          {
            etapa: 'Débito com a redução',
            formula: `${fmt(rec)} × (${ctx.premissas.aliquotaCbs}% + ${ctx.premissas.aliquotaIbs}%) × (1 − ${pc(Math.max(red, ja))})`,
            valor: cbsB + ibsB,
          },
        ],
        efeitos: rec
          ? [
              {
                tributo: 'CBS',
                descricao: 'Redução setorial',
                atual: cbsA,
                planejado: cbsB,
                baseChave: 'setorial:receita',
              },
              {
                tributo: 'IBS',
                descricao: 'Redução setorial',
                atual: ibsA,
                planejado: ibsB,
                baseChave: 'setorial:receita',
              },
            ]
          : [],
        avisos: [
          'Somente itens listados nos anexos da LC 214/2025, com classificação correta (NCM/NBS/cClassTrib).',
          'Alíquotas de referência são premissas.',
        ],
      }
    },
  },
  folha: {
    id: 'folha',
    nome: 'Folha e benefícios: encargos atuais × planejados',
    descricao:
      'Mesma verba anual; encargos (CPP, RAT×FAP, terceiros, FGTS) no formato atual e no formato planejado. Se a despesa é dedutível nos dois cenários, a economia de encargos aumenta o IRPJ/CSLL (escudo menor) — o sistema desconta.',
    campos: [
      {
        id: 'valor',
        rotulo: 'Valor anual da verba/benefício (R$)',
        tipo: 'moeda',
        padrao: () => 0,
      },
      {
        id: 'encargoAtual',
        rotulo: 'Encargos no formato atual (%)',
        tipo: 'pct',
        ajuda: 'CPP 20% + RAT×FAP + terceiros + FGTS 8% (conferir FPAS e FAP).',
        padrao: (c) => (c.perfil.encargoPatronal != null ? r2(c.perfil.encargoPatronal + 8) : null),
      },
      {
        id: 'encargoPlanejado',
        rotulo: 'Encargos no formato planejado (%)',
        tipo: 'pct',
        padrao: () => 0,
      },
      {
        id: 'dedutivel',
        rotulo: 'Dedutível do IRPJ/CSLL nos dois cenários',
        tipo: 'bool',
        padrao: () => true,
      },
    ],
    calcular: (e, ctx) => {
      const v = n(e.valor),
        a = n(e.encargoAtual) / 100,
        b = n(e.encargoPlanejado) / 100
      const enc = ctx.perfil.encargoPatronal ?? 0
      const fracInss = a > 0 ? Math.min(enc / 100, a) / a : 0
      const encA = v * a,
        encB = v * b
      const ir = e.dedutivel
        ? efeitoIr(
            ctx,
            encA - encB,
            'folha:ir',
            'Escudo de IRPJ/CSLL menor (despesa de encargos menor)',
          )
        : { ef: [], mem: [] }
      return {
        memoria: [
          { etapa: 'Encargos no formato atual', formula: `${fmt(v)} × ${pc(a)}`, valor: encA },
          { etapa: 'Encargos no formato planejado', formula: `${fmt(v)} × ${pc(b)}`, valor: encB },
          ...ir.mem,
        ],
        efeitos: v
          ? [
              {
                tributo: 'INSS',
                descricao: 'Encargos previdenciários',
                atual: encA * fracInss,
                planejado: encB * fracInss,
                baseChave: `folha:${ctx.estrategia.numero}`,
              },
              {
                tributo: 'FGTS',
                descricao: 'FGTS',
                atual: encA * (1 - fracInss),
                planejado: encB * (1 - fracInss),
                baseChave: `folha:${ctx.estrategia.numero}`,
              },
              ...ir.ef,
            ]
          : [],
        avisos: [
          'Não trocar salário devido por rótulo não salarial; natureza decorre da realidade (CLT arts. 9, 457 e 458).',
          'IRRF do empregado é questão autônoma e não entra como economia da empresa.',
        ],
      }
    },
  },
  'deducao-ir': {
    id: 'deducao-ir',
    nome: 'Dedução/exclusão no Lucro Real (escudo de IRPJ/CSLL)',
    descricao:
      'Valor da despesa ou exclusão × alíquota marginal (IRPJ 15% + adicional 10% + CSLL 9%). Se a alternativa também é dedutível, a economia incremental é zero.',
    campos: [
      {
        id: 'valor',
        rotulo: 'Despesa/exclusão adicional no ano (R$)',
        tipo: 'moeda',
        padrao: () => 0,
      },
      {
        id: 'afetaCsll',
        rotulo: 'Também reduz a base da CSLL',
        tipo: 'bool',
        padrao: (c) => !/Lei do Bem|cultura|infancia|idosa|esporte/i.test(c.estrategia.titulo),
      },
      {
        id: 'alternativaDedutivel',
        rotulo: 'A alternativa comparada já seria dedutível',
        tipo: 'bool',
        padrao: () => false,
      },
    ],
    calcular: (e, ctx) => {
      const avisos: string[] = []
      if (!ehReal(ctx.perfil))
        return {
          memoria: [{ etapa: 'Regime', formula: 'Fora do Lucro Real: sem escudo', valor: 0 }],
          efeitos: [],
          avisos: ['Só gera efeito no Lucro Real.'],
        }
      if ((ctx.perfil.lucroContabil ?? 0) <= 0)
        avisos.push('Sem lucro tributável o benefício vira prejuízo fiscal (sem caixa no ano).')
      const v = e.alternativaDedutivel
        ? 0
        : Math.min(n(e.valor), Math.max(ctx.perfil.lucroContabil ?? 0, 0))
      const m = marginalReal(ctx.perfil)
      const irpj = v * m.irpj,
        csll = e.afetaCsll ? v * m.csll : 0
      return {
        memoria: [
          {
            etapa: 'Valor considerado (limitado ao lucro)',
            formula: e.alternativaDedutivel ? 'Alternativa já dedutível: incremento zero' : fmt(v),
            valor: v,
          },
          { etapa: 'IRPJ', formula: `${fmt(v)} × ${pc(m.irpj)}`, valor: irpj },
          {
            etapa: 'CSLL',
            formula: e.afetaCsll ? `${fmt(v)} × 9%` : 'não afeta a CSLL',
            valor: csll,
          },
        ],
        efeitos: v
          ? [
              {
                tributo: 'IRPJ',
                descricao: 'Escudo fiscal',
                atual: irpj,
                planejado: 0,
                baseChave: 'ir:lucro:' + ctx.estrategia.numero,
              },
              ...(csll
                ? [
                    {
                      tributo: 'CSLL' as Tributo,
                      descricao: 'Escudo fiscal',
                      atual: csll,
                      planejado: 0,
                      baseChave: 'ir:lucro:' + ctx.estrategia.numero,
                    },
                  ]
                : []),
            ]
          : [],
        avisos,
      }
    },
  },
  jcp: {
    id: 'jcp',
    nome: 'Juros sobre capital próprio',
    descricao:
      'JCP dedutível (limitado por TJLP × PL e 50% do lucro/lucros acumulados) × 34%, menos o IRRF do beneficiário (premissa).',
    campos: [
      { id: 'pl', rotulo: 'Patrimônio líquido ajustado (R$)', tipo: 'moeda', padrao: () => 0 },
      { id: 'tjlp', rotulo: 'TJLP do período (% a.a.)', tipo: 'pct', padrao: () => 0 },
      {
        id: 'limiteLucro',
        rotulo: 'Limite: 50% do lucro do período ou de lucros acumulados (R$)',
        tipo: 'moeda',
        padrao: (c) => (c.perfil.lucroContabil ? r2(c.perfil.lucroContabil * 0.5) : 0),
      },
    ],
    calcular: (e, ctx) => {
      const bruto = (n(e.pl) * n(e.tjlp)) / 100
      const jcp = Math.min(bruto, n(e.limiteLucro) || bruto)
      const m = marginalReal(ctx.perfil)
      const irrf = (jcp * ctx.premissas.aliquotaJcpIrrf) / 100
      const avisos = ehReal(ctx.perfil) ? [] : ['JCP só é dedutível no Lucro Real.']
      if (!n(e.tjlp)) avisos.push('Informe a TJLP oficial do período.')
      return {
        memoria: [
          {
            etapa: 'JCP pela TJLP',
            formula: `${fmt(n(e.pl))} × ${pc(n(e.tjlp) / 100)}`,
            valor: bruto,
          },
          {
            etapa: 'JCP dedutível (menor entre TJLP e limite de lucros)',
            formula: `mín(${fmt(bruto)}; ${fmt(n(e.limiteLucro))})`,
            valor: jcp,
          },
          {
            etapa: 'Escudo IRPJ + CSLL',
            formula: `${fmt(jcp)} × (${pc(m.irpj)} + 9%)`,
            valor: jcp * (m.irpj + m.csll),
          },
          {
            etapa: 'IRRF na fonte sobre o JCP (custo do beneficiário)',
            formula: `${fmt(jcp)} × ${ctx.premissas.aliquotaJcpIrrf}% (premissa)`,
            valor: irrf,
          },
        ],
        efeitos:
          ehReal(ctx.perfil) && jcp
            ? [
                {
                  tributo: 'IRPJ',
                  descricao: 'Dedução do JCP',
                  atual: jcp * m.irpj,
                  planejado: 0,
                  baseChave: 'ir:lucro:jcp',
                },
                {
                  tributo: 'CSLL',
                  descricao: 'Dedução do JCP',
                  atual: jcp * m.csll,
                  planejado: 0,
                  baseChave: 'ir:lucro:jcp',
                },
                {
                  tributo: 'IRRF',
                  descricao: 'IRRF sobre JCP pago',
                  atual: 0,
                  planejado: irrf,
                  baseChave: 'ir:jcp:irrf',
                },
              ]
            : [],
        avisos,
      }
    },
  },
  prejuizo: {
    id: 'prejuizo',
    nome: 'Compensação de prejuízo fiscal / base negativa (trava de 30%)',
    descricao:
      'Mínimo entre o saldo autêntico da ECF e 30% do lucro ajustado, × IRPJ marginal e × CSLL 9%.',
    campos: [
      {
        id: 'lucro',
        rotulo: 'Lucro ajustado do exercício (R$)',
        tipo: 'moeda',
        padrao: (c) => c.perfil.lucroContabil,
      },
      {
        id: 'saldo',
        rotulo: 'Saldo de prejuízo/base negativa (R$)',
        tipo: 'moeda',
        padrao: (c) => c.perfil.prejuizoFiscal,
      },
      {
        id: 'jaCompensado',
        rotulo: 'Já compensado hoje no exercício (R$)',
        tipo: 'moeda',
        padrao: () => 0,
      },
    ],
    calcular: (e, ctx) => {
      const lim = Math.max(n(e.lucro), 0) * 0.3
      const comp = Math.max(Math.min(n(e.saldo), lim) - n(e.jaCompensado), 0)
      const m = marginalReal(ctx.perfil)
      return {
        memoria: [
          { etapa: 'Trava de 30%', formula: `${fmt(n(e.lucro))} × 30%`, valor: lim },
          {
            etapa: 'Compensação adicional',
            formula: `mín(${fmt(n(e.saldo))}; ${fmt(lim)}) − ${fmt(n(e.jaCompensado))}`,
            valor: comp,
          },
          { etapa: 'IRPJ', formula: `${fmt(comp)} × ${pc(m.irpj)}`, valor: comp * m.irpj },
          { etapa: 'CSLL', formula: `${fmt(comp)} × 9%`, valor: comp * 0.09 },
        ],
        efeitos: comp
          ? [
              {
                tributo: 'IRPJ',
                descricao: 'Compensação',
                atual: comp * m.irpj,
                planejado: 0,
                baseChave: 'ir:compensacao',
              },
              {
                tributo: 'CSLL',
                descricao: 'Compensação',
                atual: comp * 0.09,
                planejado: 0,
                baseChave: 'ir:compensacao',
              },
            ]
          : [],
        avisos: [
          'Saldo remanescente continua para os exercícios seguintes; usar só saldo controlado na ECF/e-Lalur.',
        ],
      }
    },
  },
  transacao: {
    id: 'transacao',
    nome: 'Negociação de passivo (transação/parcelamento)',
    descricao:
      'Passivo elegível × desconto do edital/proposta. Efeito único (não recorrente), condicionado ao deferimento.',
    campos: [
      {
        id: 'passivo',
        rotulo: 'Passivo elegível (R$)',
        tipo: 'moeda',
        padrao: (c) => c.perfil.passivoTributario,
      },
      {
        id: 'desconto',
        rotulo: 'Desconto previsto no edital/proposta (%)',
        tipo: 'pct',
        padrao: () => 0,
      },
      {
        id: 'custoFinanceiro',
        rotulo: 'Custo financeiro adicional do parcelamento (R$)',
        tipo: 'moeda',
        padrao: () => 0,
      },
    ],
    calcular: (e) => {
      const desc = (n(e.passivo) * n(e.desconto)) / 100
      return {
        memoria: [
          {
            etapa: 'Desconto',
            formula: `${fmt(n(e.passivo))} × ${pc(n(e.desconto) / 100)}`,
            valor: desc,
          },
          {
            etapa: 'Custo financeiro (lançar em outros impactos)',
            formula: fmt(n(e.custoFinanceiro)),
            valor: n(e.custoFinanceiro),
          },
        ],
        efeitos: desc
          ? [
              {
                tributo: 'OUTROS',
                descricao: 'Desconto na negociação do passivo',
                atual: desc,
                planejado: 0,
                baseChave: 'passivo',
              },
            ]
          : [],
        avisos: [
          'Efeito único: marque a estratégia como não recorrente.',
          'Depende de CAPAG, edital e aceite formal (PGFN/Estado).',
        ],
      }
    },
  },
  holding: {
    id: 'holding',
    nome: 'Aluguéis na pessoa física × holding (Lucro Presumido)',
    descricao:
      'IRPF dos aluguéis na PF × IRPJ/CSLL/PIS/COFINS da holding no Presumido (32%), mais IRRF de dividendos acima do limite mensal (premissa).',
    campos: [
      { id: 'alugueis', rotulo: 'Aluguéis recebidos por ano (R$)', tipo: 'moeda', padrao: () => 0 },
      {
        id: 'irpf',
        rotulo: 'Alíquota efetiva do IRPF atual (%)',
        tipo: 'pct',
        ajuda: 'Calcular pela declaração do sócio (não usar 27,5% cheio sem conferir).',
        padrao: () => 0,
      },
      {
        id: 'irrfDividendos',
        rotulo: 'IRRF sobre dividendos distribuídos (%)',
        tipo: 'pct',
        ajuda: 'Lei 15.270/2025: retenção acima de R$ 50 mil/mês por PJ.',
        padrao: () => 0,
      },
      {
        id: 'custoAnual',
        rotulo: 'Custo anual da holding (contabilidade, taxas) — lançar em manutenção',
        tipo: 'moeda',
        padrao: () => 0,
      },
    ],
    calcular: (e) => {
      const a = n(e.alugueis)
      const pf = (a * n(e.irpf)) / 100
      const base = a * 0.32
      const irpj = base * 0.15 + Math.max(base - ADICIONAL_LIMITE, 0) * 0.1,
        csll = base * 0.09,
        pis = a * 0.0065,
        cof = a * 0.03
      const lucroDist = a - irpj - csll - pis - cof
      const div = (lucroDist * n(e.irrfDividendos)) / 100
      return {
        memoria: [
          {
            etapa: 'IRPF na pessoa física',
            formula: `${fmt(a)} × ${pc(n(e.irpf) / 100)}`,
            valor: pf,
          },
          {
            etapa: 'IRPJ holding',
            formula: `${fmt(a)} × 32% × 15% (+10% acima de R$ 240 mil)`,
            valor: irpj,
          },
          { etapa: 'CSLL holding', formula: `${fmt(a)} × 32% × 9%`, valor: csll },
          { etapa: 'PIS/COFINS cumulativos', formula: `${fmt(a)} × 3,65%`, valor: pis + cof },
          {
            etapa: 'IRRF sobre dividendos',
            formula: `${fmt(lucroDist)} × ${pc(n(e.irrfDividendos) / 100)}`,
            valor: div,
          },
        ],
        efeitos: a
          ? [
              {
                tributo: 'IRPF',
                descricao: 'IRPF dos aluguéis',
                atual: pf,
                planejado: 0,
                baseChave: 'holding',
              },
              {
                tributo: 'IRPJ',
                descricao: 'Holding',
                atual: 0,
                planejado: irpj,
                baseChave: 'holding',
              },
              {
                tributo: 'CSLL',
                descricao: 'Holding',
                atual: 0,
                planejado: csll,
                baseChave: 'holding',
              },
              {
                tributo: 'PIS',
                descricao: 'Holding',
                atual: 0,
                planejado: pis,
                baseChave: 'holding',
              },
              {
                tributo: 'COFINS',
                descricao: 'Holding',
                atual: 0,
                planejado: cof,
                baseChave: 'holding',
              },
              {
                tributo: 'IRRF',
                descricao: 'Dividendos',
                atual: 0,
                planejado: div,
                baseChave: 'holding',
              },
            ]
          : [],
        avisos: [
          'ITBI na integralização, IBS/CBS sobre locação a partir de 2027 (regime específico) e sucessão devem ser avaliados à parte.',
          'PIS/COFINS da holding viram CBS/IBS a partir de 2027.',
        ],
      }
    },
  },
  generico: {
    id: 'generico',
    nome: 'Lançamento direto por tributo',
    descricao:
      'Para estratégias de conformidade ou sem fórmula padrão: informe, por tributo, o valor atual e o valor planejado com a memória nas premissas.',
    campos: [],
    calcular: () => ({
      memoria: [],
      efeitos: [],
      avisos: ['Use as linhas por tributo abaixo e descreva a memória nas premissas.'],
    }),
  },
}

/** Calculadora padrão de cada estratégia (modelo do manual + exceções). */
export function calculadoraPadrao(e: Estrategia): string {
  const n = e.numero
  const mapa: Record<number, string> = {
    1: 'regime',
    2: 'carga',
    3: 'carga',
    4: 'regime',
    7: 'simples',
    8: 'simples',
    41: 'credito',
    55: 'credito',
    56: 'credito',
    59: 'credito',
    94: 'credito-ibscbs',
    95: 'folha',
    136: 'carga',
    137: 'carga',
    138: 'carga',
    140: 'carga',
    141: 'jcp',
    142: 'prejuizo',
    143: 'prejuizo',
    176: 'transacao',
    177: 'transacao',
    178: 'transacao',
    179: 'transacao',
    181: 'holding',
  }
  if (mapa[n]) return mapa[n]
  switch (e.modelo) {
    case 'PIS':
      return 'credito-piscofins'
    case 'ICMS':
      return 'credito'
    case 'IBS':
      return (n >= 63 && n <= 71) || n === 79 || n === 80 ? 'credito-ibscbs' : 'generico'
    case 'SETORES':
      return n <= 93 ? 'reducao-setorial' : n >= 98 ? 'carga' : 'generico'
    case 'INDÚSTRIA':
      return 'carga'
    case 'FOLHA':
      return 'folha'
    case 'IR':
      return 'deducao-ir'
    case 'REGIME':
      return 'carga'
    default:
      return 'generico'
  }
}

export function novaAnalise(e: Estrategia, ctx: Omit<Contexto, 'estrategia'>): AnaliseEstrategia {
  const calc = CALCULADORAS[calculadoraPadrao(e)]
  const c = { ...ctx, estrategia: e }
  const entradas: AnaliseEstrategia['entradas'] = {}
  for (const campo of calc.campos) entradas[campo.id] = campo.padrao(c)
  const ibs = e.modelo === 'IBS' || (e.modelo === 'SETORES' && e.numero <= 97)
  return {
    numero: e.numero,
    situacao: null,
    etapa: 'identificada',
    calculadora: calc.id,
    entradas,
    linhasExtras: [],
    custoImplantacao: 0,
    custoManutencao: 0,
    outrosImpactos: 0,
    recorrente: !['transacao'].includes(calc.id),
    anoInicio: ibs ? 2027 : ctx.premissas.anoBase,
    grauRisco: e.risco === 'alto' ? 'alto' : e.risco === 'medio-alto' ? 'medio' : 'medio',
    justificativaRisco: e.riscoTexto,
    aplicacaoCliente: '',
    premissas: '',
    documentosPendentes: e.evidencias,
    responsavel: '',
    aprovador: '',
    prazo: '',
    economiaRealizada: 0,
    notas: '',
    atualizadoEm: new Date().toISOString(),
  }
}

export interface Avaliacao {
  memoria: LinhaMemoria[]
  efeitos: Efeito[]
  avisos: string[]
  economiaTributaria: number // Σ (atual − planejado), todos os tributos (pode ser negativa)
  custosAnuais: number // manutenção + outros impactos
  beneficioLiquidoAno1: number // economia − custos anuais − implantação
  beneficioLiquidoRecorrente: number
  porTributo: Partial<Record<Tributo, number>>
}

export function avaliar(a: AnaliseEstrategia, ctx: Contexto): Avaliacao {
  const calc = CALCULADORAS[a.calculadora] || CALCULADORAS.generico
  let res: ResultadoCalc
  try {
    res = calc.calcular(a.entradas || {}, ctx)
  } catch (err) {
    res = { memoria: [], efeitos: [], avisos: ['Erro no cálculo: ' + (err as Error).message] }
  }
  const extras: Efeito[] = (a.linhasExtras || []).map((l: LinhaEfeito) => ({
    ...l,
    atual: n(l.atual),
    planejado: n(l.planejado),
    baseChave: l.baseChave || `manual:${a.numero}:${l.tributo}`,
  }))
  const efeitos = [...res.efeitos, ...extras]
  const porTributo: Partial<Record<Tributo, number>> = {}
  for (const ef of efeitos)
    porTributo[ef.tributo] = (porTributo[ef.tributo] || 0) + (ef.atual - ef.planejado)
  const economia = efeitos.reduce((s, ef) => s + ef.atual - ef.planejado, 0)
  const custos = n(a.custoManutencao) + n(a.outrosImpactos)
  return {
    memoria: res.memoria,
    efeitos,
    avisos: res.avisos,
    economiaTributaria: economia,
    custosAnuais: custos,
    beneficioLiquidoAno1: economia - custos - n(a.custoImplantacao),
    beneficioLiquidoRecorrente: economia - custos,
    porTributo,
  }
}

// ------------------------------------------------------------------ consolidação sem dupla contagem
export const ETAPAS_CONSOLIDADAS = ['recomendada', 'aprovada', 'implementada', 'realizada']

export interface ItemConsolidado {
  numero: number
  titulo: string
  economiaBruta: number
  economiaConsiderada: number
  porTributo: Partial<Record<Tributo, number>>
  custosAnuais: number
  custoImplantacao: number
  recorrente: boolean
  anoInicio: number
  notas: string[]
}
export interface Consolidacao {
  itens: ItemConsolidado[]
  porTributo: Partial<Record<Tributo, { atual: number; economia: number; planejado: number }>>
  economiaTributaria: number
  custosAnuais: number
  custoImplantacao: number
  beneficioLiquido: number // ano cheio recorrente − implantação
  avisos: string[]
}

/**
 * Regras: (1) mesma base (tributo + baseChave) em duas estratégias → conta só a maior; (2) a economia de um tributo
 * não passa do valor pago hoje (exceto CBS/IBS/IS, que ainda não têm histórico); (3) troca de regime exige recalcular
 * as demais estratégias de IRPJ/CSLL/PIS/COFINS no novo regime (aviso).
 */
export function consolidar(
  pl: Planejamento,
  estrategias: Map<number, Estrategia>,
  filtro?: (a: AnaliseEstrategia) => boolean,
): Consolidacao {
  const incluir = filtro || ((a: AnaliseEstrategia) => ETAPAS_CONSOLIDADAS.includes(a.etapa))
  const sel = Object.values(pl.analises || {}).filter(
    (a) => incluir(a) && estrategias.has(a.numero),
  )
  const avisos: string[] = []
  const avals = sel.map((a) => ({
    a,
    e: estrategias.get(a.numero)!,
    av: avaliar(a, {
      perfil: pl.perfil,
      premissas: pl.premissas,
      atual: pl.atual,
      estrategia: estrategias.get(a.numero)!,
    }),
  }))
  // (1) sobreposição por base
  const melhor = new Map<string, { numero: number; valor: number }>()
  for (const { a, av } of avals) {
    const porChave = new Map<string, number>()
    for (const ef of av.efeitos)
      porChave.set(
        ef.tributo + '|' + ef.baseChave,
        (porChave.get(ef.tributo + '|' + ef.baseChave) || 0) + ef.atual - ef.planejado,
      )
    for (const [k, v] of porChave) {
      const m = melhor.get(k)
      if (!m || v > m.valor) melhor.set(k, { numero: a.numero, valor: v })
    }
  }
  const itens: ItemConsolidado[] = avals.map(({ a, e, av }) => {
    const notas: string[] = []
    const porTributo: Partial<Record<Tributo, number>> = {}
    const porChave = new Map<string, { tributo: Tributo; v: number }>()
    for (const ef of av.efeitos) {
      const k = ef.tributo + '|' + ef.baseChave
      const x = porChave.get(k) || { tributo: ef.tributo, v: 0 }
      x.v += ef.atual - ef.planejado
      porChave.set(k, x)
    }
    for (const [k, x] of porChave) {
      const m = melhor.get(k)!
      if (m.numero !== a.numero && x.v > 0) {
        notas.push(
          `${x.tributo}: mesma base da estratégia ${String(m.numero).padStart(3, '0')} — não somado.`,
        )
        continue
      }
      porTributo[x.tributo] = (porTributo[x.tributo] || 0) + x.v
    }
    const considerada = Object.values(porTributo).reduce((s, v) => s + (v || 0), 0)
    return {
      numero: a.numero,
      titulo: e.titulo,
      economiaBruta: av.economiaTributaria,
      economiaConsiderada: considerada,
      porTributo,
      custosAnuais: av.custosAnuais,
      custoImplantacao: n(a.custoImplantacao),
      recorrente: a.recorrente,
      anoInicio: a.anoInicio || pl.premissas.anoBase,
      notas,
    }
  })
  // (2) teto por tributo
  const porTributo: Consolidacao['porTributo'] = {}
  const somaT: Partial<Record<Tributo, number>> = {}
  for (const it of itens)
    for (const [t, v] of Object.entries(it.porTributo))
      somaT[t as Tributo] = (somaT[t as Tributo] || 0) + (v || 0)
  for (const [t, eco] of Object.entries(somaT) as [Tributo, number][]) {
    const atual = pl.atual.valores[t] ?? 0
    let economia = eco
    if (!['CBS', 'IBS', 'IS', 'IRPF', 'OUTROS'].includes(t) && atual > 0 && eco > atual) {
      avisos.push(
        `${t}: economia somada (${fmt(eco)}) maior que o pago hoje (${fmt(atual)}) — limitada ao valor atual, proporcionalmente.`,
      )
      const fator = atual / eco
      for (const it of itens)
        if ((it.porTributo[t] || 0) > 0) {
          it.porTributo[t] = (it.porTributo[t] || 0) * fator
          it.notas.push(`${t} reduzido proporcionalmente (teto do tributo pago).`)
        }
      economia = atual
    }
    porTributo[t] = { atual, economia, planejado: atual - economia }
  }
  for (const it of itens)
    it.economiaConsiderada = Object.values(it.porTributo).reduce((s, v) => s + (v || 0), 0)
  // (3) troca de regime
  const regime = avals.filter(({ a }) => a.calculadora === 'regime' || a.calculadora === 'simples')
  if (regime.length > 1)
    avisos.push(
      'Mais de uma estratégia de regime incluída: escolha uma (os regimes são alternativos).',
    )
  if (
    regime.length &&
    avals.some(({ a }) =>
      ['deducao-ir', 'jcp', 'prejuizo', 'credito-piscofins'].includes(a.calculadora),
    )
  )
    avisos.push(
      'Há troca de regime e estratégias de IRPJ/CSLL/PIS/COFINS calculadas no regime atual: recalcule-as no regime planejado.',
    )
  const economia = itens.reduce((s, i) => s + i.economiaConsiderada, 0)
  const custos = itens.reduce((s, i) => s + i.custosAnuais, 0)
  const impl = itens.reduce((s, i) => s + i.custoImplantacao, 0)
  return {
    itens,
    porTributo,
    economiaTributaria: economia,
    custosAnuais: custos,
    custoImplantacao: impl,
    beneficioLiquido: economia - custos - impl,
    avisos,
  }
}

// ------------------------------------------------------------------ projeção 2026–2033
/** Fator de existência de cada tributo por ano (EC 132/2023, LC 214/2025; cronograma RFB). */
export function fatorTributo(t: Tributo, ano: number): number {
  const antigo: Record<number, number> = {
    2026: 1,
    2027: 1,
    2028: 1,
    2029: 0.9,
    2030: 0.8,
    2031: 0.7,
    2032: 0.6,
    2033: 0,
  }
  const ibs: Record<number, number> = {
    2026: 0,
    2027: 0,
    2028: 0,
    2029: 0.1,
    2030: 0.2,
    2031: 0.3,
    2032: 0.4,
    2033: 1,
  }
  switch (t) {
    case 'PIS':
    case 'COFINS':
    case 'IPI':
      return ano <= 2026 ? 1 : 0
    case 'ICMS':
    case 'ISS':
      return antigo[ano] ?? 0
    case 'CBS':
    case 'IS':
      return ano >= 2027 ? 1 : 0
    case 'IBS':
      return ibs[ano] ?? 1
    default:
      return 1
  }
}

export interface AnoProjecao {
  ano: number
  referencia: number // tributos atuais ou de referência
  planejado: number
  economia: number
  custos: number
  beneficioLiquido: number
  porTributo: Partial<Record<Tributo, { referencia: number; economia: number }>>
  sensibilidade: { menor: number; maior: number }
  nota: string
}

const NOTA_ANO: Record<number, string> = {
  2026: 'Ano de teste: CBS 0,9% e IBS 0,1% compensáveis; PIS/COFINS, ICMS, ISS e IPI normais.',
  2027: 'CBS cobrada; PIS/COFINS extintos; IPI a zero (exceções); início do Imposto Seletivo; IBS 0,1%.',
  2028: 'CBS no modelo novo; IBS ainda em teste.',
  2029: 'ICMS/ISS a 90%; IBS a 10% da referência.',
  2030: 'ICMS/ISS a 80%; IBS a 20%.',
  2031: 'ICMS/ISS a 70%; IBS a 30%.',
  2032: 'ICMS/ISS a 60%; IBS a 40%; conciliar saldos legados.',
  2033: 'ICMS/ISS extintos; IBS/CBS integrais.',
}

export function projetar(
  pl: Planejamento,
  cons: Consolidacao,
): { anos: AnoProjecao[]; avisos: string[] } {
  const p = pl.perfil,
    pr = pl.premissas,
    v = pl.atual.valores
  const g = (pr.crescimentoReceita || 0) / 100
  const avisos: string[] = []
  const simples = p.regime === 'simples'
  const receita = p.receitaAnual ?? 0,
    compras = p.comprasCreditaveis ?? 0
  if (!simples && !receita)
    avisos.push(
      'Sem receita anual no perfil: CBS/IBS de referência de 2027 em diante não podem ser estimados.',
    )
  avisos.push(
    `CBS ${pr.aliquotaCbs}% e IBS ${pr.aliquotaIbs}% são PREMISSAS (referência ainda não fixada oficialmente); sensibilidade de ±${pr.sensibilidade} p.p.`,
  )
  const consumoBase = Math.max(receita - compras, 0)
  const anos = ANOS.map((ano) => {
    const k = Math.pow(1 + g, ano - pl.atual.anoReferencia)
    const porTributo: AnoProjecao['porTributo'] = {}
    const add = (t: Tributo, ref: number) => {
      porTributo[t] = { referencia: ref, economia: 0 }
    }
    for (const t of [
      'IRPJ',
      'CSLL',
      'INSS',
      'FGTS',
      'IRRF',
      'OUTROS',
      'DAS',
      'PIS',
      'COFINS',
      'IPI',
      'ICMS',
      'ISS',
      'IS',
    ] as Tributo[]) {
      const base = v[t] ?? 0
      if (!base) continue
      if (t === 'IS') {
        add(t, ano >= 2027 ? base * k : 0)
        continue
      }
      add(t, base * k * fatorTributo(t, ano))
    }
    if (!simples && consumoBase > 0) {
      add('CBS', ano >= 2027 ? ((consumoBase * pr.aliquotaCbs) / 100) * k : 0)
      add('IBS', ((consumoBase * pr.aliquotaIbs) / 100) * fatorTributo('IBS', ano) * k)
    }
    let economia = 0,
      custos = 0
    for (const it of cons.itens) {
      if (ano < it.anoInicio) continue
      custos += it.custosAnuais + (ano === it.anoInicio ? it.custoImplantacao : 0)
      if (!it.recorrente && ano !== it.anoInicio) continue
      for (const [t, val] of Object.entries(it.porTributo) as [Tributo, number][]) {
        const e =
          (val || 0) *
          fatorTributo(t, ano) *
          (it.recorrente ? Math.pow(1 + g, ano - it.anoInicio) : 1)
        if (!e) continue
        economia += e
        porTributo[t] = porTributo[t] || { referencia: 0, economia: 0 }
        porTributo[t]!.economia += e
      }
    }
    const referencia = Object.values(porTributo).reduce((s, x) => s + (x?.referencia || 0), 0)
    const consumo = (porTributo.CBS?.referencia || 0) + (porTributo.IBS?.referencia || 0)
    const somaAliq = pr.aliquotaCbs + pr.aliquotaIbs
    const delta = somaAliq > 0 ? consumo * (pr.sensibilidade / somaAliq) : 0
    return {
      ano,
      referencia: r2(referencia),
      planejado: r2(referencia - economia),
      economia: r2(economia),
      custos: r2(custos),
      beneficioLiquido: r2(economia - custos),
      porTributo,
      sensibilidade: { menor: r2(referencia - delta), maior: r2(referencia + delta) },
      nota: NOTA_ANO[ano],
    }
  })
  if (simples)
    avisos.push(
      'Optante pelo Simples: IBS/CBS ficam dentro do DAS (a opção pelo regime regular a partir de 2027 é a estratégia 012).',
    )
  return { anos, avisos }
}

export const fmtMoeda = fmt
export const fmtPct = pc
