// Alíquota interna modal (geral) de ICMS por UF, vigente em 2026.
// Conferida em 07/11/2026 em duas tabelas públicas (Barbieri Advogados, atualizada em nov/2026, e NCM Brasil, ago/2026):
// as 27 alíquotas coincidem. Não substitui a lei estadual: produtos com alíquota própria, reduções de base e
// adicionais de fundo de pobreza (FECP) variam por mercadoria.
export const ICMS_UF: Record<string, { aliquota: number; base: string }> = {
  AC: { aliquota: 19, base: 'LC 55/1997, art. 18, I' },
  AL: { aliquota: 20.5, base: 'Lei 5.900/1996, art. 17, I (Lei 9.776/2025), desde 01/04/2026' },
  AM: { aliquota: 20, base: 'LC 19/1997, art. 12, I' },
  AP: { aliquota: 18, base: 'Lei 400/1997, art. 37' },
  BA: { aliquota: 20.5, base: 'Lei 7.014/1996, art. 15, I (Lei 14.629/2023)' },
  CE: { aliquota: 20, base: 'Lei 12.670/1996, art. 44, I' },
  DF: { aliquota: 20, base: 'Lei 1.254/1996, art. 18, II' },
  ES: { aliquota: 17, base: 'RICMS/ES' },
  GO: { aliquota: 19, base: 'Lei 11.651/1991, art. 27, I (Lei 22.460/2023)' },
  MA: { aliquota: 23, base: 'Lei 7.799/2002, art. 23, III (Lei 12.426/2024)' },
  MG: { aliquota: 18, base: 'RICMS/MG (Decreto 48.589/2023), Anexo I' },
  MS: { aliquota: 17, base: 'Lei 1.810/1997, art. 41, III' },
  MT: { aliquota: 17, base: 'Lei 7.098/1998, art. 14, I' },
  PA: { aliquota: 19, base: 'Lei 5.530/1989, art. 12 (Lei 9.755/2022)' },
  PB: { aliquota: 20, base: 'Lei 6.379/1996, art. 11, I' },
  PE: { aliquota: 20.5, base: 'Lei 15.730/2016, art. 15' },
  PI: { aliquota: 22.5, base: 'Lei 4.257/1989, art. 23, I (Lei 8.558/2024)' },
  PR: { aliquota: 19.5, base: 'Lei 11.580/1996, art. 14 (Lei 21.850/2023)' },
  RJ: { aliquota: 22, base: 'Lei 2.657/1996, art. 14, I: 20% + 2% de FECP (LC 210/2023)' },
  RN: { aliquota: 20, base: 'Lei 6.968/1996, art. 27, I (Lei 11.999/2024)' },
  RO: { aliquota: 19.5, base: 'Lei 688/1996, art. 27, I (Lei 5.634/2023)' },
  RR: { aliquota: 20, base: 'Lei 59/1993, art. 32, I (Lei 1.767/2022)' },
  RS: { aliquota: 17, base: 'RICMS/RS' },
  SC: { aliquota: 17, base: 'RICMS/SC, art. 26, I (12% para contribuintes — art. 26, III)' },
  SE: { aliquota: 19, base: 'Lei 3.796/1996, art. 18, I (+1% de FECOEP só em casos específicos)' },
  SP: { aliquota: 18, base: 'RICMS/SP, art. 52, I' },
  TO: { aliquota: 20, base: 'Lei 1.287/2001, art. 27, II (Lei 4.141/2023)' },
}

export const PREFIXO_FONTE_ICMS_UF = 'Alíquota modal de ICMS'
