// Acesso aos dados: PocketBase (mesma origem), base de conhecimento (manual.json + estratégias incorporadas) e padrões.
import pb from '@/lib/pocketbase/client'
import { comStatusAutomatico } from './status'
import type {
  Destinatario,
  Envio,
  Estrategia,
  Manual,
  Perfil,
  Planejamento,
  Premissas,
  Proposta,
  SituacaoAtual,
} from './tipos'

// No Skip o login é o do próprio sistema (lib/auth); aqui só se reaproveita o cliente do PocketBase.
export { pb }

export const logado = () => pb.authStore.isValid
function expirou(): never {
  pb.authStore.clear()
  window.location.href = '/login'
  throw new Error('Sessão expirada.')
}
export const autorizacao = (): Record<string, string> =>
  pb.authStore.token ? { Authorization: pb.authStore.token } : {}

/** Rotas próprias do sistema (hooks em /backend/v1/pt/*). */
export async function pedir<T>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(pb.buildURL(url), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...autorizacao(), ...(init?.headers || {}) },
  })
  if (r.status === 401) expirou()
  const corpo = await r.json().catch(() => ({}))
  if (!r.ok) {
    const c = corpo as { erro?: string; message?: string }
    throw new Error(c.erro || c.message || r.statusText)
  }
  return corpo as T
}

async function seguro<T>(f: () => Promise<T>): Promise<T> {
  try {
    return await f()
  } catch (e) {
    const st = (e as { status?: number }).status
    if (st === 401 || st === 403) expirou()
    // Erro de validação do PocketBase: mostra campo e motivo em português, não só "Failed to create record."
    const campos = (
      e as { response?: { data?: Record<string, { code?: string; message?: string }> } }
    ).response?.data
    if (campos && Object.keys(campos).length) {
      const NOMES: Record<string, string> = {
        cnpj: 'CNPJ',
        nome: 'Cliente',
        periodo: 'Período',
        responsavel: 'Responsável',
        status: 'Status',
        cross_sell: 'Possível cross-sell',
        dados: 'Dados do planejamento',
        email: 'E-mail',
        grupo: 'Grupo',
        mes: 'Mês',
      }
      const motivo = (c?: string, m?: string) =>
        c === 'validation_max_text_constraint'
          ? `texto longo demais (${m})`
          : c === 'validation_required'
            ? 'obrigatório'
            : c === 'validation_invalid_format'
              ? 'formato inválido'
              : m || c || 'inválido'
      throw new Error(
        'Não foi possível salvar: ' +
          Object.entries(campos)
            .map(([k, v]) => `${NOMES[k] || k} — ${motivo(v?.code, v?.message)}`)
            .join('; '),
      )
    }
    throw e
  }
}

// ------------------------------------------------------------------ base de conhecimento
let manualCache: Promise<Manual> | null = null
export function carregarManual(): Promise<Manual> {
  if (!manualCache)
    manualCache = (async () => {
      const r = await fetch('/planejamento/manual.json')
      if (!r.ok) throw new Error('Base de estratégias indisponível.')
      const m = (await r.json()) as Manual
      m.estrategias.forEach((e) => (e.origem = 'manual'))
      try {
        const extras = await pb.collection('pt_estrategias_extra').getFullList({ sort: 'numero' })
        for (const x of extras)
          m.estrategias.push({
            ...(x.dados as Estrategia),
            numero: x.numero as number,
            origem: 'inteligencia',
          })
      } catch {
        /* sem estratégias incorporadas */
      }
      return m
    })()
  return manualCache
}
export const recarregarManual = () => {
  manualCache = null
  return carregarManual()
}

// ------------------------------------------------------------------ padrões
export const perfilVazio = (): Perfil => ({
  regime: null,
  uf: '',
  municipio: '',
  cnae: '',
  atividade: '',
  anexoSimples: null,
  receitaAnual: null,
  receitaServicos: null,
  lucroContabil: null,
  folhaAnual: null,
  empregados: null,
  comprasCreditaveis: null,
  investimentoAnual: null,
  passivoTributario: null,
  prejuizoFiscal: null,
  aliquotaIcms: null,
  aliquotaIss: null,
  encargoPatronal: null,
  setores: {
    industria: null,
    comercio: null,
    servicos: null,
    transporte: null,
    construcao: null,
    saude: null,
    educacao: null,
    agro: null,
    imobiliario: null,
    alimentos: null,
    bebidas: null,
    veiculos: null,
    hotelaria: null,
    restaurante: null,
    tecnologia: null,
    profIntelectual: null,
    financeiro: null,
  },
  operacoes: {
    contribuinteIcms: null,
    contribuinteIpi: null,
    contribuinteIss: null,
    exporta: null,
    importa: null,
    interestadual: null,
    substituicaoTributaria: null,
    monofasicos: null,
    incentivoEstadual: null,
    filiais: null,
    multiplasAtividades: null,
    intermediacao: null,
    desoneracaoFolha: null,
  },
  societario: {
    grupoEconomico: null,
    patrimonioImobiliarioPF: null,
    sociosRecebemDividendos: null,
    reorganizacao: null,
    partesRelacionadasExterior: null,
    pesquisaDesenvolvimento: null,
  },
})

/** Premissas iniciais. CBS 8,8% + IBS 17,7% = estimativa de referência divulgada pelo Ministério da Fazenda (26,5%), não alíquota oficial. */
export const premissasPadrao = (): Premissas => ({
  crescimentoReceita: 0,
  aliquotaCbs: 8.8,
  aliquotaIbs: 17.7,
  sensibilidade: 2,
  aliquotaJcpIrrf: 15,
  anoBase: 2026,
  observacao:
    'CBS/IBS: estimativa de referência (26,5%) usada como premissa até a fixação oficial pelo Senado. IRRF sobre JCP: conferir a alíquota vigente no exercício.',
})

