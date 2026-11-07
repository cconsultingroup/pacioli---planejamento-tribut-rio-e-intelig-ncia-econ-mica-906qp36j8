import { describe, it } from 'vitest'
import { lerXlsx } from './xlsx-lite'
import { linhasParaTexto } from './importar-empresas'

describe('baixar e inspecionar planilha', () => {
  it('baixa o arquivo remoto e inspeciona linhas', async () => {
    const url =
      'https://dagtlwojkqyivnjgveda.supabase.co/storage/v1/object/public/message-attachments/6ff6d2b4-9ddc-4a9b-93a7-4b2fbf49361b/clientes-2026-11-07-3f868.xlsx'
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Falha ao baixar: ${res.status}`)
    const arrayBuf = await res.arrayBuffer()
    const file = new File([arrayBuf], 'clientes.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const linhas = await lerXlsx(file)
    console.log('Total linhas na planilha:', linhas.length)
    console.log('Primeiras 3 linhas:', JSON.stringify(linhas.slice(0, 3), null, 2))

    const previa = linhasParaTexto(linhas)
    console.log('Total de itens parseados:', previa.validas, 'ignoradas:', previa.ignoradas)
    console.log('Primeiro item:', JSON.stringify(previa.itens[0], null, 2))
    console.log('Último item:', JSON.stringify(previa.itens[previa.itens.length - 1], null, 2))
  })
})
