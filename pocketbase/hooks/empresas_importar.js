routerAdd('POST', '/backend/v1/empresas/importar', (e) => {
  // Sem login por enquanto: a rota fica aberta para importação de empresas.
  let b = {}
  try {
    b = e.requestInfo().body || {}
  } catch (err) {
    b = {}
  }

  // Suporta itens estruturados (array de objetos) ou texto legado delimitado por linha
  const itens = Array.isArray(b.itens) ? b.itens : []
  const texto = typeof b.texto === 'string' ? b.texto : ''

  // Opções globais de importação informadas pelo usuário no formulário
  const situacaoGlobal =
    b.situacao === 'inativa' ? 'inativa' : b.situacao === 'ativa' ? 'ativa' : ''

  let procuracaoGlobal = ''
  if (b.procuracao === true || b.procuracao === 'sim') procuracaoGlobal = 'sim'
  if (b.procuracao === false || b.procuracao === 'nao') procuracaoGlobal = 'nao'

  let crossSellGlobal = ''
  if (b.possivel_cross_sell === true || b.possivel_cross_sell === 'sim') crossSellGlobal = 'sim'
  if (b.possivel_cross_sell === false || b.possivel_cross_sell === 'nao') crossSellGlobal = 'nao'

  const validadeGlobal =
    typeof b.procuracao_validade === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.procuracao_validade)
      ? b.procuracao_validade
      : ''

  // Constrói lista unificada de registros a processar
  let listaParaProcessar = []

  if (itens.length > 0) {
    listaParaProcessar = itens
  } else if (texto) {
    const linhas = texto.split(/\r?\n/)
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

      listaParaProcessar.push({
        cnpj,
        nome,
        situacao: situacaoLinha,
      })
    }
  }

  if (listaParaProcessar.length > 5000) {
    return e.json(422, { erro: 'Máximo de 5.000 linhas por importação.' })
  }

  let novas = 0
  let atualizadas = 0
  const invalidas = []
  const vistos = {}

  const colEmpresas = $app.findCollectionByNameOrId('empresas')

  for (let i = 0; i < listaParaProcessar.length; i++) {
    const item = listaParaProcessar[i] || {}

    // Normaliza CNPJ (somente números)
    let cnpj = ''
    if (typeof item.cnpj === 'string' || typeof item.cnpj === 'number') {
      cnpj = String(item.cnpj).replace(/\D/g, '')
      if (cnpj.length >= 11 && cnpj.length < 14) {
        cnpj = cnpj.padStart(14, '0')
      }
    }

    // Normaliza nome
    let nome = typeof item.nome === 'string' ? item.nome.trim().slice(0, 255) : ''

    // Se a linha tiver "CNPJ" como nome ou cabeçalho residual, descarta
    if (/^cnpj$/i.test(nome) && !cnpj) {
      continue
    }

    // Situação: item específico tem precedência sobre o padrão global se preenchido
    let situacao = ''
    if (item.situacao === 'ativa' || item.situacao === 'inativa') {
      situacao = item.situacao
    } else if (typeof item.situacao === 'string') {
      const s = item.situacao.toUpperCase()
      if (s.indexOf('INAT') >= 0) situacao = 'inativa'
      else if (s.indexOf('ATIV') >= 0) situacao = 'ativa'
    }
    if (!situacao && situacaoGlobal) {
      situacao = situacaoGlobal
    }

    // Regime de tributação
    let regime = ''
    if (item.regime_tributacao) {
      const r = String(item.regime_tributacao).toLowerCase()
      if (r.indexOf('simples') >= 0) regime = 'simples_nacional'
      else if (r.indexOf('presumido') >= 0) regime = 'lucro_presumido'
      else if (r.indexOf('real') >= 0) regime = 'lucro_real'
      else if (r.indexOf('nao') >= 0 || r.indexOf('informado') >= 0) regime = 'nao_informado'
    }

    // Procuração e validade
    let itemProc = ''
    let itemValidade = ''

    if (item.procuracao === 'sim' || item.procuracao === true) itemProc = 'sim'
    else if (item.procuracao === 'nao' || item.procuracao === false) itemProc = 'nao'
    else if (typeof item.procuracao === 'string' && item.procuracao.trim()) {
      const p = item.procuracao.trim().toLowerCase()
      if (p.indexOf('sim') === 0 || p === 's') itemProc = 'sim'
      else if (p.indexOf('nao') === 0 || p.indexOf('não') === 0 || p === 'n') itemProc = 'nao'
    }

    if (item.procuracao_validade && typeof item.procuracao_validade === 'string') {
      const vMatch = item.procuracao_validade.match(/(\d{4}-\d{2}-\d{2})/)
      if (vMatch) itemValidade = vMatch[1]
    }

    // Se o usuário selecionou uma opção global no formulário ("com", "sem"), ela prevalece sobre o que veio ou complementa
    let procuracaoFinal = itemProc
    let validadeFinal = itemValidade

    if (procuracaoGlobal === 'sim') {
      procuracaoFinal = 'sim'
      if (validadeGlobal) validadeFinal = validadeGlobal
    } else if (procuracaoGlobal === 'nao') {
      procuracaoFinal = 'nao'
      validadeFinal = ''
    } else {
      // Procuração global não informada: usa o do item
      if (procuracaoFinal !== 'sim') {
        validadeFinal = ''
      } else if (!validadeFinal && validadeGlobal) {
        validadeFinal = validadeGlobal
      }
    }

    // Vendedor responsável
    const vendedor =
      typeof item.vendedor_responsavel === 'string'
        ? item.vendedor_responsavel.trim().slice(0, 255)
        : ''

    // Possível cross-sell: valor do item (quando existir) ou a escolha global do formulário
    let crossSellItem = ''
    if (item.possivel_cross_sell === 'sim' || item.possivel_cross_sell === true)
      crossSellItem = 'sim'
    else if (item.possivel_cross_sell === 'nao' || item.possivel_cross_sell === false)
      crossSellItem = 'nao'
    else if (typeof item.possivel_cross_sell === 'string' && item.possivel_cross_sell.trim()) {
      const cs = item.possivel_cross_sell.trim().toLowerCase()
      if (cs.indexOf('sim') === 0 || cs === 's' || cs === 'true' || cs === '1')
        crossSellItem = 'sim'
      else if (cs.indexOf('nao') === 0 || cs.indexOf('não') === 0 || cs === 'n')
        crossSellItem = 'nao'
    }
    const crossSellFinal = crossSellGlobal || crossSellItem

    // Cadastrado em
    let cadastradoEm = ''
    if (typeof item.cadastrado_em === 'string' && item.cadastrado_em.trim()) {
      cadastradoEm = item.cadastrado_em.trim()
    }

    // Observação
    const observacao =
      typeof item.observacao === 'string' ? item.observacao.trim().slice(0, 1000) : ''

    // Se a linha não tiver dados substantivos, ignora
    if (
      !cnpj &&
      !nome &&
      !situacao &&
      !regime &&
      !procuracaoFinal &&
      !crossSellFinal &&
      !vendedor &&
      !observacao
    ) {
      continue
    }

    // Deduplicação em lote e busca do registro existente
    let rec = null
    if (cnpj) {
      if (vistos[cnpj]) {
        continue
      }
      vistos[cnpj] = true
      try {
        rec = $app.findFirstRecordByData('empresas', 'cnpj', cnpj)
      } catch (_) {
        rec = null
      }
    } else if (nome) {
      // Se não tiver CNPJ, tenta localizar por nome exato
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
        if (situacao) rec.set('situacao', situacao)
        if (regime) rec.set('regime_tributacao', regime)
        if (procuracaoFinal) rec.set('procuracao', procuracaoFinal)
        if (validadeFinal) rec.set('procuracao_validade', validadeFinal + ' 00:00:00.000Z')
        if (crossSellFinal) rec.set('possivel_cross_sell', crossSellFinal)
        if (vendedor) rec.set('vendedor_responsavel', vendedor)
        if (cadastradoEm) rec.set('cadastrado_em', cadastradoEm)
        if (observacao) rec.set('observacao', observacao)

        $app.save(rec)
        novas++
      } else {
        if (cnpj && !rec.getString('cnpj')) rec.set('cnpj', cnpj)
        if (nome && !rec.getString('nome')) rec.set('nome', nome)
        if (situacao) rec.set('situacao', situacao)
        if (regime) rec.set('regime_tributacao', regime)
        if (procuracaoFinal) rec.set('procuracao', procuracaoFinal)
        if (validadeFinal) rec.set('procuracao_validade', validadeFinal + ' 00:00:00.000Z')
        if (crossSellFinal) rec.set('possivel_cross_sell', crossSellFinal)
        if (vendedor) rec.set('vendedor_responsavel', vendedor)
        if (cadastradoEm && !rec.getString('cadastrado_em')) rec.set('cadastrado_em', cadastradoEm)
        if (observacao) rec.set('observacao', observacao)

        $app.save(rec)
        atualizadas++
      }
    } catch (saveErr) {
      invalidas.push({
        linha: i + 1,
        conteudo: nome || cnpj || 'linha vazia',
        erro: String(saveErr && saveErr.message ? saveErr.message : saveErr),
      })
    }
  }

  return e.json(200, { novas, atualizadas, invalidas, total: novas + atualizadas })
})
