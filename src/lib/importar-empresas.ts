// Utilitário de parsing e normalização de planilhas/textos para importação de empresas.
// Aceita tanto planilha rica (cabeçalhos por nome) quanto texto legado (CNPJ;Nome;Situação) ou arrays de colunas.

export type EmpresaImportacao = {
  nome: string
  cnpj: string
  situacao?: 'ativa' | 'inativa' | ''
  regime_tributacao?: 'simples_nacional' | 'lucro_presumido' | 'lucro_real' | 'nao_informado' | ''
  procuracao?: 'sim' | 'nao' | ''
  procuracao_validade?: string // AAAA-MM-DD
  possivel_cross_sell?: 'sim' | 'nao' | ''
  vendedor_responsavel?: string
  cadastrado_em?: string // AAAA-MM-DDTHH:mm:ss.000Z
  observacao?: string
}

export type Previa = {
  itens: EmpresaImportacao[]
  texto: string
  validas: number
  ignoradas: number
}

function normalizarCabecalho(cab: string): string {
  return cab
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '_')
}

// Extrai data no formato dd/mm/aaaa ou aaaa-mm-dd e converte para AAAA-MM-DD
export function extrairDataISO(texto: string): string {
  if (!texto) return ''
  const t = texto.trim()

  // Formato dd/mm/aaaa
  const mBR = t.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (mBR) {
    const dia = mBR[1].padStart(2, '0')
    const mes = mBR[2].padStart(2, '0')
    const ano = mBR[3]
    return `${ano}-${mes}-${dia}`
  }

  // Formato aaaa-mm-dd
  const mISO = t.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (mISO) {
    return `${mISO[1]}-${mISO[2]}-${mISO[3]}`
  }

  return ''
}

// Converte texto com data e hora ex: "16/10/2026, 15:10" para string aceita pelo PocketBase: "YYYY-MM-DD HH:mm:ss.000Z"
export function extrairDataHoraPocketBase(texto: string): string {
  if (!texto) return ''
  const t = texto.trim()

  // Padrão dd/mm/aaaa, hh:mm ou dd/mm/aaaa hh:mm
  const m = t.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})[,\s]+(\d{1,2}):(\d{2})/)
  if (m) {
    const dia = m[1].padStart(2, '0')
    const mes = m[2].padStart(2, '0')
    const ano = m[3]
    const hora = m[4].padStart(2, '0')
    const min = m[5].padStart(2, '0')
    return `${ano}-${mes}-${dia} ${hora}:${min}:00.000Z`
  }

  const soData = extrairDataISO(t)
  if (soData) {
    return `${soData} 00:00:00.000Z`
  }

  return ''
}

// Parse do campo "Procuração eletrônica"
// Valores possíveis: "Sim", "Sim (validade 30/12/2030)", "Não", "", etc.
export function parseProcuracao(valor: string): {
  procuracao: 'sim' | 'nao' | ''
  validade: string
} {
  if (!valor) return { procuracao: '', validade: '' }
  const v = valor.trim().toLowerCase()

  if (v.startsWith('sim') || v === 's' || v === 'true' || v === '1') {
    const validade = extrairDataISO(valor)
    return { procuracao: 'sim', validade }
  }

  if (v.startsWith('n') || v === 'false' || v === '0') {
    return { procuracao: 'nao', validade: '' }
  }

  return { procuracao: '', validade: '' }
}

// Normaliza regime de tributação
export function parseRegimeTributacao(
  valor: string,
): 'simples_nacional' | 'lucro_presumido' | 'lucro_real' | 'nao_informado' | '' {
  if (!valor) return ''
  const v = valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

  if (v.includes('simples')) return 'simples_nacional'
  if (v.includes('presumido')) return 'lucro_presumido'
  if (v.includes('real')) return 'lucro_real'
  if (v.includes('nao') || v.includes('sem') || v.includes('informado')) return 'nao_informado'
  return ''
}

// Parse do campo "Possível cross-sell (obrigatório)"
// Aceita Sim/Não, true/false, 1/0 e variações com ou sem hífen ("cross sell", "cross-sell")
export function parsePossivelCrossSell(valor: string): 'sim' | 'nao' | '' {
  if (!valor) return ''
  const v = valor.trim().toLowerCase()
  if (v.startsWith('sim') || v === 's' || v === 'true' || v === '1' || v === 'x' || v === 'yes') {
    return 'sim'
  }
  if (v.startsWith('n') || v === 'false' || v === '0' || v === '-') {
    return 'nao'
  }
  return ''
}

export function ehColunaCrossSell(cabecalho: string): boolean {
  const c = normalizarCabecalho(cabecalho)
  return c.includes('cross_sell') || c.includes('crosssell')
}

// Normaliza situação cadastral (ATIVA, INATIVA)
export function parseSituacao(valor: string): 'ativa' | 'inativa' | '' {
  if (!valor) return ''
  const v = valor.toUpperCase()
  if (v.includes('INAT')) return 'inativa'
  if (v.includes('ATIV')) return 'ativa'
  return ''
}

// Limpa e normaliza CNPJ
export function normalizarCnpj(valor: string): string {
  if (!valor) return ''
  let digitos = valor.replace(/\D/g, '')
  if (digitos.length >= 11 && digitos.length < 14) {
    digitos = digitos.padStart(14, '0')
  }
  return digitos
}

