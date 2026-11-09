migrate(
  (app) => {
    console.log('MIGRACAO 0006 INICIADA')
    const url =
      'https://dagtlwojkqyivnjgveda.supabase.co/storage/v1/object/public/message-attachments/6ff6d2b4-9ddc-4a9b-93a7-4b2fbf49361b/clientes-2026-11-07-3f868.xlsx'

    try {
      // Verifica se $http existe em migrações
      if (typeof $http !== 'undefined') {
        console.log('$http existe em migrações')
      } else {
        console.log('$http NAO existe em migrações')
      }
    } catch (e) {
      console.log('Erro checando $http:', e)
    }
  },
  () => {},
)
