// Relatório executivo para o cliente: visual, orientado a decisão. Gerado como HTML e enviado à impressão (Salvar como PDF).
// Sem memória de cálculo detalhada nem fundamentação extensa — isso fica no dossiê técnico (Word).
import logoConsulting from '@/planejamento/assets/logo-consulting.png'
import { fmtMoeda as brl } from './calculo'
import { compararRegimes } from './comparativo'
import { dadosRelatorio } from './respostas'
import { barrasAgrupadas, barrasHorizontais, cronograma, matrizRisco } from './svg'
import type { Estrategia, Planejamento, Tributo } from './tipos'
import { NOME_TRIBUTO } from './tipos'

const esc = (s: unknown) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
const cnpjFmt = (c: string) => c.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
const RISCO: Record<string, number> = { baixo: 1, medio: 2, alto: 3, critico: 4 }
const NOME_RISCO: Record<string, string> = {
  baixo: 'Baixo',
  medio: 'Médio',
  alto: 'Alto',
  critico: 'Crítico',
  'medio-alto': 'Médio/alto',
}

const ESTILO = `
  * { box-sizing: border-box; }
  @page { size: A4; margin: 13mm; }
  body { font-family: "IBM Plex Sans", "Segoe UI", Arial, sans-serif; color: #132420; margin: 0; font-size: 11.5px; line-height: 1.5;
         -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .barra { background: #141726; color: #fff; border-radius: 10px; padding: 12px 18px; display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #0e6b63; }
  .barra img { height: 38px; } .barra .dir { text-align: right; font-size: 10px; color: #c7d5d0; } .barra .marca { font-size: 14px; font-weight: 700; color: #fff; }
  h1 { font-size: 19px; margin: 18px 0 2px; } .sub { color: #5b6b66; }
  h2 { font-size: 14.5px; margin: 22px 0 8px; color: #0b4f4a; border-bottom: 2px solid #d5dfdb; padding-bottom: 3px; page-break-after: avoid; }
  .heroi { margin: 14px 0; border-radius: 14px; padding: 22px; color: #fff; background: linear-gradient(135deg, #0e6b63 0%, #0b4f4a 55%, #141726 100%);
           display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .heroi .r { font-size: 9.5px; text-transform: uppercase; letter-spacing: .14em; color: #b7f0e6; } .heroi .v { font-size: 20px; font-weight: 800; font-variant-numeric: tabular-nums; }
  table { width: 100%; border-collapse: collapse; margin: 6px 0; page-break-inside: auto; } tr { page-break-inside: avoid; }
  th { background: #eef4f2; text-align: left; font-size: 9.5px; text-transform: uppercase; letter-spacing: .06em; color: #3d4f4a; }
  th, td { padding: 5px 7px; border-bottom: 1px solid #e3e8e6; vertical-align: top; } td.n, th.n { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .tot td { font-weight: 700; background: #f6f9f8; }
  .ok { color: #1f7a3d; } .risco { color: #b4321f; }
  .grafico { border: 1px solid #e3e8e6; border-radius: 10px; padding: 8px; margin: 8px 0; page-break-inside: avoid; }
  .aviso { border-left: 3px solid #d39a1d; background: #fdf7e9; padding: 6px 10px; margin: 6px 0; font-size: 10.5px; }
  .contato { margin-top: 18px; border-radius: 12px; background: #141726; color: #fff; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; }
  .contato .slogan { font-size: 17px; font-weight: 800; color: #5eead4; }
  .rodape { margin-top: 12px; font-size: 8.5px; color: #6b7a76; border-top: 1px solid #d5dfdb; padding-top: 6px; }
  .quebra { page-break-before: always; }
`

