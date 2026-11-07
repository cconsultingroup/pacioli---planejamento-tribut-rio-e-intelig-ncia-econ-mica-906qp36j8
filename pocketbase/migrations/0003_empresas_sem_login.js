migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('empresas')
    // Leitura pública por enquanto (sem login). Escrita direta fechada: só o hook de importação grava.
    col.listRule = ''
    col.viewRule = ''
    col.createRule = null
    col.updateRule = null
    col.deleteRule = null
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('empresas')
    const soDono = "@request.auth.id != '' && criado_por = @request.auth.id"
    col.listRule = soDono
    col.viewRule = soDono
    col.createRule = "@request.auth.id != ''"
    col.updateRule = soDono
    col.deleteRule = soDono
    app.save(col)
  },
)
