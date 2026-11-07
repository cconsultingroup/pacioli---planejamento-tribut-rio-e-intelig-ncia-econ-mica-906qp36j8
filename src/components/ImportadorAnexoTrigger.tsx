import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'

export function ImportadorAnexoTrigger() {
  const [status, setStatus] = useState<string>('idle')
  const [data, setData] = useState<unknown>(null)

  useEffect(() => {
    pb.send('/backend/v1/empresas/importar-anexo', { method: 'POST' })
      .then((res) => {
        setStatus('ok')
        setData(res)
        console.log('Importar-anexo res:', res)
      })
      .catch((err) => {
        setStatus('erro')
        setData(err)
        console.error('Importar-anexo err:', err)
      })
  }, [])

  return (
    <div style={{ padding: 10, background: '#eee', fontSize: 12 }}>
      <strong>Trigger importação anexo:</strong> {status} - {JSON.stringify(data)}
    </div>
  )
}
