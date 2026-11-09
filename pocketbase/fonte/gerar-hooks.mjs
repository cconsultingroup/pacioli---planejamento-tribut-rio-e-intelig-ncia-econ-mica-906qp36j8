// Gera pocketbase/hooks/api_planejamento.js a partir de api_planejamento.js e planejamento-lib.js desta pasta.
// No Skip um arquivo de rotas não carrega outro (require): o código da lib é colado DENTRO de cada rota que o usa.
// Edite os arquivos desta pasta e rode: node pocketbase/fonte/gerar-hooks.mjs && npx oxfmt pocketbase/hooks/api_planejamento.js
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const aqui = dirname(fileURLToPath(import.meta.url))
const hooks = join(aqui, '..', 'hooks')

function embutir(lib) {
  const texto = readFileSync(join(aqui, lib), 'utf8').replace(/\r\n/g, '\n')
  const m = /\nmodule\.exports = (\{[^}]*\})\s*$/.exec(texto)
  if (!m) throw new Error(`${lib}: falta "module.exports = { ... }" no fim`)
  const corpo = texto.slice(0, m.index).trim()
  return `(function () {\n${corpo}\n    return ${m[1]}\n  })()`
}

for (const [rotas, lib] of [['api_planejamento.js', 'planejamento-lib.js']]) {
  const fonte = readFileSync(join(aqui, rotas), 'utf8').replace(/\r\n/g, '\n')
  const chamada = new RegExp('require\\(`\\$\\{__hooks\\}/' + lib.replace('.', '\\.') + '`\\)', 'g')
  const quantas = (fonte.match(chamada) || []).length
  if (!quantas) throw new Error(`${rotas}: não usa ${lib}`)
  const gerado =
    `// GERADO por pocketbase/fonte/gerar-hooks.mjs a partir de pocketbase/fonte/${rotas} e ${lib}. Não edite aqui.\n` +
    fonte.replace(chamada, embutir(lib))
  writeFileSync(join(hooks, rotas), gerado)
  console.log(`${rotas}: ${lib} embutido em ${quantas} rota(s)`)
}
