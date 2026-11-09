// Status da demanda definido automaticamente pelo andamento do planejamento.
// "Faturada" e "Arquivada" não têm como ser deduzidos: só manualmente (o que desliga o automático).
import type { Planejamento, StatusDemanda } from './tipos'

const ESPERAS: StatusDemanda[] = [
  'Aguardando cliente',
  'Aguardando interno',
  'Aguardando terceiro',
  'Aguardando financeiro',
]

export function inferirStatus(
  p: Pick<Planejamento, 'perfil' | 'atual' | 'analises' | 'tarefas' | 'crossSell'>,
): { status: StatusDemanda; motivo: string } {
  const analises = Object.values(p.analises || {}).filter((a) => a.etapa !== 'descartada')
  const tarefas = p.tarefas || []
  const abertas = tarefas.filter((t) => !['Concluída', 'Faturada', 'Arquivada'].includes(t.status))
  const comecou =
    !!p.perfil?.regime ||
    Object.keys(p.atual?.valores || {}).length > 0 ||
    analises.some((a) => a.etapa !== 'identificada') ||
    tarefas.length > 0
  const decididas = analises.filter((a) =>
    ['aprovada', 'implementada', 'realizada'].includes(a.etapa),
  )
  const recomendadas = analises.filter((a) => a.etapa === 'recomendada')
  const implantadas = analises.filter((a) => a.etapa === 'implementada' || a.etapa === 'realizada')

  if (!comecou) return { status: 'Nova', motivo: 'Nada preenchido ainda.' }
  if (
    implantadas.length &&
    implantadas.length === decididas.length &&
    !recomendadas.length &&
    !abertas.length
  )
    return {
      status: 'Concluída',
      motivo: 'Estratégias aprovadas já implementadas e sem tarefas abertas.',
    }
  const espera = ESPERAS.find((s) => abertas.some((t) => t.status === s))
  if (espera) return { status: espera, motivo: `Há tarefa do plano em "${espera}".` }
  if (recomendadas.length)
    return {
      status: 'Aguardando cliente',
      motivo: `${recomendadas.length} estratégia(s) recomendada(s) aguardando aprovação do cliente.`,
    }
  return {
    status: 'Em execução',
    motivo: decididas.length
      ? 'Estratégias aprovadas em implantação.'
      : 'Perfil, triagem ou simulações em andamento.',
  }
}

/** Aplica o automático (se ligado). */
export function comStatusAutomatico(p: Planejamento): Planejamento {
  if (p.statusManual) return p
  const s = inferirStatus(p).status
  return s === p.status ? p : { ...p, status: s }
}
