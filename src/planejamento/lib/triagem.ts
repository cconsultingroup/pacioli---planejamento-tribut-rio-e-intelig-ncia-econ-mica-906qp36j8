// Triagem automática das 200 estratégias a partir do perfil da empresa.
// É uma SUGESTÃO: a situação final é sempre decidida pela equipe (Aplicável exige requisitos demonstrados em documento).
import type { Estrategia, Perfil, Situacao } from './tipos'

/** Características derivadas do perfil. true/false = conhecido; null = não informado. */
type Marca =
  | 'SIMPLES'
  | 'PRESUMIDO'
  | 'REAL'
  | 'NAO_SIMPLES'
  | 'CPP'
  | 'INDUSTRIA'
  | 'COMERCIO'
  | 'SERVICOS'
  | 'TRANSPORTE'
  | 'CONSTRUCAO'
  | 'SAUDE'
  | 'EDUCACAO'
  | 'AGRO'
  | 'IMOBILIARIO'
  | 'ALIMENTOS'
  | 'BEBIDAS'
  | 'VEICULOS'
  | 'HOTELARIA'
  | 'RESTAURANTE'
  | 'TECNOLOGIA'
  | 'PROF_INTELECTUAL'
  | 'FINANCEIRO'
  | 'ICMS'
  | 'IPI'
  | 'ISS'
  | 'EXPORTA'
  | 'IMPORTA'
  | 'INTERESTADUAL'
  | 'ST'
  | 'MONOFASICO'
  | 'INCENTIVO_ESTADUAL'
  | 'FILIAIS'
  | 'MULTIPLAS_ATIVIDADES'
  | 'INTERMEDIACAO'
  | 'DESONERACAO'
  | 'GRUPO'
  | 'PATRIMONIO_PF'
  | 'SOCIOS_PF'
  | 'REORGANIZACAO'
  | 'EXTERIOR'
  | 'PD'
  | 'FOLHA'
  | 'LUCRO'
  | 'PREJUIZO'
  | 'PASSIVO'
  | 'INVESTIMENTO'
  | 'RECEITA_5MI'
  | 'RECEITA_3_6MI'
  | 'PE'

export const NOME_MARCA: Record<Marca, string> = {
  SIMPLES: 'optante pelo Simples Nacional',
  PRESUMIDO: 'Lucro Presumido',
  REAL: 'Lucro Real',
  NAO_SIMPLES: 'fora do Simples Nacional',
  CPP: 'recolhe a contribuição patronal fora do DAS',
  INDUSTRIA: 'atividade industrial',
  COMERCIO: 'atividade comercial',
  SERVICOS: 'prestação de serviços',
  TRANSPORTE: 'transporte',
  CONSTRUCAO: 'construção/obras',
  SAUDE: 'saúde',
  EDUCACAO: 'educação',
  AGRO: 'agropecuária/agroindústria',
  IMOBILIARIO: 'atividade imobiliária',
  ALIMENTOS: 'alimentos',
  BEBIDAS: 'bebidas',
  VEICULOS: 'veículos ou bens sujeitos ao Imposto Seletivo',
  HOTELARIA: 'hotelaria/turismo',
  RESTAURANTE: 'bares e restaurantes',
  TECNOLOGIA: 'tecnologia da informação',
  PROF_INTELECTUAL: 'profissão intelectual regulamentada',
  FINANCEIRO: 'receitas financeiras relevantes',
  ICMS: 'contribuinte do ICMS',
  IPI: 'contribuinte do IPI',
  ISS: 'contribuinte do ISS',
  EXPORTA: 'exporta',
  IMPORTA: 'importa',
  INTERESTADUAL: 'operações interestaduais',
  ST: 'operações com substituição tributária',
  MONOFASICO: 'produtos monofásicos',
  INCENTIVO_ESTADUAL: 'incentivo fiscal estadual',
  FILIAIS: 'mais de um estabelecimento',
  MULTIPLAS_ATIVIDADES: 'atividades com coeficientes diferentes',
  INTERMEDIACAO: 'intermediação/agenciamento',
  DESONERACAO: 'desoneração da folha (CPRB)',
  GRUPO: 'grupo econômico',
  PATRIMONIO_PF: 'imóveis na pessoa física dos sócios',
  SOCIOS_PF: 'sócios pessoas físicas recebendo lucros',
  REORGANIZACAO: 'reorganização societária ou M&A em vista',
  EXTERIOR: 'partes relacionadas no exterior',
  PD: 'pesquisa e desenvolvimento',
  FOLHA: 'empregados registrados',
  LUCRO: 'lucro tributável',
  PREJUIZO: 'prejuízo fiscal/base negativa acumulados',
  PASSIVO: 'passivo tributário',
  INVESTIMENTO: 'investimento em imobilizado',
  RECEITA_5MI: 'receita anual acima de R$ 5 milhões',
  RECEITA_3_6MI: 'receita anual acima de R$ 3,6 milhões',
  PE: 'estabelecida em Pernambuco',
}

