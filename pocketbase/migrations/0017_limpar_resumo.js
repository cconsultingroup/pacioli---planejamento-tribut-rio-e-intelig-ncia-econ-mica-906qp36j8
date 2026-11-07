migrate(
  (app) => {
    try {
      const r = app.findFirstRecordByData('empresas', 'nome', '__RESUMO_IMPORTACAO__')
      if (r) app.delete(r)
    } catch (_) {}
  },
  () => {},
)
