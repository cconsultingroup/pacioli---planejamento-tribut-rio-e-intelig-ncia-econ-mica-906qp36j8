routerAdd('POST', '/backend/v1/empresas/importar', (e) => {
  // Sem login por enquanto (pedido da Thamyres, 07/11): a rota fica aberta.
  let b = {}
  try {
    b = e.requestInfo().body || {}
  } catch (err) {
    b = {}
  }
  // Sem validação de campo obrigatório (pedido do usuário): texto vazio é permitido,
  // a importação simplesmente não grava nenhuma empresa.
  const texto = typeof b.texto === 'string' ? b.texto : ''
  const linhas = texto.split(/\r?\n/)
  if (linhas.length > 5000) {
    return e.json(422, { erro: 'Máximo de 5.000 linhas por importação.' })
  }
  // '' = não informar: novas empresas ficam sem situação definida.
  const situacaoPadrao =
    b.situacao === 'inativa' ? 'inativa' : b.situacao === 'ativa' ? 'ativa' : ''
  let procuracao = ''
  if (b.procuracao === true || b.procuracao === 'sim') procuracao = 'sim'
  if (b.procuracao === false || b.procuracao === 'nao') procuracao = 'nao'
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
    const col0 = pedacos[0] || ''
    // Ignora linha de cabeçalho padrão (ex: "CNPJ;Nome;Situação")
    if (i === 0 && /cnpj/i.test(col0) && /nome/i.test(pedacos[1] || '')) {
      continue
    }

    const cnpj = col0.replace(/\D/g, '')
    const nome = (pedacos[1] || (!cnpj && col0 ? col0 : '')).slice(0, 255)
    const token = (pedacos[2] || '').toUpperCase()
    const situacaoLinha =
      token.indexOf('INAT') >= 0 ? 'inativa' : token.indexOf('ATIV') >= 0 ? 'ativa' : ''

    // Se tiver CNPJ, deduplica e busca por CNPJ
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
      // Se não tiver CNPJ, tenta localizar por nome exato para não duplicar se reimportar
      try {
        rec = $app.findFirstRecordByData('empresas', 'nome', nome)
      } catch (_) {
        rec = null
      }
    }

    // Se a linha não tiver nem CNPJ nem nome e nem situação, ignora silenciosamente
    if (!cnpj && !nome && !situacaoLinha) {
      continue
    }

    if (!rec) {
      rec = new Record($app.findCollectionByNameOrId('empresas'))
      if (cnpj) rec.set('cnpj', cnpj)
      if (nome) rec.set('nome', nome)
      if (situacaoLinha || situacaoPadrao) rec.set('situacao', situacaoLinha || situacaoPadrao)
      if (procuracao) rec.set('procuracao', procuracao)
      if (validade) rec.set('procuracao_validade', validade + ' 00:00:00.000Z')
      // criado_por fica vazio enquanto não houver login.
      $app.save(rec)
      novas++
    } else {
      if (cnpj && !rec.getString('cnpj')) rec.set('cnpj', cnpj)
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
