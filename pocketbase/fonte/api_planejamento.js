// Rotas do Planejamento Tributário 2026–2033 (src/planejamento). Só leitura do SPED já importado na API ReceitanetBX:
// nunca consulta o SERPRO nem pede arquivos à Receita. Acesso: equipe técnica (Dev e Tributarista).
// planejamento-lib.js é colado dentro de cada rota por gerar-hooks.mjs (o Skip não carrega outro arquivo por require).

routerAdd(
  'GET',
  '/backend/v1/pt/empresas',
  (e) => {
    const u = require(`${__hooks}/planejamento-lib.js`)
    if (!u.equipe(e)) return e.json(403, { erro: 'Acesso restrito à equipe técnica.' })
    // Empresas deste sistema (planilha importada) + as que já têm SPED no servidor (API ReceitanetBX, se configurada).
    const mapa = {}
    for (const x of u.empresasLocais()) if (x.situacao !== 'inativa') mapa[x.cnpj] = x
    if (u.rbxConfigurado()) {
      try {
        for (const x of u.rbx('GET', '/v1/empresas') || []) {
          if (x.situacao === 'inativa' || mapa[x.cnpj]) continue
          mapa[x.cnpj] = {
            cnpj: x.cnpj,
            nome: x.nome || x.empresa || null,
            observacao: x.observacao || null,
            situacao: x.situacao,
          }
        }
      } catch (err) {
        // sem a API, fica só a lista local
      }
    }
    const lista = Object.keys(mapa).map((k) => mapa[k])
    lista.sort((a, b) => String(a.nome || a.cnpj).localeCompare(String(b.nome || b.cnpj)))
    return e.json(200, lista)
  },
  $apis.requireAuth(),
)

routerAdd(
  'GET',
  '/backend/v1/pt/dados/{cnpj}',
  (e) => {
    const u = require(`${__hooks}/planejamento-lib.js`)
    if (!u.equipe(e)) return e.json(403, { erro: 'Acesso restrito à equipe técnica.' })
    const cnpj = e.request.pathValue('cnpj')
    if (!u.cnpjValido(cnpj)) return e.json(422, { erro: 'CNPJ inválido.' })
    if (!u.rbxConfigurado())
      return e.json(503, {
        erro: 'Leitura do SPED indisponível: cadastre os secrets RECEITANETBOX_URL e RECEITANETBOX_API_KEY no Skip. Enquanto isso, preencha o perfil à mão.',
      })
    try {
      let empresa = null
      try {
        empresa = (u.rbx('GET', '/v1/empresas') || []).find((x) => x.cnpj === cnpj) || null
      } catch (err) {
        empresa = null
      }
      const api = (caminho) => u.rbx('GET', caminho, undefined, 120)
      const r = u.situacaoAtual(api, cnpj, u.cnpjMatriz(cnpj), u.declaracoes)
      // Nome do município e descrição do CNAE (IBGE).
      const pf = r.perfil || {}
      if (pf.codMun) {
        const m = u.ibge('/v1/localidades/municipios/' + pf.codMun)
        if (m && m.nome) {
          pf.municipio = m.nome
          pf.fontes.municipio = pf.fontes.codMun + ' · IBGE ' + pf.codMun
        }
      }
      if (pf.cnae) {
        const c = u.ibge('/v2/cnae/subclasses/' + pf.cnae)
        const item = Array.isArray(c) ? c[0] : c
        if (item && item.descricao) {
          pf.atividade = item.descricao
          pf.fontes.atividade = pf.fontes.cnae + ' · IBGE/CNAE'
        }
      }
      return e.json(
        200,
        Object.assign(
          { empresa: empresa ? { nome: empresa.nome, observacao: empresa.observacao } : null },
          r,
        ),
      )
    } catch (err) {
      return u.falhar(e, err)
    }
  },
  $apis.requireAuth(),
)