export function marcas(p: Perfil): Record<Marca, boolean | null> {
  const r = p.regime
  const num = (v: number | null, min = 0) => (v == null ? null : v > min)
  const real = r == null ? null : r === 'real-anual' || r === 'real-trimestral'
  const simples = r == null ? null : r === 'simples'
  return {
    SIMPLES: simples,
    PRESUMIDO: r == null ? null : r === 'presumido',
    REAL: real,
    NAO_SIMPLES: simples == null ? null : !simples,
    CPP: simples == null ? null : !simples || p.anexoSimples === 'IV',
    INDUSTRIA: p.setores.industria,
    COMERCIO: p.setores.comercio,
    SERVICOS: p.setores.servicos,
    TRANSPORTE: p.setores.transporte,
    CONSTRUCAO: p.setores.construcao,
    SAUDE: p.setores.saude,
    EDUCACAO: p.setores.educacao,
    AGRO: p.setores.agro,
    IMOBILIARIO: p.setores.imobiliario,
    ALIMENTOS: p.setores.alimentos,
    BEBIDAS: p.setores.bebidas,
    VEICULOS: p.setores.veiculos,
    HOTELARIA: p.setores.hotelaria,
    RESTAURANTE: p.setores.restaurante,
    TECNOLOGIA: p.setores.tecnologia,
    PROF_INTELECTUAL: p.setores.profIntelectual,
    FINANCEIRO: p.setores.financeiro,
    ICMS: p.operacoes.contribuinteIcms,
    IPI: p.operacoes.contribuinteIpi,
    ISS: p.operacoes.contribuinteIss,
    EXPORTA: p.operacoes.exporta,
    IMPORTA: p.operacoes.importa,
    INTERESTADUAL: p.operacoes.interestadual,
    ST: p.operacoes.substituicaoTributaria,
    MONOFASICO: p.operacoes.monofasicos,
    INCENTIVO_ESTADUAL: p.operacoes.incentivoEstadual,
    FILIAIS: p.operacoes.filiais,
    MULTIPLAS_ATIVIDADES: p.operacoes.multiplasAtividades,
    INTERMEDIACAO: p.operacoes.intermediacao,
    DESONERACAO: p.operacoes.desoneracaoFolha,
    GRUPO: p.societario.grupoEconomico,
    PATRIMONIO_PF: p.societario.patrimonioImobiliarioPF,
    SOCIOS_PF: p.societario.sociosRecebemDividendos,
    REORGANIZACAO: p.societario.reorganizacao,
    EXTERIOR: p.societario.partesRelacionadasExterior,
    PD: p.societario.pesquisaDesenvolvimento,
    FOLHA: p.empregados == null ? num(p.folhaAnual) : p.empregados > 0,
    LUCRO: p.lucroContabil == null ? null : p.lucroContabil > 0,
    PREJUIZO: num(p.prejuizoFiscal),
    PASSIVO: num(p.passivoTributario),
    INVESTIMENTO: num(p.investimentoAnual),
    RECEITA_5MI: num(p.receitaAnual, 5_000_000),
    RECEITA_3_6MI: num(p.receitaAnual, 3_600_000),
    PE: p.uf ? p.uf.toUpperCase() === 'PE' : null,
  }
}

