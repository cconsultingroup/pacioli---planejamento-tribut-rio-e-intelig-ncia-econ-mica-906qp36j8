// Leitor mínimo de .xlsx (primeira aba) sem dependências: abre o zip e descomprime com DecompressionStream.

type Entrada = { nome: string; metodo: number; comprimido: number; offset: number }

async function lerZip(buf: ArrayBuffer): Promise<Map<string, Uint8Array>> {
  const v = new DataView(buf)
  const bytes = new Uint8Array(buf)
  let fim = -1
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (v.getUint32(i, true) === 0x06054b50) {
      fim = i
      break
    }
  }
  if (fim < 0) throw new Error('arquivo .xlsx inválido (diretório não encontrado)')
  const qtd = v.getUint16(fim + 10, true)
  let p = v.getUint32(fim + 16, true)
  const entradas: Entrada[] = []
  const dec = new TextDecoder()
  for (let k = 0; k < qtd; k++) {
    if (v.getUint32(p, true) !== 0x02014b50) break
    const metodo = v.getUint16(p + 10, true)
    const comprimido = v.getUint32(p + 20, true)
    const nLen = v.getUint16(p + 28, true)
    const xLen = v.getUint16(p + 30, true)
    const cLen = v.getUint16(p + 32, true)
    const offset = v.getUint32(p + 42, true)
    entradas.push({
      nome: dec.decode(bytes.subarray(p + 46, p + 46 + nLen)),
      metodo,
      comprimido,
      offset,
    })
    p += 46 + nLen + xLen + cLen
  }
  const arquivos = new Map<string, Uint8Array>()
  for (const en of entradas) {
    const lnLen = v.getUint16(en.offset + 26, true)
    const lxLen = v.getUint16(en.offset + 28, true)
    const ini = en.offset + 30 + lnLen + lxLen
    const dados = bytes.subarray(ini, ini + en.comprimido)
    if (en.metodo === 0) {
      arquivos.set(en.nome, dados)
    } else if (en.metodo === 8) {
      const saida = new Blob([dados]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
      arquivos.set(en.nome, new Uint8Array(await new Response(saida).arrayBuffer()))
    }
  }
  return arquivos
}

function xml(bytes: Uint8Array): Document {
  return new DOMParser().parseFromString(new TextDecoder().decode(bytes), 'application/xml')
}

function indiceColuna(ref: string): number {
  let n = 0
  for (const ch of ref.replace(/\d/g, '')) n = n * 26 + (ch.charCodeAt(0) - 64)
  return n - 1
}

export async function lerXlsx(arquivo: File): Promise<string[][]> {
  const arquivos = await lerZip(await arquivo.arrayBuffer())
  const strings: string[] = []
  const sst = arquivos.get('xl/sharedStrings.xml')
  if (sst) {
    for (const si of Array.from(xml(sst).getElementsByTagName('si'))) {
      strings.push(
        Array.from(si.getElementsByTagName('t'))
          .map((t) => t.textContent ?? '')
          .join(''),
      )
    }
  }
  const aba = Array.from(arquivos.keys())
    .filter((n) => /^xl\/worksheets\/sheet\d+\.xml$/.test(n))
    .sort()[0]
  const conteudo = aba ? arquivos.get(aba) : undefined
  if (!conteudo) throw new Error('nenhuma aba encontrada na planilha')
  const linhas: string[][] = []
  for (const linha of Array.from(xml(conteudo).getElementsByTagName('row'))) {
    const r = Number(linha.getAttribute('r') ?? '0') - 1
    const cels: string[] = []
    for (const c of Array.from(linha.getElementsByTagName('c'))) {
      const idx = indiceColuna(c.getAttribute('r') ?? 'A1')
      const tipo = c.getAttribute('t')
      const v = c.getElementsByTagName('v')[0]?.textContent ?? ''
      let valor = v
      if (tipo === 's') valor = strings[Number(v)] ?? ''
      else if (tipo === 'inlineStr')
        valor = Array.from(c.getElementsByTagName('t'))
          .map((t) => t.textContent ?? '')
          .join('')
      cels[idx] = valor
    }
    linhas[r] = Array.from(cels, (x) => x ?? '')
  }
  return linhas.filter(Boolean)
}

export async function lerCsv(arquivo: File): Promise<string[][]> {
  const texto = await arquivo.text()
  const todas = texto.split(/\r?\n/).filter((l) => l.trim())
  const primeira = todas[0] ?? ''
  const sep = primeira.includes(';') ? ';' : primeira.includes('\t') ? '\t' : ','
  return todas.map((l) => l.split(sep).map((c) => c.trim().replace(/^"|"$/g, '')))
}
