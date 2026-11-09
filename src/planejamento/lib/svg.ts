// Gráficos em SVG puro para os relatórios impressos (HTML → PDF) e para o Word (convertidos em PNG).
const esc = (s: unknown) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
export const CORES = ['#0e6b63', '#d39a1d', '#2e64b0', '#8a4fb8', '#c2410c', '#4b8b3b']
const curto = (v: number) => {
  const a = Math.abs(v)
  const s =
    a >= 1e6
      ? (v / 1e6).toFixed(1).replace('.', ',') + ' mi'
      : a >= 1e3
        ? (v / 1e3).toFixed(0) + ' mil'
        : v.toFixed(0)
  return 'R$ ' + s
}

function eixoY(max: number, min: number, x0: number, y0: number, alt: number, larg: number) {
  const passos = 4
  let s = ''
  for (let i = 0; i <= passos; i++) {
    const v = min + ((max - min) * i) / passos
    const y = y0 + alt - (alt * i) / passos
    s += `<line x1="${x0}" x2="${x0 + larg}" y1="${y}" y2="${y}" stroke="#e3e8e6"/><text x="${x0 - 6}" y="${y + 3}" text-anchor="end" font-size="9" fill="#5b6b66">${curto(v)}</text>`
  }
  return s
}

/** Barras agrupadas: categorias × séries. */
export function barrasAgrupadas(
  cats: string[],
  series: { nome: string; valores: number[] }[],
  opt: { largura?: number; altura?: number } = {},
) {
  const W = opt.largura || 640,
    H = opt.altura || 260,
    x0 = 64,
    y0 = 14,
    alt = H - 64,
    larg = W - x0 - 10
  const todos = series.flatMap((s) => s.valores)
  const max = Math.max(...todos, 1),
    min = Math.min(0, ...todos)
  const esc_y = (v: number) => y0 + alt - ((v - min) / (max - min)) * alt
  const gw = larg / Math.max(cats.length, 1),
    bw = Math.min(28, (gw * 0.8) / series.length)
  let s = eixoY(max, min, x0, y0, alt, larg)
  cats.forEach((c, i) => {
    series.forEach((se, j) => {
      const v = se.valores[i] || 0
      const x = x0 + i * gw + (gw - bw * series.length) / 2 + j * bw
      const y = esc_y(Math.max(v, 0)),
        h = Math.abs(esc_y(v) - esc_y(0))
      s += `<rect x="${x}" y="${v >= 0 ? y : esc_y(0)}" width="${bw - 2}" height="${Math.max(h, 0.5)}" rx="2" fill="${CORES[j % CORES.length]}"/>`
    })
    s += `<text x="${x0 + i * gw + gw / 2}" y="${y0 + alt + 14}" text-anchor="middle" font-size="9.5" fill="#132420">${esc(c)}</text>`
  })
  s += series
    .map(
      (se, j) =>
        `<rect x="${x0 + j * 150}" y="${H - 18}" width="10" height="10" rx="2" fill="${CORES[j % CORES.length]}"/><text x="${x0 + j * 150 + 14}" y="${H - 9}" font-size="10">${esc(se.nome)}</text>`,
    )
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" font-family="Arial, sans-serif">${s}</svg>`
}

/** Barras horizontais (ex.: economia por estratégia). */
export function barrasHorizontais(
  itens: { rotulo: string; valor: number }[],
  opt: { largura?: number } = {},
) {
  const W = opt.largura || 640,
    linha = 22,
    x0 = 220,
    H = Math.max(itens.length * linha + 20, 60),
    larg = W - x0 - 90
  const max = Math.max(...itens.map((i) => Math.abs(i.valor)), 1)
  const s = itens
    .map((it, i) => {
      const w = (Math.abs(it.valor) / max) * larg,
        y = 10 + i * linha
      return (
        `<text x="${x0 - 6}" y="${y + 13}" text-anchor="end" font-size="9.5">${esc(it.rotulo.length > 42 ? it.rotulo.slice(0, 41) + '…' : it.rotulo)}</text>` +
        `<rect x="${x0}" y="${y + 3}" width="${Math.max(w, 1)}" height="14" rx="2" fill="${it.valor < 0 ? '#c2410c' : CORES[0]}"/>` +
        `<text x="${x0 + w + 4}" y="${y + 13}" font-size="9.5" fill="#132420">${curto(it.valor)}</text>`
      )
    })
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" font-family="Arial, sans-serif">${s}</svg>`
}