interface Regra {
  todos?: Marca[] // todas obrigatórias
  algum?: Marca[] // pelo menos uma
  foraEscopo?: string // atribuição de outro módulo/agente
  vigencia?: string // observação de período (ex.: PIS/COFINS só até 2026)
}

const R = (todos: Marca[] = [], algum: Marca[] = [], vigencia?: string): Regra => ({
  todos,
  algum,
  vigencia,
})
const PISCOFINS_2026 =
  'PIS/COFINS deixam de existir em 2027 (CBS): efeito apenas nas competências de 2026.'
const FORA_CREDITOS =
  'Recuperação de tributos pagos é atribuição do painel de créditos (C CONT) e do contencioso (Caldas Advocacia): encaminhar, não simular aqui.'

/** Regras por número de estratégia (requisitos mínimos de perfil). */
const REGRAS: Record<number, Regra> = {
  1: R(['NAO_SIMPLES']),
  2: R(['REAL']),
  3: R(['REAL']),
  4: R(['PRESUMIDO', 'RECEITA_5MI']),
  5: R(['PRESUMIDO', 'MULTIPLAS_ATIVIDADES']),
  6: R(['SERVICOS', 'INTERMEDIACAO']),
  7: R(['SIMPLES', 'SERVICOS']),
  8: R(['SIMPLES', 'SERVICOS']),
  9: R(['SIMPLES', 'MONOFASICO']),
  10: R(['SIMPLES', 'COMERCIO', 'SERVICOS']),
  11: R(['SIMPLES', 'RECEITA_3_6MI']),
  12: R(['SIMPLES'], [], 'Opção a partir de 2027.'),
  13: R(['PRESUMIDO', 'SAUDE']),
  14: R(['PRESUMIDO', 'SAUDE']),
  15: R(['CONSTRUCAO']),
  16: R(['CONSTRUCAO']),
  17: R(['PRESUMIDO', 'TRANSPORTE']),
  18: R(['PRESUMIDO', 'FINANCEIRO']),
  19: R(['IMOBILIARIO']),
  20: R(['SERVICOS', 'PROF_INTELECTUAL', 'ISS']),
  // Bloco 02: PIS/COFINS não cumulativos (Lucro Real), só 2026.
  21: R(['REAL'], ['INDUSTRIA', 'CONSTRUCAO'], PISCOFINS_2026),
  22: R(['REAL'], ['INDUSTRIA', 'ALIMENTOS', 'SAUDE'], PISCOFINS_2026),
  23: R(['REAL', 'INDUSTRIA'], [], PISCOFINS_2026),
  24: R(['REAL', 'INDUSTRIA'], [], PISCOFINS_2026),
  25: R(['REAL', 'INDUSTRIA'], [], PISCOFINS_2026),
  26: R(['REAL', 'INDUSTRIA'], [], PISCOFINS_2026),
  27: R(['REAL', 'INDUSTRIA'], [], PISCOFINS_2026),
  28: R(['REAL', 'INDUSTRIA'], [], PISCOFINS_2026),
  29: R(['REAL', 'INDUSTRIA'], [], PISCOFINS_2026),
  30: R(['REAL'], ['INDUSTRIA', 'COMERCIO'], PISCOFINS_2026),
  31: R(['REAL'], ['INDUSTRIA', 'COMERCIO'], PISCOFINS_2026),
  32: R(['REAL', 'INDUSTRIA'], [], PISCOFINS_2026),
  33: R(['REAL', 'INDUSTRIA'], [], PISCOFINS_2026),
  34: R(['REAL', 'INDUSTRIA'], [], PISCOFINS_2026),
  35: R(['REAL', 'INDUSTRIA'], [], PISCOFINS_2026),
  36: R(['REAL', 'ALIMENTOS'], [], PISCOFINS_2026),
  37: R(['REAL'], [], PISCOFINS_2026),
  38: R(['REAL'], ['INDUSTRIA', 'SERVICOS'], PISCOFINS_2026),
  39: R(['REAL', 'INDUSTRIA'], [], PISCOFINS_2026),
  40: R(['REAL'], ['INDUSTRIA', 'SERVICOS'], PISCOFINS_2026),
  // Bloco 03: ICMS/IPI legados (ICMS reduz de 2029 a 2032 e acaba em 2033; IPI a zero em 2027, salvo exceções).
  41: R(['ICMS', 'NAO_SIMPLES', 'INVESTIMENTO']),
  42: R(['ICMS', 'NAO_SIMPLES', 'INDUSTRIA']),
  43: R(['ICMS', 'NAO_SIMPLES']),
  44: R(['ST']),
  45: R(['ST', 'INTERESTADUAL']),
  46: R(['ICMS'], ['COMERCIO', 'INDUSTRIA']),
  47: R(['ICMS', 'FILIAIS']),
  48: R(['ICMS', 'EXPORTA']),
  49: R(['ICMS', 'PE'], ['EXPORTA', 'INCENTIVO_ESTADUAL']),
  50: R(['ICMS', 'INTERESTADUAL']),
  51: R(['ICMS', 'INCENTIVO_ESTADUAL']),
  52: R(['ICMS']),
  53: R(['AGRO']),
  54: R(['ICMS', 'NAO_SIMPLES', 'INDUSTRIA']),
  55: R(['IPI', 'NAO_SIMPLES']),
  56: R(['IPI']),
  57: R(['IPI', 'INDUSTRIA']),
  58: R([], ['IMPORTA', 'IPI']),
  59: R(['IPI']),
  60: R(['NAO_SIMPLES'], ['ICMS', 'IPI']),
  // Bloco 04: IBS/CBS.
  61: R(),
  62: R(),
  63: R(['INDUSTRIA', 'NAO_SIMPLES']),
  64: R(['NAO_SIMPLES']),
  65: R(['NAO_SIMPLES']),
  66: R(['NAO_SIMPLES', 'INVESTIMENTO']),
  67: R(['NAO_SIMPLES']),
  68: R(['NAO_SIMPLES'], ['INDUSTRIA', 'COMERCIO']),
  69: R(['NAO_SIMPLES']),
  70: R(['NAO_SIMPLES']),
  71: R(['NAO_SIMPLES']),
  72: R(['NAO_SIMPLES']),
  73: R(['NAO_SIMPLES']),
  74: R([], ['COMERCIO', 'INDUSTRIA']),
  75: R([], ['COMERCIO', 'INDUSTRIA']),
  76: R([], ['COMERCIO', 'INDUSTRIA']),
  77: R(),
  78: R(['NAO_SIMPLES']),
  79: R(['IMPORTA']),
  80: R(['EXPORTA']),
  // Bloco 05: setores, reduções e Imposto Seletivo.
  81: R(['ALIMENTOS']),
  82: R(['ALIMENTOS']),
  83: R(['SAUDE']),
  84: R(['SAUDE']),
  85: R(['SAUDE', 'SERVICOS']),
  86: R(['EDUCACAO']),
  87: R(['PROF_INTELECTUAL']),
  88: R(['AGRO']),
  89: R(['EXPORTA', 'SERVICOS']),
  90: R(['HOTELARIA']),
  91: R(['RESTAURANTE']),
  92: R(['IMOBILIARIO']),
  93: R(['IMOBILIARIO']),
  94: R(['NAO_SIMPLES']),
  95: R(['FOLHA']),
  96: R(['INTERESTADUAL']),
  97: R(),
  98: R(['BEBIDAS']),
  99: R(['BEBIDAS']),
  100: R(['VEICULOS']),
  // Bloco 06: classificação fiscal e engenharia fabril.
  101: R(['INDUSTRIA']),
  102: R(['INDUSTRIA']),
  103: R(['INDUSTRIA']),
  104: R(['ALIMENTOS']),
  105: R([], ['COMERCIO', 'INDUSTRIA']),
  106: R(['INDUSTRIA']),
  107: R(['ST']),
  108: R(['SERVICOS']),
  109: R(['INTERESTADUAL']),
  110: R(['MONOFASICO']),
  111: R(),
  112: R(['INDUSTRIA']),
  113: R(['INDUSTRIA']),
  114: R(['INDUSTRIA']),
  115: R(['INDUSTRIA']),
  116: R(['INDUSTRIA']),
  117: R(['INDUSTRIA']),
  118: R([], ['BEBIDAS', 'VEICULOS']),
  119: R(['INDUSTRIA']),
  120: R([], ['INDUSTRIA', 'COMERCIO']),
  // Bloco 07: folha, seguros e remuneração.
  121: R(['FOLHA', 'LUCRO']),
  122: R(['FOLHA']),
  123: R(['FOLHA']),
  124: R(['FOLHA']),
  125: R(['FOLHA']),
  126: R(['FOLHA']),
  127: R(['FOLHA']),
  128: R(['FOLHA']),
  129: R(['FOLHA']),
  130: R(['FOLHA']),
  131: R(['FOLHA']),
  132: R(['FOLHA']),
  133: R(),
  134: R(),
  135: R(['FOLHA']),
  136: R(['FOLHA', 'CPP']),
  137: R(['FOLHA', 'CPP']),
  138: R(['FOLHA', 'CPP']),
  139: R(['FOLHA']),
  140: R(['FOLHA', 'CPP', 'DESONERACAO']),
  // Bloco 08: IRPJ/CSLL.
  141: R(['REAL', 'LUCRO']),
  142: R(['REAL', 'PREJUIZO']),
  143: R(['REAL', 'PREJUIZO']),
  144: { foraEscopo: FORA_CREDITOS },
  145: { foraEscopo: FORA_CREDITOS },
  146: R(['REAL']),
  147: R(['REAL', 'INVESTIMENTO']),
  148: R(['REAL', 'INVESTIMENTO']),
  149: R(['REAL']),
  150: R(['REAL', 'PD', 'LUCRO']),
  151: R(['TECNOLOGIA']),
  152: R(['REAL', 'INCENTIVO_ESTADUAL']),
  153: R(['REAL', 'FOLHA', 'LUCRO']),
  154: R(['REAL', 'LUCRO']),
  155: R(['REAL', 'LUCRO']),
  156: R(['REAL', 'LUCRO']),
  157: R(['REAL', 'LUCRO']),
  158: R(['REAL'], ['INDUSTRIA', 'COMERCIO']),
  159: R(['REAL']),
  160: R(['REAL']),
  // Bloco 09: recuperação e contencioso ficam com outros módulos; negociação de passivo entra no planejamento.
  176: R(['PASSIVO']),
  177: R(['PASSIVO']),
  178: R(['PASSIVO', 'ICMS']),
  179: R(['PASSIVO', 'FOLHA']),
  // Bloco 10: societário, patrimonial, financeiro e comércio exterior.
  181: R(['PATRIMONIO_PF']),
  182: R(['PATRIMONIO_PF']),
  183: R(['REORGANIZACAO']),
  184: R(['GRUPO', 'REORGANIZACAO']),
  185: R(['REAL', 'REORGANIZACAO']),
  186: R(),
  187: R(['IMOBILIARIO'], ['CONSTRUCAO']),
  188: R(['INVESTIMENTO']),
  189: R(['SOCIOS_PF']),
  190: R(['GRUPO']),
  191: R(['GRUPO']),
  192: R([], ['EXPORTA', 'IMPORTA']),
  193: R(['EXPORTA', 'SERVICOS']),
  194: R(['IMPORTA']),
  195: R(['EXTERIOR'], ['EXPORTA', 'IMPORTA']),
  196: R(['EXPORTA', 'INDUSTRIA']),
  197: R(['CONSTRUCAO']),
  198: R(['IMOBILIARIO']),
  199: R(['AGRO']),
  200: R(['ICMS', 'NAO_SIMPLES']),
}
for (let n = 161; n <= 175; n++) REGRAS[n] = { foraEscopo: FORA_CREDITOS }
REGRAS[180] = { foraEscopo: FORA_CREDITOS }

