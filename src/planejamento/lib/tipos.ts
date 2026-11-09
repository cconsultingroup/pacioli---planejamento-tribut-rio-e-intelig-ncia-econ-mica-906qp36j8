// Tipos do sistema de Planejamento Tributário 2026–2033.

/** Estratégia do Manual Avançado (web/public/base/manual.json) ou incorporada pela inteligência adaptativa. */
export interface Estrategia {
  numero: number
  codigo: string
  titulo: string
  bloco: number | null
  risco: 'baixo' | 'medio' | 'medio-alto' | 'alto'
  riscoTexto: string
  modelo: string // REGIME, PIS, ICMS, IBS, SETORES, INDÚSTRIA, FOLHA, IR, CONTENCIOSO, FINANCEIRO
  mecanismo: string[]
  baseLegal: string[]
  evidencias: string
  contraprova: string
  bloqueio: string
  memoria: {
    aviso: string
    linhas: { etapa: string; formula: string; condicao: string }[]
    economiaIlustrativa: number | null
    materialidade: string
    formula: string
  }
  fluxo: string[]
  pontoControle: string
  lancamentos: string[]
  declaracoes: string[]
  alerta: string
  riscoExtrapolacao: string
  mitigacao: string
  matrizAnual: { ano: number; texto: string }[]
  matrizNota: string
  roteiro: string[]
  handoff: string
  parecerConclusao: string
  fontes: string[]
  fontesTexto: string
  origem?: 'manual' | 'inteligencia'
}

export interface Manual {
  versao: string
  titulo: string
  blocos: { numero: number; nome: string; intro: string }[]
  gerais: { titulo: string; paragrafos: string[]; tabelas: string[][][] }[]
  referencias: { codigo: string; descricao: string }[]
  estrategias: Estrategia[]
}

export type Regime =
  | 'simples'
  | 'presumido'
  | 'real-anual'
  | 'real-trimestral'
  | 'arbitrado'
  | 'imune'
export type SimNao = boolean | null // null = não informado

/** Perfil da empresa usado na triagem e nos cálculos. Valores anuais em R$ (últimos 12 meses ou exercício de referência). */
export interface Perfil {
  regime: Regime | null
  uf: string
  municipio: string
  cnae: string
  atividade: string
  anexoSimples: 'I' | 'II' | 'III' | 'IV' | 'V' | null
  receitaAnual: number | null
  receitaServicos: number | null // parte da receita que é serviço
  lucroContabil: number | null // lucro antes do IRPJ/CSLL (base para o Lucro Real)
  folhaAnual: number | null // salários + pró-labore
  empregados: number | null
  comprasCreditaveis: number | null // aquisições que dariam crédito (PIS/COFINS hoje; IBS/CBS a partir de 2027)
  investimentoAnual: number | null // imobilizado/CAPEX previsto por ano
  passivoTributario: number | null
  prejuizoFiscal: number | null // prejuízo fiscal / base negativa acumulados
  aliquotaIcms: number | null // alíquota interna de referência (%)
  aliquotaIss: number | null // alíquota de ISS do município (%) — efetiva do SPED ou padrão a conferir
  encargoPatronal: number | null // CPP + RAT×FAP + terceiros (%)
  setores: {
    industria: SimNao
    comercio: SimNao
    servicos: SimNao
    transporte: SimNao
    construcao: SimNao
    saude: SimNao
    educacao: SimNao
    agro: SimNao
    imobiliario: SimNao
    alimentos: SimNao
    bebidas: SimNao
    veiculos: SimNao
    hotelaria: SimNao
    restaurante: SimNao
    tecnologia: SimNao
    profIntelectual: SimNao
    financeiro: SimNao
  }
  operacoes: {
    contribuinteIcms: SimNao
    contribuinteIpi: SimNao
    contribuinteIss: SimNao
    exporta: SimNao
    importa: SimNao
    interestadual: SimNao
    substituicaoTributaria: SimNao
    monofasicos: SimNao
    incentivoEstadual: SimNao
    filiais: SimNao
    multiplasAtividades: SimNao
    intermediacao: SimNao
    desoneracaoFolha: SimNao
  }
  societario: {
    grupoEconomico: SimNao
    patrimonioImobiliarioPF: SimNao
    sociosRecebemDividendos: SimNao
    reorganizacao: SimNao
    partesRelacionadasExterior: SimNao
    pesquisaDesenvolvimento: SimNao
  }
}

/** Tributos tratados no cenário atual e nas projeções. */
export const TRIBUTOS = [
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
  'CBS',
  'IBS',
  'IS',
  'IRPF',
  'OUTROS',
] as const
export type Tributo = (typeof TRIBUTOS)[number]
export const NOME_TRIBUTO: Record<Tributo, string> = {
  IRPJ: 'IRPJ',
  CSLL: 'CSLL',
  PIS: 'PIS',
  COFINS: 'COFINS',
  ICMS: 'ICMS',
  IPI: 'IPI',
  ISS: 'ISS',
  DAS: 'Simples (DAS)',
  INSS: 'INSS patronal (CPP, RAT, terceiros)',
  FGTS: 'FGTS',
  IRRF: 'IRRF',
  CBS: 'CBS',
  IBS: 'IBS',
  IS: 'Imposto Seletivo',
  IRPF: 'IRPF dos sócios',
  OUTROS: 'Outros',
}

/** Situação tributária atual (valores anuais) e de onde veio cada número. */
export interface SituacaoAtual {
  anoReferencia: number
  valores: Partial<Record<Tributo, number>>
  fontes: Partial<Record<Tributo, string>>
  observacao: string
}

