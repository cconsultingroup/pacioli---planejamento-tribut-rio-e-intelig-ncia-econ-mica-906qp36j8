// Planejamento Tributário 2026–2033 (src/planejamento): planejamentos por empresa, propostas da inteligência
// adaptativa, estratégias incorporadas, destinatários de relatórios e histórico de envios.
// Acesso só com login (usuários da tabela users). pt_envios só é gravada pelas rotas do servidor.
migrate(
  (app) => {
    const EQUIPE = "@request.auth.id != ''"
    const abertoEquipe = {
      listRule: EQUIPE,
      viewRule: EQUIPE,
      createRule: EQUIPE,
      updateRule: EQUIPE,
      deleteRule: EQUIPE,
    }
    const autodate = [
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ]

    app.save(
      new Collection({
        name: 'pt_planejamentos',
        type: 'base',
        ...abertoEquipe,
        fields: [
          { name: 'cnpj', type: 'text', required: true, min: 14, max: 14, pattern: '^\\d{14}$' },
          { name: 'nome', type: 'text', required: true, max: 500 },
          { name: 'periodo', type: 'text', max: 60 },
          { name: 'responsavel', type: 'text', max: 120 },
          { name: 'status', type: 'text', max: 40 },
          { name: 'cross_sell', type: 'text', max: 5000 },
          { name: 'dados', type: 'json', maxSize: 20000000 },
        ].concat(autodate),
        indexes: ['CREATE INDEX idx_pt_planejamentos_cnpj ON pt_planejamentos (cnpj)'],
      }),
    )

    app.save(
      new Collection({
        name: 'pt_inteligencia',
        type: 'base',
        ...abertoEquipe,
        fields: [
          { name: 'mes', type: 'text', required: true, pattern: '^\\d{4}-\\d{2}$' },
          { name: 'nome', type: 'text', required: true, max: 300 },
          { name: 'situacao', type: 'text', max: 30 },
          { name: 'dados', type: 'json', maxSize: 200000 },
        ].concat(autodate),
        indexes: ['CREATE INDEX idx_pt_inteligencia_mes ON pt_inteligencia (mes)'],
      }),
    )

    app.save(
      new Collection({
        name: 'pt_estrategias_extra',
        type: 'base',
        ...abertoEquipe,
        fields: [
          { name: 'numero', type: 'number', required: true, min: 201, onlyInt: true },
          { name: 'titulo', type: 'text', required: true, max: 300 },
          { name: 'dados', type: 'json', maxSize: 500000 },
        ].concat(autodate),
        indexes: [
          'CREATE UNIQUE INDEX idx_pt_estrategias_extra_numero ON pt_estrategias_extra (numero)',
        ],
      }),
    )

    const dest = new Collection({
      name: 'pt_destinatarios',
      type: 'base',
      ...abertoEquipe,
      fields: [
        { name: 'grupo', type: 'text', required: true, max: 120 },
        { name: 'nome', type: 'text', required: true, max: 200 },
        { name: 'email', type: 'text', max: 200 },
        { name: 'relatorios', type: 'json', maxSize: 2000 },
        { name: 'periodicidade', type: 'text', max: 30 },
        { name: 'ativo', type: 'bool' },
      ].concat(autodate),
    })
    app.save(dest)

    app.save(
      new Collection({
        name: 'pt_envios',
        type: 'base',
        listRule: EQUIPE,
        viewRule: EQUIPE,
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
          { name: 'destinatario', type: 'text', max: 200 },
          { name: 'email', type: 'text', max: 200 },
          { name: 'relatorio', type: 'text', max: 60 },
          { name: 'assunto', type: 'text', max: 300 },
          { name: 'status', type: 'text', max: 20 },
          { name: 'detalhe', type: 'text', max: 2000 },
        ].concat(autodate),
        indexes: ['CREATE INDEX idx_pt_envios_created ON pt_envios (created)'],
      }),
    )

    // Grupos iniciais (e-mails a cadastrar; inativos até lá).
    const iniciais = [
      ['Controladoria', 'Controladoria', ['tecnico', 'executivo', 'inteligencia'], 'mensal'],
      ['Desenvolvimento', 'Desenvolvimento', ['inteligencia', 'especificacoes'], 'mensal'],
      [
        'Vinícius — Diretoria',
        'Vinicius Caldas',
        ['executivo', 'consolidado', 'inteligencia'],
        'mensal',
      ],
    ]
    const col = app.findCollectionByNameOrId('pt_destinatarios')
    for (const [grupo, nome, relatorios, periodicidade] of iniciais) {
      const r = new Record(col)
      r.set('grupo', grupo)
      r.set('nome', nome)
      r.set('email', '')
      r.set('relatorios', relatorios)
      r.set('periodicidade', periodicidade)
      r.set('ativo', false)
      app.save(r)
    }
  },
  (app) => {
    for (const n of [
      'pt_envios',
      'pt_destinatarios',
      'pt_estrategias_extra',
      'pt_inteligencia',
      'pt_planejamentos',
    ]) {
      try {
        app.delete(app.findCollectionByNameOrId(n))
      } catch (err) {
        // já removida
      }
    }
  },
)
