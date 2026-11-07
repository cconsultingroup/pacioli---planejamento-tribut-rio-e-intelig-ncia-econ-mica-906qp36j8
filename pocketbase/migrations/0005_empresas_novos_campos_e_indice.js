migrate(
  (app) => {
    // 1. Limpa registros de teste corrompidos do teste anterior (ex: nome="CNPJ" e cnpj vazio)
    try {
      app
        .db()
        .newQuery("DELETE FROM empresas WHERE nome = 'CNPJ' AND (cnpj = '' OR cnpj IS NULL)")
        .execute()
    } catch (_) {}

    const col = app.findCollectionByNameOrId('empresas')

    // 2. Garante campos extras na coleção empresas para armazenar todos os dados da planilha
    if (!col.fields.getByName('regime_tributacao')) {
      col.fields.add(
        new SelectField({
          name: 'regime_tributacao',
          required: false,
          values: ['simples_nacional', 'lucro_presumido', 'lucro_real', 'nao_informado'],
          maxSelect: 1,
        }),
      )
    }

    if (!col.fields.getByName('vendedor_responsavel')) {
      col.fields.add(
        new TextField({
          name: 'vendedor_responsavel',
          required: false,
          max: 255,
        }),
      )
    }

    if (!col.fields.getByName('cadastrado_em')) {
      col.fields.add(
        new DateField({
          name: 'cadastrado_em',
          required: false,
        }),
      )
    }

    // 3. Atualizar índice de CNPJ: deve ser único apenas quando CNPJ != ''
    // No SQLite / PocketBase, removemos o índice irrestrito antigo se existir
    try {
      col.removeIndex('idx_empresas_cnpj')
    } catch (_) {}

    col.addIndex('idx_empresas_cnpj', true, 'cnpj', "cnpj != ''")

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('empresas')
    try {
      col.removeIndex('idx_empresas_cnpj')
      col.addIndex('idx_empresas_cnpj', true, 'cnpj', '')
    } catch (_) {}
    app.save(col)
  },
)
