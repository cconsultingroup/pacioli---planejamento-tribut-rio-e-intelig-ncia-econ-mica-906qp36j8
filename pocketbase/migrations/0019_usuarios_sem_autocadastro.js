// Usuários: sem autocadastro pela API (o padrão do PocketBase permite). O primeiro acesso e os demais usuários são
// criados pelas rotas /backend/v1/pt/primeiro-acesso e /backend/v1/pt/usuarios.
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.createRule = null
    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.createRule = ''
    app.save(users)
  },
)
