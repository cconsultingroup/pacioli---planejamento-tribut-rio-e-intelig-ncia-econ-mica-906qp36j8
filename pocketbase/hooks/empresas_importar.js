routerAdd('POST', '/backend/v1/empresas/importar', (e) => {
  // Sem login por enquanto (pedido da Thamyres, 07/11): a rota fica aberta.
  let b = {}
  try {
    b = e.requestInfo().body || {}
  } catch (err) {
    b = {}
  }
  const texto = typeof b.texto === 'string' ? b.texto : ''
  if (!texto.trim()) {
    return e.json(422, { erro: 'Envie uma planilha ou cole a lista (uma empresa por linha).' })
  }
  const linhas = texto.split(/\r?\n/)
  if (linhas.length > 5000) {
    return e.json(422, { erro: 'Máximo de 5.000 linhas por importação.' })
  }
  const situacaoPadrao = b.situacao === 'inativa' ? 'inativa' : 'ativa'
  let procuracao = ''
  if (b.procuracao === true) procuracao = 'sim'
  if (b.procuracao === false) procuracao = 'nao'
  const validade =
    typeof b.procuracao_validade === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.procuracao_validade)
      ? b.procuracao_validade
      : ''

  let novas = 0
  let atualizadas = 0
  const invalidas = []
  const vistos = {}

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i].trim()
    if (!linha) continue
    const sep = linha.indexOf(';') >= 0 ? ';' : linha.indexOf('\t') >= 0 ? '\t' : ','
    const pedacos = linha.split(sep).map((p) => p.trim())
    const cnpj = (pedacos[0] || '').replace(/\D/g, '')
    if (cnpj.length !== 14) {
      if (!(i === 0 && /cnpj/i.test(pedacos[0] || ''))) {
        invalidas.push({ linha: i + 1, conteudo: linha })
      }
      continue
    }
    if (vistos[cnpj]) continue
    vistos[cnpj] = true
    const nome = (pedacos[1] || '').slice(0, 255)
    const token = (pedacos[2] || '').toUpperCase()
    const situacaoLinha =
      token.indexOf('INAT') >= 0 ? 'inativa' : token.indexOf('ATIV') >= 0 ? 'ativa' : ''

    let rec = null
    try {
      rec = $app.findFirstRecordByData('empresas', 'cnpj', cnpj)
    } catch (_) {
      rec = null
    }
    if (!rec) {
      rec = new Record($app.findCollectionByNameOrId('empresas'))
      rec.set('cnpj', cnpj)
      rec.set('nome', nome)
      rec.set('situacao', situacaoLinha || situacaoPadrao)
      if (procuracao) rec.set('procuracao', procuracao)
      if (validade) rec.set('procuracao_validade', validade + ' 00:00:00.000Z')
      // criado_por fica vazio enquanto não houver login.
      $app.save(rec)
      novas++
    } else {
      if (nome && !rec.getString('nome')) rec.set('nome', nome)
      if (situacaoLinha) rec.set('situacao', situacaoLinha)
      if (procuracao) rec.set('procuracao', procuracao)
      if (validade) rec.set('procuracao_validade', validade + ' 00:00:00.000Z')
      $app.save(rec)
      atualizadas++
    }
  }
  return e.json(200, { novas, atualizadas, invalidas, total: novas + atualizadas })
})
