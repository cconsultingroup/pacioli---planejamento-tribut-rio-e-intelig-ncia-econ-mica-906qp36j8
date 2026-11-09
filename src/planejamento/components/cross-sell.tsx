// Seletor do "Possível cross-sell": portfólio do grupo em botões, com sugestões a partir do perfil do cliente.
// O valor continua sendo texto ("Holding (Caldas); New Tax Plan (C CONT)"), compatível com os registros antigos.
import { useState } from 'react'
import { Check, Plus, Sparkles } from 'lucide-react'
import { Input } from '@/planejamento/ui/input'
import type { Perfil, SituacaoAtual } from '@/planejamento/lib/tipos'
import { cn } from '@/planejamento/lib/utils'

export const PORTFOLIO: { nome: string; braco: 'Caldas' | 'C CONT' | 'C Capital' }[] = [
  { nome: 'Processos Judiciais por Êxito', braco: 'Caldas' },
  { nome: 'Negociação Caixa', braco: 'Caldas' },
  { nome: 'Parcelamento ICMS / Transação Tributária', braco: 'Caldas' },
  { nome: 'Holding Patrimonial e Sucessória', braco: 'Caldas' },
  { nome: 'Governança Societária / Private Equity', braco: 'Caldas' },
  { nome: 'MS 10% Lucro Presumido', braco: 'Caldas' },
  { nome: 'Transação Estruturada (CAPAG/NJP)', braco: 'Caldas' },
  { nome: 'Contábil Estratégico', braco: 'C CONT' },
  { nome: 'Sistema S', braco: 'C CONT' },
  { nome: 'New Tax Plan (Reforma do Consumo)', braco: 'C CONT' },
  { nome: 'CFP®', braco: 'C Capital' },
  { nome: 'Seguros / Previdência', braco: 'C Capital' },
  { nome: 'Crédito Estressado', braco: 'C Capital' },
  { nome: 'Cash Colateral', braco: 'C Capital' },
  { nome: '13º Patrimonial', braco: 'C Capital' },
  { nome: 'IB / Abertura de Conta', braco: 'C Capital' },
  { nome: 'Câmbio', braco: 'C Capital' },
  { nome: 'CRI/CRA', braco: 'C Capital' },
]
const rotulo = (p: (typeof PORTFOLIO)[number]) => `${p.nome} (${p.braco})`

/** Sugestões com o motivo, a partir do perfil e da situação atual. */
export function sugerirCrossSell(perfil?: Perfil, atual?: SituacaoAtual): Record<string, string> {
  const s: Record<string, string> = {}
  const add = (nome: string, motivo: string) => {
    const p = PORTFOLIO.find((x) => x.nome === nome)
    if (p && !s[rotulo(p)]) s[rotulo(p)] = motivo
  }
  add('New Tax Plan (Reforma do Consumo)', 'todo cliente é afetado pela CBS/IBS de 2027 a 2033')
  if (!perfil) return s
  const so = perfil.societario,
    op = perfil.operacoes,
    se = perfil.setores
  if (so.patrimonioImobiliarioPF)
    add('Holding Patrimonial e Sucessória', 'imóveis na pessoa física dos sócios')
  if (so.sociosRecebemDividendos) {
    add(
      'Holding Patrimonial e Sucessória',
      'sócios recebem lucros (tributação de dividendos desde 2026)',
    )
    add('CFP®', 'planejamento financeiro dos sócios')
  }
  if (so.grupoEconomico || so.reorganizacao)
    add('Governança Societária / Private Equity', 'grupo econômico ou reorganização em vista')
  if ((perfil.passivoTributario ?? 0) > 0) {
    add('Parcelamento ICMS / Transação Tributária', 'há passivo tributário')
    add(
      'Transação Estruturada (CAPAG/NJP)',
      'passivo pode ser negociado pela capacidade de pagamento',
    )
  }
  if (perfil.regime === 'presumido') add('MS 10% Lucro Presumido', 'empresa no Lucro Presumido')
  if ((perfil.empregados ?? 0) >= 50 || (perfil.folhaAnual ?? 0) >= 2_400_000) {
    add('Sistema S', 'folha relevante (contribuições a terceiros)')
    add('Seguros / Previdência', 'benefícios a empregados e dirigentes')
  }
  if (op.exporta || op.importa) add('Câmbio', 'opera com exterior')
  if (se.agro) add('CRI/CRA', 'lastro agroindustrial (CRA)')
  if (se.imobiliario || se.construcao) add('CRI/CRA', 'recebíveis imobiliários (CRI)')
  if ((perfil.receitaAnual ?? 0) >= 6_000_000)
    add('Contábil Estratégico', 'porte do ICP do grupo (faturamento acima de R$ 500 mil/mês)')
  if (perfil.lucroContabil != null && perfil.lucroContabil < 0)
    add('Crédito Estressado', 'resultado negativo: avaliar estrutura de dívida')
  const total = atual ? Object.values(atual.valores).reduce((a, v) => a + (v || 0), 0) : 0
  if (total > 0 && perfil.receitaAnual && total / perfil.receitaAnual > 0.2)
    add(
      'Processos Judiciais por Êxito',
      'carga acima de 20% da receita: avaliar teses (painel de créditos)',
    )
  return s
}

