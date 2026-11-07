routerAdd('POST', '/backend/v1/empresas/importar-planilha-anexa', (e) => {
  function extrairDataISO(texto) {
    if (!texto) return ''
    const t = String(texto).trim()
    const mBR = t.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
    if (mBR) {
      const dia = mBR[1].length === 1 ? '0' + mBR[1] : mBR[1]
      const mes = mBR[2].length === 1 ? '0' + mBR[2] : mBR[2]
      const ano = mBR[3]
      return ano + '-' + mes + '-' + dia
    }
    const mISO = t.match(/(\d{4})-(\d{2})-(\d{2})/)
    if (mISO) return mISO[1] + '-' + mISO[2] + '-' + mISO[3]
    return ''
  }

  function extrairDataHoraPocketBase(texto) {
    if (!texto) return ''
    const t = String(texto).trim()
    const m = t.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})[,\s]+(\d{1,2}):(\d{2})/)
    if (m) {
      const dia = m[1].length === 1 ? '0' + m[1] : m[1]
      const mes = m[2].length === 1 ? '0' + m[2] : m[2]
      const ano = m[3]
      const hora = m[4].length === 1 ? '0' + m[4] : m[4]
      const min = m[5].length === 1 ? '0' + m[5] : m[5]
      return ano + '-' + mes + '-' + dia + ' ' + hora + ':' + min + ':00.000Z'
    }
    const soData = extrairDataISO(t)
    if (soData) return soData + ' 00:00:00.000Z'
    return ''
  }

  function parseProcuracao(valor) {
    if (!valor) return { procuracao: '', validade: '' }
    const v = String(valor).trim().toLowerCase()
    if (v.indexOf('sim') === 0 || v === 's' || v === 'true' || v === '1') {
      const validade = extrairDataISO(valor)
      return { procuracao: 'sim', validade: validade }
    }
    if (v.indexOf('n') === 0 || v === 'false' || v === '0') {
      return { procuracao: 'nao', validade: '' }
    }
    return { procuracao: '', validade: '' }
  }

  function parseRegimeTributacao(valor) {
    if (!valor) return ''
    const v = String(valor)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
    if (v.indexOf('simples') >= 0) return 'simples_nacional'
    if (v.indexOf('presumido') >= 0) return 'lucro_presumido'
    if (v.indexOf('real') >= 0) return 'lucro_real'
    if (v.indexOf('nao') >= 0 || v.indexOf('sem') >= 0 || v.indexOf('informado') >= 0)
      return 'nao_informado'
    return ''
  }

  function parseSituacao(valor) {
    if (!valor) return ''
    const v = String(valor).toUpperCase()
    if (v.indexOf('INAT') >= 0) return 'inativa'
    if (v.indexOf('ATIV') >= 0) return 'ativa'
    return ''
  }

  function normalizarCnpj(valor) {
    if (!valor) return ''
    let digitos = String(valor).replace(/\D/g, '')
    if (digitos.length >= 11 && digitos.length < 14) {
      while (digitos.length < 14) digitos = '0' + digitos
    }
    return digitos
  }

  function indiceColuna(ref) {
    const letras = ref.replace(/\d/g, '').toUpperCase()
    let n = 0
    for (let i = 0; i < letras.length; i++) {
      n = n * 26 + (letras.charCodeAt(i) - 64)
    }
    return n - 1
  }

  function normalizarCabecalho(cab) {
    return String(cab || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '_')
  }

  const url =
    'https://dagtlwojkqyivnjgveda.supabase.co/storage/v1/object/public/message-attachments/6ff6d2b4-9ddc-4a9b-93a7-4b2fbf49361b/clientes-2026-11-07-3f868.xlsx'

  let res = null
  try {
    res = $http.send({
      url: url,
      method: 'GET',
      timeout: 60,
    })
  } catch (err) {
    return e.json(500, { erro: 'Falha ao baixar planilha anexada: ' + String(err) })
  }

  if (res.statusCode !== 200) {
    return e.json(500, { erro: 'Status de download inválido: HTTP ' + res.statusCode })
  }

  const bytes = res.body

  // Extrai xml do ZIP uncompressed (method=0)
  function getFileContent(targetName) {
    for (let i = 0; i < bytes.length - 30; i++) {
      if (bytes[i] === 80 && bytes[i + 1] === 75 && bytes[i + 2] === 3 && bytes[i + 3] === 4) {
        const compSize =
          bytes[i + 18] | (bytes[i + 19] << 8) | (bytes[i + 20] << 16) | (bytes[i + 21] << 24)
        const nameLen = bytes[i + 26] | (bytes[i + 27] << 8)
        const extraLen = bytes[i + 28] | (bytes[i + 29] << 8)
        let name = ''
        for (let k = 0; k < nameLen; k++) {
          name += String.fromCharCode(bytes[i + 30 + k])
        }
        if (name === targetName) {
          const start = i + 30 + nameLen + extraLen
          let text = ''
          let idx = 0
          while (idx < compSize) {
            const b0 = bytes[start + idx]
            if (b0 < 0x80) {
              text += String.fromCharCode(b0)
              idx += 1
            } else if ((b0 & 0xe0) === 0xc0) {
              const b1 = bytes[start + idx + 1]
              text += String.fromCharCode(((b0 & 0x1f) << 6) | (b1 & 0x3f))
              idx += 2
            } else if ((b0 & 0xf0) === 0xe0) {
              const b1 = bytes[start + idx + 1]
              const b2 = bytes[start + idx + 2]
              text += String.fromCharCode(((b0 & 0x0f) << 12) | ((b1 & 0x3f) << 6) | (b2 & 0x3f))
              idx += 3
            } else {
              idx += 4
            }
          }
          return text
        }
      }
    }
    return null
  }

  const sheetXml = getFileContent('xl/worksheets/sheet1.xml')
  if (!sheetXml) {
    return e.json(500, { erro: 'Aba sheet1.xml não encontrada na planilha' })
  }

  // Parse das linhas e células
  const rowMatches = sheetXml.match(/<row[^>]*>[\s\S]*?<\/row>/g) || []
  const linhasMatriz = []

  for (let rIdx = 0; rIdx < rowMatches.length; rIdx++) {
    const rowContent = rowMatches[rIdx]
    const cellMatches = rowContent.match(/<c\s+r="([A-Z0-9]+)"[^>]*>([\s\S]*?)<\/c>/g) || []
    const linhaCols = []

    for (let cIdx = 0; cIdx < cellMatches.length; cIdx++) {
      const cStr = cellMatches[cIdx]
      const rMatch = cStr.match(/r="([A-Z0-9]+)"/)
      const colRef = rMatch ? rMatch[1] : 'A1'
      const colNum = indiceColuna(colRef)

      // Extrai valor de <v>...</v> ou <t>...</t>
      let val = ''
      const vMatch = cStr.match(/<v>([\s\S]*?)<\/v>/)
      if (vMatch) {
        val = vMatch[1]
      } else {
        const tMatch = cStr.match(/<t[^>]*>([\s\S]*?)<\/t>/)
        if (tMatch) val = tMatch[1]
      }

      val = val
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&#39;/g, "'")

      linhaCols[colNum] = val.trim()
    }

    linhasMatriz.push(linhaCols)
  }

  if (linhasMatriz.length === 0) {
    return e.json(400, { erro: 'Planilha sem linhas detectadas.' })
  }

  // Mapeamento de colunas pelo cabeçalho
  const primeira = linhasMatriz[0] || []
  const cabecalhosNorm = primeira.map(normalizarCabecalho)
  const mapaColunas = {}

  for (let idx = 0; idx < cabecalhosNorm.length; idx++) {
    const c = cabecalhosNorm[idx]
    if (c.indexOf('razao') >= 0 || c.indexOf('nome') >= 0) mapaColunas['nome'] = idx
    else if (c.indexOf('cnpj') >= 0) mapaColunas['cnpj'] = idx
    else if (c.indexOf('regime') >= 0 || c.indexOf('tributacao') >= 0) mapaColunas['regime'] = idx
    else if (c.indexOf('situacao') >= 0 || c.indexOf('status') >= 0) mapaColunas['situacao'] = idx
    else if (c.indexOf('procuracao') >= 0) mapaColunas['procuracao'] = idx
    else if (c.indexOf('vendedor') >= 0) mapaColunas['vendedor'] = idx
    else if (c.indexOf('cadastrado') >= 0) mapaColunas['cadastrado'] = idx
    else if (c.indexOf('observ') >= 0 || c.indexOf('obs') >= 0) mapaColunas['observacao'] = idx
  }

  const itens = []
  let ignoradas = 0

  for (let i = 1; i < linhasMatriz.length; i++) {
    const cols = linhasMatriz[i] || []

    const nome = (mapaColunas['nome'] !== undefined ? cols[mapaColunas['nome']] : '') || ''
    const cnpjBruto = (mapaColunas['cnpj'] !== undefined ? cols[mapaColunas['cnpj']] : '') || ''
    const situacaoBruta =
      (mapaColunas['situacao'] !== undefined ? cols[mapaColunas['situacao']] : '') || ''
    const regimeBruto =
      (mapaColunas['regime'] !== undefined ? cols[mapaColunas['regime']] : '') || ''
    const procuracaoBruta =
      (mapaColunas['procuracao'] !== undefined ? cols[mapaColunas['procuracao']] : '') || ''
    const vendedorBruto =
      (mapaColunas['vendedor'] !== undefined ? cols[mapaColunas['vendedor']] : '') || ''
    const cadastradoBruto =
      (mapaColunas['cadastrado'] !== undefined ? cols[mapaColunas['cadastrado']] : '') || ''
    const observacaoBruta =
      (mapaColunas['observacao'] !== undefined ? cols[mapaColunas['observacao']] : '') || ''

    const cnpj = normalizarCnpj(cnpjBruto)
    const nomeLimpo = nome.trim()
    const situacao = parseSituacao(situacaoBruta)
    const regime = parseRegimeTributacao(regimeBruto)
    const procInfo = parseProcuracao(procuracaoBruta)
    const vendedor = vendedorBruto.trim()
    const cadastradoEm = extrairDataHoraPocketBase(cadastradoBruto)
    const observacao = observacaoBruta.trim()

    if (
      !cnpj &&
      !nomeLimpo &&
      !situacao &&
      !regime &&
      !procInfo.procuracao &&
      !vendedor &&
      !observacao
    ) {
      ignoradas++
      continue
    }

    itens.push({
      cnpj,
      nome: nomeLimpo,
      situacao,
      regime_tributacao: regime,
      procuracao: procInfo.procuracao,
      procuracao_validade: procInfo.validade,
      vendedor_responsavel: vendedor,
      cadastrado_em: cadastradoEm,
      observacao,
    })
  }

  let novas = 0
  let atualizadas = 0
  const invalidas = []
  const vistos = {}

  const colEmpresas = $app.findCollectionByNameOrId('empresas')

  for (let i = 0; i < itens.length; i++) {
    const item = itens[i]
    const cnpj = item.cnpj
    const nome = item.nome

    let rec = null
    if (cnpj) {
      if (vistos[cnpj]) continue
      vistos[cnpj] = true
      try {
        rec = $app.findFirstRecordByData('empresas', 'cnpj', cnpj)
      } catch (_) {
        rec = null
      }
    } else if (nome) {
      try {
        rec = $app.findFirstRecordByData('empresas', 'nome', nome)
      } catch (_) {
        rec = null
      }
    }

    try {
      if (!rec) {
        rec = new Record(colEmpresas)
        if (cnpj) rec.set('cnpj', cnpj)
        if (nome) rec.set('nome', nome)
        if (item.situacao) rec.set('situacao', item.situacao)
        if (item.regime_tributacao) rec.set('regime_tributacao', item.regime_tributacao)
        if (item.procuracao) rec.set('procuracao', item.procuracao)
        if (item.procuracao_validade)
          rec.set('procuracao_validade', item.procuracao_validade + ' 00:00:00.000Z')
        if (item.vendedor_responsavel) rec.set('vendedor_responsavel', item.vendedor_responsavel)
        if (item.cadastrado_em) rec.set('cadastrado_em', item.cadastrado_em)
        if (item.observacao) rec.set('observacao', item.observacao)

        $app.save(rec)
        novas++
      } else {
        if (cnpj && !rec.getString('cnpj')) rec.set('cnpj', cnpj)
        if (nome && !rec.getString('nome')) rec.set('nome', nome)
        if (item.situacao) rec.set('situacao', item.situacao)
        if (item.regime_tributacao) rec.set('regime_tributacao', item.regime_tributacao)
        if (item.procuracao) rec.set('procuracao', item.procuracao)
        if (item.procuracao_validade)
          rec.set('procuracao_validade', item.procuracao_validade + ' 00:00:00.000Z')
        if (item.vendedor_responsavel) rec.set('vendedor_responsavel', item.vendedor_responsavel)
        if (item.cadastrado_em && !rec.getString('cadastrado_em'))
          rec.set('cadastrado_em', item.cadastrado_em)
        if (item.observacao) rec.set('observacao', item.observacao)

        $app.save(rec)
        atualizadas++
      }
    } catch (err) {
      invalidas.push({
        linha: i + 2,
        nome: nome || cnpj,
        erro: String(err && err.message ? err.message : err),
      })
    }
  }

  return e.json(200, {
    totalItens: itens.length,
    ignoradas,
    novas,
    atualizadas,
    invalidas,
  })
})