export function montarRelatorioExecutivo(
  pl: Planejamento,
  mapa: Map<number, Estrategia>,
  emitido = new Date(),
): string {
  const d = dadosRelatorio(pl, mapa)
  const { cons, proj } = d
  const acum = proj.anos.reduce((s, a) => s + a.beneficioLiquido, 0)
  const pctReceita = pl.perfil.receitaAnual
    ? ` · ${((d.totalAtual / pl.perfil.receitaAnual) * 100).toFixed(1).replace('.', ',')}% da receita`
    : ''
  const atuais = (Object.entries(pl.atual.valores) as [Tributo, number][]).filter(([, v]) => v)
  const tribCons = (
    Object.entries(cons.porTributo) as [Tributo, { atual: number; economia: number }][]
  ).filter(([, v]) => v.atual || v.economia)
  const riscos = d.recomendadas.filter((x) => ['alto', 'critico'].includes(x.a!.grauRisco || ''))

  const linhasEstrategias = cons.itens
    .map((i) => {
      const a = pl.analises[i.numero],
        e = mapa.get(i.numero)!
      return `<tr><td><b>${esc(e.codigo)}</b> ${esc(e.titulo)}<div class="sub">${esc(a.aplicacaoCliente || e.mecanismo[0]?.split('. ')[0] || '')}</div></td>
      <td>${esc(NOME_RISCO[a.grauRisco || 'medio'])}</td><td class="n">${brl(i.economiaConsiderada)}</td><td class="n">${brl(i.custosAnuais + i.custoImplantacao)}</td><td class="n">${brl(i.economiaConsiderada - i.custosAnuais)}</td></tr>`
    })
    .join('')

  const graficoAntesDepois = tribCons.length
    ? barrasAgrupadas(
        tribCons.map(([t]) => t),
        [
          { nome: 'Atual', valores: tribCons.map(([, v]) => v.atual) },
          { nome: 'Planejado', valores: tribCons.map(([, v]) => v.atual - v.economia) },
        ],
      )
    : ''
  const graficoPorTributo = tribCons.length
    ? barrasHorizontais(tribCons.map(([t, v]) => ({ rotulo: NOME_TRIBUTO[t], valor: v.economia })))
    : ''
  const graficoPorEstrategia = cons.itens.length
    ? barrasHorizontais(
        cons.itens.map((i) => ({
          rotulo: `${String(i.numero).padStart(3, '0')} ${i.titulo}`,
          valor: i.economiaConsiderada,
        })),
      )
    : ''
  const graficoEvolucao = barrasAgrupadas(
    proj.anos.map((a) => String(a.ano)),
    [
      { nome: 'Tributos de referência', valores: proj.anos.map((a) => a.referencia) },
      { nome: 'Tributos planejados', valores: proj.anos.map((a) => a.planejado) },
    ],
  )
  const graficoAnual = barrasAgrupadas(
    proj.anos.map((a) => String(a.ano)),
    [
      { nome: 'Economia anual', valores: proj.anos.map((a) => a.economia) },
      { nome: 'Benefício líquido', valores: proj.anos.map((a) => a.beneficioLiquido) },
    ],
  )
  const graficoMatriz = cons.itens.length
    ? matrizRisco(
        cons.itens.map((i) => ({
          rotulo: String(i.numero).padStart(3, '0'),
          risco: RISCO[pl.analises[i.numero].grauRisco || 'medio'],
          beneficio: i.economiaConsiderada - i.custosAnuais,
        })),
      )
    : ''
  const cr = compararRegimes(pl.perfil, pl.atual)
  const grafRegimes = cr.regimes.some((r) => r.disponivel || r.modelo)
    ? barrasHorizontais(
        cr.regimes
          .filter((r) => r.disponivel || r.modelo)
          .map((r) => ({
            rotulo:
              r.nome +
              (r.atual ? ' (atual)' : '') +
              (r.id === cr.melhor?.id ? ' — menor carga' : ''),
            valor: r.total,
          })),
      )
    : ''
  const secaoRegimes = cr.melhor
    ? `<h2>Comparativo de regimes de tributação</h2>
  <div class="aviso" style="border-left-color:${cr.situacao === 'trocar' ? '#1f7a3d' : '#0e6b63'};background:#eef7f3"><b>${cr.situacao === 'ideal' ? 'A tributação atual já é a ideal.' : cr.situacao === 'trocar' ? 'Outra tributação seria melhor.' : cr.situacao === 'equivalente' ? 'Tributações praticamente equivalentes.' : 'Comparativo incompleto.'}</b> ${esc(cr.conclusao)}${cr.conclusao2027 ? '<br>' + esc(cr.conclusao2027) : ''}</div>
  <table><tr><th>Tributo</th>${cr.regimes.map((r) => `<th class="n">${esc(r.nome)}${r.atual ? ' · atual' : ''}</th>`).join('')}</tr>
  ${cr.linhasTributo.map((tr) => `<tr><td>${esc(NOME_TRIBUTO[tr])}</td>${cr.regimes.map((r) => `<td class="n">${(r.disponivel || r.modelo) && r.tributos[tr] ? brl(r.tributos[tr]!) : r.disponivel || r.modelo ? '—' : ''}</td>`).join('')}</tr>`).join('')}
  <tr class="tot"><td>Total anual</td>${cr.regimes.map((r) => `<td class="n">${r.disponivel || r.modelo ? brl(r.total) : 'indisponível'}</td>`).join('')}</tr>
  <tr><td>Diferença para a atual</td>${cr.regimes
    .map((r) => {
      const df =
        cr.atual?.disponivel && (r.disponivel || r.modelo) ? r.total - cr.atual.total : null
      return `<td class="n ${df != null && df < 0 ? 'ok' : df ? 'risco' : ''}">${df == null ? '' : df === 0 ? '—' : (df < 0 ? 'economia ' : 'a mais ') + brl(Math.abs(df))}</td>`
    })
    .join('')}</tr></table>
  ${cr.situacao === 'trocar' ? `<p><b>Economia estimada com o ${esc(cr.melhor.nome)}:</b> ${brl(cr.economia)} por ano · ${brl(cr.economia / 12)} por mês · ${(cr.economiaPct * 100).toFixed(1).replace('.', ',')}% da carga comparada.</p>` : ''}
  ${grafRegimes ? `<div class="grafico"><b>Carga anual por regime</b>${grafRegimes}</div>` : ''}
  ${cr.regimes
    .filter((r) => !r.disponivel)
    .map((r) => `<div class="aviso">${esc(r.nome)}: ${esc(r.motivo)}</div>`)
    .join('')}
  <div class="aviso">${esc(cr.avisos[cr.avisos.length - 1])}</div>`
    : ''
  const graficoCrono = cronograma(
    pl.tarefas.map((t) => ({
      rotulo: t.descricao,
      prazo: t.prazo,
      concluida: t.status === 'Concluída' || t.status === 'Faturada',
    })),
  )

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Planejamento Tributário — ${esc(pl.nome)}</title><style>${ESTILO}</style></head><body>
  <div class="barra"><img src="${logoConsulting}" alt="C Consulting Group"><div class="dir"><div class="marca">C CONT · Contabilidade Estratégica</div>Planejamento tributário · emitido em ${emitido.toLocaleDateString('pt-BR')}</div></div>
  <h1>PLANEJAMENTO TRIBUTÁRIO ESTRATÉGICO — ${esc(pl.nome)} — ${esc(pl.periodo)}</h1>
  <div class="sub">CNPJ ${cnpjFmt(pl.cnpj)} · Responsável técnico: ${esc(pl.responsavel || '—')}</div>

  <h2>Resumo executivo</h2>
  <div class="heroi">
    <div><div class="r">Carga de referência</div><div class="v">${brl(d.totalAtual)}</div><div class="r">${pl.atual.anoReferencia}${pctReceita}</div></div>
    <div><div class="r">Economia consolidada/ano</div><div class="v">${brl(cons.economiaTributaria)}</div><div class="r">sem dupla contagem</div></div>
    <div><div class="r">Benefício líquido 1º ano</div><div class="v">${brl(cons.beneficioLiquido)}</div><div class="r">após custos</div></div>
    <div><div class="r">Líquido 2026–2033</div><div class="v">${brl(acum)}</div><div class="r">com a transição da reforma</div></div>
  </div>
  <p>${
    cons.itens.length
      ? `Principais estratégias: ${cons.itens
          .slice()
          .sort((a, b) => b.economiaConsiderada - a.economiaConsiderada)
          .slice(0, 4)
          .map(
            (i) =>
              `<b>${String(i.numero).padStart(3, '0')}</b> ${esc(i.titulo)} (${brl(i.economiaConsiderada)}/ano)`,
          )
          .join('; ')}.`
      : 'Ainda não há estratégias recomendadas: este relatório mostra a situação atual e a projeção de referência.'
  }</p>
  ${riscos.length ? `<div class="aviso"><b>Riscos relevantes:</b> ${riscos.map((x) => `${x.e.codigo} — ${esc(x.a!.justificativaRisco || x.e.riscoTexto)}`).join('; ')}.</div>` : ''}

  <h2>Situação tributária atual</h2>
  <table><tr><th>Tributo</th><th class="n">Valor anual</th><th>Fonte</th></tr>
  ${atuais.map(([t, v]) => `<tr><td>${esc(NOME_TRIBUTO[t])}</td><td class="n">${brl(v)}</td><td class="sub">${esc(pl.atual.fontes[t] || '')}</td></tr>`).join('')}
  <tr class="tot"><td>Total</td><td class="n">${brl(d.totalAtual)}</td><td></td></tr></table>

  ${secaoRegimes}

  <h2>Estratégias recomendadas</h2>
  ${cons.itens.length ? `<table><tr><th>Estratégia e aplicação</th><th>Risco</th><th class="n">Economia/ano</th><th class="n">Custos</th><th class="n">Líquido/ano</th></tr>${linhasEstrategias}</table>` : "<p class='sub'>Nenhuma estratégia recomendada até o momento.</p>"}
  ${graficoPorEstrategia ? `<div class="grafico"><b>Economia individual por estratégia</b>${graficoPorEstrategia}</div>` : ''}

  <h2>Comparativo antes e depois</h2>
  ${graficoAntesDepois ? `<div class="grafico"><b>Tributos atuais × planejados</b>${graficoAntesDepois}</div>` : "<p class='sub'>Sem dados suficientes.</p>"}
  ${graficoPorTributo ? `<div class="grafico"><b>Economia por tributo</b>${graficoPorTributo}</div>` : ''}

  <h2>Economia consolidada</h2>
  <table><tr><th>Indicador</th><th class="n">Mensal</th><th class="n">Anual</th></tr>
    <tr><td>Economia tributária</td><td class="n">${brl(cons.economiaTributaria / 12)}</td><td class="n">${brl(cons.economiaTributaria)}</td></tr>
    <tr><td>Custos de manutenção e outros impactos</td><td class="n">${brl(cons.custosAnuais / 12)}</td><td class="n">${brl(cons.custosAnuais)}</td></tr>
    <tr class="tot"><td>Benefício econômico líquido (recorrente)</td><td class="n">${brl((cons.economiaTributaria - cons.custosAnuais) / 12)}</td><td class="n">${brl(cons.economiaTributaria - cons.custosAnuais)}</td></tr>
    <tr><td>Custo de implantação (único)</td><td class="n"></td><td class="n">${brl(cons.custoImplantacao)}</td></tr></table>
  ${cons.avisos.map((a) => `<div class="aviso">${esc(a)}</div>`).join('')}

  <h2 class="quebra">Projeções até 2033</h2>
  <table><tr><th>Ano</th><th class="n">Tributos de referência</th><th class="n">Tributos planejados</th><th class="n">Economia estimada</th><th>Mudança no ano</th></tr>
  ${proj.anos.map((a) => `<tr><td>${a.ano}</td><td class="n">${brl(a.referencia)}</td><td class="n">${brl(a.planejado)}</td><td class="n ok">${brl(a.economia)}</td><td class="sub">${esc(a.nota)}</td></tr>`).join('')}</table>
  <div class="grafico"><b>Evolução da carga tributária 2026–2033</b>${graficoEvolucao}</div>
  <div class="grafico"><b>Economia consolidada anual</b>${graficoAnual}</div>
  ${proj.avisos.map((a) => `<div class="aviso">${esc(a)}</div>`).join('')}

  ${graficoMatriz ? `<h2>Matriz de risco × benefício econômico</h2><div class="grafico">${graficoMatriz}</div>` : ''}

  <h2>Plano de implementação</h2>
  ${pl.tarefas.length ? `<table><tr><th>Ação</th><th>Responsável</th><th>Área</th><th>Prazo</th><th>Status</th></tr>${pl.tarefas.map((t) => `<tr><td>${esc(t.descricao)}</td><td>${esc(t.responsavel)}</td><td>${esc(t.area)}</td><td>${t.prazo ? t.prazo.split('-').reverse().join('/') : '—'}</td><td>${esc(t.status)}</td></tr>`).join('')}</table>` : "<p class='sub'>Plano a definir após a aprovação das estratégias.</p>"}
  ${graficoCrono ? `<div class="grafico"><b>Cronograma de implementação</b>${graficoCrono}</div>` : ''}

  <h2>Decisões necessárias</h2>
  <ol>${cons.itens.map((i) => `<li>Aprovar a estratégia ${String(i.numero).padStart(3, '0')} — ${esc(i.titulo)} (responsável: ${esc(pl.analises[i.numero].aprovador || 'a definir')}).</li>`).join('') || '<li>Validar o perfil e a situação tributária atual para concluir a seleção de estratégias.</li>'}</ol>

  <div class="contato"><div><b>C Consulting Group</b><br>Av. República do Líbano, 251, Sl. 616, Torre I, Pina, Recife/PE<br>controladoria@caldasadvocacia.adv.br · +55 81 9995-7501</div><div class="slogan">Resultados importam!</div></div>
  <div class="rodape">Simulação de planejamento tributário com base nas apurações fornecidas e nas regras vigentes em ${emitido.toLocaleDateString('pt-BR')}. Valores potenciais não são economia realizada nem promessa de resultado;
  alíquotas de CBS/IBS de 2027 em diante são premissas (CBS ${pl.premissas.aliquotaCbs}%, IBS ${pl.premissas.aliquotaIbs}%) até a fixação oficial. A implementação depende de documentos, aprovação do cliente e, quando indicado, parecer jurídico.
  Documento confidencial: compartilhar apenas por canal autenticado.</div>
  </body></html>`
}

export function abrirRelatorioExecutivo(pl: Planejamento, mapa: Map<number, Estrategia>) {
  const html = montarRelatorioExecutivo(pl, mapa)
  const w = window.open('', '_blank')
  if (!w)
    throw new Error('O navegador bloqueou a janela do relatório. Permita pop-ups para este site.')
  w.document.open()
  w.document.write(html)
  w.document.close()
  w.onload = () => setTimeout(() => w.print(), 300)
}
