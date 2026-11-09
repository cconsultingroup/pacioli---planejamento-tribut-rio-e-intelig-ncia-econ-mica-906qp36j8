// Dados comuns dos relatórios e as respostas obrigatórias ao final de cada planejamento.
import { avaliar, consolidar, fmtMoeda, projetar, ETAPAS_CONSOLIDADAS } from './calculo'
import { triar } from './triagem'
import type { Estrategia, Planejamento, Tributo } from './tipos'
import { NOME_ETAPA, NOME_SITUACAO, NOME_TRIBUTO } from './tipos'

export function dadosRelatorio(pl: Planejamento, mapa: Map<number, Estrategia>) {
  const cons = consolidar(pl, mapa)
  const proj = projetar(pl, cons)
  const totalAtual = Object.values(pl.atual.valores).reduce((s, v) => s + (v || 0), 0)
  const ctxBase = { perfil: pl.perfil, premissas: pl.premissas, atual: pl.atual }
  const triagem = [...mapa.values()].map((e) => {
    const a = pl.analises[e.numero]
    const t = triar(e, pl.perfil)
    return {
      e,
      a,
      t,
      final: a?.situacao || t.sugestao,
      av: a ? avaliar(a, { ...ctxBase, estrategia: e }) : null,
    }
  })
  const recomendadas = triagem.filter((x) => x.a && ETAPAS_CONSOLIDADAS.includes(x.a.etapa))
  const emAnalise = triagem.filter((x) => x.a && x.a.etapa === 'em-analise')
  const contagem = (s: string) => triagem.filter((x) => x.final === s).length
  return { cons, proj, totalAtual, triagem, recomendadas, emAnalise, contagem }
}

export interface Resposta {
  pergunta: string
  resposta: string
}

