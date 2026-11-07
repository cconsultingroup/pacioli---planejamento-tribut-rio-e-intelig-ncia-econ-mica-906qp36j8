migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('empresas')
    const soDono = "@request.auth.id != '' && criado_por = @request.auth.id"
    col.listRule = soDono
    col.viewRule = soDono
    col.updateRule = soDono
    col.deleteRule = soDono
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('empresas')
    const aberto = "@request.auth.id != ''"
    col.listRule = aberto
    col.viewRule = aberto
    col.updateRule = aberto
    col.deleteRule = aberto
    app.save(col)
  },
)
