routerAdd('POST', '/backend/v1/empresas/cross-sell-em-massa', (e) => {
  let b = {}
  try {
    b = e.requestInfo().body || {}
  } catch (err) {
    b = {}
  }

  const destino =
    b.possivel_cross_sell === 'sim' ? 'sim' : b.possivel_cross_sell === 'nao' ? 'nao' : ''
  if (!destino) {
    return e.json(422, { erro: 'Informe possivel_cross_sell como "sim" ou "nao".' })
  }

  const ids = Array.isArray(b.ids)
    ? b.ids.filter((id) => typeof id === 'string' && id.trim() !== '').slice(0, 10000)
    : []

  let atualizadas = 0
  let falhas = 0
  const erros = []

  if (ids.length > 0) {
    // Atualiza apenas as empresas cujos ids foram enviados (respeita filtro/busca da tela).
    for (const id of ids) {
      try {
        const rec = $app.findRecordById('empresas', id)
        rec.set('possivel_cross_sell', destino)
        $app.save(rec)
        atualizadas++
      } catch (err) {
        falhas++
        if (erros.length < 10) erros.push(String(err && err.message ? err.message : err))
      }
    }
  } else {
    // Sem ids: aplica a TODAS as empresas do cadastro.
    try {
      const todas = $app.findRecordsByFilter('empresas', '', '', 0, 0)
      for (const rec of todas) {
        try {
          if (rec.getString('possivel_cross_sell') === destino) continue
          rec.set('possivel_cross_sell', destino)
          $app.save(rec)
          atualizadas++
        } catch (err) {
          falhas++
          if (erros.length < 10) erros.push(String(err && err.message ? err.message : err))
        }
      }
    } catch (err) {
      return e.json(500, { erro: String(err && err.message ? err.message : err) })
    }
  }

  return e.json(200, { atualizadas, falhas, total: ids.length || atualizadas + falhas, erros })
})