const separar = (v: string) =>
  v
    .split(/\s*;\s*/)
    .map((x) => x.trim())
    .filter(Boolean)

export function SeletorCrossSell({
  valor,
  aoMudar,
  perfil,
  atual,
}: {
  valor: string
  aoMudar: (v: string) => void
  perfil?: Perfil
  atual?: SituacaoAtual
}) {
  const [livre, setLivre] = useState('')
  const escolhidos = separar(valor)
  const sugestoes = sugerirCrossSell(perfil, atual)
  const alternar = (r: string) =>
    aoMudar(
      (escolhidos.includes(r) ? escolhidos.filter((x) => x !== r) : [...escolhidos, r]).join('; '),
    )
  const outros = escolhidos.filter((e) => !PORTFOLIO.some((p) => rotulo(p) === e))
  const botao = (r: string, sugerido?: string) => {
    const ativo = escolhidos.includes(r)
    return (
      <button
        key={r}
        type="button"
        onClick={() => alternar(r)}
        title={sugerido ? `Sugestão: ${sugerido}` : undefined}
        className={cn(
          'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors',
          ativo
            ? 'border-primary bg-primary text-primary-foreground'
            : sugerido
              ? 'border-aviso/50 bg-aviso/10 hover:bg-aviso/20'
              : 'hover:bg-accent',
        )}
      >
        {ativo ? (
          <Check className="size-3" />
        ) : sugerido ? (
          <Sparkles className="size-3 text-aviso" />
        ) : (
          <Plus className="size-3" />
        )}
        {r}
      </button>
    )
  }
  return (
    <div className="space-y-2">
      {Object.keys(sugestoes).length > 0 && (
        <div>
          <div className="mb-1 text-xs font-medium text-aviso">
            Sugeridos pelo perfil (passe o mouse para ver o motivo)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(sugestoes).map(([r, m]) => botao(r, m))}
          </div>
        </div>
      )}
      {(['Caldas', 'C CONT', 'C Capital'] as const).map((b) => (
        <div key={b}>
          <div className="mb-1 text-xs font-medium text-muted-foreground">
            {b === 'Caldas'
              ? 'Caldas Advocacia'
              : b === 'C CONT'
                ? 'C CONT Contabilidade'
                : 'C Capital (BTG Pactual)'}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PORTFOLIO.filter((p) => p.braco === b && !sugestoes[rotulo(p)]).map((p) =>
              botao(rotulo(p)),
            )}
          </div>
        </div>
      ))}
      {outros.length > 0 && (
        <div className="flex flex-wrap gap-1.5">{outros.map((o) => botao(o))}</div>
      )}
      <div className="flex gap-2">
        <Input
          placeholder="Outro (digite e aperte Enter)"
          value={livre}
          onChange={(e) => setLivre(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && livre.trim()) {
              e.preventDefault()
              aoMudar([...escolhidos, livre.trim()].join('; '))
              setLivre('')
            }
          }}
        />
      </div>
      <div className="text-xs text-muted-foreground">
        {escolhidos.length
          ? `Selecionados: ${escolhidos.join('; ')}`
          : 'Nenhum selecionado — obrigatório escolher ao menos um.'}
      </div>
    </div>
  )
}
