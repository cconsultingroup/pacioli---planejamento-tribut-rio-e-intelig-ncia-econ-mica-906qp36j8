import { useMemo } from 'react'
import { ArrowLeft, ListPlus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/planejamento/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/planejamento/ui/card'
import { Input } from '@/planejamento/ui/input'
import {
  Aviso,
  CampoMoeda,
  Kpi,
  Rotulo,
  SeloRisco,
  SeloSituacao,
  brl,
  classeSelect,
  classeTexto,
} from '@/planejamento/components/comuns'
import {
  ANOS,
  CALCULADORAS,
  avaliar,
  consolidar,
  fatorTributo,
  novaAnalise,
  type CampoCalc,
} from '@/planejamento/lib/calculo'
import { areaDoModelo, triar } from '@/planejamento/lib/triagem'
import type {
  AnaliseEstrategia,
  Estrategia,
  Etapa,
  GrauRisco,
  LinhaEfeito,
  Manual,
  Planejamento,
  Situacao,
  Tributo,
} from '@/planejamento/lib/tipos'
import { NOME_ETAPA, NOME_SITUACAO, NOME_TRIBUTO, TRIBUTOS } from '@/planejamento/lib/tipos'
import type { Alterar } from '@/planejamento/paginas/Planejamento'

function Secao({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          <span className="text-muted-foreground">{n}.</span> {titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm leading-relaxed">{children}</CardContent>
    </Card>
  )
}

function CampoEntrada({
  c,
  valor,
  aoMudar,
}: {
  c: CampoCalc
  valor: unknown
  aoMudar: (v: number | string | boolean | null) => void
}) {
  if (c.tipo === 'bool')
    return (
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={!!valor} onChange={(e) => aoMudar(e.target.checked)} />{' '}
        {c.rotulo}
      </label>
    )
  if (c.tipo === 'opcao' || c.tipo === 'tributo') {
    const ops =
      c.tipo === 'tributo'
        ? TRIBUTOS.map((t) => [t, NOME_TRIBUTO[t]] as [string, string])
        : c.opcoes || []
    return (
      <Rotulo texto={c.rotulo} ajuda={c.ajuda}>
        <select
          className={classeSelect}
          value={String(valor ?? '')}
          onChange={(e) => aoMudar(e.target.value)}
        >
          {ops.map(([k, t]) => (
            <option key={k} value={k}>
              {t}
            </option>
          ))}
        </select>
      </Rotulo>
    )
  }
  return (
    <Rotulo texto={c.rotulo} ajuda={c.ajuda}>
      <CampoMoeda
        sufixo={c.tipo === 'pct' ? '%' : c.tipo === 'numero' ? 'nº' : undefined}
        valor={typeof valor === 'number' ? valor : null}
        aoMudar={aoMudar}
      />
    </Rotulo>
  )
}

export function AbaDossie({
  pl,
  manual,
  e,
  alterar,
  voltar,
}: {
  pl: Planejamento
  manual: Manual
  e: Estrategia
  alterar: Alterar
  voltar: () => void
}) {
  const a: AnaliseEstrategia =
    pl.analises[e.numero] ||
    novaAnalise(e, { perfil: pl.perfil, premissas: pl.premissas, atual: pl.atual })
  const ctx = { perfil: pl.perfil, premissas: pl.premissas, atual: pl.atual, estrategia: e }
  const t = triar(e, pl.perfil)
  const av = avaliar(a, ctx)
  const calc = CALCULADORAS[a.calculadora] || CALCULADORAS.generico
  const mapa = useMemo(() => new Map(manual.estrategias.map((x) => [x.numero, x])), [manual])
  const refs = new Map(manual.referencias.map((r) => [r.codigo, r.descricao]))

  const set = (patch: Partial<AnaliseEstrategia>) =>
    alterar((p) => ({
      ...p,
      analises: {
        ...p.analises,
        [e.numero]: {
          ...(p.analises[e.numero] || a),
          ...patch,
          atualizadoEm: new Date().toISOString(),
        },
      },
    }))
  const setEntrada = (k: string, v: number | string | boolean | null) =>
    set({ entradas: { ...a.entradas, [k]: v } })
  const trocarCalc = (id: string) => {
    const c = CALCULADORAS[id]
    const entradas: AnaliseEstrategia['entradas'] = {}
    for (const campo of c.campos) entradas[campo.id] = campo.padrao(ctx)
    set({ calculadora: id, entradas })
  }
  const setLinha = (i: number, patch: Partial<LinhaEfeito>) =>
    set({ linhasExtras: a.linhasExtras.map((l, j) => (j === i ? { ...l, ...patch } : l)) })

  // Interações: outras estratégias em análise que mexem nos mesmos tributos.
  const tribs = new Set(av.efeitos.map((x) => x.tributo))
  const interacoes = Object.values(pl.analises)
    .filter(
      (o) =>
        o.numero !== e.numero &&
        o.etapa !== 'descartada' &&
        o.etapa !== 'identificada' &&
        mapa.has(o.numero),
    )
    .map((o) => ({
      o,
      ef: avaliar(o, { ...ctx, estrategia: mapa.get(o.numero)! }).efeitos.filter((x) =>
        tribs.has(x.tributo),
      ),
    }))
    .filter((x) => x.ef.length)
  const cons = consolidar(pl, mapa)
  const noConsolidado = cons.itens.find((i) => i.numero === e.numero)

  // Resultado financeiro por ano (esta estratégia isolada).
  const g = (pl.premissas.crescimentoReceita || 0) / 100
  const porAno = ANOS.map((ano) => {
    if (ano < a.anoInicio) return { ano, economia: 0, custos: 0 }
    const custos = av.custosAnuais + (ano === a.anoInicio ? a.custoImplantacao : 0)
    if (!a.recorrente && ano !== a.anoInicio) return { ano, economia: 0, custos }
    const economia = Object.entries(av.porTributo).reduce(
      (s, [tr, v]) =>
        s +
        (v || 0) *
          fatorTributo(tr as Tributo, ano) *
          (a.recorrente ? Math.pow(1 + g, ano - a.anoInicio) : 1),
      0,
    )
    return { ano, economia, custos }
  })
  const acumulado = porAno.reduce((s, x) => s + x.economia - x.custos, 0)
  const situacaoFinal: Situacao = a.situacao || t.sugestao
  const negativo = av.economiaTributaria !== 0 && av.beneficioLiquidoRecorrente <= 0

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={voltar}>
        <ArrowLeft /> Voltar à triagem
      </Button>
      <div>
        <h2 className="font-display text-xl font-bold">
          Estratégia {e.codigo} — {e.titulo}
        </h2>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
          <SeloSituacao s={situacaoFinal} sugerida={!a.situacao} />
          <SeloRisco risco={e.risco} />
          <span className="text-muted-foreground">
            Modelo {e.modelo} · Bloco {String(e.bloco).padStart(2, '0')} · Área:{' '}
            {areaDoModelo(e.modelo)}
          </span>
        </div>
      </div>

      <Card className="border-primary/30">
        <CardContent className="grid gap-3 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <Rotulo
            texto="Situação (decisão da equipe)"
            ajuda={`Sugestão da triagem: ${NOME_SITUACAO[t.sugestao]}`}
          >
            <select
              className={classeSelect}
              value={a.situacao || ''}
              onChange={(ev) => set({ situacao: (ev.target.value || null) as Situacao | null })}
            >
              <option value="">Usar a sugestão</option>
              {(Object.keys(NOME_SITUACAO) as Situacao[]).map((s) => (
                <option key={s} value={s}>
                  {NOME_SITUACAO[s]}
                </option>
              ))}
            </select>
          </Rotulo>
          <Rotulo texto="Etapa">
            <select
              className={classeSelect}
              value={a.etapa}
              onChange={(ev) => set({ etapa: ev.target.value as Etapa })}
            >
              {(Object.keys(NOME_ETAPA) as Etapa[]).map((k) => (
                <option key={k} value={k}>
                  {NOME_ETAPA[k]}
                </option>
              ))}
            </select>
          </Rotulo>
          <Rotulo texto="Ano de início">
            <select
              className={classeSelect}
              value={a.anoInicio}
              onChange={(ev) => set({ anoInicio: Number(ev.target.value) })}
            >
              {ANOS.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Rotulo>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input
              type="checkbox"
              checked={a.recorrente}
              onChange={(ev) => set({ recorrente: ev.target.checked })}
            />{' '}
            Economia recorrente (todo ano)
          </label>
        </CardContent>
      </Card>
      {negativo && (
        <Aviso tom="risco">
          Benefício líquido zero ou negativo: custos e efeitos superam a economia. Considere
          classificar como "Não recomendada".
        </Aviso>
      )}
      {!negativo && acumulado < 0 && (
        <Aviso>
          Ganho nas regras atuais, mas resultado acumulado 2026–2033 negativo: a economia vem de
          tributos que deixam de existir (PIS/COFINS/IPI em 2027, ICMS/ISS até 2033). Reavalie o
          horizonte da decisão.
        </Aviso>
      )}
      {e.risco === 'alto' && (
        <Aviso tom="risco">
          {e.riscoTexto}. {e.bloqueio}
        </Aviso>
      )}
      {e.numero === 124 && (
        <Aviso>
          Seguro de vida resgatável: integra o processo normalmente, sem pressupor economia
          automática de encargos nem dedutibilidade fiscal. Testar IRRF, INSS, FGTS, IRPJ/CSLL e
          contabilização separadamente (COSIT 105/2025, Súmula CARF 182).
        </Aviso>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi
          titulo="Economia tributária/ano (regras atuais)"
          valor={brl(av.economiaTributaria)}
          destaque
        />
        <Kpi
          titulo="Custos anuais"
          valor={brl(av.custosAnuais)}
          detalhe={`Implantação ${brl(a.custoImplantacao)}`}
        />
        <Kpi
          titulo="Benefício líquido/ano"
          valor={brl(av.beneficioLiquidoRecorrente)}
          detalhe={`1º ano: ${brl(av.beneficioLiquidoAno1)} · mensal ≈ ${brl(av.beneficioLiquidoRecorrente / 12)}`}
        />
        <Kpi
          titulo="Acumulado 2026–2033 (com a reforma)"
          valor={brl(acumulado)}
          detalhe="PIS/COFINS/IPI só em 2026; ICMS/ISS em transição"
        />
      </div>

      <Secao n={1} titulo="Objetivo da estratégia">
        {e.mecanismo.map((x, i) => (
          <p key={i}>{x}</p>
        ))}
        {e.memoria.materialidade && (
          <p className="text-xs text-muted-foreground">
            Referência do manual (exemplo didático, não é valor do cliente):{' '}
            {e.memoria.materialidade}
          </p>
        )}
      </Secao>

      <Secao n={2} titulo="Aplicação ao cliente">
        <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
          {t.motivos.map((m) => (
            <li key={m}>{m}</li>
          ))}
          {t.vigencia && <li>{t.vigencia}</li>}
        </ul>
        <Rotulo texto="Por que a estratégia é adequada a este CNPJ (fatos, documentos, operação)">
          <textarea
            className={classeTexto}
            rows={4}
            value={a.aplicacaoCliente}
            onChange={(ev) => set({ aplicacaoCliente: ev.target.value })}
          />
        </Rotulo>
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg bg-muted/50 p-2 text-xs">
            <b>Evidências primárias:</b> {e.evidencias}
          </div>
          <div className="rounded-lg bg-muted/50 p-2 text-xs">
            <b>Contraprova obrigatória:</b> {e.contraprova}
          </div>
          <div className="rounded-lg bg-muted/50 p-2 text-xs">
            <b>Regra de bloqueio:</b> {e.bloqueio}
          </div>
        </div>
      </Secao>

      <Secao n={3} titulo="Fundamentação jurídica">
        {e.baseLegal.map((x, i) => (
          <p key={i}>{x}</p>
        ))}
        <div>
          <div className="text-xs font-semibold uppercase text-muted-foreground">
            Fontes primárias (conferir o texto vigente na competência)
          </div>
          <ul className="mt-1 list-disc pl-5">
            {e.fontes.map((f) => (
              <li key={f}>
                <b>{f}</b>
                {refs.get(f) ? ` — ${refs.get(f)}` : ''}
              </li>
            ))}
          </ul>
        </div>
      </Secao>

      <Secao n={4} titulo="Como implementar">
        <ol className="list-decimal space-y-1 pl-5">
          {e.roteiro.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ol>
        {e.handoff && (
          <p className="text-xs text-muted-foreground">
            <b>Handoff:</b> {e.handoff}
          </p>
        )}
      </Secao>

      <Secao n={5} titulo="Fluxograma documental">
        <div className="flex flex-wrap items-center gap-2">
          {e.fluxo.map((x, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="max-w-56 rounded-lg border bg-card px-3 py-2 text-xs">
                <span className="font-semibold text-primary">{String(i + 1).padStart(2, '0')}</span>{' '}
                {x}
              </div>
              {i < e.fluxo.length - 1 && <span className="text-muted-foreground">→</span>}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">{e.pontoControle}</p>
      </Secao>

      <Secao n={6} titulo="Memória de cálculo completa">
        <div className="grid gap-3 md:grid-cols-[2fr_3fr]">
          <div className="space-y-3">
            <Rotulo texto="Calculadora" ajuda={calc.descricao}>
              <select
                className={classeSelect}
                value={a.calculadora}
                onChange={(ev) => trocarCalc(ev.target.value)}
              >
                {Object.values(CALCULADORAS).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </Rotulo>
            {calc.campos.map((c) => (
              <CampoEntrada
                key={c.id}
                c={c}
                valor={a.entradas[c.id]}
                aoMudar={(v) => setEntrada(c.id, v)}
              />
            ))}
          </div>
          <div className="space-y-2">
            <table className="w-full text-xs">
              <thead className="text-left uppercase text-muted-foreground">
                <tr>
                  <th className="py-1">Etapa</th>
                  <th className="py-1">Fórmula</th>
                  <th className="py-1 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {av.memoria.map((m, i) => (
                  <tr
                    key={i}
                    className={
                      m.valor == null && !m.formula ? 'bg-muted/50 font-semibold' : 'border-t'
                    }
                  >
                    <td className="py-1 pr-2">
                      {m.etapa}
                      {m.nota ? (
                        <span className="block text-muted-foreground">{m.nota}</span>
                      ) : null}
                    </td>
                    <td className="py-1 pr-2 font-mono text-[11px]">{m.formula}</td>
                    <td className="py-1 text-right tabular-nums">
                      {m.valor == null ? '' : brl(m.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {av.avisos.map((x) => (
              <Aviso key={x}>{x}</Aviso>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Lançamentos diretos por tributo (complementam a calculadora)
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                set({
                  linhasExtras: [
                    ...a.linhasExtras,
                    { tributo: 'OUTROS', descricao: '', atual: 0, planejado: 0, baseChave: '' },
                  ],
                })
              }
            >
              <Plus /> Linha
            </Button>
          </div>
          {a.linhasExtras.map((l, i) => (
            <div
              key={i}
              className="mb-2 grid items-end gap-2 sm:grid-cols-[120px_1fr_150px_150px_140px_40px]"
            >
              <select
                className={classeSelect}
                value={l.tributo}
                onChange={(ev) => setLinha(i, { tributo: ev.target.value as Tributo })}
              >
                {TRIBUTOS.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
              <Input
                placeholder="Descrição / memória"
                value={l.descricao}
                onChange={(ev) => setLinha(i, { descricao: ev.target.value })}
              />
              <CampoMoeda
                placeholder="atual"
                valor={l.atual}
                aoMudar={(v) => setLinha(i, { atual: v || 0 })}
              />
              <CampoMoeda
                placeholder="planejado"
                valor={l.planejado}
                aoMudar={(v) => setLinha(i, { planejado: v || 0 })}
              />
              <Input
                placeholder="base (evita dupla contagem)"
                value={l.baseChave}
                onChange={(ev) => setLinha(i, { baseChave: ev.target.value })}
              />
              <Button
                size="icon"
                variant="ghost"
                aria-label="Remover"
                onClick={() => set({ linhasExtras: a.linhasExtras.filter((_, j) => j !== i) })}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Rotulo texto="Custo de implantação (único)">
            <CampoMoeda
              valor={a.custoImplantacao}
              aoMudar={(v) => set({ custoImplantacao: v || 0 })}
            />
          </Rotulo>
          <Rotulo texto="Custo de manutenção (por ano)">
            <CampoMoeda
              valor={a.custoManutencao}
              aoMudar={(v) => set({ custoManutencao: v || 0 })}
            />
          </Rotulo>
          <Rotulo texto="Outros impactos econômicos negativos (por ano)">
            <CampoMoeda valor={a.outrosImpactos} aoMudar={(v) => set({ outrosImpactos: v || 0 })} />
          </Rotulo>
        </div>
        <Rotulo texto="Premissas e hipóteses (fonte de cada base e alíquota)">
          <textarea
            className={classeTexto}
            rows={3}
            value={a.premissas}
            onChange={(ev) => set({ premissas: ev.target.value })}
          />
        </Rotulo>
        <p className="text-xs text-muted-foreground">
          Fórmula: economia tributária = tributo no cenário atual − tributo no cenário planejado.
          Benefício líquido = economia − custos incrementais − outros impactos. {e.memoria.formula}
        </p>
      </Secao>

      <Secao n={7} titulo="Impacto tributário">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th>Tributo</th>
              <th>Descrição</th>
              <th className="text-right">Atual</th>
              <th className="text-right">Planejado</th>
              <th className="text-right">Economia</th>
            </tr>
          </thead>
          <tbody>
            {av.efeitos.map((x, i) => (
              <tr key={i} className="border-t">
                <td className="py-1">{x.tributo}</td>
                <td className="py-1 text-xs text-muted-foreground">{x.descricao}</td>
                <td className="py-1 text-right tabular-nums">{brl(x.atual)}</td>
                <td className="py-1 text-right tabular-nums">{brl(x.planejado)}</td>
                <td
                  className={
                    'py-1 text-right font-medium tabular-nums ' +
                    (x.atual - x.planejado < 0 ? 'text-risco' : 'text-ok')
                  }
                >
                  {brl(x.atual - x.planejado)}
                </td>
              </tr>
            ))}
            {!av.efeitos.length && (
              <tr>
                <td colSpan={5} className="py-2 text-muted-foreground">
                  Sem valores ainda: preencha a memória de cálculo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {interacoes.length > 0 && (
          <div className="text-xs">
            <b>Interações com outras estratégias em análise (mesmos tributos):</b>{' '}
            {interacoes
              .map(
                ({ o, ef }) =>
                  `${String(o.numero).padStart(3, '0')} (${[...new Set(ef.map((x) => x.tributo))].join(', ')})`,
              )
              .join('; ')}
            .
            {noConsolidado?.notas.length ? (
              <span className="text-aviso"> {noConsolidado.notas.join(' ')}</span>
            ) : (
              ' A consolidação não soma a mesma base duas vezes.'
            )}
          </div>
        )}
      </Secao>

      <Secao n={8} titulo="Obrigações fiscais afetadas">
        {e.declaracoes.map((x, i) => (
          <p key={i}>{x}</p>
        ))}
        <div className="text-xs font-semibold uppercase text-muted-foreground">
          Lançamentos contábeis e conciliações
        </div>
        {e.lancamentos.map((x, i) => (
          <p key={i} className="text-muted-foreground">
            {x}
          </p>
        ))}
      </Secao>

      <Secao n={9} titulo="Grau de risco">
        <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
          <Rotulo texto="Classificação">
            <select
              className={classeSelect}
              value={a.grauRisco || ''}
              onChange={(ev) => set({ grauRisco: (ev.target.value || null) as GrauRisco | null })}
            >
              <option value="baixo">Baixo</option>
              <option value="medio">Médio</option>
              <option value="alto">Alto</option>
              <option value="critico">Crítico</option>
            </select>
          </Rotulo>
          <Rotulo texto="Justificativa">
            <textarea
              className={classeTexto}
              rows={2}
              value={a.justificativaRisco}
              onChange={(ev) => set({ justificativaRisco: ev.target.value })}
            />
          </Rotulo>
        </div>
        <p>
          <b>Manual:</b> {e.riscoTexto}. {e.alerta}
        </p>
        <p className="text-muted-foreground">{e.riscoExtrapolacao}</p>
        <p className="text-muted-foreground">
          <b>Mitigação:</b> {e.mitigacao}
        </p>
      </Secao>

      <Secao n={10} titulo="Resultado financeiro">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th>Ano</th>
                <th className="text-right">Economia</th>
                <th className="text-right">Custos</th>
                <th className="text-right">Líquido</th>
                <th className="pl-3">Efeito da reforma (manual)</th>
              </tr>
            </thead>
            <tbody>
              {porAno.map((x) => (
                <tr key={x.ano} className="border-t align-top">
                  <td className="py-1">{x.ano}</td>
                  <td className="py-1 text-right tabular-nums">{brl(x.economia)}</td>
                  <td className="py-1 text-right tabular-nums">{brl(x.custos)}</td>
                  <td className="py-1 text-right font-medium tabular-nums">
                    {brl(x.economia - x.custos)}
                  </td>
                  <td className="py-1 pl-3 text-xs text-muted-foreground">
                    {e.matrizAnual
                      .find((m) => m.ano === x.ano)
                      ?.texto.replace(/R\$ [\d.,]+/g, '[valor do exemplo]')}
                  </td>
                </tr>
              ))}
              <tr className="border-t font-semibold">
                <td className="py-1">Acumulado</td>
                <td className="py-1 text-right">
                  {brl(porAno.reduce((s, x) => s + x.economia, 0))}
                </td>
                <td className="py-1 text-right">{brl(porAno.reduce((s, x) => s + x.custos, 0))}</td>
                <td className="py-1 text-right">{brl(acumulado)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
        <Rotulo texto="Economia já realizada (comprovada em guia/apuração)">
          <CampoMoeda
            className="max-w-xs"
            valor={a.economiaRealizada}
            aoMudar={(v) => set({ economiaRealizada: v || 0 })}
          />
        </Rotulo>
      </Secao>

      <Secao n={11} titulo="Plano de execução">
        <div className="grid gap-3 sm:grid-cols-3">
          <Rotulo texto="Responsável pela execução">
            <Input value={a.responsavel} onChange={(ev) => set({ responsavel: ev.target.value })} />
          </Rotulo>
          <Rotulo texto="Responsável pela aprovação">
            <Input value={a.aprovador} onChange={(ev) => set({ aprovador: ev.target.value })} />
          </Rotulo>
          <Rotulo texto="Prazo">
            <Input type="date" value={a.prazo} onChange={(ev) => set({ prazo: ev.target.value })} />
          </Rotulo>
        </div>
        <Rotulo texto="Documentos pendentes">
          <textarea
            className={classeTexto}
            rows={2}
            value={a.documentosPendentes}
            onChange={(ev) => set({ documentosPendentes: ev.target.value })}
          />
        </Rotulo>
        <Rotulo texto="Dependências e observações">
          <textarea
            className={classeTexto}
            rows={2}
            value={a.notas}
            onChange={(ev) => set({ notas: ev.target.value })}
          />
        </Rotulo>
        <p className="text-xs text-muted-foreground">{e.parecerConclusao}</p>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            alterar((p) => {
              const area = areaDoModelo(e.modelo).startsWith('Caldas')
                ? 'Caldas Advocacia'
                : areaDoModelo(e.modelo).startsWith('C Capital')
                  ? 'C Capital'
                  : 'C CONT'
              const novas = e.roteiro.map((r, i) => ({
                id: `${e.numero}-${Date.now()}-${i}`,
                descricao: `Estratégia ${e.codigo} — ${r.split(':')[0]}: ${r.split(':').slice(1).join(':').trim() || r}`,
                responsavel: a.responsavel,
                area: area as 'C CONT',
                prazo: a.prazo,
                status: 'Nova' as const,
                dependencia: i ? `Etapa ${i} da estratégia ${e.codigo}` : '',
              }))
              return { ...p, tarefas: [...p.tarefas, ...novas] }
            })
          }
        >
          <ListPlus /> Levar o roteiro ao plano de implementação
        </Button>
      </Secao>
    </div>
  )
}
