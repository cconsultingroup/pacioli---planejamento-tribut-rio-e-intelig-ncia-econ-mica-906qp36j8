import { useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'

export type EmpresaMinima = { id: string; possivel_cross_sell?: string }

type Props = {
  /** Empresas que serão afetadas (respeitam a busca/filtro ativo). */
  alvo: EmpresaMinima[]
  /** Recarrega a lista após aplicar a mudança. */
  aoConcluir: () => Promise<void> | void
}

/**
 * Ações em massa sobre o campo "possivel_cross_sell" das empresas visíveis
 * na tabela (respeitando a busca ativa).
 */
export default function EmpresasAcoesLote({ alvo, aoConcluir }: Props) {
  const { toast } = useToast()
  const [destino, setDestino] = useState<'sim' | 'nao' | null>(null)
  const [aplicando, setAplicando] = useState(false)

  const aplicar = async () => {
    if (!destino || alvo.length === 0 || aplicando) return
    setAplicando(true)
    try {
      const r = await pb.send<{
        atualizadas: number
        falhas: number
      }>('/backend/v1/empresas/cross-sell-em-massa', {
        method: 'POST',
        body: {
          ids: alvo.map((e) => e.id),
          possivel_cross_sell: destino,
        },
      })
      await aoConcluir()
      if (r.falhas === 0) {
        toast({
          title: 'Pronto',
          description: `${r.atualizadas} empresa(s) marcada(s) como possível cross-sell: ${destino === 'sim' ? 'Sim' : 'Não'}.`,
        })
      } else {
        toast({
          title: 'Concluído com falhas',
          description: `${r.atualizadas} atualizada(s), ${r.falhas} com erro. Verifique e tente novamente.`,
          variant: 'destructive',
        })
      }
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as empresas. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setAplicando(false)
      setDestino(null)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={aplicando || alvo.length === 0}
        onClick={() => setDestino('sim')}
      >
        Marcar todas como cross-sell
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={aplicando || alvo.length === 0}
        onClick={() => setDestino('nao')}
      >
        Desmarcar todas
      </Button>
      {aplicando && <span className="text-sm text-muted-foreground">Atualizando empresas…</span>}

      <AlertDialog
        open={destino !== null}
        onOpenChange={(aberto) => {
          if (!aplicando) setDestino(aberto ? destino : null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {destino === 'sim'
                ? 'Marcar todas como possível cross-sell?'
                : 'Desmarcar todas como possível cross-sell?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {alvo.length} empresa(s) da lista atual{' '}
              {destino === 'sim'
                ? 'ficarão com possível cross-sell = Sim'
                : 'ficarão com possível cross-sell = Não'}
              . A alteração vale para as empresas visíveis agora (a busca ativa é respeitada).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={aplicando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={aplicando}
              onClick={(ev) => {
                ev.preventDefault()
                void aplicar()
              }}
            >
              {aplicando
                ? 'Aplicando…'
                : destino === 'sim'
                  ? `Marcar ${alvo.length} empresa(s)`
                  : `Desmarcar ${alvo.length} empresa(s)`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
