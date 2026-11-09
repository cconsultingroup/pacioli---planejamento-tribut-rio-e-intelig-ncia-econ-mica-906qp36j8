// Comparativo entre tributações (Simples Nacional, Lucro Presumido e Lucro Real) com as MESMAS bases do perfil.
// Mostra qual regime tem a menor carga, se o atual já é o ideal e quanto se economizaria com o melhor.
// Regras 2026 (antes da CBS): Presumido = presunção por atividade (Lei 9.249/1995) + acréscimo da LC 224/2025 acima de R$ 5 mi;
// Real = lucro com compensação de prejuízo fiscal limitada a 30% (Lei 9.065/1995, art. 15); PIS/COFINS não cumulativos com créditos.
import { ANEXOS_SIMPLES, aliquotaEfetivaSimples, type LinhaMemoria } from './calculo'
import type { Perfil, SituacaoAtual, Tributo } from './tipos'

export type IdRegime = 'simples' | 'presumido' | 'real'
export const NOME_REGIME: Record<IdRegime, string> = {
  simples: 'Simples Nacional',
  presumido: 'Lucro Presumido',
  real: 'Lucro Real',
}

export interface ResultadoRegime {
  id: IdRegime
  nome: string
  disponivel: boolean
  /** Calculado só como modelo (a empresa não pode optar): aparece no comparativo, mas nunca é escolhido como melhor. */
  modelo?: boolean
  motivo?: string
  tributos: Partial<Record<Tributo, number>>
  total: number
  /** Só os tributos que mudam com o regime a partir de 2027 (IRPJ, CSLL e contribuição patronal; CBS é igual no Presumido e no Real). */
  total2027: number | null
  memoria: LinhaMemoria[]
  atual: boolean
}

export interface Comparativo {
  regimes: ResultadoRegime[]
  atualId: IdRegime | null
  melhor: ResultadoRegime | null
  atual: ResultadoRegime | null
  economia: number // atual − melhor (ano)
  economiaPct: number // sobre o total do regime atual
  situacao: 'ideal' | 'trocar' | 'equivalente' | 'sem-atual' | 'sem-dados'
  conclusao: string
  conclusao2027: string | null
  linhasTributo: Tributo[]
  avisos: string[]
  /** Conferência: tributos do regime atual que têm valor apurado na situação atual × os mesmos tributos simulados. */
  pagoSped: { pago: number; simulado: number; tributos: Tributo[] } | null
}

const r2 = (v: number) => Math.round(v * 100) / 100
const fmt = (v: number) =>
  (v < 0 ? '-' : '') +
  'R$ ' +
  Math.abs(r2(v))
    .toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
const pc = (v: number) => (Math.round(v * 10000) / 100).toString().replace('.', ',') + '%'
const LIMITE_SIMPLES = 4_800_000
const SUBLIMITE = 3_600_000
const LIMITE_PRESUMIDO = 78_000_000
const LIMITE_LC224 = 5_000_000
const ADICIONAL = 240_000

export const regimeIdDoPerfil = (p: Perfil): IdRegime | null =>
  p.regime === 'simples'
    ? 'simples'
    : p.regime === 'presumido'
      ? 'presumido'
      : p.regime === 'real-anual' || p.regime === 'real-trimestral'
        ? 'real'
        : null

export function anexoProvavel(p: Perfil): string {
  if (p.anexoSimples) return p.anexoSimples
  if (p.setores.industria) return 'II'
  if (p.setores.comercio) return 'I'
  if (p.setores.servicos) return 'III'
  return 'I'
}

/** Tributos que não mudam entre Presumido e Real (ICMS, IPI, ISS), pelos valores da situação atual. */
function constantes(atual: SituacaoAtual) {
  const t: Partial<Record<Tributo, number>> = {}
  for (const k of ['ICMS', 'IPI', 'ISS'] as Tributo[])
    if ((atual.valores[k] ?? 0) > 0) t[k] = atual.valores[k]!
  return t
}

