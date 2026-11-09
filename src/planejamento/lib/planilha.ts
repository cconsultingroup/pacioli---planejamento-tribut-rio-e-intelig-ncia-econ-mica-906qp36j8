// Planilha Excel com fórmulas auditáveis: premissas, situação atual, memória de cada estratégia, consolidação e projeção.
// As células de economia e projeção são FÓRMULAS do Excel (não valores colados), para conferência independente.
import ExcelJS from 'exceljs'
import { ANOS, avaliar, fatorTributo } from './calculo'
import { dadosRelatorio } from './respostas'
import type { Estrategia, Planejamento, Tributo } from './tipos'
import { NOME_TRIBUTO, TRIBUTOS } from './tipos'

const MOEDA = '"R$" #,##0.00;[Red]-"R$" #,##0.00'
const cab = (ws: ExcelJS.Worksheet, linha: number) => {
  const r = ws.getRow(linha)
  r.font = { bold: true, color: { argb: 'FF0B4F4A' } }
  r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F0EE' } }
}

export async function gerarPlanilha(
  pl: Planejamento,
  mapa: Map<number, Estrategia>,
): Promise<Blob> {
  const d = dadosRelatorio(pl, mapa)
  const wb = new ExcelJS.Workbook()
  wb.creator = 'C Consulting Group'
  wb.created = new Date()

  // Premissas
  const pr = wb.addWorksheet('Premissas')
  pr.columns = [{ width: 46 }, { width: 18 }, { width: 70 }]
  pr.addRow(['PLANEJAMENTO TRIBUTÁRIO — ' + pl.nome + ' — ' + pl.periodo]).font = {
    bold: true,
    size: 13,
  }
  pr.addRow(['CNPJ', pl.cnpj])
  pr.addRow([])
  pr.addRow(['Premissa', 'Valor', 'Observação'])
  cab(pr, 4)
  pr.addRow(['Crescimento da receita (% a.a.)', pl.premissas.crescimentoReceita / 100, '']) // B5
  pr.addRow(['CBS de referência', pl.premissas.aliquotaCbs / 100, 'Premissa até a fixação oficial']) // B6
  pr.addRow(['IBS de referência', pl.premissas.aliquotaIbs / 100, 'Premissa até a fixação oficial']) // B7
  pr.addRow(['Receita bruta anual', pl.perfil.receitaAnual ?? 0, 'Perfil']) // B8
  pr.addRow(['Compras com direito a crédito', pl.perfil.comprasCreditaveis ?? 0, 'Perfil']) // B9
  pr.addRow(['Exercício de referência', pl.atual.anoReferencia, '']) // B10
  pr.addRow([
    'Optante pelo Simples (1 = sim)',
    pl.perfil.regime === 'simples' ? 1 : 0,
    'No Simples, CBS/IBS ficam no DAS',
  ]) // B11
  ;[5, 6, 7].forEach((r) => (pr.getCell(`B${r}`).numFmt = '0.00%'))
  ;[8, 9].forEach((r) => (pr.getCell(`B${r}`).numFmt = MOEDA))

  // Situação atual
  const at = wb.addWorksheet('Situação atual')
  at.columns = [{ width: 10 }, { width: 38 }, { width: 18 }, { width: 70 }]
  at.addRow(['Código', 'Tributo', 'Valor anual', 'Fonte'])
  cab(at, 1)
  const linhaAtual: Partial<Record<Tributo, number>> = {}
  TRIBUTOS.forEach((t) => {
    const r = at.addRow([t, NOME_TRIBUTO[t], pl.atual.valores[t] ?? 0, pl.atual.fontes[t] || ''])
    r.getCell(3).numFmt = MOEDA
    linhaAtual[t] = r.number
  })
  const totAt = at.addRow(['', 'Total', { formula: `SUM(C2:C${at.rowCount})` }])
  totAt.font = { bold: true }
  totAt.getCell(3).numFmt = MOEDA

  // Estratégias: efeitos por tributo, com economia = atual − planejado em fórmula
  const es = wb.addWorksheet('Estratégias')
  es.columns = [
    { width: 8 },
    { width: 46 },
    { width: 10 },
    { width: 34 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 10 },
    { width: 10 },
  ]
  es.addRow([
    'Nº',
    'Estratégia',
    'Tributo',
    'Descrição',
    'Atual',
    'Planejado',
    'Economia',
    'Considerada no conjunto',
    'Início',
    'Recorrente',
  ])
  cab(es, 1)
  const ctxBase = { perfil: pl.perfil, premissas: pl.premissas, atual: pl.atual }
  for (const it of d.cons.itens) {
    const e = mapa.get(it.numero)!,
      a = pl.analises[it.numero]
    const av = avaliar(a, { ...ctxBase, estrategia: e })
    const somaBruta: Partial<Record<Tributo, number>> = {}
    for (const f of av.efeitos)
      somaBruta[f.tributo] = (somaBruta[f.tributo] || 0) + f.atual - f.planejado
    for (const f of av.efeitos) {
      const r = es.addRow([
        it.numero,
        e.titulo,
        f.tributo,
        f.descricao,
        f.atual,
        f.planejado,
        null,
        null,
        a.anoInicio,
        a.recorrente ? 1 : 0,
      ])
      r.getCell(7).value = { formula: `E${r.number}-F${r.number}` }
      // Fator do conjunto (sobreposição/teto) aplicado proporcionalmente ao tributo.
      const fator = somaBruta[f.tributo]
        ? (it.porTributo[f.tributo] || 0) / somaBruta[f.tributo]!
        : 0
      r.getCell(8).value = { formula: `G${r.number}*${fator.toFixed(6)}` }
      ;[5, 6, 7, 8].forEach((c) => (r.getCell(c).numFmt = MOEDA))
    }
    const rc = es.addRow([
      it.numero,
      'Custos: manutenção + outros impactos (ano) | implantação (único)',
      '',
      '',
      a.custoManutencao + a.outrosImpactos,
      a.custoImplantacao,
    ])
    rc.font = { italic: true }
    ;[5, 6].forEach((c) => (rc.getCell(c).numFmt = MOEDA))
  }
  const ultimaEst = es.rowCount

  // Memória detalhada
  const me = wb.addWorksheet('Memória de cálculo')
  me.columns = [{ width: 8 }, { width: 50 }, { width: 80 }, { width: 18 }]
  me.addRow(['Nº', 'Etapa', 'Fórmula', 'Valor'])
  cab(me, 1)
  for (const x of d.recomendadas.length ? d.recomendadas : d.emAnalise) {
    const av = avaliar(x.a!, { ...ctxBase, estrategia: x.e })
    me.addRow([x.e.numero, `${x.e.codigo} — ${x.e.titulo}`]).font = { bold: true }
    av.memoria.forEach((m) => {
      const r = me.addRow([
        x.e.numero,
        m.etapa + (m.nota ? ` (${m.nota})` : ''),
        m.formula,
        m.valor,
      ])
      r.getCell(4).numFmt = MOEDA
    })
    if (x.a!.premissas) me.addRow([x.e.numero, 'Premissas', x.a!.premissas])
  }

  // Consolidação por tributo (fórmulas SOMASE sobre a aba Estratégias)
  const co = wb.addWorksheet('Consolidação')
  co.columns = [{ width: 10 }, { width: 38 }, { width: 18 }, { width: 18 }, { width: 18 }]
  co.addRow(['Código', 'Tributo', 'Atual', 'Economia no conjunto', 'Planejado'])
  cab(co, 1)
  const tribs = TRIBUTOS.filter((t) => (pl.atual.valores[t] ?? 0) || d.cons.porTributo[t])
  for (const t of tribs) {
    const r = co.addRow([t, NOME_TRIBUTO[t]])
    r.getCell(3).value = { formula: `'Situação atual'!C${linhaAtual[t]}` }
    r.getCell(4).value = {
      formula: `SUMIF(Estratégias!C2:C${ultimaEst},A${r.number},Estratégias!H2:H${ultimaEst})`,
    }
    r.getCell(5).value = { formula: `C${r.number}-D${r.number}` }
    ;[3, 4, 5].forEach((c) => (r.getCell(c).numFmt = MOEDA))
  }
  const n = co.rowCount
  const tc = co.addRow([
    '',
    'Total',
    { formula: `SUM(C2:C${n})` },
    { formula: `SUM(D2:D${n})` },
    { formula: `SUM(E2:E${n})` },
  ])
  tc.font = { bold: true }
  ;[3, 4, 5].forEach((c) => (tc.getCell(c).numFmt = MOEDA))
  co.addRow([])
  d.cons.avisos.forEach((a) => co.addRow(['', a]))

  // Projeção: fatores de transição + fórmulas
  const pj = wb.addWorksheet('Projeção 2026-2033')
  pj.columns = [{ width: 12 }, ...ANOS.map(() => ({ width: 16 }))]
  pj.addRow(['Fator de transição por tributo (EC 132/2023, LC 214/2025)']).font = { bold: true }
  pj.addRow(['Tributo', ...ANOS])
  cab(pj, 2)
  const linhaFator: Partial<Record<Tributo, number>> = {}
  for (const t of TRIBUTOS) {
    const r = pj.addRow([t, ...ANOS.map((a) => fatorTributo(t, a))])
    linhaFator[t] = r.number
  }
  pj.addRow([])
  pj.addRow([
    'Tributos de referência por ano (atual × crescimento × fator; CBS/IBS = (receita − compras) × alíquota-premissa × fator)',
  ]).font = { bold: true }
  const iniRef = pj.rowCount + 1
  pj.addRow(['Tributo', ...ANOS])
  cab(pj, iniRef)
  const col = (i: number) => String.fromCharCode(66 + i) // B..I
  const linhasRef: number[] = []
  for (const t of TRIBUTOS) {
    if (t === 'CBS' || t === 'IBS') {
      const aliq = t === 'CBS' ? 'Premissas!$B$6' : 'Premissas!$B$7'
      const r = pj.addRow([
        t,
        ...ANOS.map((ano, i) => ({
          formula: `IF(Premissas!$B$11=1,0,MAX(Premissas!$B$8-Premissas!$B$9,0)*${aliq}*${col(i)}${linhaFator[t]}*(1+Premissas!$B$5)^(${ano}-Premissas!$B$10))`,
        })),
      ])
      ANOS.forEach((_, i) => (r.getCell(i + 2).numFmt = MOEDA))
      linhasRef.push(r.number)
      continue
    }
    if (!(pl.atual.valores[t] ?? 0)) continue
    const r = pj.addRow([
      t,
      ...ANOS.map((ano, i) => ({
        formula: `'Situação atual'!$C$${linhaAtual[t]}*${col(i)}${linhaFator[t]}*(1+Premissas!$B$5)^(${ano}-Premissas!$B$10)`,
      })),
    ])
    ANOS.forEach((_, i) => (r.getCell(i + 2).numFmt = MOEDA))
    linhasRef.push(r.number)
  }
  const totRef = pj.addRow([
    'Referência',
    ...ANOS.map((_, i) => ({ formula: linhasRef.map((l) => `${col(i)}${l}`).join('+') || '0' })),
  ])
  totRef.font = { bold: true }
  ANOS.forEach((_, i) => (totRef.getCell(i + 2).numFmt = MOEDA))
  pj.addRow([])
  pj.addRow([
    'Economia por ano (valores do sistema, já com fatores de transição e crescimento)',
  ]).font = { bold: true }
  const eco = pj.addRow(['Economia', ...d.proj.anos.map((a) => a.economia)])
  const cus = pj.addRow(['Custos', ...d.proj.anos.map((a) => a.custos)])
  const plan = pj.addRow([
    'Planejado',
    ...ANOS.map((_, i) => ({ formula: `${col(i)}${totRef.number}-${col(i)}${eco.number}` })),
  ])
  const liq = pj.addRow([
    'Líquido',
    ...ANOS.map((_, i) => ({ formula: `${col(i)}${eco.number}-${col(i)}${cus.number}` })),
  ])
  ;[eco, cus, plan, liq].forEach((r) => ANOS.forEach((_, i) => (r.getCell(i + 2).numFmt = MOEDA)))
  liq.font = { bold: true }

  const buf = await wb.xlsx.writeBuffer()
  return new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}
