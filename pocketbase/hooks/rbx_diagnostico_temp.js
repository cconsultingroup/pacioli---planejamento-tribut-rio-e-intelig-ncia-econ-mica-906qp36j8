// Rota temporária de diagnóstico (REMOVER após validar a conexão): prova a leitura ao vivo da API
// ReceitanetBX com a chave dos secrets do Skip e aponta qual chamada falha na rota /backend/v1/pt/dados.
routerAdd('GET', '/backend/v1/pt/rbx-diagnostico', (e) => {
  const url = ($secrets.get('RECEITANETBOX_URL') || '').replace(/\/$/, '')
  const chave = $secrets.get('RECEITANETBOX_API_KEY') || ''
  const sai = (o) => {
    console.log('rbx-diagnostico: ' + JSON.stringify(o))
    return e.json(200, o)
  }
  if (!url || !chave)
    return sai({ erro: 'Secrets RECEITANETBOX_URL/RECEITANETBOX_API_KEY ausentes.', url: url })
  const passa = (metodo, caminho) => {
    try {
      const res = $http.send({
        url: url + caminho,
        method: metodo,
        headers: { 'X-API-Key': chave, Accept: 'application/json' },
        timeout: 60,
      })
      let j = null
      try {
        j = res.json
      } catch (_) {}
      const chaves = j && typeof j === 'object' && !Array.isArray(j) ? Object.keys(j) : null
      return { status: res.statusCode, chaves: chaves, bruto: (res.raw || '').slice(0, 300) }
    } catch (err) {
      return { status: 'excecao', erro: String(err) }
    }
  }
  return sai({
    url: url,
    health: passa('GET', '/health'),
    spedEmpresas: passa('GET', '/v1/sped/empresas'),
    spedArquivos23468575000210: passa(
      'GET',
      '/v1/sped/arquivos?cnpj=23468575000210&tipo=EFD-CONTRIBUICOES&limite=200',
    ),
    cadastroEmpresas: passa('GET', '/v1/empresas'),
  })
})

cronAdd(
  'rbx-diagnostico-cron',
  '*/4 * * * *',
  () => {
    const url = ($secrets.get('RECEITANETBOX_URL') || '').replace(/\/$/, '')
    const chave = $secrets.get('RECEITANETBOX_API_KEY') || ''
    try {
      const res = $http.send({
        url: url + '/v1/sped/empresas',
        method: 'GET',
        headers: { 'X-API-Key': chave, Accept: 'application/json' },
        timeout: 60,
      })
      let j = null
      try {
        j = res.json
      } catch (_) {}
      console.log(
        'rbx-cron: url=' +
          url +
          ' status=' +
          res.statusCode +
          ' chaves=' +
          JSON.stringify(j && typeof j === 'object' && !Array.isArray(j) ? Object.keys(j) : null),
      )
    } catch (err) {
      console.log('rbx-cron: url=' + url + ' excecao=' + String(err))
    }
  },
  () => console.log('rbx-cron: registrado'),
)