export function linhasParaTexto(linhas: string[][]): Previa {
  if (!linhas || linhas.length === 0) {
    return { itens: [], texto: '', validas: 0, ignoradas: 0 }
  }

  // Verifica se a primeira linha tem cabeçalhos
  const primeira = linhas[0] || []
  const cabecalhosNorm = primeira.map(normalizarCabecalho)

  const mapaColunas: Record<string, number> = {}
  cabecalhosNorm.forEach((c, idx) => {
    if (c.includes('razao') || c.includes('nome')) mapaColunas['nome'] = idx
    else if (c.includes('cnpj')) mapaColunas['cnpj'] = idx
    else if (c.includes('regime') || c.includes('tributacao')) mapaColunas['regime'] = idx
    else if (c.includes('situacao') || c.includes('status')) mapaColunas['situacao'] = idx
    else if (c.includes('procuracao')) mapaColunas['procuracao'] = idx
    else if (ehColunaCrossSell(c)) mapaColunas['cross_sell'] = idx
    else if (c.includes('vendedor')) mapaColunas['vendedor'] = idx
    else if (c.includes('cadastrado')) mapaColunas['cadastrado'] = idx
    else if (c.includes('observ') || c.includes('obs')) mapaColunas['observacao'] = idx
  })

  const temCabecalhoReconhecido =
    mapaColunas['nome'] !== undefined ||
    mapaColunas['cnpj'] !== undefined ||
    mapaColunas['situacao'] !== undefined

  const inicio = temCabecalhoReconhecido ? 1 : 0
  const itens: EmpresaImportacao[] = []
  let ignoradas = 0

  for (let i = inicio; i < linhas.length; i++) {
    const cols = linhas[i] || []

    let nome = ''
    let cnpjBruto = ''
    let situacaoBruta = ''
    let regimeBruto = ''
    let procuracaoBruta = ''
    let crossSellBruto = ''
    let vendedorBruto = ''
    let cadastradoBruto = ''
    let observacaoBruta = ''

    if (temCabecalhoReconhecido) {
      if (mapaColunas['nome'] !== undefined) nome = cols[mapaColunas['nome']] ?? ''
      if (mapaColunas['cnpj'] !== undefined) cnpjBruto = cols[mapaColunas['cnpj']] ?? ''
      if (mapaColunas['situacao'] !== undefined) situacaoBruta = cols[mapaColunas['situacao']] ?? ''
      if (mapaColunas['regime'] !== undefined) regimeBruto = cols[mapaColunas['regime']] ?? ''
      if (mapaColunas['procuracao'] !== undefined)
        procuracaoBruta = cols[mapaColunas['procuracao']] ?? ''
      if (mapaColunas['cross_sell'] !== undefined)
        crossSellBruto = cols[mapaColunas['cross_sell']] ?? ''
      if (mapaColunas['vendedor'] !== undefined) vendedorBruto = cols[mapaColunas['vendedor']] ?? ''
      if (mapaColunas['cadastrado'] !== undefined)
        cadastradoBruto = cols[mapaColunas['cadastrado']] ?? ''
      if (mapaColunas['observacao'] !== undefined)
        observacaoBruta = cols[mapaColunas['observacao']] ?? ''
    } else {
      // Formato legado por posição: CNPJ; Nome; Situação
      cnpjBruto = cols[0] ?? ''
      nome = cols[1] ?? ''
      situacaoBruta = cols[2] ?? ''
    }

    const cnpj = normalizarCnpj(cnpjBruto)
    nome = nome.trim().replace(/[;\r\n]/g, ' ')
    const situacao = parseSituacao(situacaoBruta)
    const regime_tributacao = parseRegimeTributacao(regimeBruto)
    const procInfo = parseProcuracao(procuracaoBruta)
    const possivel_cross_sell = parsePossivelCrossSell(crossSellBruto)
    const vendedor_responsavel = vendedorBruto.trim()
    const cadastrado_em = extrairDataHoraPocketBase(cadastradoBruto)
    const observacao = observacaoBruta.trim()

    // Linha vazia ou sem nenhuma informação útil
    if (
      !cnpj &&
      !nome &&
      !situacao &&
      !regime_tributacao &&
      !procInfo.procuracao &&
      !possivel_cross_sell &&
      !vendedor_responsavel &&
      !observacao
    ) {
      ignoradas++
      continue
    }

    itens.push({
      nome,
      cnpj,
      situacao,
      regime_tributacao,
      procuracao: procInfo.procuracao,
      procuracao_validade: procInfo.validade,
      possivel_cross_sell,
      vendedor_responsavel,
      cadastrado_em,
      observacao,
    })
  }

  // Gera também a representação em texto legado (CNPJ;Nome;Situação) para compatibilidade
  const linhasTexto = itens.map((it) => [it.cnpj, it.nome, it.situacao || ''].join(';'))

  return {
    itens,
    texto: linhasTexto.join('\n'),
    validas: itens.length,
    ignoradas,
  }
}

export function cnpjFmt(c: string): string {
  if (!c) return '-'
  if (c.length === 14) {
    return c.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
  }
  return c
}
