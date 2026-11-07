migrate(
  (app) => {
    // Apaga registro residual de teste se existir
    try {
      const r = app.findFirstRecordByData('empresas', 'nome', '63.410.115/0001-74')
      if (r && r.getString('cnpj') === '63410115') {
        app.delete(r)
      }
    } catch (_) {}

    // Cria registro com o resumo da contagem para auditoria
    const total = app.findRecordsByFilter(
      'empresas',
      "nome != '__RESUMO_IMPORTACAO__'",
      '-created',
      200,
    )

    const col = app.findCollectionByNameOrId('empresas')
    const res = new Record(col)
    res.set('nome', '__RESUMO_IMPORTACAO__')
    res.set('observacao', 'Total empresas importadas: ' + total.length)
    app.save(res)
  },
  () => {},
)
