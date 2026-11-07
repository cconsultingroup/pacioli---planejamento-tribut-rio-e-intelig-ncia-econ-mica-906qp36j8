routerAdd('POST', '/backend/v1/empresas/importar-anexo', (e) => {
  const url =
    'https://dagtlwojkqyivnjgveda.supabase.co/storage/v1/object/public/message-attachments/6ff6d2b4-9ddc-4a9b-93a7-4b2fbf49361b/clientes-2026-11-07-3f868.xlsx'

  let res = null
  try {
    res = $http.send({
      url: url,
      method: 'GET',
      timeout: 60,
    })
  } catch (err) {
    return e.json(500, { erro: 'Falha ao baixar arquivo: ' + String(err) })
  }

  if (res.statusCode !== 200) {
    return e.json(500, { erro: 'Status de download inválido: ' + res.statusCode })
  }

  // Cria um arquivo temporário com $filesystem ou converte
  // No PocketBase Goja, $filesystem.fileFromBytes(bytes, name)
  try {
    const file = $filesystem.fileFromBytes(res.body, 'clientes.xlsx')
    const docRes = $documents.toMarkdown({ file: file })
    return e.json(200, {
      status: 'ok',
      truncated: docRes.truncated,
      tamanhoMarkdown: (docRes.markdown || '').length,
      amostraMarkdown: (docRes.markdown || '').slice(0, 1000),
    })
  } catch (convErr) {
    return e.json(500, { erro: 'Falha no toMarkdown: ' + String(convErr) })
  }
})
