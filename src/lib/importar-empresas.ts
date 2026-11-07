// Converte linhas de planilha (CSV ou Excel) no formato da importação: CNPJ;Nome;ATIVA|INATIVA.
// Mesma regra da importação de clientes do Pacioli 69179: uma empresa por linha.

export type Previa = { texto: string; validas: number; ignoradas: number }

const SO_NUMERO = /^[\d.\-/\s]+$/

export function linhasParaTexto(linhas: string[][]): Previa {
  const saida: string[] = []
  let ignoradas = 0
  linhas.forEach((cols, i) => {
    const c0 = (cols[0] ?? '').trim()
    const nomeBruto = (cols[1] ?? '').trim()
    if (i === 0 && /cnpj/i.test(c0)) return
    if (!c0 && !nomeBruto) return
    let digitos = c0.replace(/\D/g, '')
    // Excel costuma tirar o zero à esquerda do CNPJ numérico: completa até 14 dígitos.
    if (SO_NUMERO.test(c0) && digitos.length >= 11 && digitos.length < 14) {
      digitos = digitos.padStart(14, '0')
    }
    const nome = nomeBruto.replace(/[;\r\n]/g, ' ')
    const sit = (cols[2] ?? '').toUpperCase()
    const situacao = sit.includes('INAT') ? 'INATIVA' : sit.includes('ATIV') ? 'ATIVA' : ''

    // Nenhum campo é obrigatório: aceita linha se tiver CNPJ ou nome ou situação
    if (!digitos && !nome && !situacao) {
      ignoradas++
      return
    }
    saida.push([digitos, nome, situacao].join(';'))
  })
  return { texto: saida.join('\n'), validas: saida.length, ignoradas }
}

export function cnpjFmt(c: string): string {
  if (!c) return '-'
  if (c.length === 14) {
    return c.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
  }
  return c
}
