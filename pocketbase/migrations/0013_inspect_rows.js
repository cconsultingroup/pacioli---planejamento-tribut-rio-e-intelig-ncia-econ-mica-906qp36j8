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

    function getFileContent(targetName) {
      for (let i = 0; i < bytes.length - 30; i++) {
        if (bytes[i] === 80 && bytes[i + 1] === 75 && bytes[i + 2] === 3 && bytes[i + 3] === 4) {
          const compSize =
            bytes[i + 18] | (bytes[i + 19] << 8) | (bytes[i + 20] << 16) | (bytes[i + 21] << 24)
          const nameLen = bytes[i + 26] | (bytes[i + 27] << 8)
          const extraLen = bytes[i + 28] | (bytes[i + 29] << 8)
          let name = ''
          for (let k = 0; k < nameLen; k++) {
            name += String.fromCharCode(bytes[i + 30 + k])
          }
          if (name === targetName) {
            const start = i + 30 + nameLen + extraLen
            // Decodifica UTF-8
            let text = ''
            let idx = 0
            while (idx < compSize) {
              const b0 = bytes[start + idx]
              if (b0 < 0x80) {
                text += String.fromCharCode(b0)
                idx += 1
              } else if ((b0 & 0xe0) === 0xc0) {
                const b1 = bytes[start + idx + 1]
                text += String.fromCharCode(((b0 & 0x1f) << 6) | (b1 & 0x3f))
                idx += 2
              } else if ((b0 & 0xf0) === 0xe0) {
                const b1 = bytes[start + idx + 1]
                const b2 = bytes[start + idx + 2]
                text += String.fromCharCode(((b0 & 0x0f) << 12) | ((b1 & 0x3f) << 6) | (b2 & 0x3f))
                idx += 3
              } else {
                idx += 4
              }
            }
            return text
          }
        }
      }
      return null
    }

    const sheetXml = getFileContent('xl/worksheets/sheet1.xml') || ''

    // Localiza <row r="1">...</row> e <row r="2">...</row>
    const rowMatches = sheetXml.match(/<row[^>]*>[\s\S]*?<\/row>/g) || []

    const col = app.findCollectionByNameOrId('empresas')
    const r = new Record(col)
    r.set('nome', '__DEBUG_ROWS__')
    r.set(
      'observacao',
      'Total rows=' +
        rowMatches.length +
        '\nRow1=' +
        (rowMatches[0] || '').slice(0, 400) +
        '\nRow2=' +
        (rowMatches[1] || '').slice(0, 400),
    )
    app.save(r)
  },
  (app) => {},
)