export function respostasObrigatorias(
  pl: Planejamento,
  mapa: Map<number, Estrategia>,
  oportunidadesInteligencia: string[] = [],
): Resposta[] {
  const d = dadosRelatorio(pl, mapa)
  const tributos = (Object.entries(pl.atual.valores) as [Tributo, number][])
    .filter(([, v]) => v)
    .map(([t, v]) => `${NOME_TRIBUTO[t]} ${fmtMoeda(v)}`)
    .join('; ')
  const total2633 = d.proj.anos.reduce(
    (s, a) => ({ eco: s.eco + a.economia, cus: s.cus + a.custos }),
    { eco: 0, cus: 0 },
  )
  const pct = pl.perfil.receitaAnual
    ? ` (${((d.totalAtual / pl.perfil.receitaAnual) * 100).toFixed(2).replace('.', ',')}% da receita)`
    : ''
  const aplicaveis = d.triagem.filter((x) =>
    ['aplicavel', 'condicionada', 'alto-risco'].includes(x.final),
  )
  return [
    {
      pergunta: 'Quanto o cliente tributa atualmente?',
      resposta: `${fmtMoeda(d.totalAtual)} por ano no exercício ${pl.atual.anoReferencia}${pct}. ${tributos || 'Situação atual ainda não informada.'}`,
    },
    {
      pergunta: 'Quais estratégias podem ser aplicadas?',
      resposta:
        `${d.contagem('aplicavel')} aplicáveis, ${d.contagem('condicionada')} condicionadas, ${d.contagem('alto-risco')} de alto risco, ${d.contagem('nao-recomendada')} não recomendadas e ${d.contagem('inaplicavel')} inaplicáveis, de ${d.triagem.length}. ` +
        (d.recomendadas.length
          ? `Recomendadas: ${d.recomendadas.map((x) => `${x.e.codigo} ${x.e.titulo} (${NOME_ETAPA[x.a!.etapa]})`).join('; ')}.`
          : `Nenhuma recomendada ainda; em análise: ${d.emAnalise.map((x) => x.e.codigo).join(', ') || 'nenhuma'}. Principais aplicáveis: ${aplicaveis
              .slice(0, 8)
              .map((x) => x.e.codigo)
              .join(', ')}.`),
    },
    {
      pergunta: 'Quanto cada estratégia poderá economizar?',
      resposta: d.cons.itens.length
        ? d.cons.itens
            .map(
              (i) =>
                `${String(i.numero).padStart(3, '0')}: ${fmtMoeda(i.economiaBruta)}/ano isolada; ${fmtMoeda(i.economiaConsiderada)} no conjunto; líquido ${fmtMoeda(i.economiaConsiderada - i.custosAnuais)}`,
            )
            .join(' · ')
        : 'Sem estratégias recomendadas com memória de cálculo.',
    },
    {
      pergunta: 'Como serão calculados os tributos depois de sua aplicação?',
      resposta: d.recomendadas.length
        ? d.recomendadas
            .map((x) => {
              const mem = x.av?.memoria || []
              const iPlan = mem.findIndex((m) => /^CENÁRIO PLANEJADO/.test(m.etapa))
              const linhas = (iPlan >= 0 ? [mem[iPlan], ...mem.slice(iPlan + 1)] : mem)
                .filter((m) => m.formula || /^CENÁRIO/.test(m.etapa))
                .slice(0, 5)
              return `${x.e.codigo}: ${linhas.map((m) => (m.formula ? `${m.etapa} = ${m.formula}` : m.etapa)).join('; ') || 'lançamento direto por tributo (ver premissas)'}`
            })
            .join(' · ')
        : 'Ver memória de cálculo no dossiê de cada estratégia.',
    },
    {
      pergunta: 'Qual será a economia total consolidada, sem dupla contagem?',
      resposta: `${fmtMoeda(d.cons.economiaTributaria)} por ano em tributos; custos anuais ${fmtMoeda(d.cons.custosAnuais)} e implantação ${fmtMoeda(d.cons.custoImplantacao)}; benefício líquido no 1º ano ${fmtMoeda(d.cons.beneficioLiquido)}. ${d.cons.avisos.join(' ')}`,
    },
    {
      pergunta: 'Qual o impacto econômico de 2026 a 2033?',
      resposta:
        `Economia acumulada ${fmtMoeda(total2633.eco)}, custos ${fmtMoeda(total2633.cus)}, líquido ${fmtMoeda(total2633.eco - total2633.cus)}. ` +
        d.proj.anos.map((a) => `${a.ano}: ${fmtMoeda(a.economia)}`).join('; ') +
        `. Premissas: CBS ${pl.premissas.aliquotaCbs}%, IBS ${pl.premissas.aliquotaIbs}%, crescimento ${pl.premissas.crescimentoReceita}% a.a.`,
    },
    {
      pergunta: 'Quais os riscos e custos da implementação?',
      resposta: d.recomendadas.length
        ? d.recomendadas
            .map(
              (x) =>
                `${x.e.codigo}: risco ${x.a!.grauRisco || x.e.risco} (${x.a!.justificativaRisco || x.e.riscoTexto}); implantação ${fmtMoeda(x.a!.custoImplantacao)}, manutenção ${fmtMoeda(x.a!.custoManutencao)}/ano`,
            )
            .join(' · ')
        : 'Definidos por estratégia no dossiê.',
    },
    {
      pergunta: 'Quais ações deverão ser realizadas para alcançar a economia?',
      resposta: pl.tarefas.length
        ? pl.tarefas
            .map(
              (t) =>
                `[${t.status}] ${t.descricao} — ${t.responsavel || 'sem responsável'} (${t.area})${t.prazo ? ', até ' + t.prazo.split('-').reverse().join('/') : ''}`,
            )
            .join(' · ')
        : 'Plano de implementação ainda sem tarefas.',
    },
    {
      pergunta: 'Quais oportunidades adicionais foram identificadas pela inteligência adaptativa?',
      resposta: oportunidadesInteligencia.length
        ? oportunidadesInteligencia.join(' · ')
        : 'Nenhuma proposta aprovada da inteligência adaptativa se aplica a este cliente até o momento.',
    },
  ]
}

export const nomeSituacao = NOME_SITUACAO