routerAdd(
  'GET',
  '/backend/v1/pt/email-estado',
  (e) => {
    const u = require(`${__hooks}/planejamento-lib.js`)
    if (!u.equipe(e)) return e.json(403, { erro: 'Acesso restrito à equipe técnica.' })
    const ok = u.emailConfigurado()
    return e.json(200, {
      configurado: ok,
      remetente: ok ? $app.settings().meta.senderAddress : null,
    })
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/pt/email-teste/{id}',
  (e) => {
    const u = require(`${__hooks}/planejamento-lib.js`)
    if (!u.equipe(e)) return e.json(403, { erro: 'Acesso restrito à equipe técnica.' })
    let d
    try {
      d = $app.findRecordById('pt_destinatarios', e.request.pathValue('id'))
    } catch (err) {
      return e.json(404, { erro: 'Destinatário não encontrado.' })
    }
    const email = d.getString('email')
    if (!email) return e.json(422, { erro: 'Destinatário sem e-mail.' })
    if (!u.emailConfigurado()) {
      u.registrarEnvio(
        d.getString('nome'),
        email,
        'teste',
        'Teste de entrega',
        'falhou',
        'Serviço de e-mail (SMTP) não configurado no servidor.',
      )
      return e.json(503, { erro: 'Serviço de e-mail (SMTP) ainda não configurado no servidor.' })
    }
    const ok = u.enviarEmail(
      d.getString('nome'),
      email,
      'teste',
      'Teste de entrega — Planejamento Tributário C CONT',
      u.moldura(
        'Teste de entrega',
        '<p>Mensagem de teste da Gestão de Destinatários. Se você recebeu, o envio está funcionando.</p>',
      ),
      'teste',
    )
    return ok ? e.json(200, { ok: true }) : e.json(502, { erro: 'Falha no envio (ver histórico).' })
  },
  $apis.requireAuth(),
)

/** Aviso de planejamento: só o link autenticado (conteúdo do cliente é sigiloso). */
routerAdd(
  'POST',
  '/backend/v1/pt/enviar-planejamento/{id}',
  (e) => {
    const u = require(`${__hooks}/planejamento-lib.js`)
    if (!u.equipe(e)) return e.json(403, { erro: 'Acesso restrito à equipe técnica.' })
    let p
    try {
      p = $app.findRecordById('pt_planejamentos', e.request.pathValue('id'))
    } catch (err) {
      return e.json(404, { erro: 'Planejamento não encontrado.' })
    }
    const nome = p.getString('nome')
    const link = u.SITE() + '/planejamento-tributario/planejamento/' + p.id + '/relatorios'
    const assunto = 'Planejamento tributário disponível — ' + nome
    const html = u.moldura(
      assunto,
      '<p>O planejamento tributário de <b>' +
        u.esc(nome) +
        '</b> (' +
        u.esc(p.getString('periodo')) +
        ') foi atualizado e está disponível no sistema.</p>' +
        (u.SITE()
          ? "<p><a href='" +
            link +
            "' style='background:#0e6b63;color:#fff;padding:8px 14px;border-radius:6px;text-decoration:none'>Abrir no sistema (acesso autenticado)</a></p>"
          : '<p>Abra o módulo Planejamento Tributário no sistema para ver os relatórios.</p>') +
        "<p style='font-size:12px;color:#5b6b66'>Por sigilo, relatórios de clientes não seguem anexados ao e-mail.</p>",
    )
    const vistos = {}
    let enviados = 0
    let falhas = 0
    for (const tipo of ['executivo', 'tecnico']) {
      for (const d of u.destinatarios(tipo)) {
        if (vistos[d.email]) continue
        vistos[d.email] = true
        if (u.enviarEmail(d.nome, d.email, tipo, assunto, html)) enviados++
        else falhas++
      }
    }
    return e.json(200, {
      enviados,
      falhas,
      detalhe:
        !enviados && !falhas
          ? 'Nenhum destinatário ativo com relatório executivo ou técnico.'
          : u.emailConfigurado()
            ? ''
            : 'SMTP não configurado: envios registrados como falha.',
    })
  },
  $apis.requireAuth(),
)

/** Relatório mensal da inteligência adaptativa (não contém dados de clientes). */
routerAdd(
  'POST',
  '/backend/v1/pt/enviar-inteligencia/{mes}',
  (e) => {
    const u = require(`${__hooks}/planejamento-lib.js`)
    if (!u.equipe(e)) return e.json(403, { erro: 'Acesso restrito à equipe técnica.' })
    const mes = e.request.pathValue('mes')
    if (!/^\d{4}-\d{2}$/.test(mes)) return e.json(422, { erro: 'Mês inválido.' })
    const assunto =
      'NOVAS OPORTUNIDADES DE PLANEJAMENTO TRIBUTÁRIO — ' + mes.split('-').reverse().join('/')
    const html = u.moldura(assunto, u.relatorioInteligencia(mes))
    let enviados = 0
    let falhas = 0
    for (const d of u.destinatarios('inteligencia')) {
      if (u.enviarEmail(d.nome, d.email, 'inteligencia', assunto, html)) enviados++
      else falhas++
    }
    return e.json(200, {
      enviados,
      falhas,
      detalhe:
        !enviados && !falhas
          ? 'Nenhum destinatário ativo com o relatório de inteligência adaptativa.'
          : u.emailConfigurado()
            ? ''
            : 'SMTP não configurado: envios registrados como falha.',
    })
  },
  $apis.requireAuth(),
)

// Envio mensal automático (dia 1º, 8h de Brasília = 11h UTC): relatório do mês anterior aos destinatários "mensal".
// Só dispara se o SMTP estiver configurado e houver destinatários ativos.
cronAdd('pt-inteligencia-mensal', '0 11 1 * *', () => {
  const u = require(`${__hooks}/planejamento-lib.js`)
  if (!u.emailConfigurado()) return
  const d = new Date()
  d.setUTCDate(1)
  d.setUTCMonth(d.getUTCMonth() - 1)
  const mes = d.toISOString().slice(0, 7)
  const assunto =
    'NOVAS OPORTUNIDADES DE PLANEJAMENTO TRIBUTÁRIO — ' + mes.split('-').reverse().join('/')
  const html = u.moldura(assunto, u.relatorioInteligencia(mes))
  for (const x of u.destinatarios('inteligencia'))
    if (x.periodicidade === 'mensal') u.enviarEmail(x.nome, x.email, 'inteligencia', assunto, html)
})

// ------------------------------------------------------------------ usuários
// O banco não aceita autocadastro (migração 0019). Enquanto não houver nenhum usuário, a tela de login permite criar o
// primeiro acesso. O CRUD completo (admin geral) virou pocketbase/hooks/pt_usuarios.js; aqui ficam só as rotas de
// bootstrap. Enquanto não houver NENHUM usuário, o primeiro acesso cria o ADMIN GERAL.
routerAdd('GET', '/backend/v1/pt/primeiro-acesso', (e) => {
  const n = $app.findRecordsByFilter('users', "id != ''", '', 1, 0).length
  return e.json(200, { livre: n === 0 })
})

routerAdd('POST', '/backend/v1/pt/primeiro-acesso', (e) => {
  if ($app.findRecordsByFilter('users', "id != ''", '', 1, 0).length)
    return e.json(403, {
      erro: 'O primeiro acesso já foi criado. Peça a um usuário cadastrado para incluir você.',
    })
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
  if (senha.length < 8) return e.json(422, { erro: 'A senha precisa ter pelo menos 8 caracteres.' })
  const r = new Record($app.findCollectionByNameOrId('users'))
  r.set('email', email)
  r.set('name', nome)
  r.setPassword(senha)
  r.setVerified(true)
  r.set('admin', true)
  r.set('ativo', true)
  $app.save(r)
  return e.json(200, { ok: true })
})
