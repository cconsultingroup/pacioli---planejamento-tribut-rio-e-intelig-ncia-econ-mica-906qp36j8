// Dossiê técnico em Word (.docx): fundamentos, estratégias, riscos e memórias de cálculo.
// Blocos e estratégias usam estilos de Título 1/2/3 do Word (Painel de Navegação).
import {
  AlignmentType,
  Document,
  Footer,
  HeadingLevel,
  ImageRun,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableOfContents,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'
import { ANOS, avaliar, fatorTributo, fmtMoeda as brl } from './calculo'
import { compararRegimes } from './comparativo'
import { dadosRelatorio, respostasObrigatorias } from './respostas'
import { barrasAgrupadas, barrasHorizontais, svgParaPng } from './svg'
import { areaDoModelo, triar } from './triagem'
import type { Estrategia, Manual, Planejamento, Tributo } from './tipos'
import { NOME_ETAPA, NOME_SITUACAO, NOME_TRIBUTO } from './tipos'

const cnpjFmt = (c: string) => c.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
const H1 = (t: string) =>
  new Paragraph({ text: t, heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 120 } })
const H2 = (t: string) =>
  new Paragraph({ text: t, heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 100 } })
const H3 = (t: string) =>
  new Paragraph({ text: t, heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 80 } })
const P = (t: string, opt: { negrito?: boolean; cinza?: boolean; italico?: boolean } = {}) =>
  new Paragraph({
    children: [
      new TextRun({
        text: t,
        bold: opt.negrito,
        italics: opt.italico,
        color: opt.cinza ? '5B6B66' : undefined,
        size: 20,
      }),
    ],
    spacing: { after: 80 },
  })
const Rot = (rotulo: string, texto: string) =>
  new Paragraph({
    children: [
      new TextRun({ text: rotulo + ': ', bold: true, size: 20 }),
      new TextRun({ text: texto || '—', size: 20 }),
    ],
    spacing: { after: 60 },
  })
const Item = (t: string) =>
  new Paragraph({
    children: [new TextRun({ text: t, size: 20 })],
    bullet: { level: 0 },
    spacing: { after: 40 },
  })

function tabela(cab: string[], linhas: (string | number)[][], numericas: number[] = []) {
  const cel = (t: string | number, i: number, cabecalho = false) =>
    new TableCell({
      children: [
        new Paragraph({
          alignment: numericas.includes(i) ? AlignmentType.RIGHT : AlignmentType.LEFT,
          children: [
            new TextRun({
              text: typeof t === 'number' ? brl(t) : String(t ?? ''),
              bold: cabecalho,
              size: 17,
            }),
          ],
        }),
      ],
      shading: cabecalho ? { type: ShadingType.CLEAR, color: 'auto', fill: 'E6F0EE' } : undefined,
      margins: { top: 40, bottom: 40, left: 80, right: 80 },
    })
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ tableHeader: true, children: cab.map((c, i) => cel(c, i, true)) }),
      ...linhas.map((l) => new TableRow({ children: l.map((c, i) => cel(c, i)) })),
    ],
  })
}
async function imagem(svg: string) {
  const png = await svgParaPng(svg, 1200)
  return new Paragraph({
    children: [
      new ImageRun({
        type: 'png',
        data: png.dados,
        transformation: { width: 600, height: Math.round((600 * png.altura) / png.largura) },
      }),
    ],
  })
}