function regAtualTotal(regimes: ResultadoRegime[], id: IdRegime | null) {
  const r = id ? regimes.find((x) => x.id === id) : null
  return r && r.disponivel ? r.total : null
}

export function compararRegimes(p: Perfil, atual: SituacaoAtual): Comparativo {
  const receita = p.receitaAnual ?? 0
  const servicos = Math.min(Math.max(p.receitaServicos ?? 0, 0), receita)
  const geral = receita - servicos
  const folha = p.folhaAnual ?? 0
  const encargo = (p.encargoPatronal ?? 0) / 100
  const inss = folha * encargo
  const fixos = constantes(atual)
  const atualId = regimeIdDoPerfil(p)
  const avisos: string[] = []
  const memInss: LinhaMemoria = {
    etapa: 'Contribuição patronal (CPP + RAT + terceiros)',
    formula: `${fmt(folha)} × ${pc(encargo)}`,
    valor: inss,
  }
  const memFixos: LinhaMemoria[] = Object.entries(fixos).map(([k, v]) => ({
    etapa: `${k} (igual no Presumido e no Real)`,
    formula: 'Valor da situação atual',
    valor: v!,
  }))

  // ---------------- Simples Nacional
  const anexo = anexoProvavel(p)
  const simples: ResultadoRegime = {
    id: 'simples',
    nome: `${NOME_REGIME.simples} (Anexo ${anexo})`,
    disponivel: false,
    tributos: {},
    total: 0,
    total2027: null,
    memoria: [],
    atual: atualId === 'simples',
  }
  const acima = receita > LIMITE_SIMPLES
  // Acima do limite não existe tabela: o modelo estende a 6ª faixa do anexo (mesma alíquota nominal e parcela a deduzir).
  const ult = ANEXOS_SIMPLES[anexo][ANEXOS_SIMPLES[anexo].length - 1]
  const a =
    acima && receita > 0
      ? {
          nominal: ult[1],
          deduzir: ult[2],
          efetiva: (receita * ult[1] - ult[2]) / receita,
          faixa: 6,
        }
      : aliquotaEfetivaSimples(anexo, receita)
  if (!receita || !a) simples.motivo = 'Receita não informada.'
  else {
    if (acima) {
      simples.modelo = true
      simples.nome += ' · modelo'
      simples.motivo = `Calculado só como modelo: a receita de ${fmt(receita)} passa do limite de ${fmt(LIMITE_SIMPLES)} por ano (LC 123/2006, art. 3º), e a empresa não pode optar pelo Simples.`
    } else simples.disponivel = true
    simples.tributos.DAS = receita * a.efetiva
    simples.memoria.push({
      etapa: `DAS — Anexo ${anexo}, faixa ${a.faixa}${acima ? ' estendida (modelo)' : ''}`,
      formula: `(${fmt(receita)} × ${pc(a.nominal)} − ${fmt(a.deduzir)}) ÷ ${fmt(receita)} = ${pc(a.efetiva)} efetiva × receita`,
      valor: simples.tributos.DAS,
      nota: acima
        ? 'Modelo: a tabela do Simples vai até R$ 4,8 mi'
        : 'Inclui IRPJ, CSLL, PIS, COFINS, CPP, ICMS/ISS/IPI do anexo',
    })
    if (anexo === 'IV') {
      simples.tributos.INSS = inss
      simples.memoria.push({ ...memInss, etapa: 'CPP fora do DAS (Anexo IV)' })
    }
    // Acima do sublimite de R$ 3,6 mi (6ª faixa), ICMS e ISS não estão no DAS: são pagos à parte (LC 123/2006, art. 13-A).
    if (receita > SUBLIMITE)
      for (const k of ['ICMS', 'ISS'] as Tributo[])
        if (fixos[k]) {
          simples.tributos[k] = fixos[k]
          simples.memoria.push({
            etapa: `${k} fora do DAS (receita acima do sublimite de R$ 3,6 mi)`,
            formula: 'Valor da situação atual',
            valor: fixos[k]!,
          })
        }
    simples.total = Object.values(simples.tributos).reduce((s, v) => s + (v || 0), 0)
  }

  // ---------------- Lucro Presumido
  const presumido: ResultadoRegime = {
    id: 'presumido',
    nome: NOME_REGIME.presumido,
    disponivel: false,
    tributos: {},
    total: 0,
    total2027: null,
    memoria: [],
    atual: atualId === 'presumido',
  }
  if (!receita) presumido.motivo = 'Receita não informada.'
  else if (receita > LIMITE_PRESUMIDO)
    presumido.motivo = `Receita acima de ${fmt(LIMITE_PRESUMIDO)} por ano: obrigada ao Lucro Real (Lei 9.718/1998, art. 14).`
  else {
    presumido.disponivel = true
    let baseIr = geral * 0.08 + servicos * 0.32
    let baseCs = geral * 0.12 + servicos * 0.32
    presumido.memoria.push({
      etapa: 'Base presumida do IRPJ',
      formula: `${fmt(geral)} × 8%${servicos ? ` + serviços ${fmt(servicos)} × 32%` : ''}`,
      valor: baseIr,
    })
    presumido.memoria.push({
      etapa: 'Base presumida da CSLL',
      formula: `${fmt(geral)} × 12%${servicos ? ` + serviços ${fmt(servicos)} × 32%` : ''}`,
      valor: baseCs,
    })
    if (receita > LIMITE_LC224) {
      const fator = 1 + ((receita - LIMITE_LC224) / receita) * 0.1
      baseIr *= fator
      baseCs *= fator
      presumido.memoria.push({
        etapa: 'Acréscimo da LC 224/2025 (receita acima de R$ 5 mi)',
        formula: `bases × (1 + ${fmt(receita - LIMITE_LC224)} ÷ ${fmt(receita)} × 10%) = × ${fator.toFixed(4).replace('.', ',')}`,
        valor: baseIr,
      })
    }
    const irpj = baseIr * 0.15 + Math.max(baseIr - ADICIONAL, 0) * 0.1
    const csll = baseCs * 0.09
    Object.assign(presumido.tributos, {
      IRPJ: irpj,
      CSLL: csll,
      PIS: receita * 0.0065,
      COFINS: receita * 0.03,
      INSS: inss,
      ...fixos,
    })
    presumido.memoria.push({
      etapa: 'IRPJ',
      formula: `15% × ${fmt(baseIr)} + 10% × (${fmt(baseIr)} − ${fmt(ADICIONAL)})`,
      valor: irpj,
    })
    presumido.memoria.push({ etapa: 'CSLL', formula: `9% × ${fmt(baseCs)}`, valor: csll })
    presumido.memoria.push({
      etapa: 'PIS/COFINS cumulativos',
      formula: `${fmt(receita)} × (0,65% + 3%)`,
      valor: receita * 0.0365,
    })
    presumido.memoria.push(memInss, ...memFixos)
    presumido.total = Object.values(presumido.tributos).reduce((s, v) => s + (v || 0), 0)
    presumido.total2027 = irpj + csll + inss
  }

  // ---------------- Lucro Real
  const real: ResultadoRegime = {
    id: 'real',
    nome: NOME_REGIME.real,
    disponivel: false,
    tributos: {},
    total: 0,
    total2027: null,
    memoria: [],
    atual: atualId === 'real',
  }
  if (!receita) real.motivo = 'Receita não informada.'
  else if (p.lucroContabil == null)
    real.motivo = 'Informe o lucro antes do IRPJ/CSLL (ou importe a ECF) para simular o Lucro Real.'
  else {
    real.disponivel = true
    const lucro = p.lucroContabil
    const prej = Math.max(p.prejuizoFiscal ?? 0, 0)
    const comp = lucro > 0 ? Math.min(prej, lucro * 0.3) : 0
    const base = Math.max(lucro - comp, 0)
    real.memoria.push({
      etapa: 'Lucro real antes da compensação',
      formula: fmt(lucro),
      valor: lucro,
      nota: lucro < 0 ? 'Prejuízo no ano: sem IRPJ/CSLL' : undefined,
    })
    if (comp)
      real.memoria.push({
        etapa: 'Compensação de prejuízo fiscal (limite de 30%)',
        formula: `mín(${fmt(prej)}; 30% × ${fmt(lucro)})`,
        valor: -comp,
      })
    const irpj = base * 0.15 + Math.max(base - ADICIONAL, 0) * 0.1
    const csll = base * 0.09
    const compras = Math.max(p.comprasCreditaveis ?? 0, 0)
    const basePc = Math.max(receita - compras, 0)
    Object.assign(real.tributos, {
      IRPJ: irpj,
      CSLL: csll,
      PIS: basePc * 0.0165,
      COFINS: basePc * 0.076,
      INSS: inss,
      ...fixos,
    })
    real.memoria.push({
      etapa: 'IRPJ',
      formula: `15% × ${fmt(base)} + 10% × (${fmt(base)} − ${fmt(ADICIONAL)})`,
      valor: irpj,
    })
    real.memoria.push({ etapa: 'CSLL', formula: `9% × ${fmt(base)}`, valor: csll })
    real.memoria.push({
      etapa: 'PIS/COFINS não cumulativos',
      formula: `(${fmt(receita)} − compras com crédito ${fmt(compras)}) × 9,25%`,
      valor: basePc * 0.0925,
    })
    real.memoria.push(memInss, ...memFixos)
    real.total = Object.values(real.tributos).reduce((s, v) => s + (v || 0), 0)
    real.total2027 = irpj + csll + inss
    if (!p.comprasCreditaveis)
      avisos.push(
        'Sem compras com direito a crédito no perfil: o PIS/COFINS do Lucro Real está sem créditos (superestimado).',
      )
  }

  const regimes = [simples, presumido, real]
  const disponiveis = regimes.filter((r) => r.disponivel)
  const melhor = disponiveis.length
    ? disponiveis.reduce((m, r) => (r.total < m.total ? r : m))
    : null
  const regAtual = atualId ? regimes.find((r) => r.id === atualId) || null : null
  const linhasTributo = (
    ['DAS', 'IRPJ', 'CSLL', 'PIS', 'COFINS', 'INSS', 'ICMS', 'IPI', 'ISS'] as Tributo[]
  ).filter((t) => regimes.some((r) => (r.tributos[t] ?? 0) > 0))
  if (simples.modelo && regAtualTotal(regimes, atualId) != null) {
    const ref = regAtualTotal(regimes, atualId)!
    const d = simples.total - ref
    avisos.unshift(
      `Simples Nacional como modelo (Anexo ${anexo}): carga de ${fmt(simples.total)} por ano, ${d < 0 ? fmt(-d) + ' a menos' : fmt(d) + ' a mais'} que a tributação atual. Serve só de referência: a empresa não pode optar porque a receita passa de R$ 4,8 milhões.`,
    )
  }

  let situacao: Comparativo['situacao'] = 'sem-dados'
  let economia = 0,
    economiaPct = 0,
    conclusao = ''
  if (!melhor)
    conclusao = 'Dados insuficientes para comparar: informe receita anual, lucro e folha no perfil.'
  else if (!regAtual) {
    situacao = 'sem-atual'
    conclusao = `Regime atual não informado no perfil. Com os dados atuais, o regime de menor carga é o ${melhor.nome} (${fmt(melhor.total)} por ano).`
  } else if (!regAtual.disponivel) {
    situacao = 'sem-dados'
    conclusao = `Não foi possível simular o regime atual (${regAtual.nome}): ${regAtual.motivo}`
  } else {
    economia = regAtual.total - melhor.total
    economiaPct = regAtual.total > 0 ? economia / regAtual.total : 0
    if (melhor.id === regAtual.id) {
      situacao = 'ideal'
      const segundo = disponiveis
        .filter((r) => r.id !== regAtual.id)
        .sort((x, y) => x.total - y.total)[0]
      conclusao =
        `A tributação atual (${regAtual.nome}) já é a ideal: é a de menor carga entre os regimes possíveis.` +
        (segundo
          ? ` A segunda melhor opção, ${segundo.nome}, custaria ${fmt(segundo.total - regAtual.total)} a mais por ano (${fmt((segundo.total - regAtual.total) / 12)} por mês).`
          : '')
    } else if (economia < Math.max(5_000, regAtual.total * 0.01)) {
      situacao = 'equivalente'
      conclusao = `${regAtual.nome} e ${melhor.nome} ficam praticamente equivalentes (diferença de ${fmt(economia)} por ano, ${pc(economiaPct)}). Não compensa trocar só por isso.`
    } else {
      situacao = 'trocar'
      conclusao = `O ${melhor.nome} seria melhor que a tributação atual (${regAtual.nome}): economia estimada de ${fmt(economia)} por ano (${fmt(economia / 12)} por mês, ${pc(economiaPct)} da carga comparada).`
    }
  }

  // A partir de 2027 o PIS/COFINS dá lugar à CBS (não cumulativa nos dois regimes): só IRPJ, CSLL e CPP seguem diferentes.
  let conclusao2027: string | null = null
  if (presumido.total2027 != null && real.total2027 != null) {
    const dif = presumido.total2027 - real.total2027
    const melhor27 = dif > 0 ? real : presumido
    conclusao2027 =
      Math.abs(dif) < 5_000
        ? `A partir de 2027 (CBS no lugar de PIS/COFINS), Presumido e Real ficam equivalentes em IRPJ/CSLL (diferença de ${fmt(Math.abs(dif))} por ano).`
        : `A partir de 2027 a CBS substitui o PIS/COFINS e é igual no Presumido e no Real; entre esses dois, a diferença fica só em IRPJ/CSLL e o ${melhor27.nome} fica ${fmt(Math.abs(dif))} por ano mais barato.`
  }

  if (!p.receitaAnual) avisos.push('Receita anual não informada no perfil.')
  if (p.encargoPatronal == null && folha)
    avisos.push(
      'Encargo patronal vazio: a contribuição sobre a folha ficou zerada (pesa contra o Simples na comparação).',
    )
  if (!folha)
    avisos.push(
      'Folha não informada: a contribuição patronal ficou zerada nos regimes fora do Simples.',
    )
  if (p.lucroContabil != null && p.lucroContabil < 0)
    avisos.push(
      'Empresa com prejuízo no ano: no Lucro Real não há IRPJ/CSLL, enquanto no Presumido o imposto incide sobre a receita mesmo com prejuízo.',
    )
  if (p.operacoes.monofasicos || p.operacoes.substituicaoTributaria)
    avisos.push(
      'Há produtos monofásicos ou com substituição tributária: a receita deles tem PIS/COFINS (e ICMS, no Simples) diferenciados, o que esta comparação simplificada não separa.',
    )
  if (simples.disponivel)
    avisos.push(
      'No Simples, ICMS, ISS e IPI estão dentro do DAS; conferir vedações (LC 123/2006, art. 17) e sublimite estadual de R$ 3,6 mi para ICMS/ISS.',
    )
  avisos.push(
    'A opção pelo regime é anual e irretratável, feita com o primeiro pagamento do ano (janeiro). Valores com as regras de 2026; confirmar lucro e ajustes do e-Lalur antes de decidir.',
  )

  let pagoSped: Comparativo['pagoSped'] = null
  if (regAtual && regAtual.disponivel) {
    const tribs = (Object.keys(regAtual.tributos) as Tributo[]).filter(
      (t) => (atual.valores[t] ?? 0) > 0 && !['ICMS', 'IPI', 'ISS'].includes(t),
    )
    if (tribs.length)
      pagoSped = {
        tributos: tribs,
        pago: tribs.reduce((s, t) => s + atual.valores[t]!, 0),
        simulado: tribs.reduce((s, t) => s + (regAtual.tributos[t] ?? 0), 0),
      }
  }

  return {
    regimes,
    atualId,
    melhor,
    atual: regAtual,
    economia: r2(economia),
    economiaPct,
    situacao,
    conclusao,
    conclusao2027,
    linhasTributo,
    avisos,
    pagoSped,
  }
}
