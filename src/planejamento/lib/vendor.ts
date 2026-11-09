// Bibliotecas grandes carregadas só na hora de gerar o Word e a planilha, a partir de public/planejamento/vendor.
// O Skip protege o package.json (desfaz dependências novas); por isso docx e exceljs ficam empacotadas nessa pasta.
// Para atualizar: esbuild com --bundle --format=esm --platform=browser a partir de "export * from 'docx'" e
// "import ExcelJS from 'exceljs'; export default ExcelJS".
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function carregarBiblioteca(arquivo: string): Promise<any> {
  const url = new URL('/planejamento/vendor/' + arquivo, window.location.origin).href
  return import(/* @vite-ignore */ url)
}
