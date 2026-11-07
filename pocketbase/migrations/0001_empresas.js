migrate(
  (app) => {
    const collection = new Collection({
      name: 'empresas',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'cnpj', type: 'text', required: true, min: 14, max: 14, pattern: '^\\d{14}$' },
        { name: 'nome', type: 'text', required: false, max: 255 },
        {
          name: 'situacao',
          type: 'select',
          required: false,
          values: ['ativa', 'inativa'],
          maxSelect: 1,
        },
        {
          name: 'procuracao',
          type: 'select',
          required: false,
          values: ['sim', 'nao'],
          maxSelect: 1,
        },
        { name: 'procuracao_validade', type: 'date', required: false },
        { name: 'observacao', type: 'text', required: false, max: 1000 },
        {
          name: 'criado_por',
          type: 'relation',
          required: false,
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_empresas_cnpj ON empresas (cnpj)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('empresas')
    app.delete(collection)
  },
)
