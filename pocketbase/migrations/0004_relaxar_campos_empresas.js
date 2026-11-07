migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('empresas')
    const cnpjField = col.fields.getByName('cnpj')
    if (cnpjField) {
      cnpjField.required = false
      cnpjField.min = 0
      cnpjField.max = 30
      cnpjField.pattern = ''
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('empresas')
    const cnpjField = col.fields.getByName('cnpj')
    if (cnpjField) {
      cnpjField.required = true
      cnpjField.min = 14
      cnpjField.max = 14
      cnpjField.pattern = '^\\d{14}$'
    }
    app.save(col)
  },
)