export const atualVazio = (): SituacaoAtual => ({
  anoReferencia: 2025,
  valores: {},
  fontes: {},
  observacao: '',
})

// ------------------------------------------------------------------ planejamentos
const desserializar = (r: Record<string, unknown>): Planejamento =>
  comStatusAutomatico(desserializarBruto(r))
const desserializarBruto = (r: Record<string, unknown>): Planejamento => {
  const d = (r.dados || {}) as Partial<Planejamento>
  return {
    id: r.id as string,
    cnpj: r.cnpj as string,
    nome: r.nome as string,
    periodo: (r.periodo as string) || '',
    responsavel: (r.responsavel as string) || 'C CONT',
    status: ((r.status as string) || 'Nova') as Planejamento['status'],
    crossSell: (r.cross_sell as string) || '',
    perfil: {
      ...perfilVazio(),
      ...(d.perfil || {}),
      setores: { ...perfilVazio().setores, ...(d.perfil?.setores || {}) },
      operacoes: { ...perfilVazio().operacoes, ...(d.perfil?.operacoes || {}) },
      societario: { ...perfilVazio().societario, ...(d.perfil?.societario || {}) },
    },
    atual: { ...atualVazio(), ...(d.atual || {}) },
    premissas: { ...premissasPadrao(), ...(d.premissas || {}) },
    analises: d.analises || {},
    tarefas: d.tarefas || [],
    importado: d.importado || null,
    statusManual: !!d.statusManual,
    created: r.created as string,
    updated: r.updated as string,
  }
}
const serializar = (p0: Planejamento) => {
  const p = comStatusAutomatico(p0)
  return {
    cnpj: p.cnpj,
    nome: p.nome,
    periodo: p.periodo,
    responsavel: p.responsavel,
    status: p.status,
    cross_sell: p.crossSell,
    dados: {
      perfil: p.perfil,
      atual: p.atual,
      premissas: p.premissas,
      analises: p.analises,
      tarefas: p.tarefas,
      importado: p.importado,
      statusManual: !!p.statusManual,
    },
  }
}

export const listarPlanejamentos = () =>
  seguro(async () =>
    (await pb.collection('pt_planejamentos').getFullList({ sort: '-updated' })).map((r) =>
      desserializar(r as unknown as Record<string, unknown>),
    ),
  )
export const obterPlanejamento = (id: string) =>
  seguro(async () =>
    desserializar(
      (await pb.collection('pt_planejamentos').getOne(id)) as unknown as Record<string, unknown>,
    ),
  )
export const criarPlanejamento = (p: Omit<Planejamento, 'id'>) =>
  seguro(async () =>
    desserializar(
      (await pb
        .collection('pt_planejamentos')
        .create(serializar(p as Planejamento))) as unknown as Record<string, unknown>,
    ),
  )
export const salvarPlanejamento = (p: Planejamento) =>
  seguro(async () =>
    desserializar(
      (await pb.collection('pt_planejamentos').update(p.id, serializar(p))) as unknown as Record<
        string,
        unknown
      >,
    ),
  )
export const excluirPlanejamento = (id: string) =>
  seguro(() => pb.collection('pt_planejamentos').delete(id))

// ------------------------------------------------------------------ inteligência adaptativa
export const listarPropostas = () =>
  seguro(async () =>
    (await pb.collection('pt_inteligencia').getFullList({ sort: '-mes,-created' })).map(
      (r) =>
        ({
          ...(r.dados as object),
          id: r.id,
          mes: r.mes,
          nome: r.nome,
          situacao: r.situacao,
          created: r.created,
        }) as Proposta,
    ),
  )
export const salvarProposta = (p: Proposta) =>
  seguro(async () => {
    const corpo = { mes: p.mes, nome: p.nome, situacao: p.situacao, dados: p }
    return p.id
      ? pb.collection('pt_inteligencia').update(p.id, corpo)
      : pb.collection('pt_inteligencia').create(corpo)
  })
export const excluirProposta = (id: string) =>
  seguro(() => pb.collection('pt_inteligencia').delete(id))
export const incorporarEstrategia = (e: Estrategia) =>
  seguro(() =>
    pb.collection('pt_estrategias_extra').create({ numero: e.numero, titulo: e.titulo, dados: e }),
  )

// ------------------------------------------------------------------ destinatários e envios
export const listarDestinatarios = () =>
  seguro(async () =>
    (await pb.collection('pt_destinatarios').getFullList({ sort: 'grupo,nome' })).map(
      (r) =>
        ({
          id: r.id,
          grupo: r.grupo,
          nome: r.nome,
          email: r.email,
          relatorios: r.relatorios || [],
          periodicidade: r.periodicidade || 'manual',
          ativo: !!r.ativo,
        }) as Destinatario,
    ),
  )
export const salvarDestinatario = (d: Destinatario) =>
  seguro(() => {
    const { id, ...corpo } = d
    return id
      ? pb.collection('pt_destinatarios').update(id, corpo)
      : pb.collection('pt_destinatarios').create(corpo)
  })
export const excluirDestinatario = (id: string) =>
  seguro(() => pb.collection('pt_destinatarios').delete(id))
export const listarEnvios = () =>
  seguro(async () =>
    (await pb.collection('pt_envios').getList(1, 200, { sort: '-created' })).items.map(
      (r) =>
        ({
          id: r.id,
          destinatario: r.destinatario,
          email: r.email,
          relatorio: r.relatorio,
          assunto: r.assunto,
          status: r.status,
          detalhe: r.detalhe,
          created: r.created,
        }) as Envio,
    ),
  )