/** Dispersão risco (1–4) × benefício. */
export function matrizRisco(
  pontos: { rotulo: string; risco: number; beneficio: number }[],
  opt: { largura?: number } = {},
) {
  const W = opt.largura || 640,
    H = 260,
    x0 = 64,
    y0 = 14,
    alt = H - 50,
    larg = W - x0 - 20
  const vals = pontos.map((p) => p.beneficio)
  const max = Math.max(...vals, 1),
    min = Math.min(0, ...vals)
  const ey = (v: number) => y0 + alt - ((v - min) / (max - min)) * alt
  const ex = (r: number) => x0 + ((r - 0.5) / 4) * larg
  let s = eixoY(max, min, x0, y0, alt, larg)
  ;['Baixo', 'Médio', 'Alto', 'Crítico'].forEach(
    (t, i) =>
      (s += `<text x="${ex(i + 1)}" y="${y0 + alt + 16}" text-anchor="middle" font-size="10">${t}</text>`),
  )
  s += `<rect x="${x0}" y="${y0}" width="${ex(2.5) - x0}" height="${alt}" fill="#0e6b63" opacity="0.05"/>`
  pontos.forEach((p, i) => {
    const x = ex(p.risco) + ((i % 3) - 1) * 8,
      y = ey(p.beneficio)
    s += `<circle cx="${x}" cy="${y}" r="6" fill="${p.risco >= 3 ? '#c2410c' : CORES[0]}" opacity="0.85"/><text x="${x + 8}" y="${y + 3}" font-size="9">${esc(p.rotulo)}</text>`
  })
  s += `<text x="${x0 + larg}" y="${H - 4}" text-anchor="end" font-size="9" fill="#5b6b66">Risco →  (área clara = prioridade: maior benefício, menor risco)</text>`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" font-family="Arial, sans-serif">${s}</svg>`
}

/** Cronograma (Gantt simplificado por prazo). */
export function cronograma(
  tarefas: { rotulo: string; prazo: string; concluida: boolean }[],
  opt: { largura?: number } = {},
) {
  const lista = tarefas.filter((t) => t.prazo).sort((a, b) => a.prazo.localeCompare(b.prazo))
  if (!lista.length) return ''
  const W = opt.largura || 640,
    linha = 20,
    x0 = 230,
    larg = W - x0 - 70,
    H = lista.length * linha + 30
  const t0 = Math.min(Date.now(), ...lista.map((t) => new Date(t.prazo + 'T12:00:00').getTime()))
  const t1 = Math.max(
    ...lista.map((t) => new Date(t.prazo + 'T12:00:00').getTime()),
    t0 + 86400000 * 30,
  )
  const s = lista
    .map((t, i) => {
      const w = ((new Date(t.prazo + 'T12:00:00').getTime() - t0) / (t1 - t0)) * larg,
        y = 8 + i * linha
      return (
        `<text x="${x0 - 6}" y="${y + 12}" text-anchor="end" font-size="9">${esc(t.rotulo.length > 44 ? t.rotulo.slice(0, 43) + '…' : t.rotulo)}</text>` +
        `<rect x="${x0}" y="${y + 2}" width="${larg}" height="12" rx="2" fill="#eef2f1"/><rect x="${x0}" y="${y + 2}" width="${Math.max(w, 3)}" height="12" rx="2" fill="${t.concluida ? '#4b8b3b' : CORES[0]}"/>` +
        `<text x="${x0 + larg + 4}" y="${y + 12}" font-size="9">${t.prazo.split('-').reverse().join('/')}</text>`
      )
    })
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" font-family="Arial, sans-serif">${s}</svg>`
}

/** Converte um SVG em PNG (para o Word). */
export async function svgParaPng(
  svg: string,
  largura = 1200,
  altura?: number,
): Promise<{ dados: ArrayBuffer; largura: number; altura: number }> {
  const vb = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg)
  const w0 = vb ? Number(vb[1]) : 640,
    h0 = vb ? Number(vb[2]) : 260
  const h = altura || Math.round((largura * h0) / w0)
  const img = new Image()
  const url = URL.createObjectURL(
    new Blob([svg.replace('width="100%"', `width="${largura}" height="${h}"`)], {
      type: 'image/svg+xml',
    }),
  )
  await new Promise<void>((ok, erro) => {
    img.onload = () => ok()
    img.onerror = () => erro(new Error('Falha ao desenhar gráfico'))
    img.src = url
  })
  const c = document.createElement('canvas')
  c.width = largura
  c.height = h
  const g = c.getContext('2d')!
  g.fillStyle = '#fff'
  g.fillRect(0, 0, largura, h)
  g.drawImage(img, 0, 0, largura, h)
  URL.revokeObjectURL(url)
  const blob: Blob = await new Promise((ok) => c.toBlob((b) => ok(b!), 'image/png'))
  return { dados: await blob.arrayBuffer(), largura, altura: h }
}