export async function gerarDossieWord(
  pl: Planejamento,
  manual: Manual,
  mapa: Map<number, Estrategia>,
): Promise<Blob> {
  const d = dadosRelatorio(pl, mapa)
  const refs = new Map(manual.referencias.map((r) => [r.codigo, r.descricao]))
  const ctxBase = { perfil: pl.perfil, premissas: pl.premissas, atual: pl.atual }
  const lista = d.recomendadas.length ? d.recomendadas : d.emAnalise
  const g = (pl.premissas.crescimentoReceita || 0) / 100
  const filhos: (Paragraph | Table | TableOfContents)[] = []

  filhos.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'DOSSIÊ TÉCNICO — PLANEJAMENTO TRIBUTÁRIO ESTRATÉGICO',
          bold: true,
          size: 32,
          color: '0B4F4A',
        }),
      ],
      spacing: { after: 120 },
    }),
  )
  filhos.push(
    new Paragraph({
      children: [
        new TextRun({ text: `${pl.nome} · CNPJ ${cnpjFmt(pl.cnpj)} · ${pl.periodo}`, size: 24 }),
      ],
      spacing: { after: 60 },
    }),
  )
  filhos.push(
    P(
      `C Consulting Group · C CONT Contabilidade Estratégica · emitido em ${new Date().toLocaleDateString('pt-BR')} · uso restrito a profissionais autorizados.`,
      { cinza: true },
    ),
  )
  filhos.push(
    P(
      'Use Exibir > Painel de Navegação para saltar entre as seções e estratégias. Para atualizar o sumário: botão direito > Atualizar campo.',
      { cinza: true, italico: true },
    ),
  )
  filhos.push(new TableOfContents('Sumário', { hyperlink: true, headingStyleRange: '1-2' }))

  // 1. Identificação e perfil
  filhos.push(H1('1. Identificação e perfil do cliente'))
  const p = pl.perfil
  filhos.push(Rot('Demanda', `[${pl.status}] | ${pl.nome} | C CONT | Planejamento tributário`))
  filhos.push(Rot('Responsável técnico', pl.responsavel))
  filhos.push(Rot('Possível cross-sell', pl.crossSell))
  filhos.push(Rot('Regime', p.regime || 'não informado'))
  filhos.push(
    Rot(
      'Atividade / CNAE',
      `${p.atividade || '—'} / ${p.cnae || '—'} · ${p.municipio || '—'}/${p.uf || '—'}`,
    ),
  )
  filhos.push(
    tabela(
      ['Grandeza', 'Valor anual'],
      [
        ['Receita bruta', p.receitaAnual ?? 0],
        ['Receita de serviços', p.receitaServicos ?? 0],
        ['Lucro antes do IRPJ/CSLL', p.lucroContabil ?? 0],
        ['Compras com direito a crédito', p.comprasCreditaveis ?? 0],
        ['Folha (salários + pró-labore)', p.folhaAnual ?? 0],
        ['Investimento em imobilizado', p.investimentoAnual ?? 0],
        ['Passivo tributário', p.passivoTributario ?? 0],
        ['Prejuízo fiscal / base negativa', p.prejuizoFiscal ?? 0],
      ],
      [1],
    ),
  )

  // 2. Situação atual
  filhos.push(H1('2. Situação tributária atual'))
  filhos.push(
    P(
      `Exercício de referência ${pl.atual.anoReferencia}. Apurações recebidas usadas como referência, sem nova auditoria. ${pl.atual.observacao || ''}`,
    ),
  )
  const atuais = (Object.entries(pl.atual.valores) as [Tributo, number][]).filter(([, v]) => v)
  filhos.push(
    tabela(
      ['Tributo', 'Valor anual', 'Fonte'],
      [
        ...atuais.map(([t, v]) => [NOME_TRIBUTO[t], v, pl.atual.fontes[t] || '']),
        ['Total', d.totalAtual, ''],
      ],
      [1],
    ),
  )

  // 2.1 Comparativo de regimes
  const cr = compararRegimes(pl.perfil, pl.atual)
  filhos.push(H2('2.1 Comparativo de regimes de tributação'))
  filhos.push(P(cr.conclusao, { negrito: true }))
  if (cr.conclusao2027) filhos.push(P(cr.conclusao2027))
  if (cr.melhor) {
    filhos.push(
      tabela(
        ['Tributo', ...cr.regimes.map((r) => r.nome + (r.atual ? ' (atual)' : ''))],
        [
          ...cr.linhasTributo.map((tr) => [
            NOME_TRIBUTO[tr],
            ...cr.regimes.map((r) => (r.disponivel || r.modelo ? (r.tributos[tr] ?? '—') : '')),
          ]),
          [
            'Total anual',
            ...cr.regimes.map((r) => (r.disponivel || r.modelo ? r.total : 'indisponível')),
          ],
          [
            'Diferença para a atual',
            ...cr.regimes.map((r) =>
              cr.atual?.disponivel && (r.disponivel || r.modelo) ? r.total - cr.atual.total : '',
            ),
          ],
          [
            'A partir de 2027 (IRPJ + CSLL + patronal)',
            ...cr.regimes.map((r) => r.total2027 ?? ''),
          ],
        ],
        cr.regimes.map((_, i) => i + 1),
      ),
    )
    if (cr.situacao === 'trocar')
      filhos.push(
        P(
          `Economia estimada com o ${cr.melhor.nome}: ${brl(cr.economia)} por ano (${brl(cr.economia / 12)} por mês; ${(cr.economiaPct * 100).toFixed(1).replace('.', ',')}% da carga comparada).`,
          { negrito: true },
        ),
      )
    for (const r of cr.regimes) {
      if (!r.disponivel && !r.modelo) {
        filhos.push(P(`${r.nome}: ${r.motivo}`, { cinza: true }))
        continue
      }
      filhos.push(H3(`Memória de cálculo — ${r.nome}`))
      if (r.modelo && r.motivo) filhos.push(P(r.motivo, { cinza: true }))
      filhos.push(
        tabela(
          ['Etapa', 'Fórmula', 'Valor'],
          r.memoria.map((m) => [
            m.etapa,
            m.formula + (m.nota ? ' · ' + m.nota : ''),
            m.valor ?? '',
          ]),
          [2],
        ),
      )
    }
  }
  for (const av of cr.avisos) filhos.push(Item(av))

  // 3. Triagem
  filhos.push(H1('3. Triagem das 200 estratégias'))
  filhos.push(
    P(
      `Aplicáveis ${d.contagem('aplicavel')} · Condicionadas ${d.contagem('condicionada')} · Alto risco ${d.contagem('alto-risco')} · Não recomendadas ${d.contagem('nao-recomendada')} · Inaplicáveis ${d.contagem('inaplicavel')}.`,
    ),
  )
  filhos.push(
    tabela(
      ['Estratégia', 'Situação', 'Etapa', 'Motivo'],
      d.triagem
        .filter((x) => x.final !== 'inaplicavel')
        .map((x) => [
          `${x.e.codigo} ${x.e.titulo}`,
          NOME_SITUACAO[x.final] + (x.a?.situacao ? '' : ' (sugestão)'),
          x.a ? NOME_ETAPA[x.a.etapa] : '—',
          x.t.motivos.slice(-1)[0] || '',
        ]),
    ),
  )

  // 4. Estratégias (dossiê individual)
  filhos.push(
    H1(
      d.recomendadas.length
        ? '4. Estratégias recomendadas'
        : '4. Estratégias em análise (ainda não recomendadas)',
    ),
  )
  for (const x of lista) {
    const e = x.e,
      a = x.a!
    const av = avaliar(a, { ...ctxBase, estrategia: e })
    const t = triar(e, pl.perfil)
    filhos.push(H2(`Estratégia ${e.codigo} — ${e.titulo}`))
    filhos.push(
      P(
        `Situação: ${NOME_SITUACAO[a.situacao || t.sugestao]} · Etapa: ${NOME_ETAPA[a.etapa]} · Modelo ${e.modelo} · Área: ${areaDoModelo(e.modelo)}`,
        { cinza: true },
      ),
    )
    filhos.push(H3('1. Objetivo da estratégia'))
    e.mecanismo.forEach((m) => filhos.push(P(m)))
    filhos.push(H3('2. Aplicação ao cliente'))
    if (a.aplicacaoCliente) filhos.push(P(a.aplicacaoCliente))
    t.motivos.forEach((m) => filhos.push(Item(m)))
    filhos.push(Rot('Evidências primárias', e.evidencias))
    filhos.push(Rot('Contraprova obrigatória', e.contraprova))
    filhos.push(Rot('Regra de bloqueio', e.bloqueio))
    filhos.push(H3('3. Fundamentação jurídica'))
    e.baseLegal.forEach((m) => filhos.push(P(m)))
    e.fontes.forEach((f) =>
      filhos.push(
        Item(
          `${f}${refs.get(f) ? ' — ' + refs.get(f) : ''} (conferir texto vigente na competência)`,
        ),
      ),
    )
    filhos.push(H3('4. Como implementar'))
    e.roteiro.forEach((r, i) => filhos.push(P(`${i + 1}. ${r}`)))
    if (e.handoff) filhos.push(Rot('Handoff', e.handoff))
    filhos.push(H3('5. Fluxograma documental'))
    filhos.push(P(e.fluxo.map((f, i) => `${String(i + 1).padStart(2, '0')} ${f}`).join('  →  ')))
    filhos.push(P(e.pontoControle, { cinza: true }))
    filhos.push(H3('6. Memória de cálculo completa'))
    filhos.push(
      tabela(
        ['Etapa', 'Fórmula', 'Valor'],
        av.memoria.map((m) => [
          m.etapa + (m.nota ? ` (${m.nota})` : ''),
          m.formula,
          m.valor == null ? '' : m.valor,
        ]),
        [2],
      ),
    )
    if (a.premissas) filhos.push(Rot('Premissas', a.premissas))
    av.avisos.forEach((w) => filhos.push(Item(w)))
    filhos.push(H3('7. Impacto tributário'))
    filhos.push(
      tabela(
        ['Tributo', 'Descrição', 'Atual', 'Planejado', 'Economia'],
        av.efeitos.map((f) => [
          f.tributo,
          f.descricao,
          f.atual,
          f.planejado,
          f.atual - f.planejado,
        ]),
        [2, 3, 4],
      ),
    )
    const ic = d.cons.itens.find((i) => i.numero === e.numero)
    if (ic?.notas.length) filhos.push(P('Interações: ' + ic.notas.join(' '), { cinza: true }))
    filhos.push(H3('8. Obrigações fiscais afetadas'))
    e.declaracoes.forEach((m) => filhos.push(P(m)))
    e.lancamentos.forEach((m) => filhos.push(P(m, { cinza: true })))
    filhos.push(H3('9. Grau de risco'))
    filhos.push(
      Rot('Classificação', `${a.grauRisco || '—'} — ${a.justificativaRisco || e.riscoTexto}`),
    )
    filhos.push(Rot('Alerta do manual', e.alerta))
    filhos.push(Rot('Mitigação', e.mitigacao))
    filhos.push(H3('10. Resultado financeiro'))
    const anos = ANOS.map((ano) => {
      if (ano < a.anoInicio) return [String(ano), 0, 0, 0]
      const custos = av.custosAnuais + (ano === a.anoInicio ? a.custoImplantacao : 0)
      const eco =
        !a.recorrente && ano !== a.anoInicio
          ? 0
          : Object.entries(av.porTributo).reduce(
              (s, [tr, v]) =>
                s +
                (v || 0) *
                  fatorTributo(tr as Tributo, ano) *
                  (a.recorrente ? Math.pow(1 + g, ano - a.anoInicio) : 1),
              0,
            )
      return [String(ano), eco, custos, eco - custos]
    })
    filhos.push(
      P(
        `Economia mensal ≈ ${brl(av.beneficioLiquidoRecorrente / 12)} · anual ${brl(av.economiaTributaria)} · custos anuais ${brl(av.custosAnuais)} · implantação ${brl(a.custoImplantacao)} · benefício líquido anual ${brl(av.beneficioLiquidoRecorrente)}.`,
      ),
    )
    filhos.push(
      tabela(['Ano', 'Economia', 'Custos', 'Líquido'], anos as (string | number)[][], [1, 2, 3]),
    )
    filhos.push(H3('11. Plano de execução'))
    filhos.push(Rot('Responsável pela execução', a.responsavel))
    filhos.push(Rot('Responsável pela aprovação', a.aprovador))
    filhos.push(Rot('Prazo', a.prazo ? a.prazo.split('-').reverse().join('/') : ''))
    filhos.push(Rot('Documentos pendentes', a.documentosPendentes))
    filhos.push(Rot('Dependências', a.notas))
    filhos.push(P(e.parecerConclusao, { cinza: true }))
  }
  if (!lista.length)
    filhos.push(P('Nenhuma estratégia em análise ou recomendada.', { cinza: true }))

  // 5. Consolidação
  filhos.push(H1('5. Economia consolidada sem dupla contagem'))
  filhos.push(
    P(
      `Economia tributária ${brl(d.cons.economiaTributaria)}/ano · custos anuais ${brl(d.cons.custosAnuais)} · implantação ${brl(d.cons.custoImplantacao)} · benefício líquido 1º ano ${brl(d.cons.beneficioLiquido)}.`,
    ),
  )
  filhos.push(
    tabela(
      ['Estratégia', 'Isolada', 'No conjunto', 'Custos/ano', 'Notas'],
      d.cons.itens.map((i) => [
        `${String(i.numero).padStart(3, '0')} ${i.titulo}`,
        i.economiaBruta,
        i.economiaConsiderada,
        i.custosAnuais,
        i.notas.join(' '),
      ]),
      [1, 2, 3],
    ),
  )
  d.cons.avisos.forEach((w) => filhos.push(Item(w)))
  const tribCons = (
    Object.entries(d.cons.porTributo) as [Tributo, { atual: number; economia: number }][]
  ).filter(([, v]) => v.atual || v.economia)
  if (tribCons.length) {
    filhos.push(
      await imagem(
        barrasAgrupadas(
          tribCons.map(([t]) => t),
          [
            { nome: 'Atual', valores: tribCons.map(([, v]) => v.atual) },
            { nome: 'Planejado', valores: tribCons.map(([, v]) => v.atual - v.economia) },
          ],
        ),
      ),
    )
    filhos.push(
      await imagem(
        barrasHorizontais(
          d.cons.itens.map((i) => ({
            rotulo: `${String(i.numero).padStart(3, '0')} ${i.titulo}`,
            valor: i.economiaConsiderada,
          })),
        ),
      ),
    )
  }

  // 6. Projeção
  filhos.push(H1('6. Projeção 2026–2033'))
  filhos.push(
    tabela(
      [
        'Ano',
        'Tributos de referência',
        'Tributos planejados',
        'Economia estimada',
        'Custos',
        'Regra do ano',
      ],
      d.proj.anos.map((a) => [
        String(a.ano),
        a.referencia,
        a.planejado,
        a.economia,
        a.custos,
        a.nota,
      ]),
      [1, 2, 3, 4],
    ),
  )
  filhos.push(
    await imagem(
      barrasAgrupadas(
        d.proj.anos.map((a) => String(a.ano)),
        [
          { nome: 'Referência', valores: d.proj.anos.map((a) => a.referencia) },
          { nome: 'Planejado', valores: d.proj.anos.map((a) => a.planejado) },
        ],
      ),
    ),
  )
  d.proj.avisos.forEach((w) => filhos.push(Item(w)))

  // 7. Premissas
  filhos.push(H1('7. Premissas e limitações'))
  const pr = pl.premissas
  filhos.push(Item(`Crescimento da receita: ${pr.crescimentoReceita}% a.a.`))
  filhos.push(
    Item(
      `CBS de referência ${pr.aliquotaCbs}% e IBS ${pr.aliquotaIbs}% (premissas até a fixação oficial); sensibilidade ±${pr.sensibilidade} p.p.`,
    ),
  )
  filhos.push(Item(`IRRF sobre JCP: ${pr.aliquotaJcpIrrf}% (premissa).`))
  if (pr.observacao) filhos.push(P(pr.observacao))
  const regras = manual.gerais.find((x) => /dupla contagem/i.test(x.titulo))
  regras?.paragrafos.forEach((m) => filhos.push(P(m, { cinza: true })))

  // 8. Respostas obrigatórias
  filhos.push(H1('8. Respostas obrigatórias do planejamento'))
  for (const r of respostasObrigatorias(pl, mapa)) {
    filhos.push(H3(r.pergunta))
    filhos.push(P(r.resposta))
  }

  const doc = new Document({
    creator: 'C Consulting Group',
    title: `Dossiê técnico — ${pl.nome}`,
    features: { updateFields: true },
    styles: { default: { document: { run: { font: 'Calibri', size: 20 } } } },
    sections: [
      {
        properties: { page: { margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 } } },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `C Consulting Group · Dossiê técnico · ${pl.nome} · confidencial · pág. `,
                    size: 16,
                    color: '6B7A76',
                  }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '6B7A76' }),
                ],
              }),
            ],
          }),
        },
        children: filhos,
      },
    ],
  })
  return Packer.toBlob(doc)
}
