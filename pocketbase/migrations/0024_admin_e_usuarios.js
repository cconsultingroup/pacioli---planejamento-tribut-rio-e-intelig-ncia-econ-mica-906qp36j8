// 0024: administrador geral e CRUD de usuários.
// - campos `admin` (bool) e `ativo` (bool) na coleção users (auth). `ativo` = false impede o login (hook de bind).
// - regra de update travada: ninguém muda o próprio `admin`/`ativo` pela API de registros (só via hooks admin).
// - seed idempotente: gabriella.paiva@caldasadvocacia.adv.br como administrador geral (admin = true).
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    if (!users.fields.getByName('admin'))
      users.fields.add(new BoolField({ name: 'admin', presentable: false }))
    if (!users.fields.getByName('ativo'))
      users.fields.add(new BoolField({ name: 'ativo', presentable: false }))
    // Update próprio (nome/avatar) continua; trocar admin/ativo pela API de registros fica bloqueado.
    users.updateRule =
      'id = @request.auth.id && @request.body.admin:changed = false && @request.body.ativo:changed = false'
    app.save(users)

    // Quem já existe fica ativo (o campo novo nasce falso e bloquearia o login).
    for (const r of app.findRecordsByFilter('users', "id != ''", '', 0, 0)) {
      if (!r.getBool('ativo')) {
        r.set('ativo', true)
        app.save(r)
      }
    }

    // Seed do administrador geral (idempotente: se o e-mail já existe, só garante admin/verificado).
    let admin = null
    try {
      admin = app.findAuthRecordByEmail('users', 'gabriella.paiva@caldasadvocacia.adv.br')
    } catch (_) {
      admin = null
    }
    if (!admin) {
      admin = new Record(users)
      admin.setEmail('gabriella.paiva@caldasadvocacia.adv.br')
      admin.set('name', 'Gabriella Paiva')
      admin.setVerified(true)
    }
    admin.set('admin', true)
    admin.set('ativo', true)
    if (admin.isNew()) {
      admin.setPassword('12345678')
      app.save(admin)
    } else {
      // Usuário já existia: só garante o flag de admin (não sobrescreve a senha).
      app.save(admin)
    }
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.updateRule = 'id = @request.auth.id'
    if (users.fields.getByName('admin')) users.fields.removeByName('admin')
    if (users.fields.getByName('ativo')) users.fields.removeByName('ativo')
    app.save(users)
  },
)