/** Premissas explícitas das projeções (nada de alíquota futura "presumida" sem aparecer aqui). */
export interface Premissas {
  crescimentoReceita: number // % ao ano
  aliquotaCbs: number // % de referência (premissa até a fixação oficial)
  aliquotaIbs: number // % de referência (premissa até a fixação oficial)
  sensibilidade: number // ± pontos percentuais na soma CBS+IBS
  aliquotaJcpIrrf: number // % IRRF sobre JCP (premissa conferida pela equipe)
  anoBase: number
  observacao: string
}

export type Situacao =
  | 'aplicavel'
  | 'condicionada'
  | 'inaplicavel'
  | 'alto-risco'
  | 'nao-recomendada'
export const NOME_SITUACAO: Record<Situacao, string> = {
  aplicavel: 'Aplicável',
  condicionada: 'Condicionada',
  inaplicavel: 'Inaplicável',
  'alto-risco': 'Alto risco',
  'nao-recomendada': 'Não recomendada',
}

export type Etapa =
  | 'identificada'
  | 'em-analise'
  | 'recomendada'
  | 'aprovada'
  | 'implementada'
  | 'realizada'
  | 'descartada'
export const NOME_ETAPA: Record<Etapa, string> = {
  identificada: 'Identificada',
  'em-analise': 'Em análise',
  recomendada: 'Recomendada ao cliente',
  aprovada: 'Aprovada pelo cliente',
  implementada: 'Implementada',
  realizada: 'Economia realizada',
  descartada: 'Descartada',
}

export type GrauRisco = 'baixo' | 'medio' | 'alto' | 'critico'

/** Status de demanda do grupo (nomenclatura [STATUS] | [CLIENTE] | [ÁREA] | [SERVIÇO]). */
export const STATUS_DEMANDA = [
  'Nova',
  'Aguardando definição',
  'Aguardando início',
  'Em execução',
  'Aguardando cliente',
  'Aguardando interno',
  'Aguardando terceiro',
  'Aguardando financeiro',
  'Concluída',
  'Faturada',
  'Arquivada',
] as const
export type StatusDemanda = (typeof STATUS_DEMANDA)[number]

export interface Tarefa {
  id: string
  descricao: string
  responsavel: string
  area: 'C CONT' | 'Caldas Advocacia' | 'C Capital'
  prazo: string // AAAA-MM-DD
  status: StatusDemanda
  dependencia: string
}

/** Linha livre de efeito (calculadora "genérica" ou ajuste manual). */
export interface LinhaEfeito {
  tributo: Tributo
  descricao: string
  atual: number
  planejado: number
  baseChave: string // mesma base em duas estratégias = não somar duas vezes
}

/** O que a equipe registrou para uma estratégia no planejamento de um cliente. */
export interface AnaliseEstrategia {
  numero: number
  situacao: Situacao | null // decisão da equipe (null = usar a sugestão da triagem)
  etapa: Etapa
  calculadora: string // id da calculadora (ver calculo.ts)
  entradas: Record<string, number | string | boolean | null>
  linhasExtras: LinhaEfeito[]
  custoImplantacao: number
  custoManutencao: number // por ano
  outrosImpactos: number // por ano (negativos econômicos)
  recorrente: boolean
  anoInicio: number
  grauRisco: GrauRisco | null
  justificativaRisco: string
  aplicacaoCliente: string
  premissas: string
  documentosPendentes: string
  responsavel: string
  aprovador: string
  prazo: string
  economiaRealizada: number
  notas: string
  atualizadoEm: string
}

export interface Planejamento {
  id: string
  cnpj: string
  nome: string
  periodo: string
  responsavel: string
  status: StatusDemanda
  crossSell: string // obrigatório (regra do grupo)
  perfil: Perfil
  atual: SituacaoAtual
  premissas: Premissas
  analises: Record<string, AnaliseEstrategia>
  tarefas: Tarefa[]
  importado: unknown
  statusManual?: boolean // true = status escolhido à mão (desliga o automático)
  created?: string
  updated?: string
}

/** Proposta mensal da inteligência adaptativa. */
export interface Proposta {
  id: string
  mes: string // AAAA-MM
  nome: string
  novidade: string
  fonte: string
  beneficiados: string
  exemploCalculo: string
  risco: GrauRisco
  alteracoesIA: string
  recomendacao: 'incorporar' | 'aprofundar' | 'revisar' | 'rejeitar'
  estrategiaRelacionada: number | null
  aprovacoes: { controladoria: string; juridico: string; desenvolvimento: string }
  situacao: 'proposta' | 'em-validacao' | 'aprovada' | 'rejeitada' | 'implantada'
  testes: string
  created?: string
}

export const TIPOS_RELATORIO = {
  executivo: 'Relatório executivo',
  tecnico: 'Dossiê técnico',
  consolidado: 'Consolidado da carteira',
  inteligencia: 'Inteligência adaptativa mensal',
  especificacoes: 'Especificações de melhorias',
} as const
export type TipoRelatorio = keyof typeof TIPOS_RELATORIO

export interface Destinatario {
  id: string
  grupo: string
  nome: string
  email: string
  relatorios: TipoRelatorio[]
  periodicidade: 'mensal' | 'por-planejamento' | 'manual'
  ativo: boolean
}

export interface Envio {
  id: string
  destinatario: string
  email: string
  relatorio: string
  assunto: string
  status: 'enviado' | 'falhou' | 'teste'
  detalhe: string
  created: string
}
