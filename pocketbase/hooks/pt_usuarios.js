// Hooks de usuários (admin geral) — Pacioli. Rotas:
//   GET    /backend/v1/pt/usuarios            — lista (só admin)
//   POST   /backend/v1/pt/usuarios            — cria usuário (só admin)
//   PATCH  /backend/v1/pt/usuarios/{id}       — edita nome/e-mail/ativo/admin (só admin, com salvaguardas)
//   DELETE /backend/v1/pt/usuarios/{id}       — exclui usuário (só admin, nunca a si mesmo)
//   POST   /backend/v1/pt/usuarios/{id}/senha — troca a senha de um usuário (só admin)
//   POST   /backend/v1/minha-senha            — troca a própria senha (usuário logado, exige a senha atual)
// O flag `ativo = false` impede o login (onRecordAuthRequest, abaixo). Autocadastro segue fechado (migração 0019).
// Nota do JSVM: nada de declarações de topo compartilhadas entre callbacks — todo o helper vai inline em cada rota.

routerAdd(
  'GET',
  '/backend/v1/pt/usuarios',
  (e) => {
    const admin = !!e.auth && e.auth.getBool('admin') === true
    if (!admin) return e.json(403, { erro: 'Acesso restrito ao administrador geral.' })
    const lista = $app.findRecordsByFilter('users', "id != ''", 'name', 0, 0)
    return e.json(
      200,
      lista.map((r) => ({
        id: r.id,
        nome: r.getString('name'),
        email: r.getString('email'),
        admin: r.getBool('admin'),
        ativo: r.getBool('ativo'),
        criado: r.getString('created'),
      })),
    )
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/pt/usuarios',
  (e) => {
    const admin = !!e.auth && e.auth.getBool('admin') === true
    if (!admin) return e.json(403, { erro: 'Acesso restrito ao administrador geral.' })
    let b = {}
    try {
      b = e.requestInfo().body || {}
    } catch (err) {
      b = {}
    }
    const nome = String(b.nome || '').trim()
    const email = String(b.email || '')
      .trim()
      .toLowerCase()
    const senha = String(b.senha || '')
    if (!nome) return e.json(422, { erro: 'Informe o nome.' })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return e.json(422, { erro: 'E-mail inválido.' })
    if (senha.length < 8)
      return e.json(422, { erro: 'A senha precisa ter pelo menos 8 caracteres.' })
    if ($app.findRecordsByFilter('users', 'email = {:email}', '', 1, 0, { email: email }).length)
      return e.json(409, { erro: 'Já existe um usuário com esse e-mail.' })
    const r = new Record($app.findCollectionByNameOrId('users'))
    r.set('email', email)
    r.set('name', nome)
    r.setPassword(senha)
    r.setVerified(true)
    r.set('ativo', true)
    r.set('admin', b.admin === true)
    $app.save(r)
    return e.json(200, { ok: true, id: r.id })
  },
  $apis.requireAuth(),
)

routerAdd(
  'PATCH',
  '/backend/v1/pt/usuarios/{id}',
  (e) => {
    const admin = !!e.auth && e.auth.getBool('admin') === true
    if (!admin) return e.json(403, { erro: 'Acesso restrito ao administrador geral.' })
    let r
    try {
      r = $app.findRecordById('users', e.request.pathValue('id'))
    } catch (err) {
      return e.json(404, { erro: 'Usuário não encontrado.' })
    }
    let b = {}
    try {
      b = e.requestInfo().body || {}
    } catch (err) {
      b = {}
    }
    if ('nome' in b) {
      const nome = String(b.nome || '').trim()
      if (!nome) return e.json(422, { erro: 'Informe o nome.' })
      r.set('name', nome)
    }
    if ('email' in b) {
      const email = String(b.email || '')
        .trim()
        .toLowerCase()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return e.json(422, { erro: 'E-mail inválido.' })
      const outros = $app.findRecordsByFilter(
        'users',
        'email = {:email} && id != {:id}',
        '',
        1,
        0,
        { email: email, id: r.id },
      )
      if (outros.length) return e.json(409, { erro: 'Já existe um usuário com esse e-mail.' })
      r.set('email', email)
    }
    if ('ativo' in b) {
      if (r.id === e.auth.id && b.ativo !== true)
        return e.json(422, { erro: 'Você não pode desativar o seu próprio acesso.' })
      r.set('ativo', b.ativo === true)
    }
    if ('admin' in b) {
      if (r.id === e.auth.id && b.admin !== true)
        return e.json(422, { erro: 'Você não pode remover o seu próprio papel de administrador.' })
      r.set('admin', b.admin === true)
    }
    $app.save(r)
    return e.json(200, {
      ok: true,
      id: r.id,
      nome: r.getString('name'),
      email: r.getString('email'),
      admin: r.getBool('admin'),
      ativo: r.getBool('ativo'),
    })
  },
  $apis.requireAuth(),
)

routerAdd(
  'DELETE',
  '/backend/v1/pt/usuarios/{id}',
  (e) => {
    const admin = !!e.auth && e.auth.getBool('admin') === true
    if (!admin) return e.json(403, { erro: 'Acesso restrito ao administrador geral.' })
    let r
    try {
      r = $app.findRecordById('users', e.request.pathValue('id'))
    } catch (err) {
      return e.json(404, { erro: 'Usuário não encontrado.' })
    }
    if (r.id === e.auth.id)
      return e.json(422, { erro: 'Você não pode excluir o seu próprio acesso.' })
    if ($app.countRecords('users') <= 1)
      return e.json(422, { erro: 'O sistema precisa de pelo menos um usuário.' })
    $app.delete(r)
    return e.json(200, { ok: true })
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/pt/usuarios/{id}/senha',
  (e) => {
    const admin = !!e.auth && e.auth.getBool('admin') === true
    if (!admin) return e.json(403, { erro: 'Acesso restrito ao administrador geral.' })
    let r
    try {
      r = $app.findRecordById('users', e.request.pathValue('id'))
    } catch (err) {
      return e.json(404, { erro: 'Usuário não encontrado.' })
    }
    let b = {}
    try {
      b = e.requestInfo().body || {}
    } catch (err) {
      b = {}
    }
    const senha = String(b.senha || '')
    if (senha.length < 8)
      return e.json(422, { erro: 'A nova senha precisa ter pelo menos 8 caracteres.' })
    r.setPassword(senha)
    $app.save(r)
    return e.json(200, { ok: true })
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/minha-senha',
  (e) => {
    if (!e.auth) return e.json(401, { erro: 'Entre com o seu acesso.' })
    let b = {}
    try {
      b = e.requestInfo().body || {}
    } catch (err) {
      b = {}
    }
    const atual = String(b.atual || '')
    const nova = String(b.nova || '')
    if (nova.length < 8)
      return e.json(422, { erro: 'A nova senha precisa ter pelo menos 8 caracteres.' })
    if (atual === nova) return e.json(422, { erro: 'A nova senha precisa ser diferente da atual.' })
    const alvo = $app.findRecordById('users', e.auth.id)
    if (!alvo.validatePassword(atual)) return e.json(401, { erro: 'Senha atual incorreta.' })
    alvo.setPassword(nova)
    $app.save(alvo)
    return e.json(200, { ok: true })
  },
  $apis.requireAuth(),
)

/** Bloqueia o login de usuários desativados. */
onRecordAuthRequest((e) => {
  if (!e.record.getBool('ativo'))
    throw new BadRequestError('Usuário desativado: procure o administrador geral.')
  e.next()
}, 'users')
