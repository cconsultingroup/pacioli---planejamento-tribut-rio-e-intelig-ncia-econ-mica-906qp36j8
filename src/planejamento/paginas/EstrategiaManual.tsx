import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/planejamento/ui/card'
import { Skeleton } from '@/planejamento/ui/skeleton'
import { SeloRisco, brl, useManual } from '@/planejamento/components/comuns'
import { CALCULADORAS, calculadoraPadrao } from '@/planejamento/lib/calculo'
import { areaDoModelo } from '@/planejamento/lib/triagem'

function S({ n, t, children }: { n: string; t: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          <span className="text-muted-foreground">{n}</span> {t}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm leading-relaxed">{children}</CardContent>
    </Card>
  )
}

export default function EstrategiaManual() {
  const { numero } = useParams()
  const { manual, mapa } = useManual()
  if (!manual) return <Skeleton className="h-96 w-full" />
  const e = mapa.get(Number(numero))
  if (!e) return <p>Estratégia não encontrada.</p>
  const refs = new Map(manual.referencias.map((r) => [r.codigo, r.descricao]))
  const bloco = manual.blocos.find((b) => b.numero === e.bloco)
  return (
    <div className="space-y-4">
      <Link
        to="/planejamento-tributario/estrategias"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3" /> Base de estratégias
      </Link>
      <div>
        <h1 className="font-display text-2xl font-bold">
          Estratégia {e.codigo} — {e.titulo}
        </h1>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <SeloRisco risco={e.risco} />
          <span>{e.riscoTexto}</span>
          <span>·</span>
          <span>Modelo {e.modelo}</span>
          <span>·</span>
          <span>
            {bloco
              ? `Bloco ${String(bloco.numero).padStart(2, '0')} · ${bloco.nome}`
              : 'Incorporada pela inteligência adaptativa'}
          </span>
          <span>·</span>
          <span>Área: {areaDoModelo(e.modelo)}</span>
          <span>·</span>
          <span>Calculadora: {CALCULADORAS[calculadoraPadrao(e)].nome}</span>
        </div>
      </div>
      <S n="01" t="Mecanismo, substância e cliente elegível">
        {e.mecanismo.map((x, i) => (
          <p key={i}>{x}</p>
        ))}
      </S>
      <S n="02" t="Base legal, limites e interpretação crítica">
        {e.baseLegal.map((x, i) => (
          <p key={i}>{x}</p>
        ))}
      </S>
      <S n="03" t="Diagnóstico, documentos e teste de contraprova">
        <p>
          <b>Evidências primárias:</b> {e.evidencias}
        </p>
        <p>
          <b>Contraprova obrigatória:</b> {e.contraprova}
        </p>
        <p>
          <b>Regra de bloqueio:</b> {e.bloqueio}
        </p>
      </S>
      <S n="04" t="Memória de cálculo demonstrativa (exemplo didático do manual)">
        <p className="text-xs text-muted-foreground">{e.memoria.aviso}</p>
        <table className="w-full text-xs">
          <thead className="text-left uppercase text-muted-foreground">
            <tr>
              <th>Etapa</th>
              <th>Fórmula / valor</th>
              <th>Condição</th>
            </tr>
          </thead>
          <tbody>
            {e.memoria.linhas.map((l, i) => (
              <tr key={i} className="border-t align-top">
                <td className="py-1 pr-2">{l.etapa}</td>
                <td className="py-1 pr-2 font-mono">{l.formula}</td>
                <td className="py-1 text-muted-foreground">{l.condicao}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>{e.memoria.materialidade}</p>
        <p className="text-xs text-muted-foreground">{e.memoria.formula}</p>
        {e.memoria.economiaIlustrativa != null && (
          <p className="text-xs">
            Valor ilustrativo: {brl(e.memoria.economiaIlustrativa)} — economia reconhecida = R$ 0,00
            até aceite técnico e jurídico.
          </p>
        )}
      </S>
      <S n="05" t="Fluxograma documental e trilha de aprovação">
        <ol className="list-decimal pl-5">
          {e.fluxo.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ol>
        <p className="text-xs text-muted-foreground">{e.pontoControle}</p>
      </S>
      <S n="06" t="Lançamentos contábeis e conciliações">
        {e.lancamentos.map((x, i) => (
          <p key={i}>{x}</p>
        ))}
      </S>
      <S n="07" t="Declarações, pagamentos, SPED e reflexos">
        {e.declaracoes.map((x, i) => (
          <p key={i}>{x}</p>
        ))}
      </S>
      <S n="08" t="Risco, red flags e mitigação">
        <p>
          <b>Alerta:</b> {e.alerta}
        </p>
        <p>{e.riscoExtrapolacao}</p>
        <p>
          <b>Mitigação:</b> {e.mitigacao}
        </p>
      </S>
      <S n="09" t="Matriz anual 2026–2033">
        <table className="w-full text-xs">
          <tbody>
            {e.matrizAnual.map((m) => (
              <tr key={m.ano} className="border-t">
                <td className="py-1 pr-3 font-medium">{m.ano}</td>
                <td className="py-1">{m.texto}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-muted-foreground">{e.matrizNota}</p>
      </S>
      <S n="10" t="Roteiro de implementação, responsáveis e decisão">
        <ol className="list-decimal pl-5">
          {e.roteiro.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ol>
        {e.handoff && (
          <p>
            <b>Handoff:</b> {e.handoff}
          </p>
        )}
        {e.parecerConclusao && (
          <p>
            <b>Parecer de conclusão:</b> {e.parecerConclusao}
          </p>
        )}
      </S>
      <S n="11" t="Fontes primárias e roteiro de conferência legal">
        <ul className="list-disc pl-5">
          {e.fontes.map((f) => (
            <li key={f}>
              <b>{f}</b>
              {refs.get(f) ? ` — ${refs.get(f)}` : ''}
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">{e.fontesTexto}</p>
      </S>
    </div>
  )
}
