migrate(
  (app) => {
    try {
      app.db().newQuery("DELETE FROM empresas WHERE nome LIKE '__DEBUG_%'").execute()
    } catch (_) {}

    const url =
      'https://dagtlwojkqyivnjgveda.supabase.co/storage/v1/object/public/message-attachments/6ff6d2b4-9ddc-4a9b-93a7-4b2fbf49361b/clientes-2026-11-07-3f868.xlsx'

    const res = $http.send({
      url: url,
      method: 'GET',
      timeout: 60,
    })

    const bytes = res.body
    const filesList = []

    for (let i = 0; i < bytes.length - 30; i++) {
      if (bytes[i] === 80 && bytes[i + 1] === 75 && bytes[i + 2] === 3 && bytes[i + 3] === 4) {
        const method = bytes[i + 8] | (bytes[i + 9] << 8)
        const compSize =
          bytes[i + 18] | (bytes[i + 19] << 8) | (bytes[i + 20] << 16) | (bytes[i + 21] << 24)
        const nameLen = bytes[i + 26] | (bytes[i + 27] << 8)
        const extraLen = bytes[i + 28] | (bytes[i + 29] << 8)
        let name = ''
        for (let k = 0; k < nameLen; k++) {
          name += String.fromCharCode(bytes[i + 30 + k])
        }
        filesList.push(name + ' (method=' + method + ' size=' + compSize + ')')
      }
    }

    const col = app.findCollectionByNameOrId('empresas')
    const r = new Record(col)
    r.set('nome', '__DEBUG_NAMES__')
    r.set('observacao', filesList.join(' | '))
    app.save(r)
  },
  (app) => {},
)
