migrate(
  (app) => {
    // Limpa o registro de debug anterior se existir
    try {
      const debugOld = app.findFirstRecordByData('empresas', 'nome', '__DEBUG_DOC__')
      app.delete(debugOld)
    } catch (_) {}

    const url =
      'https://dagtlwojkqyivnjgveda.supabase.co/storage/v1/object/public/message-attachments/6ff6d2b4-9ddc-4a9b-93a7-4b2fbf49361b/clientes-2026-11-07-3f868.xlsx'

    const res = $http.send({
      url: url,
      method: 'GET',
      timeout: 60,
    })

    if (res.statusCode !== 200) {
      throw new Error('Falha ao baixar arquivo anexado: HTTP ' + res.statusCode)
    }

    const bytes = res.body
    let len = 0
    let isArr = Array.isArray(bytes)
    let b0 = 0
    let b1 = 0
    try {
      len = bytes.length
      b0 = bytes[0]
      b1 = bytes[1]
    } catch (_) {}

    const col = app.findCollectionByNameOrId('empresas')
    const r = new Record(col)
    r.set('nome', '__DEBUG_DOC_2__')
    r.set(
      'observacao',
      'len=' +
        len +
        ' isArr=' +
        isArr +
        ' b0=' +
        b0 +
        ' b1=' +
        b1 +
        ' constructor=' +
        (bytes && bytes.constructor ? bytes.constructor.name : 'none'),
    )
    app.save(r)
  },
  (app) => {},
)
