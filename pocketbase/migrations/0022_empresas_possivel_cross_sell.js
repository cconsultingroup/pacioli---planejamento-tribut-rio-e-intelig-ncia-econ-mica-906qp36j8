// Campo "possível cross-sell" na coleção empresas: select opcional (sim | nao).
// Campo nunca obrigatório; registros antigos ficam com o valor vazio (não informado).
migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('empresas')
    if (!col.fields.getByName('possivel_cross_sell')) {
      col.fields.add(
        new SelectField({ name: 'possivel_cross_sell', values: ['sim', 'nao'], maxSelect: 1 }),
      )
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('empresas')
    const f = col.fields.getByName('possivel_cross_sell')
    if (f) col.fields.removeByName('possivel_cross_sell')
    app.save(col)
  },
)
