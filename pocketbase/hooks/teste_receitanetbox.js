// Rota de teste (temporária): valida a leitura ao vivo da API ReceitanetBX, com a chave nos secrets do Skip.
// Depois da validação, remover o arquivo pocketbase/hooks/teste_receitanetbox.js e rodar deploy_backend.
routerAdd('GET', '/backend/v1/pt/receitanetbox-teste', (e) => {
  const url = ($secrets.get('RECEITANETBOX_URL') || '').replace(/\/$/, '')
  const chave = $secrets.get('RECEITANETBOX_API_KEY') || ''
  if (!url || !chave)
    return e.json(503, { erro: 'Secrets RECEITANETBOX_URL/RECEITANETBOX_API_KEY ausentes.' })
  const res = $http.send({
    url: url + '/v1/sped/empresas',
    method: 'GET',
    headers: { 'X-API-Key': chave, Accept: 'application/json' },
    timeout: 60,
  })
  let empresas = []
  try {
    empresas = res.json || []
  } catch (err) {
    return e.json(502, {
      status: res.statusCode,
      erro: 'Resposta não é JSON',
      bruto: (res.raw || '').slice(0, 300),
    })
  }
  return e.json(200, {
    status: res.statusCode,
    quantidade: Array.isArray(empresas) ? empresas.length : null,
    amostra: (Array.isArray(empresas) ? empresas : []).slice(0, 5),
  })
})