export interface ResultadoTriagem {
  sugestao: Situacao
  motivos: string[]
  faltaInformar: string[]
  vigencia?: string
  foraEscopo?: boolean
}

/** Sugere a situação de uma estratégia para o perfil. Estratégias novas (inteligência) sem regra: "condicionada". */
export function triar(e: Estrategia, p: Perfil): ResultadoTriagem {
  const regra = REGRAS[e.numero]
  if (!regra)
    return {
      sugestao: 'condicionada',
      motivos: ['Estratégia sem regra automática de triagem: avaliar caso a caso.'],
      faltaInformar: [],
    }
  if (regra.foraEscopo)
    return {
      sugestao: 'inaplicavel',
      motivos: [regra.foraEscopo],
      faltaInformar: [],
      foraEscopo: true,
    }
  const m = marcas(p)
  const motivos: string[] = []
  const falta: string[] = []
  let bloqueada = false
  for (const k of regra.todos || []) {
    if (m[k] === false) {
      bloqueada = true
      motivos.push(`Requer ${NOME_MARCA[k]}: não corresponde ao perfil.`)
    } else if (m[k] == null) falta.push(NOME_MARCA[k])
    else motivos.push(`Perfil atende: ${NOME_MARCA[k]}.`)
  }
  if (regra.algum && regra.algum.length) {
    const vals = regra.algum.map((k) => m[k])
    if (vals.some((v) => v === true))
      motivos.push(
        `Perfil atende: ${regra.algum
          .filter((k) => m[k])
          .map((k) => NOME_MARCA[k])
          .join(' / ')}.`,
      )
    else if (vals.every((v) => v === false)) {
      bloqueada = true
      motivos.push(
        `Requer ${regra.algum.map((k) => NOME_MARCA[k]).join(' ou ')}: não corresponde ao perfil.`,
      )
    } else
      falta.push(
        regra.algum
          .filter((k) => m[k] == null)
          .map((k) => NOME_MARCA[k])
          .join(' ou '),
      )
  }
  if (bloqueada)
    return { sugestao: 'inaplicavel', motivos, faltaInformar: [], vigencia: regra.vigencia }
  if (!(regra.todos || []).length && !(regra.algum || []).length)
    motivos.push('Estratégia de alcance geral: confirmar operação e documentos.')
  if (falta.length) {
    motivos.push(`Falta informar no perfil: ${falta.join('; ')}.`)
    return { sugestao: 'condicionada', motivos, faltaInformar: falta, vigencia: regra.vigencia }
  }
  if (e.risco === 'alto') {
    motivos.push(
      `Manual classifica como ${e.riscoTexto}: controvérsia relevante, parecer jurídico prévio.`,
    )
    return { sugestao: 'alto-risco', motivos, faltaInformar: [], vigencia: regra.vigencia }
  }
  motivos.push(
    'Requisitos de perfil atendidos. Confirmar documentos (evidências e contraprova) antes de recomendar.',
  )
  return { sugestao: 'aplicavel', motivos, faltaInformar: [], vigencia: regra.vigencia }
}

/** Braço do grupo que conduz cada modelo (handoff e cross-sell). */
export function areaDoModelo(modelo: string): string {
  if (modelo === 'CONTENCIOSO') return 'Caldas Advocacia'
  if (modelo === 'FINANCEIRO') return 'C Capital + Caldas Advocacia'
  if (modelo === 'FOLHA') return 'C CONT + Caldas Advocacia (trabalhista)'
  return 'C CONT'
}
