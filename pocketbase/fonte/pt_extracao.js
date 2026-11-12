// Extração completa (só leitura) da API ReceitanetBX para o planejamento:
// cadastro da empresa, escriturações (SPED), documentos declarados (chaves das EFDs),
// resumo das NF-e guardadas, teses de crédito e cálculo do crédito recuperável.
// NUNCA liga o ReceitanetBX nem pede arquivos à Receita: só lê o que já está no servidor.
// Falha de uma seção não derruba as outras (cada erro vira item da lista "erros").
// Este arquivo é AUTOCONTIDO (não usa planejamento-lib.js): mantenha
// pocketbase/fonte/pt_extracao.js e pocketbase/hooks/pt_extracao.js idênticos.
routerAdd(
  'GET',
  '/backend/v1/pt/dados-completos/{cnpj}',
  (e) => {
    if (!e.auth) return e.json(401, { erro: 'Sessão expirada.' })
    const cnpj = e.request.pathValue('cnpj')
    if (!/^\d{14}$/.test(cnpj)) return e.json(422, { erro: 'CNPJ inválido.' })
    const urlBase = ($secrets.get('RECEITANETBOX_URL') || '').replace(/\/$/, '')
    const chave = $secrets.get('RECEITANETBOX_API_KEY') || ''
    if (!urlBase || !chave)
      return e.json(503, {
        erro: 'Servidor ReceitanetBX não configurado: cadastre os secrets RECEITANETBOX_URL e RECEITANETBOX_API_KEY no Skip.',
      })

    // CNPJ da matriz (0001) com dígitos verificadores: EFD-Contribuições costuma ser centralizada lá.
    const dv = (s) => {
      const pesos =
        s.length === 12
          ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
          : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      let soma = 0
      for (let i = 0; i < s.length; i++) soma += Number(s[i]) * pesos[i]
      const r = soma % 11
      return r < 2 ? 0 : 11 - r
    }
    const base = cnpj.slice(0, 8) + '0001'
    const matriz = base + dv(base) + dv(base + dv(base))

    const avisos = []
    const erros = []
    /** Busca tolerante: um erro vira item da lista "erros" e devolve null. */
    const get = (secao, caminho) => {
      try {
        const res = $http.send({
          url: urlBase + caminho,
          method: 'GET',
          headers: { 'X-API-Key': chave, Accept: 'application/json' },
          timeout: 30,
        })
        if (res.statusCode >= 400) throw new Error('HTTP ' + res.statusCode + ' em ' + secao)
        return res.json
      } catch (err) {
        erros.push({ secao: secao, mensagem: (err && err.message) || String(err) })
        return null
      }
    }
    /** Aceita lista direta ou embrulhada (arquivos/itens/dados/chaves). */
    const lista = (r, chaves) => {
      if (Array.isArray(r)) return r
      const o = r || {}
      for (const k of chaves) if (Array.isArray(o[k])) return o[k]
      return []
    }

    const saida = {
      cnpj: cnpj,
      matriz: matriz,
      empresa: null,
      escrituracoes: [],
      documentosResumo: null,
      nfeResumo: null,
      creditosTeses: null,
      creditosCalculo: null,
      avisos: avisos,
      erros: erros,
    }

    // Cadastro da empresa no servidor (nome, situação, procuração, observação…)
    const cad = get('cadastro', '/v1/empresas')
    for (const x of lista(cad, ['empresas', 'itens', 'dados', 'chaves']))
      if (String((x && x.cnpj) || '').replace(/\D/g, '') === cnpj) {
        saida.empresa = x
        break
      }

    // Escriturações SPED (todas as do CNPJ; se for filial, também as centralizadas na matriz)
    const vistos = {}
    for (const doc of [cnpj, matriz]) {
      const r = get('escrituracoes', '/v1/sped/arquivos?cnpj=' + doc + '&limite=1000')
      for (const a of lista(r, ['arquivos', 'itens', 'dados'])) {
        if (!a || vistos[a.id]) continue
        vistos[a.id] = true
        saida.escrituracoes.push({
          id: a.id,
          nome: a.nome || null,
          tipo: a.tipo || 'DESCONHECIDO',
          de: a.dt_ini || a.data_ini || null,
          ate: a.dt_fin || a.data_fim || null,
          importadoEm: a.importado_em || a.criado_em || null,
        })
      }
    }
    if (matriz !== cnpj && saida.escrituracoes.length)
      avisos.push(
        'Escriturações também pesquisadas na matriz (' +
          matriz +
          '), onde a EFD-Contribuições costuma ser centralizada.',
      )
    saida.escrituracoes.sort((a, b) => String(b.de || '').localeCompare(String(a.de || '')))
    if (!saida.escrituracoes.length)
      avisos.push('Esta empresa não tem escriturações (SPED) no servidor ReceitanetBX ainda.')

    // Totais dos documentos declarados nas EFDs (NF-e/NFC-e/CT-e/NFS-e: entradas x saídas, por mês)
    saida.documentosResumo = get(
      'documentos',
      '/v1/sped/chaves/resumo?cnpj=' + cnpj + '&limite=200',
    )
    if (!saida.documentosResumo)
      saida.documentosResumo = get('documentos', '/v1/sped/chaves?cnpj=' + cnpj + '&limite=200')

    // Resumo das NF-e guardadas (emitidas x recebidas, por mês)
    saida.nfeResumo = get('nfe', '/v1/nfe/resumo?cnpj=' + cnpj + '&limite=200')

    // Créditos: teses disponíveis e cálculo do crédito recuperável da empresa
    saida.creditosTeses = get('creditos', '/v1/creditos/teses')
    saida.creditosCalculo = get('creditos', '/v1/creditos/calculo?cnpj=' + cnpj)

    return e.json(200, saida)
  },
  $apis.requireAuth(),
)
