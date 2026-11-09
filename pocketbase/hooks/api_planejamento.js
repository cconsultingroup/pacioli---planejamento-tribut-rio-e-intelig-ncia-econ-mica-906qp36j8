// GERADO por pocketbase/fonte/gerar-hooks.mjs a partir de pocketbase/fonte/api_planejamento.js e planejamento-lib.js. Não edite aqui.
// Rotas do Planejamento Tributário 2026–2033 (src/planejamento). Só leitura do SPED já importado na API ReceitanetBX:
// nunca consulta o SERPRO nem pede arquivos à Receita. Acesso: equipe técnica (Dev e Tributarista).
// planejamento-lib.js é colado dentro de cada rota por gerar-hooks.mjs (o Skip não carrega outro arquivo por require).

routerAdd(
  'GET',
  '/backend/v1/pt/empresas',
  (e) => {
    const u = (function () {
      // Biblioteca do Planejamento Tributário para os hooks do Skip (PocketBase 0.36).
      // Não é carregada por require em produção: pocketbase/fonte/gerar-hooks.mjs cola este arquivo dentro de cada rota de
      // api_planejamento.js. Junta: acesso à API ReceitanetBX (só leitura do SPED já importado), e-mail, declarações (ECD/ECF)
      // e a leitura da situação atual/perfil a partir do SPED. Chaves só nos secrets do Skip, nunca no navegador.

      const RBX_URL = () =>
        ($secrets.get('RECEITANETBX_URL') || 'http://127.0.0.1:8000').replace(/\/$/, '')
      const RBX_CHAVE = () => $secrets.get('RECEITANETBX_API_KEY') || ''
      /** Endereço do Skip para os links dos e-mails (secret opcional SITE_URL). */
      const SITE = () => ($secrets.get('SITE_URL') || '').replace(/\/$/, '')

      class ErroApi extends Error {
        constructor(status, mensagem) {
          super(mensagem)
          this.status = status
        }
      }

      /** GET/POST na API ReceitanetBX (somente leitura do SPED já importado; não liga o ReceitanetBX). */
      function rbx(metodo, caminho, corpo, timeout) {
        const res = $http.send({
          url: RBX_URL() + caminho,
          method: metodo,
          headers: {
            'X-API-Key': RBX_CHAVE(),
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: corpo === undefined ? '' : JSON.stringify(corpo),
          timeout: timeout || 120,
        })
        if (res.statusCode >= 400) {
          const j = res.json
          throw new ErroApi(
            res.statusCode,
            (j && typeof j.detail === 'string' && j.detail) ||
              (res.raw || '').slice(0, 300) ||
              'HTTP ' + res.statusCode,
          )
        }
        return res.json
      }

      function falhar(e, err) {
        return e.json(err && err.status ? err.status : 502, {
          erro: err && err.message ? err.message : String(err),
        })
      }

      /** Usuário logado. Onde a tabela de usuários tiver perfis (role), só Dev e Tributarista. */
      function equipe(e) {
        if (!e.auth) return false
        const papel = e.auth.getString('role')
        return !papel || papel === 'dev' || papel === 'tributarista'
      }

      /** A leitura do SPED depende dos secrets da API ReceitanetBX. */
      function rbxConfigurado() {
        return !!$secrets.get('RECEITANETBX_URL') && !!$secrets.get('RECEITANETBX_API_KEY')
      }

      /** Empresas cadastradas neste sistema (coleção empresas, importada da planilha). */
      function empresasLocais() {
        try {
          return $app.findRecordsByFilter('empresas', "cnpj != ''", 'nome', 0, 0).map((r) => ({
            cnpj: r.getString('cnpj'),
            nome: r.getString('nome') || null,
            observacao: r.getString('observacao') || null,
            situacao: r.getString('situacao') || null,
          }))
        } catch (err) {
          return []
        }
      }

      const cnpjValido = (c) => /^\d{14}$/.test(c || '')

      /** CNPJ da matriz (0001) com dígitos verificadores. */
      function cnpjMatriz(cnpj) {
        const base = cnpj.slice(0, 8) + '0001'
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
        const d1 = dv(base)
        const d2 = dv(base + d1)
        return base + d1 + d2
      }

      /** Consulta pública e gratuita do IBGE (nome do município, descrição do CNAE). */
      function ibge(caminho) {
        try {
          const res = $http.send({
            url: 'https://servicodados.ibge.gov.br/api' + caminho,
            method: 'GET',
            timeout: 10,
          })
          return res.statusCode === 200 ? res.json : null
        } catch (err) {
          return null
        }
      }

      // ------------------------------------------------------------------ e-mail (SMTP configurado no PocketBase)
      function emailConfigurado() {
        const s = $app.settings()
        return !!(s.smtp && s.smtp.enabled && s.smtp.host)
      }

      /** Registra o envio no histórico (coleção pt_envios). */
      function registrarEnvio(dest, email, relatorio, assunto, status, detalhe) {
        const r = new Record($app.findCollectionByNameOrId('pt_envios'))
        r.set('destinatario', dest || '')
        r.set('email', email || '')
        r.set('relatorio', relatorio || '')
        r.set('assunto', assunto || '')
        r.set('status', status)
        r.set('detalhe', String(detalhe || '').slice(0, 1900))
        $app.save(r)
      }

      /** Envia um e-mail e registra. Devolve true/false. */
      function enviarEmail(dest, email, relatorio, assunto, html, statusOk) {
        if (!emailConfigurado()) {
          registrarEnvio(
            dest,
            email,
            relatorio,
            assunto,
            'falhou',
            'Serviço de e-mail (SMTP) não configurado no servidor.',
          )
          return false
        }
        try {
          const meta = $app.settings().meta
          const msg = new MailerMessage({
            from: { address: meta.senderAddress, name: meta.senderName || 'C CONT Planejamento' },
            to: [{ address: email, name: dest }],
            subject: assunto,
            html: html,
          })
          $app.newMailClient().send(msg)
          registrarEnvio(dest, email, relatorio, assunto, statusOk || 'enviado', '')
          return true
        } catch (err) {
          registrarEnvio(
            dest,
            email,
            relatorio,
            assunto,
            'falhou',
            err && err.message ? err.message : String(err),
          )
          return false
        }
      }

      /** Destinatários ativos com permissão para o tipo de relatório. */
      function destinatarios(tipo) {
        const lista = $app.findRecordsByFilter(
          'pt_destinatarios',
          "ativo = true && email != ''",
          'grupo',
          0,
          0,
        )
        const saida = []
        for (const r of lista) {
          let rel = []
          try {
            rel = JSON.parse(r.getString('relatorios') || '[]')
          } catch (err) {
            rel = []
          }
          if (rel.indexOf(tipo) >= 0)
            saida.push({
              nome: r.getString('nome'),
              email: r.getString('email'),
              grupo: r.getString('grupo'),
              periodicidade: r.getString('periodicidade'),
            })
        }
        return saida
      }

      const esc = (s) =>
        String(s == null ? '' : s)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')

      /** Moldura padrão dos e-mails. */
      function moldura(titulo, corpoHtml) {
        return (
          '<div style="font-family:Arial,sans-serif;color:#132420;max-width:680px">' +
          '<div style="background:#141726;color:#fff;padding:12px 16px;border-radius:8px;border-bottom:4px solid #0e6b63"><b>C CONT · Planejamento Tributário</b></div>' +
          '<h2 style="color:#0b4f4a">' +
          esc(titulo) +
          '</h2>' +
          corpoHtml +
          '<p style="font-size:11px;color:#6b7a76;margin-top:20px">C Consulting Group — Resultados importam! Mensagem automática do sistema de planejamento tributário.</p></div>'
        )
      }

      /** Relatório mensal da inteligência adaptativa montado no servidor (para o envio automático). */
      function relatorioInteligencia(mes) {
        const lista = $app.findRecordsByFilter('pt_inteligencia', 'mes = {:mes}', 'created', 0, 0, {
          mes: mes,
        })
        let html = ''
        if (!lista.length)
          html = '<p><b>Não foram encontradas novidades relevantes neste mês.</b></p>'
        for (const r of lista) {
          let d = {}
          try {
            d = JSON.parse(r.getString('dados') || '{}')
          } catch (err) {
            d = {}
          }
          const ap = d.aprovacoes || {}
          html +=
            '<h3 style="margin-bottom:4px">' +
            esc(r.getString('nome')) +
            "</h3><table style='font-size:13px;border-collapse:collapse'>" +
            [
              ['O que há de novo', d.novidade],
              ['Fonte e fundamento', d.fonte],
              ['Beneficiados', d.beneficiados],
              ['Exemplo de cálculo', d.exemploCalculo],
              ['Grau de risco', d.risco],
              ['Alterações na IA', d.alteracoesIA],
              ['Recomendação', d.recomendacao],
              [
                'Aprovações',
                'Controladoria: ' +
                  (ap.controladoria || 'pendente') +
                  ' · Jurídico: ' +
                  (ap.juridico || 'pendente') +
                  ' · Desenvolvimento: ' +
                  (ap.desenvolvimento || 'pendente'),
              ],
              ['Situação', r.getString('situacao')],
            ]
              .map(
                (l) =>
                  "<tr><td style='padding:3px 8px;font-weight:bold;vertical-align:top'>" +
                  esc(l[0]) +
                  "</td><td style='padding:3px 8px'>" +
                  esc(l[1]) +
                  '</td></tr>',
              )
              .join('') +
            '</table>'
        }
        return html
      }

      // ------------------------------------------------------------------ declarações anuais (ECD/ECF), igual ao painel do servidor
      // Declarações anuais da empresa no servidor (ECD e ECF): o que existe por ano, para baixar, e o que a ECF informa
      // (forma de tributação, IRPJ/CSLL a pagar por período, saldo negativo e retenções sofridas do Y570).
      // Mesma lógica de pocketbase/hooks/api_declaracoes.js do Skip. Saldo negativo é só "CRÉDITO POTENCIAL".

      /** api(caminho) = GET na API ReceitanetBX devolvendo o JSON. */
      function declaracoes(api, cnpj) {
        // Valor do SPED ("1234,56") em número.
        const num = (v) => {
          const s = String(v == null ? '' : v).trim()
          if (!s) return null
          const n = parseFloat(s.replace(/\./g, '').replace(',', '.'))
          return isNaN(n) ? null : n
        }
        const linhas = (id, reg) =>
          api('/v1/sped/arquivos/' + id + '/registros/' + reg + '?limite=10000').linhas || []
        // Última transmissão por ano (o nome traz _AAAAMMDDhhmmss_; sem ele, o maior id).
        const transmissao = (nome) => (/_(\d{14})_/.exec(nome || '') || [])[1] || ''
        const porAno = (lista) => {
          const r = {}
          for (const a of lista) {
            const ano = String(a.dt_ini).slice(0, 4)
            const atual = r[ano]
            const chaveA = transmissao(a.nome) + String(a.id).padStart(12, '0')
            if (!atual || chaveA > transmissao(atual.nome) + String(atual.id).padStart(12, '0'))
              r[ano] = a
          }
          return r
        }
        const FORMA_TRIB = {
          1: 'Lucro Real',
          2: 'Lucro Real/Arbitrado',
          3: 'Lucro Presumido/Real',
          4: 'Lucro Presumido/Real/Arbitrado',
          5: 'Lucro Presumido',
          6: 'Lucro Arbitrado',
          7: 'Lucro Presumido/Arbitrado',
          8: 'Imune do IRPJ',
          9: 'Isenta do IRPJ',
        }

        /** IRPJ/CSLL "a pagar" por período (N030/P030 → N630/N670/P300/P400) e saldo negativo. */
        const apuracao = (id, regPeriodo, regIrpj, codIrpj, regCsll, codCsll) => {
          const periodos = linhas(id, regPeriodo).map((l) => ({
            linha: l.linha,
            per: l.campos[3] || '',
          }))
          const periodoDe = (linha) => {
            let p = ''
            for (const x of periodos) if (x.linha < linha) p = x.per
            return p
          }
          const saida = {}
          const ler = (reg, codigo, campo) => {
            const todas = linhas(id, reg)
            // Linha "a pagar": pelo código do leiaute; se não houver, a última cuja descrição diz "A PAGAR".
            let alvo = todas.filter((l) => String(l.campos[1]) === codigo)
            if (!alvo.length) {
              const porPeriodo = {}
              for (const l of todas)
                if (/A PAGAR|A RECOLHER/i.test(l.campos[2] || ''))
                  porPeriodo[periodoDe(l.linha)] = l
              alvo = Object.keys(porPeriodo).map((k) => porPeriodo[k])
            }
            for (const l of alvo) {
              const per = periodoDe(l.linha) || 'A00'
              const v = num(l.campos[3])
              if (v == null) continue
              const x = saida[per] || (saida[per] = { periodo: per, irpj: null, csll: null })
              x[campo] = v
            }
          }
          ler(regIrpj, codIrpj, 'irpj')
          ler(regCsll, codCsll, 'csll')
          return Object.keys(saida)
            .sort()
            .map((k) => saida[k])
        }

        const ecds = porAno(
          api('/v1/sped/arquivos?cnpj=' + cnpj + '&tipo=ECD&limite=100').arquivos || [],
        )
        const ecfs = porAno(
          api('/v1/sped/arquivos?cnpj=' + cnpj + '&tipo=ECF&limite=100').arquivos || [],
        )
        const anos = {}
        const hoje = new Date()
        for (let a = hoje.getFullYear() - 5; a < hoje.getFullYear(); a++) anos[String(a)] = true
        for (const a of Object.keys(ecds).concat(Object.keys(ecfs))) anos[a] = true
        const arquivo = (a) =>
          a
            ? { id: a.id, nome: a.nome, de: a.dt_ini, ate: a.dt_fin, importadoEm: a.importado_em }
            : null

        const lista = Object.keys(anos)
          .sort()
          .reverse()
          .map((ano) => {
            const ecf = ecfs[ano]
            let info = null
            if (ecf) {
              try {
                const r0010 = (linhas(ecf.id, '0010')[0] || {}).campos || []
                // Campos localizados pelo formato (as versões do leiaute mudam a posição).
                let iTrib = -1
                for (let i = 3; i < r0010.length; i++)
                  if (/^[1-9]$/.test(r0010[i] || '')) {
                    iTrib = i
                    break
                  }
                const formaTrib = iTrib >= 0 ? r0010[iTrib] : null
                let formaApur = null
                for (let i = iTrib + 1; iTrib >= 0 && i < r0010.length; i++)
                  if (r0010[i] === 'A' || r0010[i] === 'T') {
                    formaApur = r0010[i] === 'A' ? 'anual (estimativas mensais)' : 'trimestral'
                    break
                  }
                const presumido = formaTrib === '5' || formaTrib === '7'
                const periodos = presumido
                  ? apuracao(ecf.id, 'P030', 'P300', '15', 'P400', '')
                  : apuracao(ecf.id, 'N030', 'N630', '26', 'N670', '21')
                let retIr = 0
                let retCsll = 0
                const fontes = {}
                for (const l of linhas(ecf.id, 'Y570')) {
                  retIr += num(l.campos[6]) || 0
                  retCsll += num(l.campos[7]) || 0
                  if (l.campos[1]) fontes[l.campos[1]] = true
                }
                const negIrpj = periodos.reduce(
                  (s, p) => s + (p.irpj != null && p.irpj < 0 ? -p.irpj : 0),
                  0,
                )
                const negCsll = periodos.reduce(
                  (s, p) => s + (p.csll != null && p.csll < 0 ? -p.csll : 0),
                  0,
                )
                info = {
                  formaTributacao: formaTrib ? FORMA_TRIB[formaTrib] || formaTrib : null,
                  formaApuracao: presumido ? 'trimestral' : formaApur,
                  periodos: periodos,
                  saldoNegativo: {
                    irpj: Math.round(negIrpj * 100) / 100,
                    csll: Math.round(negCsll * 100) / 100,
                    status: negIrpj + negCsll > 0 ? 'CRÉDITO POTENCIAL' : null,
                  },
                  retencoes: {
                    ir: Math.round(retIr * 100) / 100,
                    csll: Math.round(retCsll * 100) / 100,
                    fontes: Object.keys(fontes).length,
                  },
                }
              } catch (err) {
                info = { erro: err.message || String(err) }
              }
            }
            return { ano: ano, ecd: arquivo(ecds[ano]), ecf: arquivo(ecf), ecfInfo: info }
          })
        return { cnpj: cnpj, anos: lista }
      }

      // ------------------------------------------------------------------ situação atual e perfil a partir do SPED
      // Leitura do SPED já importado na API ReceitanetBX para montar a situação tributária atual (somente leitura).
      // Posições: campos[0] = REG; campos[n] = campo n+1 do leiaute; valores com vírgula decimal.
      //   M200/M600 idx2 = VL_TOT_CRED_DESC, idx12 = VL_TOT_CONT_REC   M210 idx2 = VL_REC_BRT
      //   E110 idx12 = VL_ICMS_RECOLHER                               E520 idx7 = VL_SD_IPI
      //   Perfil: EFD-Contrib 0000 UF idx9, COD_MUN idx10, IND_ATIV idx13 · 0140 estabelecimentos · M105 idx6 VL_BC_PIS (base de crédito)
      //   M400 idx1 CST (04 = monofásico) · EFD ICMS 0000 UF idx8, COD_MUN idx10, IND_ATIV idx14 · C190 CST idx1, CFOP idx2, ALIQ idx3, VL_OPR idx4, VL_BC idx5
      //   ECF 0030 CNAE idx2, UF idx7, COD_MUN idx8 · N630 código 1 (base de cálculo do IRPJ) idx3 · M010/M500 parte B (prejuízo fiscal)

      function situacaoAtual(api, cnpj, matriz, declaracoes) {
        const num = (v) => {
          const s = String(v == null ? '' : v).trim()
          if (!s) return 0
          const n = parseFloat(s.replace(/\./g, '').replace(',', '.'))
          return isNaN(n) ? 0 : n
        }
        const r2 = (v) => Math.round(v * 100) / 100
        const linhas = (id, reg) =>
          api('/v1/sped/arquivos/' + id + '/registros/' + reg + '?limite=10000').linhas || []
        const transmissao = (nome) => (/_(\d{14})_/.exec(nome || '') || [])[1] || ''
        /** Última transmissão de cada mês, os 12 meses mais recentes. */
        const ultimos12 = (lista) => {
          const porMes = {}
          for (const a of lista) {
            const mes = String(a.dt_ini).slice(0, 7)
            const atual = porMes[mes]
            const k = transmissao(a.nome) + String(a.id).padStart(12, '0')
            if (!atual || k > transmissao(atual.nome) + String(atual.id).padStart(12, '0'))
              porMes[mes] = a
          }
          return Object.keys(porMes)
            .sort()
            .reverse()
            .slice(0, 12)
            .map((m) => porMes[m])
        }
        const listar = (doc, tipo) =>
          api('/v1/sped/arquivos?cnpj=' + doc + '&tipo=' + tipo + '&limite=200').arquivos || []
        const avisos = []
        const linhas1 = (id, reg) =>
          api('/v1/sped/arquivos/' + id + '/registros/' + reg + '?limite=1').linhas || []
        const perfil = { setores: {}, operacoes: {}, fontes: {} }
        const marca = (campo, valor, fonte) => {
          if (valor == null || valor === '' || perfil[campo] != null) return
          perfil[campo] = valor
          perfil.fontes[campo] = fonte
        }
        const marcaG = (g, campo, valor, fonte) => {
          if (valor == null || perfil[g][campo] != null) return
          perfil[g][campo] = valor
          perfil.fontes[g + '.' + campo] = fonte
        }

        // EFD-Contribuições (centralizada na matriz)
        let contrib = null
        let arqC = listar(cnpj, 'EFD-CONTRIBUICOES')
        if (!arqC.length && matriz !== cnpj) {
          arqC = listar(matriz, 'EFD-CONTRIBUICOES')
          if (arqC.length)
            avisos.push(
              'EFD-Contribuições lida da matriz (' + matriz + '): valores do CNPJ inteiro.',
            )
        }
        const mesesC = ultimos12(arqC)
        if (mesesC.length) {
          const t = {
            receitaBruta: 0,
            pis: 0,
            cofins: 0,
            creditosPis: 0,
            creditosCofins: 0,
            regime: null,
          }
          for (const a of mesesC) {
            for (const l of linhas(a.id, 'M200')) {
              t.pis += num(l.campos[12])
              t.creditosPis += num(l.campos[2])
            }
            for (const l of linhas(a.id, 'M600')) {
              t.cofins += num(l.campos[12])
              t.creditosCofins += num(l.campos[2])
            }
            for (const l of linhas(a.id, 'M210')) t.receitaBruta += num(l.campos[2])
            if (!t.regime) {
              const r = linhas(a.id, '0110')[0]
              if (r)
                t.regime =
                  r.campos[1] === '1'
                    ? 'não cumulativo'
                    : r.campos[1] === '2'
                      ? 'cumulativo'
                      : 'misto'
            }
            for (const l of linhas(a.id, 'M105'))
              t.basesCredito = (t.basesCredito || 0) + num(l.campos[6])
            if (!t.mono)
              for (const l of linhas(a.id, 'M400')) if (l.campos[1] === '04') t.mono = true
            // A100 IND_OPER 1 = serviço prestado; COD_SIT idx4 (02-05 = cancelada/denegada/inutilizada); VL_DOC idx11, VL_DESC idx13, VL_ISS idx20
            for (const l of linhas(a.id, 'A100')) {
              if (l.campos[1] !== '1' || ['02', '03', '04', '05'].indexOf(String(l.campos[4])) >= 0)
                continue
              t.servicos = true
              t.recServ = (t.recServ || 0) + num(l.campos[11]) - num(l.campos[13])
              t.iss = (t.iss || 0) + num(l.campos[20])
            }
          }
          const ult = mesesC[0]
          const r0 = (linhas1(ult.id, '0000')[0] || {}).campos || []
          const fC = 'EFD-Contribuições ' + String(ult.dt_ini).slice(0, 7)
          if (/^[A-Z]{2}$/.test(r0[9] || '')) marca('uf', r0[9], fC)
          if (/^\d{7}$/.test(r0[10] || '')) marca('codMun', r0[10], fC)
          const ativ = { 0: 'industria', 2: 'comercio', 1: 'servicos', 4: 'imobiliario' }[r0[13]]
          if (ativ) marcaG('setores', ativ, true, fC + ' (0000, indicador de atividade)')
          const estab = linhas(ult.id, '0140').length
          if (estab)
            marcaG(
              'operacoes',
              'filiais',
              estab > 1,
              fC + ' (0140: ' + estab + ' estabelecimento(s))',
            )
          if (t.basesCredito)
            marca(
              'comprasCreditaveis',
              r2((t.basesCredito * 12) / mesesC.length),
              'EFD-Contribuições M105 (bases de crédito, anualizado)',
            )
          if (t.mono) marcaG('operacoes', 'monofasicos', true, 'EFD-Contribuições M400 CST 04')
          if (t.servicos)
            marcaG(
              'setores',
              'servicos',
              true,
              'EFD-Contribuições A100 (notas de serviço emitidas)',
            )
          if (t.recServ > 0)
            marca(
              'receitaServicos',
              r2((t.recServ * 12) / mesesC.length),
              'EFD-Contribuições A100: notas de serviço emitidas (valor − desconto), anualizado',
            )
          if (t.recServ > 0 && t.iss > 0) {
            marca(
              'aliquotaIss',
              Math.round((t.iss / t.recServ) * 10000) / 100,
              'EFD-Contribuições A100: ISS das notas de serviço emitidas ÷ valor dos serviços (alíquota efetiva praticada)',
            )
            marcaG(
              'operacoes',
              'contribuinteIss',
              true,
              'EFD-Contribuições A100 (ISS nas notas emitidas)',
            )
          }
          if (t.receitaBruta)
            marca(
              'receitaAnual',
              r2((t.receitaBruta * 12) / mesesC.length),
              'EFD-Contribuições M210 (receita bruta, anualizada)',
            )
          const datas = mesesC.map((a) => String(a.dt_ini).slice(0, 10)).sort()
          contrib = {
            de: datas[0],
            ate: datas[datas.length - 1],
            meses: mesesC.length,
            receitaBruta: r2(t.receitaBruta),
            pis: r2(t.pis),
            cofins: r2(t.cofins),
            creditosPis: r2(t.creditosPis),
            creditosCofins: r2(t.creditosCofins),
            regime: t.regime,
            iss: r2(t.iss || 0),
          }
          if (mesesC.length < 12)
            avisos.push(
              'EFD-Contribuições com ' +
                mesesC.length +
                ' meses: PIS/COFINS somam só esse período (anualize se for o caso).',
            )
          if (!t.receitaBruta)
            avisos.push('Sem M210 com receita bruta: informe a receita anual no perfil.')
        }

        // EFD ICMS/IPI (por estabelecimento)
        let icms = null
        const mesesI = ultimos12(listar(cnpj, 'EFD-ICMS-IPI'))
        if (mesesI.length) {
          let vIcms = 0,
            vIpi = 0
          const cf = {
            saidas: 0,
            ind: 0,
            com: 0,
            inter: false,
            exp: false,
            imp: false,
            st: false,
            aliqBc: 0,
            bc: 0,
          }
          for (const a of mesesI) {
            for (const l of linhas(a.id, 'E110')) vIcms += num(l.campos[12])
            for (const l of linhas(a.id, 'E520')) vIpi += num(l.campos[7])
            for (const l of linhas(a.id, 'C190')) {
              const cst = String(l.campos[1] || ''),
                cfop = String(l.campos[2] || ''),
                aliq = num(l.campos[3]),
                opr = num(l.campos[4]),
                bc = num(l.campos[5])
              const d = cfop[0]
              if (!/^[1-7]\d{3}$/.test(cfop)) continue
              if ('567'.indexOf(d) >= 0) cf.saidas += opr
              if (d === '6' || d === '2') cf.inter = true
              if (d === '7') cf.exp = true
              if (d === '3') cf.imp = true
              const fim = cfop.slice(1)
              if (
                [
                  '101',
                  '103',
                  '105',
                  '109',
                  '111',
                  '113',
                  '116',
                  '118',
                  '122',
                  '124',
                  '125',
                  '401',
                  '402',
                ].indexOf(fim) >= 0
              )
                cf.ind += opr
              if (
                [
                  '102',
                  '104',
                  '106',
                  '108',
                  '110',
                  '112',
                  '114',
                  '115',
                  '117',
                  '119',
                  '120',
                  '123',
                  '403',
                  '404',
                  '405',
                ].indexOf(fim) >= 0 &&
                '56'.indexOf(d) >= 0
              )
                cf.com += opr
              if (/(10|30|60|70)$/.test(cst)) cf.st = true
              if (d === '5' && aliq > 0 && bc > 0) {
                cf.aliqBc += aliq * bc
                cf.bc += bc
              }
            }
          }
          const fI =
            'EFD ICMS/IPI ' +
            String(mesesI[mesesI.length - 1].dt_ini).slice(0, 7) +
            ' a ' +
            String(mesesI[0].dt_ini).slice(0, 7) +
            ' (C190)'
          marcaG('operacoes', 'contribuinteIcms', true, 'EFD ICMS/IPI entregue')
          if (cf.ind) marcaG('setores', 'industria', true, fI + ': CFOP de produção própria')
          if (cf.com) marcaG('setores', 'comercio', true, fI + ': CFOP de revenda')
          marcaG('operacoes', 'interestadual', cf.inter, fI)
          marcaG('operacoes', 'exporta', cf.exp, fI)
          marcaG('operacoes', 'importa', cf.imp, fI)
          marcaG('operacoes', 'substituicaoTributaria', cf.st, fI + ' (CST 10/30/60/70)')
          if (cf.bc)
            marca(
              'aliquotaIcms',
              Math.round((cf.aliqBc / cf.bc) * 100) / 100,
              fI + ': alíquota média ponderada das saídas internas (pode refletir redução de base)',
            )
          if (cf.saidas)
            marca(
              'receitaAnual',
              r2((cf.saidas * 12) / mesesI.length),
              fI + ': saídas, anualizadas',
            )
          const i0 = (linhas1(mesesI[0].id, '0000')[0] || {}).campos || []
          if (/^[A-Z]{2}$/.test(i0[8] || '')) marca('uf', i0[8], 'EFD ICMS/IPI 0000')
          if (/^\d{7}$/.test(i0[10] || '')) marca('codMun', i0[10], 'EFD ICMS/IPI 0000')
          if (i0[14] === '0')
            marcaG(
              'operacoes',
              'contribuinteIpi',
              true,
              'EFD ICMS/IPI 0000 (industrial ou equiparado)',
            )
          if (vIpi > 0)
            marcaG('operacoes', 'contribuinteIpi', true, 'EFD ICMS/IPI E520 (IPI a recolher)')
          const datas = mesesI.map((a) => String(a.dt_ini).slice(0, 10)).sort()
          icms = {
            de: datas[0],
            ate: datas[datas.length - 1],
            meses: mesesI.length,
            icms: r2(vIcms),
            ipi: r2(vIpi),
            estabelecimentos: 1,
          }
          avisos.push(
            'ICMS/IPI apenas deste estabelecimento; ICMS-ST (E210) e DIFAL não incluídos.',
          )
          if (mesesI.length < 12) avisos.push('EFD ICMS/IPI com ' + mesesI.length + ' meses.')
        }

        // ECF mais recente (forma de tributação e IRPJ/CSLL a pagar)
        let ecf = null
        try {
          const decl = declaracoes(api, cnpj)
          const ultimo = (decl.anos || []).find((a) => a.ecf && a.ecfInfo && !a.ecfInfo.erro)
          if (ultimo) {
            const info = ultimo.ecfInfo
            let irpj = 0,
              csll = 0,
              temIr = false,
              temCs = false
            for (const p of info.periodos || []) {
              if (p.irpj != null && p.irpj > 0) {
                irpj += p.irpj
                temIr = true
              }
              if (p.csll != null && p.csll > 0) {
                csll += p.csll
                temCs = true
              }
            }
            ecf = {
              ano: ultimo.ano,
              formaTributacao: info.formaTributacao,
              formaApuracao: info.formaApuracao,
              irpj: temIr ? r2(irpj) : null,
              csll: temCs ? r2(csll) : null,
              arquivo: ultimo.ecf.nome || String(ultimo.ecf.id),
            }
            if (
              /Real/.test(info.formaTributacao || '') &&
              info.formaApuracao &&
              /anual/.test(info.formaApuracao)
            )
              avisos.push(
                'Lucro Real anual: o valor "a pagar" da ECF já desconta as estimativas mensais pagas. Confira o IRPJ/CSLL devido total (N630/N670) antes de usar.',
              )
            if (/Presumido/.test(info.formaTributacao || '') && !temCs)
              avisos.push(
                'ECF do Presumido sem linha de CSLL a pagar identificada: informe a CSLL manualmente.',
              )
            const fE = 'ECF ' + ultimo.ano
            const id = ultimo.ecf.id
            const c30 = (linhas1(id, '0030')[0] || {}).campos || []
            if (/^\d{7}$/.test(c30[2] || '')) marca('cnae', c30[2], fE + ' (0030)')
            if (/^[A-Z]{2}$/.test(c30[7] || '')) marca('uf', c30[7], fE + ' (0030)')
            if (/^\d{7}$/.test(c30[8] || '')) marca('codMun', c30[8], fE + ' (0030)')
            const f = info.formaTributacao || ''
            const reg =
              /Real/.test(f) && !/Presumido/.test(f)
                ? info.formaApuracao === 'trimestral'
                  ? 'real-trimestral'
                  : 'real-anual'
                : /Presumido/.test(f)
                  ? 'presumido'
                  : /Arbitrado/.test(f)
                    ? 'arbitrado'
                    : /Imune|Isenta/.test(f)
                      ? 'imune'
                      : null
            marca('regime', reg, fE + ' (0010: ' + f + ')')
            if (reg && reg.indexOf('real') === 0) {
              let base = 0,
                achou = false
              for (const l of linhas(id, 'N630'))
                if (String(l.campos[1]) === '1' && /BASE DE C.LCULO/i.test(l.campos[2] || '')) {
                  base += num(l.campos[3])
                  achou = true
                }
              if (achou)
                marca(
                  'lucroContabil',
                  r2(base),
                  fE +
                    ' (N630: base de cálculo do IRPJ somada nos períodos — lucro real após adições/exclusões; negativo = prejuízo)',
                )
              const contas = {}
              for (const l of linhas(id, 'M010'))
                if (
                  l.campos[6] === 'I' &&
                  (/PREJU/i.test(l.campos[2] || '') || /^1\.00[01]$/.test(l.campos[4] || ''))
                )
                  contas[l.campos[1]] = true
              const saldo = {}
              for (const l of linhas(id, 'M500'))
                if (contas[l.campos[1]] && l.campos[2] === 'I')
                  saldo[l.campos[1]] = (l.campos[10] === 'D' ? 1 : -1) * num(l.campos[9])
              const prej = Object.keys(saldo).reduce((a, k) => a + Math.max(saldo[k], 0), 0)
              if (prej > 0)
                marca(
                  'prejuizoFiscal',
                  r2(prej),
                  fE +
                    ' (e-Lalur parte B, M010/M500: saldo final de prejuízo fiscal do IRPJ — conferir)',
                )
            }
          }
        } catch (e) {
          avisos.push('ECF: ' + (e && e.message ? e.message : String(e)))
        }
        if (!ecf && !contrib && !icms)
          avisos.push(
            'Nenhum SPED desta empresa no servidor. Peça os arquivos pelo painel de créditos (Pedir à Receita) ou informe os valores manualmente.',
          )
        return { ecf, contrib, icms, perfil, avisos }
      }
      return {
        rbxConfigurado,
        empresasLocais,
        rbx,
        falhar,
        equipe,
        cnpjValido,
        cnpjMatriz,
        ibge,
        emailConfigurado,
        enviarEmail,
        registrarEnvio,
        destinatarios,
        esc,
        moldura,
        relatorioInteligencia,
        SITE,
        declaracoes,
        situacaoAtual,
      }
    })()
    if (!u.equipe(e)) return e.json(403, { erro: 'Acesso restrito à equipe técnica.' })
    // Empresas deste sistema (planilha importada) + as que já têm SPED no servidor (API ReceitanetBX, se configurada).
    const mapa = {}
    for (const x of u.empresasLocais()) if (x.situacao !== 'inativa') mapa[x.cnpj] = x
    if (u.rbxConfigurado()) {
      try {
        for (const x of u.rbx('GET', '/v1/empresas') || []) {
          if (x.situacao === 'inativa' || mapa[x.cnpj]) continue
          mapa[x.cnpj] = {
            cnpj: x.cnpj,
            nome: x.nome || x.empresa || null,
            observacao: x.observacao || null,
            situacao: x.situacao,
          }
        }
      } catch (err) {
        // sem a API, fica só a lista local
      }
    }
    const lista = Object.keys(mapa).map((k) => mapa[k])
    lista.sort((a, b) => String(a.nome || a.cnpj).localeCompare(String(b.nome || b.cnpj)))
    return e.json(200, lista)
  },
  $apis.requireAuth(),
)

routerAdd(
  'GET',
  '/backend/v1/pt/dados/{cnpj}',
  (e) => {
    const u = (function () {
      // Biblioteca do Planejamento Tributário para os hooks do Skip (PocketBase 0.36).
      // Não é carregada por require em produção: pocketbase/fonte/gerar-hooks.mjs cola este arquivo dentro de cada rota de
      // api_planejamento.js. Junta: acesso à API ReceitanetBX (só leitura do SPED já importado), e-mail, declarações (ECD/ECF)
      // e a leitura da situação atual/perfil a partir do SPED. Chaves só nos secrets do Skip, nunca no navegador.

      const RBX_URL = () =>
        ($secrets.get('RECEITANETBX_URL') || 'http://127.0.0.1:8000').replace(/\/$/, '')
      const RBX_CHAVE = () => $secrets.get('RECEITANETBX_API_KEY') || ''
      /** Endereço do Skip para os links dos e-mails (secret opcional SITE_URL). */
      const SITE = () => ($secrets.get('SITE_URL') || '').replace(/\/$/, '')

      class ErroApi extends Error {
        constructor(status, mensagem) {
          super(mensagem)
          this.status = status
        }
      }

      /** GET/POST na API ReceitanetBX (somente leitura do SPED já importado; não liga o ReceitanetBX). */
      function rbx(metodo, caminho, corpo, timeout) {
        const res = $http.send({
          url: RBX_URL() + caminho,
          method: metodo,
          headers: {
            'X-API-Key': RBX_CHAVE(),
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: corpo === undefined ? '' : JSON.stringify(corpo),
          timeout: timeout || 120,
        })
        if (res.statusCode >= 400) {
          const j = res.json
          throw new ErroApi(
            res.statusCode,
            (j && typeof j.detail === 'string' && j.detail) ||
              (res.raw || '').slice(0, 300) ||
              'HTTP ' + res.statusCode,
          )
        }
        return res.json
      }

      function falhar(e, err) {
        return e.json(err && err.status ? err.status : 502, {
          erro: err && err.message ? err.message : String(err),
        })
      }

      /** Usuário logado. Onde a tabela de usuários tiver perfis (role), só Dev e Tributarista. */
      function equipe(e) {
        if (!e.auth) return false
        const papel = e.auth.getString('role')
        return !papel || papel === 'dev' || papel === 'tributarista'
      }

      /** A leitura do SPED depende dos secrets da API ReceitanetBX. */
      function rbxConfigurado() {
        return !!$secrets.get('RECEITANETBX_URL') && !!$secrets.get('RECEITANETBX_API_KEY')
      }

      /** Empresas cadastradas neste sistema (coleção empresas, importada da planilha). */
      function empresasLocais() {
        try {
          return $app.findRecordsByFilter('empresas', "cnpj != ''", 'nome', 0, 0).map((r) => ({
            cnpj: r.getString('cnpj'),
            nome: r.getString('nome') || null,
            observacao: r.getString('observacao') || null,
            situacao: r.getString('situacao') || null,
          }))
        } catch (err) {
          return []
        }
      }

      const cnpjValido = (c) => /^\d{14}$/.test(c || '')

      /** CNPJ da matriz (0001) com dígitos verificadores. */
      function cnpjMatriz(cnpj) {
        const base = cnpj.slice(0, 8) + '0001'
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
        const d1 = dv(base)
        const d2 = dv(base + d1)
        return base + d1 + d2
      }

      /** Consulta pública e gratuita do IBGE (nome do município, descrição do CNAE). */
      function ibge(caminho) {
        try {
          const res = $http.send({
            url: 'https://servicodados.ibge.gov.br/api' + caminho,
            method: 'GET',
            timeout: 10,
          })
          return res.statusCode === 200 ? res.json : null
        } catch (err) {
          return null
        }
      }

      // ------------------------------------------------------------------ e-mail (SMTP configurado no PocketBase)
      function emailConfigurado() {
        const s = $app.settings()
        return !!(s.smtp && s.smtp.enabled && s.smtp.host)
      }

      /** Registra o envio no histórico (coleção pt_envios). */
      function registrarEnvio(dest, email, relatorio, assunto, status, detalhe) {
        const r = new Record($app.findCollectionByNameOrId('pt_envios'))
        r.set('destinatario', dest || '')
        r.set('email', email || '')
        r.set('relatorio', relatorio || '')
        r.set('assunto', assunto || '')
        r.set('status', status)
        r.set('detalhe', String(detalhe || '').slice(0, 1900))
        $app.save(r)
      }

      /** Envia um e-mail e registra. Devolve true/false. */
      function enviarEmail(dest, email, relatorio, assunto, html, statusOk) {
        if (!emailConfigurado()) {
          registrarEnvio(
            dest,
            email,
            relatorio,
            assunto,
            'falhou',
            'Serviço de e-mail (SMTP) não configurado no servidor.',
          )
          return false
        }
        try {
          const meta = $app.settings().meta
          const msg = new MailerMessage({
            from: { address: meta.senderAddress, name: meta.senderName || 'C CONT Planejamento' },
            to: [{ address: email, name: dest }],
            subject: assunto,
            html: html,
          })
          $app.newMailClient().send(msg)
          registrarEnvio(dest, email, relatorio, assunto, statusOk || 'enviado', '')
          return true
        } catch (err) {
          registrarEnvio(
            dest,
            email,
            relatorio,
            assunto,
            'falhou',
            err && err.message ? err.message : String(err),
          )
          return false
        }
      }

      /** Destinatários ativos com permissão para o tipo de relatório. */
      function destinatarios(tipo) {
        const lista = $app.findRecordsByFilter(
          'pt_destinatarios',
          "ativo = true && email != ''",
          'grupo',
          0,
          0,
        )
        const saida = []
        for (const r of lista) {
          let rel = []
          try {
            rel = JSON.parse(r.getString('relatorios') || '[]')
          } catch (err) {
            rel = []
          }
          if (rel.indexOf(tipo) >= 0)
            saida.push({
              nome: r.getString('nome'),
              email: r.getString('email'),
              grupo: r.getString('grupo'),
              periodicidade: r.getString('periodicidade'),
            })
        }
        return saida
      }

      const esc = (s) =>
        String(s == null ? '' : s)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')

      /** Moldura padrão dos e-mails. */
      function moldura(titulo, corpoHtml) {
        return (
          '<div style="font-family:Arial,sans-serif;color:#132420;max-width:680px">' +
          '<div style="background:#141726;color:#fff;padding:12px 16px;border-radius:8px;border-bottom:4px solid #0e6b63"><b>C CONT · Planejamento Tributário</b></div>' +
          '<h2 style="color:#0b4f4a">' +
          esc(titulo) +
          '</h2>' +
          corpoHtml +
          '<p style="font-size:11px;color:#6b7a76;margin-top:20px">C Consulting Group — Resultados importam! Mensagem automática do sistema de planejamento tributário.</p></div>'
        )
      }

      /** Relatório mensal da inteligência adaptativa montado no servidor (para o envio automático). */
      function relatorioInteligencia(mes) {
        const lista = $app.findRecordsByFilter('pt_inteligencia', 'mes = {:mes}', 'created', 0, 0, {
          mes: mes,
        })
        let html = ''
        if (!lista.length)
          html = '<p><b>Não foram encontradas novidades relevantes neste mês.</b></p>'
        for (const r of lista) {
          let d = {}
          try {
            d = JSON.parse(r.getString('dados') || '{}')
          } catch (err) {
            d = {}
          }
          const ap = d.aprovacoes || {}
          html +=
            '<h3 style="margin-bottom:4px">' +
            esc(r.getString('nome')) +
            "</h3><table style='font-size:13px;border-collapse:collapse'>" +
            [
              ['O que há de novo', d.novidade],
              ['Fonte e fundamento', d.fonte],
              ['Beneficiados', d.beneficiados],
              ['Exemplo de cálculo', d.exemploCalculo],
              ['Grau de risco', d.risco],
              ['Alterações na IA', d.alteracoesIA],
              ['Recomendação', d.recomendacao],
              [
                'Aprovações',
                'Controladoria: ' +
                  (ap.controladoria || 'pendente') +
                  ' · Jurídico: ' +
                  (ap.juridico || 'pendente') +
                  ' · Desenvolvimento: ' +
                  (ap.desenvolvimento || 'pendente'),
              ],
              ['Situação', r.getString('situacao')],
            ]
              .map(
                (l) =>
                  "<tr><td style='padding:3px 8px;font-weight:bold;vertical-align:top'>" +
                  esc(l[0]) +
                  "</td><td style='padding:3px 8px'>" +
                  esc(l[1]) +
                  '</td></tr>',
              )
              .join('') +
            '</table>'
        }
        return html
      }

      // ------------------------------------------------------------------ declarações anuais (ECD/ECF), igual ao painel do servidor
      // Declarações anuais da empresa no servidor (ECD e ECF): o que existe por ano, para baixar, e o que a ECF informa
      // (forma de tributação, IRPJ/CSLL a pagar por período, saldo negativo e retenções sofridas do Y570).
      // Mesma lógica de pocketbase/hooks/api_declaracoes.js do Skip. Saldo negativo é só "CRÉDITO POTENCIAL".

      /** api(caminho) = GET na API ReceitanetBX devolvendo o JSON. */
      function declaracoes(api, cnpj) {
        // Valor do SPED ("1234,56") em número.
        const num = (v) => {
          const s = String(v == null ? '' : v).trim()
          if (!s) return null
          const n = parseFloat(s.replace(/\./g, '').replace(',', '.'))
          return isNaN(n) ? null : n
        }
        const linhas = (id, reg) =>
          api('/v1/sped/arquivos/' + id + '/registros/' + reg + '?limite=10000').linhas || []
        // Última transmissão por ano (o nome traz _AAAAMMDDhhmmss_; sem ele, o maior id).
        const transmissao = (nome) => (/_(\d{14})_/.exec(nome || '') || [])[1] || ''
        const porAno = (lista) => {
          const r = {}
          for (const a of lista) {
            const ano = String(a.dt_ini).slice(0, 4)
            const atual = r[ano]
            const chaveA = transmissao(a.nome) + String(a.id).padStart(12, '0')
            if (!atual || chaveA > transmissao(atual.nome) + String(atual.id).padStart(12, '0'))
              r[ano] = a
          }
          return r
        }
        const FORMA_TRIB = {
          1: 'Lucro Real',
          2: 'Lucro Real/Arbitrado',
          3: 'Lucro Presumido/Real',
          4: 'Lucro Presumido/Real/Arbitrado',
          5: 'Lucro Presumido',
          6: 'Lucro Arbitrado',
          7: 'Lucro Presumido/Arbitrado',
          8: 'Imune do IRPJ',
          9: 'Isenta do IRPJ',
        }

        /** IRPJ/CSLL "a pagar" por período (N030/P030 → N630/N670/P300/P400) e saldo negativo. */
        const apuracao = (id, regPeriodo, regIrpj, codIrpj, regCsll, codCsll) => {
          const periodos = linhas(id, regPeriodo).map((l) => ({
            linha: l.linha,
            per: l.campos[3] || '',
          }))
          const periodoDe = (linha) => {
            let p = ''
            for (const x of periodos) if (x.linha < linha) p = x.per
            return p
          }
          const saida = {}
          const ler = (reg, codigo, campo) => {
            const todas = linhas(id, reg)
            // Linha "a pagar": pelo código do leiaute; se não houver, a última cuja descrição diz "A PAGAR".
            let alvo = todas.filter((l) => String(l.campos[1]) === codigo)
            if (!alvo.length) {
              const porPeriodo = {}
              for (const l of todas)
                if (/A PAGAR|A RECOLHER/i.test(l.campos[2] || ''))
                  porPeriodo[periodoDe(l.linha)] = l
              alvo = Object.keys(porPeriodo).map((k) => porPeriodo[k])
            }
            for (const l of alvo) {
              const per = periodoDe(l.linha) || 'A00'
              const v = num(l.campos[3])
              if (v == null) continue
              const x = saida[per] || (saida[per] = { periodo: per, irpj: null, csll: null })
              x[campo] = v
            }
          }
          ler(regIrpj, codIrpj, 'irpj')
          ler(regCsll, codCsll, 'csll')
          return Object.keys(saida)
            .sort()
            .map((k) => saida[k])
        }

        const ecds = porAno(
          api('/v1/sped/arquivos?cnpj=' + cnpj + '&tipo=ECD&limite=100').arquivos || [],
        )
        const ecfs = porAno(
          api('/v1/sped/arquivos?cnpj=' + cnpj + '&tipo=ECF&limite=100').arquivos || [],
        )
        const anos = {}
        const hoje = new Date()
        for (let a = hoje.getFullYear() - 5; a < hoje.getFullYear(); a++) anos[String(a)] = true
        for (const a of Object.keys(ecds).concat(Object.keys(ecfs))) anos[a] = true
        const arquivo = (a) =>
          a
            ? { id: a.id, nome: a.nome, de: a.dt_ini, ate: a.dt_fin, importadoEm: a.importado_em }
            : null

        const lista = Object.keys(anos)
          .sort()
          .reverse()
          .map((ano) => {
            const ecf = ecfs[ano]
            let info = null
            if (ecf) {
              try {
                const r0010 = (linhas(ecf.id, '0010')[0] || {}).campos || []
                // Campos localizados pelo formato (as versões do leiaute mudam a posição).
                let iTrib = -1
                for (let i = 3; i < r0010.length; i++)
                  if (/^[1-9]$/.test(r0010[i] || '')) {
                    iTrib = i
                    break
                  }
                const formaTrib = iTrib >= 0 ? r0010[iTrib] : null
                let formaApur = null
                for (let i = iTrib + 1; iTrib >= 0 && i < r0010.length; i++)
                  if (r0010[i] === 'A' || r0010[i] === 'T') {
                    formaApur = r0010[i] === 'A' ? 'anual (estimativas mensais)' : 'trimestral'
                    break
                  }
                const presumido = formaTrib === '5' || formaTrib === '7'
                const periodos = presumido
                  ? apuracao(ecf.id, 'P030', 'P300', '15', 'P400', '')
                  : apuracao(ecf.id, 'N030', 'N630', '26', 'N670', '21')
                let retIr = 0
                let retCsll = 0
                const fontes = {}
                for (const l of linhas(ecf.id, 'Y570')) {
                  retIr += num(l.campos[6]) || 0
                  retCsll += num(l.campos[7]) || 0
                  if (l.campos[1]) fontes[l.campos[1]] = true
                }
                const negIrpj = periodos.reduce(
                  (s, p) => s + (p.irpj != null && p.irpj < 0 ? -p.irpj : 0),
                  0,
                )
                const negCsll = periodos.reduce(
                  (s, p) => s + (p.csll != null && p.csll < 0 ? -p.csll : 0),
                  0,
                )
                info = {
                  formaTributacao: formaTrib ? FORMA_TRIB[formaTrib] || formaTrib : null,
                  formaApuracao: presumido ? 'trimestral' : formaApur,
                  periodos: periodos,
                  saldoNegativo: {
                    irpj: Math.round(negIrpj * 100) / 100,
                    csll: Math.round(negCsll * 100) / 100,
                    status: negIrpj + negCsll > 0 ? 'CRÉDITO POTENCIAL' : null,
                  },
                  retencoes: {
                    ir: Math.round(retIr * 100) / 100,
                    csll: Math.round(retCsll * 100) / 100,
                    fontes: Object.keys(fontes).length,
                  },
                }
              } catch (err) {
                info = { erro: err.message || String(err) }
              }
            }
            return { ano: ano, ecd: arquivo(ecds[ano]), ecf: arquivo(ecf), ecfInfo: info }
          })
        return { cnpj: cnpj, anos: lista }
      }

      // ------------------------------------------------------------------ situação atual e perfil a partir do SPED
      // Leitura do SPED já importado na API ReceitanetBX para montar a situação tributária atual (somente leitura).
      // Posições: campos[0] = REG; campos[n] = campo n+1 do leiaute; valores com vírgula decimal.
      //   M200/M600 idx2 = VL_TOT_CRED_DESC, idx12 = VL_TOT_CONT_REC   M210 idx2 = VL_REC_BRT
      //   E110 idx12 = VL_ICMS_RECOLHER                               E520 idx7 = VL_SD_IPI
      //   Perfil: EFD-Contrib 0000 UF idx9, COD_MUN idx10, IND_ATIV idx13 · 0140 estabelecimentos · M105 idx6 VL_BC_PIS (base de crédito)
      //   M400 idx1 CST (04 = monofásico) · EFD ICMS 0000 UF idx8, COD_MUN idx10, IND_ATIV idx14 · C190 CST idx1, CFOP idx2, ALIQ idx3, VL_OPR idx4, VL_BC idx5
      //   ECF 0030 CNAE idx2, UF idx7, COD_MUN idx8 · N630 código 1 (base de cálculo do IRPJ) idx3 · M010/M500 parte B (prejuízo fiscal)

      function situacaoAtual(api, cnpj, matriz, declaracoes) {
        const num = (v) => {
          const s = String(v == null ? '' : v).trim()
          if (!s) return 0
          const n = parseFloat(s.replace(/\./g, '').replace(',', '.'))
          return isNaN(n) ? 0 : n
        }
        const r2 = (v) => Math.round(v * 100) / 100
        const linhas = (id, reg) =>
          api('/v1/sped/arquivos/' + id + '/registros/' + reg + '?limite=10000').linhas || []
        const transmissao = (nome) => (/_(\d{14})_/.exec(nome || '') || [])[1] || ''
        /** Última transmissão de cada mês, os 12 meses mais recentes. */
        const ultimos12 = (lista) => {
          const porMes = {}
          for (const a of lista) {
            const mes = String(a.dt_ini).slice(0, 7)
            const atual = porMes[mes]
            const k = transmissao(a.nome) + String(a.id).padStart(12, '0')
            if (!atual || k > transmissao(atual.nome) + String(atual.id).padStart(12, '0'))
              porMes[mes] = a
          }
          return Object.keys(porMes)
            .sort()
            .reverse()
            .slice(0, 12)
            .map((m) => porMes[m])
        }
        const listar = (doc, tipo) =>
          api('/v1/sped/arquivos?cnpj=' + doc + '&tipo=' + tipo + '&limite=200').arquivos || []
        const avisos = []
        const linhas1 = (id, reg) =>
          api('/v1/sped/arquivos/' + id + '/registros/' + reg + '?limite=1').linhas || []
        const perfil = { setores: {}, operacoes: {}, fontes: {} }
        const marca = (campo, valor, fonte) => {
          if (valor == null || valor === '' || perfil[campo] != null) return
          perfil[campo] = valor
          perfil.fontes[campo] = fonte
        }
        const marcaG = (g, campo, valor, fonte) => {
          if (valor == null || perfil[g][campo] != null) return
          perfil[g][campo] = valor
          perfil.fontes[g + '.' + campo] = fonte
        }

        // EFD-Contribuições (centralizada na matriz)
        let contrib = null
        let arqC = listar(cnpj, 'EFD-CONTRIBUICOES')
        if (!arqC.length && matriz !== cnpj) {
          arqC = listar(matriz, 'EFD-CONTRIBUICOES')
          if (arqC.length)
            avisos.push(
              'EFD-Contribuições lida da matriz (' + matriz + '): valores do CNPJ inteiro.',
            )
        }
        const mesesC = ultimos12(arqC)
        if (mesesC.length) {
          const t = {
            receitaBruta: 0,
            pis: 0,
            cofins: 0,
            creditosPis: 0,
            creditosCofins: 0,
            regime: null,
          }
          for (const a of mesesC) {
            for (const l of linhas(a.id, 'M200')) {
              t.pis += num(l.campos[12])
              t.creditosPis += num(l.campos[2])
            }
            for (const l of linhas(a.id, 'M600')) {
              t.cofins += num(l.campos[12])
              t.creditosCofins += num(l.campos[2])
            }
            for (const l of linhas(a.id, 'M210')) t.receitaBruta += num(l.campos[2])
            if (!t.regime) {
              const r = linhas(a.id, '0110')[0]
              if (r)
                t.regime =
                  r.campos[1] === '1'
                    ? 'não cumulativo'
                    : r.campos[1] === '2'
                      ? 'cumulativo'
                      : 'misto'
            }
            for (const l of linhas(a.id, 'M105'))
              t.basesCredito = (t.basesCredito || 0) + num(l.campos[6])
            if (!t.mono)
              for (const l of linhas(a.id, 'M400')) if (l.campos[1] === '04') t.mono = true
            // A100 IND_OPER 1 = serviço prestado; COD_SIT idx4 (02-05 = cancelada/denegada/inutilizada); VL_DOC idx11, VL_DESC idx13, VL_ISS idx20
            for (const l of linhas(a.id, 'A100')) {
              if (l.campos[1] !== '1' || ['02', '03', '04', '05'].indexOf(String(l.campos[4])) >= 0)
                continue
              t.servicos = true
              t.recServ = (t.recServ || 0) + num(l.campos[11]) - num(l.campos[13])
              t.iss = (t.iss || 0) + num(l.campos[20])
            }
          }
          const ult = mesesC[0]
          const r0 = (linhas1(ult.id, '0000')[0] || {}).campos || []
          const fC = 'EFD-Contribuições ' + String(ult.dt_ini).slice(0, 7)
          if (/^[A-Z]{2}$/.test(r0[9] || '')) marca('uf', r0[9], fC)
          if (/^\d{7}$/.test(r0[10] || '')) marca('codMun', r0[10], fC)
          const ativ = { 0: 'industria', 2: 'comercio', 1: 'servicos', 4: 'imobiliario' }[r0[13]]
          if (ativ) marcaG('setores', ativ, true, fC + ' (0000, indicador de atividade)')
          const estab = linhas(ult.id, '0140').length
          if (estab)
            marcaG(
              'operacoes',
              'filiais',
              estab > 1,
              fC + ' (0140: ' + estab + ' estabelecimento(s))',
            )
          if (t.basesCredito)
            marca(
              'comprasCreditaveis',
              r2((t.basesCredito * 12) / mesesC.length),
              'EFD-Contribuições M105 (bases de crédito, anualizado)',
            )
          if (t.mono) marcaG('operacoes', 'monofasicos', true, 'EFD-Contribuições M400 CST 04')
          if (t.servicos)
            marcaG(
              'setores',
              'servicos',
              true,
              'EFD-Contribuições A100 (notas de serviço emitidas)',
            )
          if (t.recServ > 0)
            marca(
              'receitaServicos',
              r2((t.recServ * 12) / mesesC.length),
              'EFD-Contribuições A100: notas de serviço emitidas (valor − desconto), anualizado',
            )
          if (t.recServ > 0 && t.iss > 0) {
            marca(
              'aliquotaIss',
              Math.round((t.iss / t.recServ) * 10000) / 100,
              'EFD-Contribuições A100: ISS das notas de serviço emitidas ÷ valor dos serviços (alíquota efetiva praticada)',
            )
            marcaG(
              'operacoes',
              'contribuinteIss',
              true,
              'EFD-Contribuições A100 (ISS nas notas emitidas)',
            )
          }
          if (t.receitaBruta)
            marca(
              'receitaAnual',
              r2((t.receitaBruta * 12) / mesesC.length),
              'EFD-Contribuições M210 (receita bruta, anualizada)',
            )
          const datas = mesesC.map((a) => String(a.dt_ini).slice(0, 10)).sort()
          contrib = {
            de: datas[0],
            ate: datas[datas.length - 1],
            meses: mesesC.length,
            receitaBruta: r2(t.receitaBruta),
            pis: r2(t.pis),
            cofins: r2(t.cofins),
            creditosPis: r2(t.creditosPis),
            creditosCofins: r2(t.creditosCofins),
            regime: t.regime,
            iss: r2(t.iss || 0),
          }
          if (mesesC.length < 12)
            avisos.push(
              'EFD-Contribuições com ' +
                mesesC.length +
                ' meses: PIS/COFINS somam só esse período (anualize se for o caso).',
            )
          if (!t.receitaBruta)
            avisos.push('Sem M210 com receita bruta: informe a receita anual no perfil.')
        }

        // EFD ICMS/IPI (por estabelecimento)
        let icms = null
        const mesesI = ultimos12(listar(cnpj, 'EFD-ICMS-IPI'))
        if (mesesI.length) {
          let vIcms = 0,
            vIpi = 0
          const cf = {
            saidas: 0,
            ind: 0,
            com: 0,
            inter: false,
            exp: false,
            imp: false,
            st: false,
            aliqBc: 0,
            bc: 0,
          }
          for (const a of mesesI) {
            for (const l of linhas(a.id, 'E110')) vIcms += num(l.campos[12])
            for (const l of linhas(a.id, 'E520')) vIpi += num(l.campos[7])
            for (const l of linhas(a.id, 'C190')) {
              const cst = String(l.campos[1] || ''),
                cfop = String(l.campos[2] || ''),
                aliq = num(l.campos[3]),
                opr = num(l.campos[4]),
                bc = num(l.campos[5])
              const d = cfop[0]
              if (!/^[1-7]\d{3}$/.test(cfop)) continue
              if ('567'.indexOf(d) >= 0) cf.saidas += opr
              if (d === '6' || d === '2') cf.inter = true
              if (d === '7') cf.exp = true
              if (d === '3') cf.imp = true
              const fim = cfop.slice(1)
              if (
                [
                  '101',
                  '103',
                  '105',
                  '109',
                  '111',
                  '113',
                  '116',
                  '118',
                  '122',
                  '124',
                  '125',
                  '401',
                  '402',
                ].indexOf(fim) >= 0
              )
                cf.ind += opr
              if (
                [
                  '102',
                  '104',
                  '106',
                  '108',
                  '110',
                  '112',
                  '114',
                  '115',
                  '117',
                  '119',
                  '120',
                  '123',
                  '403',
                  '404',
                  '405',
                ].indexOf(fim) >= 0 &&
                '56'.indexOf(d) >= 0
              )
                cf.com += opr
              if (/(10|30|60|70)$/.test(cst)) cf.st = true
              if (d === '5' && aliq > 0 && bc > 0) {
                cf.aliqBc += aliq * bc
                cf.bc += bc
              }
            }
          }
          const fI =
            'EFD ICMS/IPI ' +
            String(mesesI[mesesI.length - 1].dt_ini).slice(0, 7) +
            ' a ' +
            String(mesesI[0].dt_ini).slice(0, 7) +
            ' (C190)'
          marcaG('operacoes', 'contribuinteIcms', true, 'EFD ICMS/IPI entregue')
          if (cf.ind) marcaG('setores', 'industria', true, fI + ': CFOP de produção própria')
          if (cf.com) marcaG('setores', 'comercio', true, fI + ': CFOP de revenda')
          marcaG('operacoes', 'interestadual', cf.inter, fI)
          marcaG('operacoes', 'exporta', cf.exp, fI)
          marcaG('operacoes', 'importa', cf.imp, fI)
          marcaG('operacoes', 'substituicaoTributaria', cf.st, fI + ' (CST 10/30/60/70)')
          if (cf.bc)
            marca(
              'aliquotaIcms',
              Math.round((cf.aliqBc / cf.bc) * 100) / 100,
              fI + ': alíquota média ponderada das saídas internas (pode refletir redução de base)',
            )
          if (cf.saidas)
            marca(
              'receitaAnual',
              r2((cf.saidas * 12) / mesesI.length),
              fI + ': saídas, anualizadas',
            )
          const i0 = (linhas1(mesesI[0].id, '0000')[0] || {}).campos || []
          if (/^[A-Z]{2}$/.test(i0[8] || '')) marca('uf', i0[8], 'EFD ICMS/IPI 0000')
          if (/^\d{7}$/.test(i0[10] || '')) marca('codMun', i0[10], 'EFD ICMS/IPI 0000')
          if (i0[14] === '0')
            marcaG(
              'operacoes',
              'contribuinteIpi',
              true,
              'EFD ICMS/IPI 0000 (industrial ou equiparado)',
            )
          if (vIpi > 0)
            marcaG('operacoes', 'contribuinteIpi', true, 'EFD ICMS/IPI E520 (IPI a recolher)')
          const datas = mesesI.map((a) => String(a.dt_ini).slice(0, 10)).sort()
          icms = {
            de: datas[0],
            ate: datas[datas.length - 1],
            meses: mesesI.length,
            icms: r2(vIcms),
            ipi: r2(vIpi),
            estabelecimentos: 1,
          }
          avisos.push(
            'ICMS/IPI apenas deste estabelecimento; ICMS-ST (E210) e DIFAL não incluídos.',
          )
          if (mesesI.length < 12) avisos.push('EFD ICMS/IPI com ' + mesesI.length + ' meses.')
        }

        // ECF mais recente (forma de tributação e IRPJ/CSLL a pagar)
        let ecf = null
        try {
          const decl = declaracoes(api, cnpj)
          const ultimo = (decl.anos || []).find((a) => a.ecf && a.ecfInfo && !a.ecfInfo.erro)
          if (ultimo) {
            const info = ultimo.ecfInfo
            let irpj = 0,
              csll = 0,
              temIr = false,
              temCs = false
            for (const p of info.periodos || []) {
              if (p.irpj != null && p.irpj > 0) {
                irpj += p.irpj
                temIr = true
              }
              if (p.csll != null && p.csll > 0) {
                csll += p.csll
                temCs = true
              }
            }
            ecf = {
              ano: ultimo.ano,
              formaTributacao: info.formaTributacao,
              formaApuracao: info.formaApuracao,
              irpj: temIr ? r2(irpj) : null,
              csll: temCs ? r2(csll) : null,
              arquivo: ultimo.ecf.nome || String(ultimo.ecf.id),
            }
            if (
              /Real/.test(info.formaTributacao || '') &&
              info.formaApuracao &&
              /anual/.test(info.formaApuracao)
            )
              avisos.push(
                'Lucro Real anual: o valor "a pagar" da ECF já desconta as estimativas mensais pagas. Confira o IRPJ/CSLL devido total (N630/N670) antes de usar.',
              )
            if (/Presumido/.test(info.formaTributacao || '') && !temCs)
              avisos.push(
                'ECF do Presumido sem linha de CSLL a pagar identificada: informe a CSLL manualmente.',
              )
            const fE = 'ECF ' + ultimo.ano
            const id = ultimo.ecf.id
            const c30 = (linhas1(id, '0030')[0] || {}).campos || []
            if (/^\d{7}$/.test(c30[2] || '')) marca('cnae', c30[2], fE + ' (0030)')
            if (/^[A-Z]{2}$/.test(c30[7] || '')) marca('uf', c30[7], fE + ' (0030)')
            if (/^\d{7}$/.test(c30[8] || '')) marca('codMun', c30[8], fE + ' (0030)')
            const f = info.formaTributacao || ''
            const reg =
              /Real/.test(f) && !/Presumido/.test(f)
                ? info.formaApuracao === 'trimestral'
                  ? 'real-trimestral'
                  : 'real-anual'
                : /Presumido/.test(f)
                  ? 'presumido'
                  : /Arbitrado/.test(f)
                    ? 'arbitrado'
                    : /Imune|Isenta/.test(f)
                      ? 'imune'
                      : null
            marca('regime', reg, fE + ' (0010: ' + f + ')')
            if (reg && reg.indexOf('real') === 0) {
              let base = 0,
                achou = false
              for (const l of linhas(id, 'N630'))
                if (String(l.campos[1]) === '1' && /BASE DE C.LCULO/i.test(l.campos[2] || '')) {
                  base += num(l.campos[3])
                  achou = true
                }
              if (achou)
                marca(
                  'lucroContabil',
                  r2(base),
                  fE +
                    ' (N630: base de cálculo do IRPJ somada nos períodos — lucro real após adições/exclusões; negativo = prejuízo)',
                )
              const contas = {}
              for (const l of linhas(id, 'M010'))
                if (
                  l.campos[6] === 'I' &&
                  (/PREJU/i.test(l.campos[2] || '') || /^1\.00[01]$/.test(l.campos[4] || ''))
                )
                  contas[l.campos[1]] = true
              const saldo = {}
              for (const l of linhas(id, 'M500'))
                if (contas[l.campos[1]] && l.campos[2] === 'I')
                  saldo[l.campos[1]] = (l.campos[10] === 'D' ? 1 : -1) * num(l.campos[9])
              const prej = Object.keys(saldo).reduce((a, k) => a + Math.max(saldo[k], 0), 0)
              if (prej > 0)
                marca(
                  'prejuizoFiscal',
                  r2(prej),
                  fE +
                    ' (e-Lalur parte B, M010/M500: saldo final de prejuízo fiscal do IRPJ — conferir)',
                )
            }
          }
        } catch (e) {
          avisos.push('ECF: ' + (e && e.message ? e.message : String(e)))
        }
        if (!ecf && !contrib && !icms)
          avisos.push(
            'Nenhum SPED desta empresa no servidor. Peça os arquivos pelo painel de créditos (Pedir à Receita) ou informe os valores manualmente.',
          )
        return { ecf, contrib, icms, perfil, avisos }
      }
      return {
        rbxConfigurado,
        empresasLocais,
        rbx,
        falhar,
        equipe,
        cnpjValido,
        cnpjMatriz,
        ibge,
        emailConfigurado,
        enviarEmail,
        registrarEnvio,
        destinatarios,
        esc,
        moldura,
        relatorioInteligencia,
        SITE,
        declaracoes,
        situacaoAtual,
      }
    })()
    if (!u.equipe(e)) return e.json(403, { erro: 'Acesso restrito à equipe técnica.' })
    const cnpj = e.request.pathValue('cnpj')
    if (!u.cnpjValido(cnpj)) return e.json(422, { erro: 'CNPJ inválido.' })
    if (!u.rbxConfigurado())
      return e.json(503, {
        erro: 'Leitura do SPED indisponível: cadastre os secrets RECEITANETBX_URL e RECEITANETBX_API_KEY no Skip. Enquanto isso, preencha o perfil à mão.',
      })
    try {
      let empresa = null
      try {
        empresa = (u.rbx('GET', '/v1/empresas') || []).find((x) => x.cnpj === cnpj) || null
      } catch (err) {
        empresa = null
      }
      const api = (caminho) => u.rbx('GET', caminho, undefined, 120)
      const r = u.situacaoAtual(api, cnpj, u.cnpjMatriz(cnpj), u.declaracoes)
      // Nome do município e descrição do CNAE (IBGE).
      const pf = r.perfil || {}
      if (pf.codMun) {
        const m = u.ibge('/v1/localidades/municipios/' + pf.codMun)
        if (m && m.nome) {
          pf.municipio = m.nome
          pf.fontes.municipio = pf.fontes.codMun + ' · IBGE ' + pf.codMun
        }
      }
      if (pf.cnae) {
        const c = u.ibge('/v2/cnae/subclasses/' + pf.cnae)
        const item = Array.isArray(c) ? c[0] : c
        if (item && item.descricao) {
          pf.atividade = item.descricao
          pf.fontes.atividade = pf.fontes.cnae + ' · IBGE/CNAE'
        }
      }
      return e.json(
        200,
        Object.assign(
          { empresa: empresa ? { nome: empresa.nome, observacao: empresa.observacao } : null },
          r,
        ),
      )
    } catch (err) {
      return u.falhar(e, err)
    }
  },
  $apis.requireAuth(),
)

routerAdd(
  'GET',
  '/backend/v1/pt/email-estado',
  (e) => {
    const u = (function () {
      // Biblioteca do Planejamento Tributário para os hooks do Skip (PocketBase 0.36).
      // Não é carregada por require em produção: pocketbase/fonte/gerar-hooks.mjs cola este arquivo dentro de cada rota de
      // api_planejamento.js. Junta: acesso à API ReceitanetBX (só leitura do SPED já importado), e-mail, declarações (ECD/ECF)
      // e a leitura da situação atual/perfil a partir do SPED. Chaves só nos secrets do Skip, nunca no navegador.

      const RBX_URL = () =>
        ($secrets.get('RECEITANETBX_URL') || 'http://127.0.0.1:8000').replace(/\/$/, '')
      const RBX_CHAVE = () => $secrets.get('RECEITANETBX_API_KEY') || ''
      /** Endereço do Skip para os links dos e-mails (secret opcional SITE_URL). */
      const SITE = () => ($secrets.get('SITE_URL') || '').replace(/\/$/, '')

      class ErroApi extends Error {
        constructor(status, mensagem) {
          super(mensagem)
          this.status = status
        }
      }

      /** GET/POST na API ReceitanetBX (somente leitura do SPED já importado; não liga o ReceitanetBX). */
      function rbx(metodo, caminho, corpo, timeout) {
        const res = $http.send({
          url: RBX_URL() + caminho,
          method: metodo,
          headers: {
            'X-API-Key': RBX_CHAVE(),
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: corpo === undefined ? '' : JSON.stringify(corpo),
          timeout: timeout || 120,
        })
        if (res.statusCode >= 400) {
          const j = res.json
          throw new ErroApi(
            res.statusCode,
            (j && typeof j.detail === 'string' && j.detail) ||
              (res.raw || '').slice(0, 300) ||
              'HTTP ' + res.statusCode,
          )
        }
        return res.json
      }

      function falhar(e, err) {
        return e.json(err && err.status ? err.status : 502, {
          erro: err && err.message ? err.message : String(err),
        })
      }

      /** Usuário logado. Onde a tabela de usuários tiver perfis (role), só Dev e Tributarista. */
      function equipe(e) {
        if (!e.auth) return false
        const papel = e.auth.getString('role')
        return !papel || papel === 'dev' || papel === 'tributarista'
      }

      /** A leitura do SPED depende dos secrets da API ReceitanetBX. */
      function rbxConfigurado() {
        return !!$secrets.get('RECEITANETBX_URL') && !!$secrets.get('RECEITANETBX_API_KEY')
      }

      /** Empresas cadastradas neste sistema (coleção empresas, importada da planilha). */
      function empresasLocais() {
        try {
          return $app.findRecordsByFilter('empresas', "cnpj != ''", 'nome', 0, 0).map((r) => ({
            cnpj: r.getString('cnpj'),
            nome: r.getString('nome') || null,
            observacao: r.getString('observacao') || null,
            situacao: r.getString('situacao') || null,
          }))
        } catch (err) {
          return []
        }
      }

      const cnpjValido = (c) => /^\d{14}$/.test(c || '')

      /** CNPJ da matriz (0001) com dígitos verificadores. */
      function cnpjMatriz(cnpj) {
        const base = cnpj.slice(0, 8) + '0001'
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
        const d1 = dv(base)
        const d2 = dv(base + d1)
        return base + d1 + d2
      }

      /** Consulta pública e gratuita do IBGE (nome do município, descrição do CNAE). */
      function ibge(caminho) {
        try {
          const res = $http.send({
            url: 'https://servicodados.ibge.gov.br/api' + caminho,
            method: 'GET',
            timeout: 10,
          })
          return res.statusCode === 200 ? res.json : null
        } catch (err) {
          return null
        }
      }

      // ------------------------------------------------------------------ e-mail (SMTP configurado no PocketBase)
      function emailConfigurado() {
        const s = $app.settings()
        return !!(s.smtp && s.smtp.enabled && s.smtp.host)
      }

      /** Registra o envio no histórico (coleção pt_envios). */
      function registrarEnvio(dest, email, relatorio, assunto, status, detalhe) {
        const r = new Record($app.findCollectionByNameOrId('pt_envios'))
        r.set('destinatario', dest || '')
        r.set('email', email || '')
        r.set('relatorio', relatorio || '')
        r.set('assunto', assunto || '')
        r.set('status', status)
        r.set('detalhe', String(detalhe || '').slice(0, 1900))
        $app.save(r)
      }

      /** Envia um e-mail e registra. Devolve true/false. */
      function enviarEmail(dest, email, relatorio, assunto, html, statusOk) {
        if (!emailConfigurado()) {
          registrarEnvio(
            dest,
            email,
            relatorio,
            assunto,
            'falhou',
            'Serviço de e-mail (SMTP) não configurado no servidor.',
          )
          return false
        }
        try {
          const meta = $app.settings().meta
          const msg = new MailerMessage({
            from: { address: meta.senderAddress, name: meta.senderName || 'C CONT Planejamento' },
            to: [{ address: email, name: dest }],
            subject: assunto,
            html: html,
          })
          $app.newMailClient().send(msg)
          registrarEnvio(dest, email, relatorio, assunto, statusOk || 'enviado', '')
          return true
        } catch (err) {
          registrarEnvio(
            dest,
            email,
            relatorio,
            assunto,
            'falhou',
            err && err.message ? err.message : String(err),
          )
          return false
        }
      }

      /** Destinatários ativos com permissão para o tipo de relatório. */
      function destinatarios(tipo) {
        const lista = $app.findRecordsByFilter(
          'pt_destinatarios',
          "ativo = true && email != ''",
          'grupo',
          0,
          0,
        )
        const saida = []
        for (const r of lista) {
          let rel = []
          try {
            rel = JSON.parse(r.getString('relatorios') || '[]')
          } catch (err) {
            rel = []
          }
          if (rel.indexOf(tipo) >= 0)
            saida.push({
              nome: r.getString('nome'),
              email: r.getString('email'),
              grupo: r.getString('grupo'),
              periodicidade: r.getString('periodicidade'),
            })
        }
        return saida
      }

      const esc = (s) =>
        String(s == null ? '' : s)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')

      /** Moldura padrão dos e-mails. */
      function moldura(titulo, corpoHtml) {
        return (
          '<div style="font-family:Arial,sans-serif;color:#132420;max-width:680px">' +
          '<div style="background:#141726;color:#fff;padding:12px 16px;border-radius:8px;border-bottom:4px solid #0e6b63"><b>C CONT · Planejamento Tributário</b></div>' +
          '<h2 style="color:#0b4f4a">' +
          esc(titulo) +
          '</h2>' +
          corpoHtml +
          '<p style="font-size:11px;color:#6b7a76;margin-top:20px">C Consulting Group — Resultados importam! Mensagem automática do sistema de planejamento tributário.</p></div>'
        )
      }

      /** Relatório mensal da inteligência adaptativa montado no servidor (para o envio automático). */
      function relatorioInteligencia(mes) {
        const lista = $app.findRecordsByFilter('pt_inteligencia', 'mes = {:mes}', 'created', 0, 0, {
          mes: mes,
        })
        let html = ''
        if (!lista.length)
          html = '<p><b>Não foram encontradas novidades relevantes neste mês.</b></p>'
        for (const r of lista) {
          let d = {}
          try {
            d = JSON.parse(r.getString('dados') || '{}')
          } catch (err) {
            d = {}
          }
          const ap = d.aprovacoes || {}
          html +=
            '<h3 style="margin-bottom:4px">' +
            esc(r.getString('nome')) +
            "</h3><table style='font-size:13px;border-collapse:collapse'>" +
            [
              ['O que há de novo', d.novidade],
              ['Fonte e fundamento', d.fonte],
              ['Beneficiados', d.beneficiados],
              ['Exemplo de cálculo', d.exemploCalculo],
              ['Grau de risco', d.risco],
              ['Alterações na IA', d.alteracoesIA],
              ['Recomendação', d.recomendacao],
              [
                'Aprovações',
                'Controladoria: ' +
                  (ap.controladoria || 'pendente') +
                  ' · Jurídico: ' +
                  (ap.juridico || 'pendente') +
                  ' · Desenvolvimento: ' +
                  (ap.desenvolvimento || 'pendente'),
              ],
              ['Situação', r.getString('situacao')],
            ]
              .map(
                (l) =>
                  "<tr><td style='padding:3px 8px;font-weight:bold;vertical-align:top'>" +
                  esc(l[0]) +
                  "</td><td style='padding:3px 8px'>" +
                  esc(l[1]) +
                  '</td></tr>',
              )
              .join('') +
            '</table>'
        }
        return html
      }

      // ------------------------------------------------------------------ declarações anuais (ECD/ECF), igual ao painel do servidor
      // Declarações anuais da empresa no servidor (ECD e ECF): o que existe por ano, para baixar, e o que a ECF informa
      // (forma de tributação, IRPJ/CSLL a pagar por período, saldo negativo e retenções sofridas do Y570).
      // Mesma lógica de pocketbase/hooks/api_declaracoes.js do Skip. Saldo negativo é só "CRÉDITO POTENCIAL".

      /** api(caminho) = GET na API ReceitanetBX devolvendo o JSON. */
      function declaracoes(api, cnpj) {
        // Valor do SPED ("1234,56") em número.
        const num = (v) => {
          const s = String(v == null ? '' : v).trim()
          if (!s) return null
          const n = parseFloat(s.replace(/\./g, '').replace(',', '.'))
          return isNaN(n) ? null : n
        }
        const linhas = (id, reg) =>
          api('/v1/sped/arquivos/' + id + '/registros/' + reg + '?limite=10000').linhas || []
        // Última transmissão por ano (o nome traz _AAAAMMDDhhmmss_; sem ele, o maior id).
        const transmissao = (nome) => (/_(\d{14})_/.exec(nome || '') || [])[1] || ''
        const porAno = (lista) => {
          const r = {}
          for (const a of lista) {
            const ano = String(a.dt_ini).slice(0, 4)
            const atual = r[ano]
            const chaveA = transmissao(a.nome) + String(a.id).padStart(12, '0')
            if (!atual || chaveA > transmissao(atual.nome) + String(atual.id).padStart(12, '0'))
              r[ano] = a
          }
          return r
        }
        const FORMA_TRIB = {
          1: 'Lucro Real',
          2: 'Lucro Real/Arbitrado',
          3: 'Lucro Presumido/Real',
          4: 'Lucro Presumido/Real/Arbitrado',
          5: 'Lucro Presumido',
          6: 'Lucro Arbitrado',
          7: 'Lucro Presumido/Arbitrado',
          8: 'Imune do IRPJ',
          9: 'Isenta do IRPJ',
        }

        /** IRPJ/CSLL "a pagar" por período (N030/P030 → N630/N670/P300/P400) e saldo negativo. */
        const apuracao = (id, regPeriodo, regIrpj, codIrpj, regCsll, codCsll) => {
          const periodos = linhas(id, regPeriodo).map((l) => ({
            linha: l.linha,
            per: l.campos[3] || '',
          }))
          const periodoDe = (linha) => {
            let p = ''
            for (const x of periodos) if (x.linha < linha) p = x.per
            return p
          }
          const saida = {}
          const ler = (reg, codigo, campo) => {
            const todas = linhas(id, reg)
            // Linha "a pagar": pelo código do leiaute; se não houver, a última cuja descrição diz "A PAGAR".
            let alvo = todas.filter((l) => String(l.campos[1]) === codigo)
            if (!alvo.length) {
              const porPeriodo = {}
              for (const l of todas)
                if (/A PAGAR|A RECOLHER/i.test(l.campos[2] || ''))
                  porPeriodo[periodoDe(l.linha)] = l
              alvo = Object.keys(porPeriodo).map((k) => porPeriodo[k])
            }
            for (const l of alvo) {
              const per = periodoDe(l.linha) || 'A00'
              const v = num(l.campos[3])
              if (v == null) continue
              const x = saida[per] || (saida[per] = { periodo: per, irpj: null, csll: null })
              x[campo] = v
            }
          }
          ler(regIrpj, codIrpj, 'irpj')
          ler(regCsll, codCsll, 'csll')
          return Object.keys(saida)
            .sort()
            .map((k) => saida[k])
        }

        const ecds = porAno(
          api('/v1/sped/arquivos?cnpj=' + cnpj + '&tipo=ECD&limite=100').arquivos || [],
        )
        const ecfs = porAno(
          api('/v1/sped/arquivos?cnpj=' + cnpj + '&tipo=ECF&limite=100').arquivos || [],
        )
        const anos = {}
        const hoje = new Date()
        for (let a = hoje.getFullYear() - 5; a < hoje.getFullYear(); a++) anos[String(a)] = true
        for (const a of Object.keys(ecds).concat(Object.keys(ecfs))) anos[a] = true
        const arquivo = (a) =>
          a
            ? { id: a.id, nome: a.nome, de: a.dt_ini, ate: a.dt_fin, importadoEm: a.importado_em }
            : null

        const lista = Object.keys(anos)
          .sort()
          .reverse()
          .map((ano) => {
            const ecf = ecfs[ano]
            let info = null
            if (ecf) {
              try {
                const r0010 = (linhas(ecf.id, '0010')[0] || {}).campos || []
                // Campos localizados pelo formato (as versões do leiaute mudam a posição).
                let iTrib = -1
                for (let i = 3; i < r0010.length; i++)
                  if (/^[1-9]$/.test(r0010[i] || '')) {
                    iTrib = i
                    break
                  }
                const formaTrib = iTrib >= 0 ? r0010[iTrib] : null
                let formaApur = null
                for (let i = iTrib + 1; iTrib >= 0 && i < r0010.length; i++)
                  if (r0010[i] === 'A' || r0010[i] === 'T') {
                    formaApur = r0010[i] === 'A' ? 'anual (estimativas mensais)' : 'trimestral'
                    break
                  }
                const presumido = formaTrib === '5' || formaTrib === '7'
                const periodos = presumido
                  ? apuracao(ecf.id, 'P030', 'P300', '15', 'P400', '')
                  : apuracao(ecf.id, 'N030', 'N630', '26', 'N670', '21')
                let retIr = 0
                let retCsll = 0
                const fontes = {}
                for (const l of linhas(ecf.id, 'Y570')) {
                  retIr += num(l.campos[6]) || 0
                  retCsll += num(l.campos[7]) || 0
                  if (l.campos[1]) fontes[l.campos[1]] = true
                }
                const negIrpj = periodos.reduce(
                  (s, p) => s + (p.irpj != null && p.irpj < 0 ? -p.irpj : 0),
                  0,
                )
                const negCsll = periodos.reduce(
                  (s, p) => s + (p.csll != null && p.csll < 0 ? -p.csll : 0),
                  0,
                )
                info = {
                  formaTributacao: formaTrib ? FORMA_TRIB[formaTrib] || formaTrib : null,
                  formaApuracao: presumido ? 'trimestral' : formaApur,
                  periodos: periodos,
                  saldoNegativo: {
                    irpj: Math.round(negIrpj * 100) / 100,
                    csll: Math.round(negCsll * 100) / 100,
                    status: negIrpj + negCsll > 0 ? 'CRÉDITO POTENCIAL' : null,
                  },
                  retencoes: {
                    ir: Math.round(retIr * 100) / 100,
                    csll: Math.round(retCsll * 100) / 100,
                    fontes: Object.keys(fontes).length,
                  },
                }
              } catch (err) {
                info = { erro: err.message || String(err) }
              }
            }
            return { ano: ano, ecd: arquivo(ecds[ano]), ecf: arquivo(ecf), ecfInfo: info }
          })
        return { cnpj: cnpj, anos: lista }
      }

      // ------------------------------------------------------------------ situação atual e perfil a partir do SPED
      // Leitura do SPED já importado na API ReceitanetBX para montar a situação tributária atual (somente leitura).
      // Posições: campos[0] = REG; campos[n] = campo n+1 do leiaute; valores com vírgula decimal.
      //   M200/M600 idx2 = VL_TOT_CRED_DESC, idx12 = VL_TOT_CONT_REC   M210 idx2 = VL_REC_BRT
      //   E110 idx12 = VL_ICMS_RECOLHER                               E520 idx7 = VL_SD_IPI
      //   Perfil: EFD-Contrib 0000 UF idx9, COD_MUN idx10, IND_ATIV idx13 · 0140 estabelecimentos · M105 idx6 VL_BC_PIS (base de crédito)
      //   M400 idx1 CST (04 = monofásico) · EFD ICMS 0000 UF idx8, COD_MUN idx10, IND_ATIV idx14 · C190 CST idx1, CFOP idx2, ALIQ idx3, VL_OPR idx4, VL_BC idx5
      //   ECF 0030 CNAE idx2, UF idx7, COD_MUN idx8 · N630 código 1 (base de cálculo do IRPJ) idx3 · M010/M500 parte B (prejuízo fiscal)

      function situacaoAtual(api, cnpj, matriz, declaracoes) {
        const num = (v) => {
          const s = String(v == null ? '' : v).trim()
          if (!s) return 0
          const n = parseFloat(s.replace(/\./g, '').replace(',', '.'))
          return isNaN(n) ? 0 : n
        }
        const r2 = (v) => Math.round(v * 100) / 100
        const linhas = (id, reg) =>
          api('/v1/sped/arquivos/' + id + '/registros/' + reg + '?limite=10000').linhas || []
        const transmissao = (nome) => (/_(\d{14})_/.exec(nome || '') || [])[1] || ''
        /** Última transmissão de cada mês, os 12 meses mais recentes. */
        const ultimos12 = (lista) => {
          const porMes = {}
          for (const a of lista) {
            const mes = String(a.dt_ini).slice(0, 7)
            const atual = porMes[mes]
            const k = transmissao(a.nome) + String(a.id).padStart(12, '0')
            if (!atual || k > transmissao(atual.nome) + String(atual.id).padStart(12, '0'))
              porMes[mes] = a
          }
          return Object.keys(porMes)
            .sort()
            .reverse()
            .slice(0, 12)
            .map((m) => porMes[m])
        }
        const listar = (doc, tipo) =>
          api('/v1/sped/arquivos?cnpj=' + doc + '&tipo=' + tipo + '&limite=200').arquivos || []
        const avisos = []
        const linhas1 = (id, reg) =>
          api('/v1/sped/arquivos/' + id + '/registros/' + reg + '?limite=1').linhas || []
        const perfil = { setores: {}, operacoes: {}, fontes: {} }
        const marca = (campo, valor, fonte) => {
          if (valor == null || valor === '' || perfil[campo] != null) return
          perfil[campo] = valor
          perfil.fontes[campo] = fonte
        }
        const marcaG = (g, campo, valor, fonte) => {
          if (valor == null || perfil[g][campo] != null) return
          perfil[g][campo] = valor
          perfil.fontes[g + '.' + campo] = fonte
        }

        // EFD-Contribuições (centralizada na matriz)
        let contrib = null
        let arqC = listar(cnpj, 'EFD-CONTRIBUICOES')
        if (!arqC.length && matriz !== cnpj) {
          arqC = listar(matriz, 'EFD-CONTRIBUICOES')
          if (arqC.length)
            avisos.push(
              'EFD-Contribuições lida da matriz (' + matriz + '): valores do CNPJ inteiro.',
            )
        }
        const mesesC = ultimos12(arqC)
        if (mesesC.length) {
          const t = {
            receitaBruta: 0,
            pis: 0,
            cofins: 0,
            creditosPis: 0,
            creditosCofins: 0,
            regime: null,
          }
          for (const a of mesesC) {
            for (const l of linhas(a.id, 'M200')) {
              t.pis += num(l.campos[12])
              t.creditosPis += num(l.campos[2])
            }
            for (const l of linhas(a.id, 'M600')) {
              t.cofins += num(l.campos[12])
              t.creditosCofins += num(l.campos[2])
            }
            for (const l of linhas(a.id, 'M210')) t.receitaBruta += num(l.campos[2])
            if (!t.regime) {
              const r = linhas(a.id, '0110')[0]
              if (r)
                t.regime =
                  r.campos[1] === '1'
                    ? 'não cumulativo'
                    : r.campos[1] === '2'
                      ? 'cumulativo'
                      : 'misto'
            }
            for (const l of linhas(a.id, 'M105'))
              t.basesCredito = (t.basesCredito || 0) + num(l.campos[6])
            if (!t.mono)
              for (const l of linhas(a.id, 'M400')) if (l.campos[1] === '04') t.mono = true
            // A100 IND_OPER 1 = serviço prestado; COD_SIT idx4 (02-05 = cancelada/denegada/inutilizada); VL_DOC idx11, VL_DESC idx13, VL_ISS idx20
            for (const l of linhas(a.id, 'A100')) {
              if (l.campos[1] !== '1' || ['02', '03', '04', '05'].indexOf(String(l.campos[4])) >= 0)
                continue
              t.servicos = true
              t.recServ = (t.recServ || 0) + num(l.campos[11]) - num(l.campos[13])
              t.iss = (t.iss || 0) + num(l.campos[20])
            }
          }
          const ult = mesesC[0]
          const r0 = (linhas1(ult.id, '0000')[0] || {}).campos || []
          const fC = 'EFD-Contribuições ' + String(ult.dt_ini).slice(0, 7)
          if (/^[A-Z]{2}$/.test(r0[9] || '')) marca('uf', r0[9], fC)
          if (/^\d{7}$/.test(r0[10] || '')) marca('codMun', r0[10], fC)
          const ativ = { 0: 'industria', 2: 'comercio', 1: 'servicos', 4: 'imobiliario' }[r0[13]]
          if (ativ) marcaG('setores', ativ, true, fC + ' (0000, indicador de atividade)')
          const estab = linhas(ult.id, '0140').length
          if (estab)
            marcaG(
              'operacoes',
              'filiais',
              estab > 1,
              fC + ' (0140: ' + estab + ' estabelecimento(s))',
            )
          if (t.basesCredito)
            marca(
              'comprasCreditaveis',
              r2((t.basesCredito * 12) / mesesC.length),
              'EFD-Contribuições M105 (bases de crédito, anualizado)',
            )
          if (t.mono) marcaG('operacoes', 'monofasicos', true, 'EFD-Contribuições M400 CST 04')
          if (t.servicos)
            marcaG(
              'setores',
              'servicos',
              true,
              'EFD-Contribuições A100 (notas de serviço emitidas)',
            )
          if (t.recServ > 0)
            marca(
              'receitaServicos',
              r2((t.recServ * 12) / mesesC.length),
              'EFD-Contribuições A100: notas de serviço emitidas (valor − desconto), anualizado',
            )
          if (t.recServ > 0 && t.iss > 0) {
            marca(
              'aliquotaIss',
              Math.round((t.iss / t.recServ) * 10000) / 100,
              'EFD-Contribuições A100: ISS das notas de serviço emitidas ÷ valor dos serviços (alíquota efetiva praticada)',
            )
            marcaG(
              'operacoes',
              'contribuinteIss',
              true,
              'EFD-Contribuições A100 (ISS nas notas emitidas)',
            )
          }
          if (t.receitaBruta)
            marca(
              'receitaAnual',
              r2((t.receitaBruta * 12) / mesesC.length),
              'EFD-Contribuições M210 (receita bruta, anualizada)',
            )
          const datas = mesesC.map((a) => String(a.dt_ini).slice(0, 10)).sort()
          contrib = {
            de: datas[0],
            ate: datas[datas.length - 1],
            meses: mesesC.length,
            receitaBruta: r2(t.receitaBruta),
            pis: r2(t.pis),
            cofins: r2(t.cofins),
            creditosPis: r2(t.creditosPis),
            creditosCofins: r2(t.creditosCofins),
            regime: t.regime,
            iss: r2(t.iss || 0),
          }
          if (mesesC.length < 12)
            avisos.push(
              'EFD-Contribuições com ' +
                mesesC.length +
                ' meses: PIS/COFINS somam só esse período (anualize se for o caso).',
            )
          if (!t.receitaBruta)
            avisos.push('Sem M210 com receita bruta: informe a receita anual no perfil.')
        }

        // EFD ICMS/IPI (por estabelecimento)
        let icms = null
        const mesesI = ultimos12(listar(cnpj, 'EFD-ICMS-IPI'))
        if (mesesI.length) {
          let vIcms = 0,
            vIpi = 0
          const cf = {
            saidas: 0,
            ind: 0,
            com: 0,
            inter: false,
            exp: false,
            imp: false,
            st: false,
            aliqBc: 0,
            bc: 0,
          }
          for (const a of mesesI) {
            for (const l of linhas(a.id, 'E110')) vIcms += num(l.campos[12])
            for (const l of linhas(a.id, 'E520')) vIpi += num(l.campos[7])
            for (const l of linhas(a.id, 'C190')) {
              const cst = String(l.campos[1] || ''),
                cfop = String(l.campos[2] || ''),
                aliq = num(l.campos[3]),
                opr = num(l.campos[4]),
                bc = num(l.campos[5])
              const d = cfop[0]
              if (!/^[1-7]\d{3}$/.test(cfop)) continue
              if ('567'.indexOf(d) >= 0) cf.saidas += opr
              if (d === '6' || d === '2') cf.inter = true
              if (d === '7') cf.exp = true
              if (d === '3') cf.imp = true
              const fim = cfop.slice(1)
              if (
                [
                  '101',
                  '103',
                  '105',
                  '109',
                  '111',
                  '113',
                  '116',
                  '118',
                  '122',
                  '124',
                  '125',
                  '401',
                  '402',
                ].indexOf(fim) >= 0
              )
                cf.ind += opr
              if (
                [
                  '102',
                  '104',
                  '106',
                  '108',
                  '110',
                  '112',
                  '114',
                  '115',
                  '117',
                  '119',
                  '120',
                  '123',
                  '403',
                  '404',
                  '405',
                ].indexOf(fim) >= 0 &&
                '56'.indexOf(d) >= 0
              )
                cf.com += opr
              if (/(10|30|60|70)$/.test(cst)) cf.st = true
              if (d === '5' && aliq > 0 && bc > 0) {
                cf.aliqBc += aliq * bc
                cf.bc += bc
              }
            }
          }
          const fI =
            'EFD ICMS/IPI ' +
            String(mesesI[mesesI.length - 1].dt_ini).slice(0, 7) +
            ' a ' +
            String(mesesI[0].dt_ini).slice(0, 7) +
            ' (C190)'
          marcaG('operacoes', 'contribuinteIcms', true, 'EFD ICMS/IPI entregue')
          if (cf.ind) marcaG('setores', 'industria', true, fI + ': CFOP de produção própria')
          if (cf.com) marcaG('setores', 'comercio', true, fI + ': CFOP de revenda')
          marcaG('operacoes', 'interestadual', cf.inter, fI)
          marcaG('operacoes', 'exporta', cf.exp, fI)
          marcaG('operacoes', 'importa', cf.imp, fI)
          marcaG('operacoes', 'substituicaoTributaria', cf.st, fI + ' (CST 10/30/60/70)')
          if (cf.bc)
            marca(
              'aliquotaIcms',
              Math.round((cf.aliqBc / cf.bc) * 100) / 100,
              fI + ': alíquota média ponderada das saídas internas (pode refletir redução de base)',
            )
          if (cf.saidas)
            marca(
              'receitaAnual',
              r2((cf.saidas * 12) / mesesI.length),
              fI + ': saídas, anualizadas',
            )
          const i0 = (linhas1(mesesI[0].id, '0000')[0] || {}).campos || []
          if (/^[A-Z]{2}$/.test(i0[8] || '')) marca('uf', i0[8], 'EFD ICMS/IPI 0000')
          if (/^\d{7}$/.test(i0[10] || '')) marca('codMun', i0[10], 'EFD ICMS/IPI 0000')
          if (i0[14] === '0')
            marcaG(
              'operacoes',
              'contribuinteIpi',
              true,
              'EFD ICMS/IPI 0000 (industrial ou equiparado)',
            )
          if (vIpi > 0)
            marcaG('operacoes', 'contribuinteIpi', true, 'EFD ICMS/IPI E520 (IPI a recolher)')
          const datas = mesesI.map((a) => String(a.dt_ini).slice(0, 10)).sort()
          icms = {
            de: datas[0],
            ate: datas[datas.length - 1],
            meses: mesesI.length,
            icms: r2(vIcms),
            ipi: r2(vIpi),
            estabelecimentos: 1,
          }
          avisos.push(
            'ICMS/IPI apenas deste estabelecimento; ICMS-ST (E210) e DIFAL não incluídos.',
          )
          if (mesesI.length < 12) avisos.push('EFD ICMS/IPI com ' + mesesI.length + ' meses.')
        }

        // ECF mais recente (forma de tributação e IRPJ/CSLL a pagar)
        let ecf = null
        try {
          const decl = declaracoes(api, cnpj)
          const ultimo = (decl.anos || []).find((a) => a.ecf && a.ecfInfo && !a.ecfInfo.erro)
          if (ultimo) {
            const info = ultimo.ecfInfo
            let irpj = 0,
              csll = 0,
              temIr = false,
              temCs = false
            for (const p of info.periodos || []) {
              if (p.irpj != null && p.irpj > 0) {
                irpj += p.irpj
                temIr = true
              }
              if (p.csll != null && p.csll > 0) {
                csll += p.csll
                temCs = true
              }
            }
            ecf = {
              ano: ultimo.ano,
              formaTributacao: info.formaTributacao,
              formaApuracao: info.formaApuracao,
              irpj: temIr ? r2(irpj) : null,
              csll: temCs ? r2(csll) : null,
              arquivo: ultimo.ecf.nome || String(ultimo.ecf.id),
            }
            if (
              /Real/.test(info.formaTributacao || '') &&
              info.formaApuracao &&
              /anual/.test(info.formaApuracao)
            )
              avisos.push(
                'Lucro Real anual: o valor "a pagar" da ECF já desconta as estimativas mensais pagas. Confira o IRPJ/CSLL devido total (N630/N670) antes de usar.',
              )
            if (/Presumido/.test(info.formaTributacao || '') && !temCs)
              avisos.push(
                'ECF do Presumido sem linha de CSLL a pagar identificada: informe a CSLL manualmente.',
              )
            const fE = 'ECF ' + ultimo.ano
            const id = ultimo.ecf.id
            const c30 = (linhas1(id, '0030')[0] || {}).campos || []
            if (/^\d{7}$/.test(c30[2] || '')) marca('cnae', c30[2], fE + ' (0030)')
            if (/^[A-Z]{2}$/.test(c30[7] || '')) marca('uf', c30[7], fE + ' (0030)')
            if (/^\d{7}$/.test(c30[8] || '')) marca('codMun', c30[8], fE + ' (0030)')
            const f = info.formaTributacao || ''
            const reg =
              /Real/.test(f) && !/Presumido/.test(f)
                ? info.formaApuracao === 'trimestral'
                  ? 'real-trimestral'
                  : 'real-anual'
                : /Presumido/.test(f)
                  ? 'presumido'
                  : /Arbitrado/.test(f)
                    ? 'arbitrado'
                    : /Imune|Isenta/.test(f)
                      ? 'imune'
                      : null
            marca('regime', reg, fE + ' (0010: ' + f + ')')
            if (reg && reg.indexOf('real') === 0) {
              let base = 0,
                achou = false
              for (const l of linhas(id, 'N630'))
                if (String(l.campos[1]) === '1' && /BASE DE C.LCULO/i.test(l.campos[2] || '')) {
                  base += num(l.campos[3])
                  achou = true
                }
              if (achou)
                marca(
                  'lucroContabil',
                  r2(base),
                  fE +
                    ' (N630: base de cálculo do IRPJ somada nos períodos — lucro real após adições/exclusões; negativo = prejuízo)',
                )
              const contas = {}
              for (const l of linhas(id, 'M010'))
                if (
                  l.campos[6] === 'I' &&
                  (/PREJU/i.test(l.campos[2] || '') || /^1\.00[01]$/.test(l.campos[4] || ''))
                )
                  contas[l.campos[1]] = true
              const saldo = {}
              for (const l of linhas(id, 'M500'))
                if (contas[l.campos[1]] && l.campos[2] === 'I')
                  saldo[l.campos[1]] = (l.campos[10] === 'D' ? 1 : -1) * num(l.campos[9])
              const prej = Object.keys(saldo).reduce((a, k) => a + Math.max(saldo[k], 0), 0)
              if (prej > 0)
                marca(
                  'prejuizoFiscal',
                  r2(prej),
                  fE +
                    ' (e-Lalur parte B, M010/M500: saldo final de prejuízo fiscal do IRPJ — conferir)',
                )
            }
          }
        } catch (e) {
          avisos.push('ECF: ' + (e && e.message ? e.message : String(e)))
        }
        if (!ecf && !contrib && !icms)
          avisos.push(
            'Nenhum SPED desta empresa no servidor. Peça os arquivos pelo painel de créditos (Pedir à Receita) ou informe os valores manualmente.',
          )
        return { ecf, contrib, icms, perfil, avisos }
      }
      return {
        rbxConfigurado,
        empresasLocais,
        rbx,
        falhar,
        equipe,
        cnpjValido,
        cnpjMatriz,
        ibge,
        emailConfigurado,
        enviarEmail,
        registrarEnvio,
        destinatarios,
        esc,
        moldura,
        relatorioInteligencia,
        SITE,
        declaracoes,
        situacaoAtual,
      }
    })()
    if (!u.equipe(e)) return e.json(403, { erro: 'Acesso restrito à equipe técnica.' })
    const ok = u.emailConfigurado()
    return e.json(200, {
      configurado: ok,
      remetente: ok ? $app.settings().meta.senderAddress : null,
    })
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/pt/email-teste/{id}',
  (e) => {
    const u = (function () {
      // Biblioteca do Planejamento Tributário para os hooks do Skip (PocketBase 0.36).
      // Não é carregada por require em produção: pocketbase/fonte/gerar-hooks.mjs cola este arquivo dentro de cada rota de
      // api_planejamento.js. Junta: acesso à API ReceitanetBX (só leitura do SPED já importado), e-mail, declarações (ECD/ECF)
      // e a leitura da situação atual/perfil a partir do SPED. Chaves só nos secrets do Skip, nunca no navegador.

      const RBX_URL = () =>
        ($secrets.get('RECEITANETBX_URL') || 'http://127.0.0.1:8000').replace(/\/$/, '')
      const RBX_CHAVE = () => $secrets.get('RECEITANETBX_API_KEY') || ''
      /** Endereço do Skip para os links dos e-mails (secret opcional SITE_URL). */
      const SITE = () => ($secrets.get('SITE_URL') || '').replace(/\/$/, '')

      class ErroApi extends Error {
        constructor(status, mensagem) {
          super(mensagem)
          this.status = status
        }
      }

      /** GET/POST na API ReceitanetBX (somente leitura do SPED já importado; não liga o ReceitanetBX). */
      function rbx(metodo, caminho, corpo, timeout) {
        const res = $http.send({
          url: RBX_URL() + caminho,
          method: metodo,
          headers: {
            'X-API-Key': RBX_CHAVE(),
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: corpo === undefined ? '' : JSON.stringify(corpo),
          timeout: timeout || 120,
        })
        if (res.statusCode >= 400) {
          const j = res.json
          throw new ErroApi(
            res.statusCode,
            (j && typeof j.detail === 'string' && j.detail) ||
              (res.raw || '').slice(0, 300) ||
              'HTTP ' + res.statusCode,
          )
        }
        return res.json
      }

      function falhar(e, err) {
        return e.json(err && err.status ? err.status : 502, {
          erro: err && err.message ? err.message : String(err),
        })
      }

      /** Usuário logado. Onde a tabela de usuários tiver perfis (role), só Dev e Tributarista. */
      function equipe(e) {
        if (!e.auth) return false
        const papel = e.auth.getString('role')
        return !papel || papel === 'dev' || papel === 'tributarista'
      }

      /** A leitura do SPED depende dos secrets da API ReceitanetBX. */
      function rbxConfigurado() {
        return !!$secrets.get('RECEITANETBX_URL') && !!$secrets.get('RECEITANETBX_API_KEY')
      }

      /** Empresas cadastradas neste sistema (coleção empresas, importada da planilha). */
      function empresasLocais() {
        try {
          return $app.findRecordsByFilter('empresas', "cnpj != ''", 'nome', 0, 0).map((r) => ({
            cnpj: r.getString('cnpj'),
            nome: r.getString('nome') || null,
            observacao: r.getString('observacao') || null,
            situacao: r.getString('situacao') || null,
          }))
        } catch (err) {
          return []
        }
      }

      const cnpjValido = (c) => /^\d{14}$/.test(c || '')

      /** CNPJ da matriz (0001) com dígitos verificadores. */
      function cnpjMatriz(cnpj) {
        const base = cnpj.slice(0, 8) + '0001'
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
        const d1 = dv(base)
        const d2 = dv(base + d1)
        return base + d1 + d2
      }

      /** Consulta pública e gratuita do IBGE (nome do município, descrição do CNAE). */
      function ibge(caminho) {
        try {
          const res = $http.send({
            url: 'https://servicodados.ibge.gov.br/api' + caminho,
            method: 'GET',
            timeout: 10,
          })
          return res.statusCode === 200 ? res.json : null
        } catch (err) {
          return null
        }
      }

      // ------------------------------------------------------------------ e-mail (SMTP configurado no PocketBase)
      function emailConfigurado() {
        const s = $app.settings()
        return !!(s.smtp && s.smtp.enabled && s.smtp.host)
      }

      /** Registra o envio no histórico (coleção pt_envios). */
      function registrarEnvio(dest, email, relatorio, assunto, status, detalhe) {
        const r = new Record($app.findCollectionByNameOrId('pt_envios'))
        r.set('destinatario', dest || '')
        r.set('email', email || '')
        r.set('relatorio', relatorio || '')
        r.set('assunto', assunto || '')
        r.set('status', status)
        r.set('detalhe', String(detalhe || '').slice(0, 1900))
        $app.save(r)
      }

      /** Envia um e-mail e registra. Devolve true/false. */
      function enviarEmail(dest, email, relatorio, assunto, html, statusOk) {
        if (!emailConfigurado()) {
          registrarEnvio(
            dest,
            email,
            relatorio,
            assunto,
            'falhou',
            'Serviço de e-mail (SMTP) não configurado no servidor.',
          )
          return false
        }
        try {
          const meta = $app.settings().meta
          const msg = new MailerMessage({
            from: { address: meta.senderAddress, name: meta.senderName || 'C CONT Planejamento' },
            to: [{ address: email, name: dest }],
            subject: assunto,
            html: html,
          })
          $app.newMailClient().send(msg)
          registrarEnvio(dest, email, relatorio, assunto, statusOk || 'enviado', '')
          return true
        } catch (err) {
          registrarEnvio(
            dest,
            email,
            relatorio,
            assunto,
            'falhou',
            err && err.message ? err.message : String(err),
          )
          return false
        }
      }

      /** Destinatários ativos com permissão para o tipo de relatório. */
      function destinatarios(tipo) {
        const lista = $app.findRecordsByFilter(
          'pt_destinatarios',
          "ativo = true && email != ''",
          'grupo',
          0,
          0,
        )
        const saida = []
        for (const r of lista) {
          let rel = []
          try {
            rel = JSON.parse(r.getString('relatorios') || '[]')
          } catch (err) {
            rel = []
          }
          if (rel.indexOf(tipo) >= 0)
            saida.push({
              nome: r.getString('nome'),
              email: r.getString('email'),
              grupo: r.getString('grupo'),
              periodicidade: r.getString('periodicidade'),
            })
        }
        return saida
      }

      const esc = (s) =>
        String(s == null ? '' : s)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')

      /** Moldura padrão dos e-mails. */
      function moldura(titulo, corpoHtml) {
        return (
          '<div style="font-family:Arial,sans-serif;color:#132420;max-width:680px">' +
          '<div style="background:#141726;color:#fff;padding:12px 16px;border-radius:8px;border-bottom:4px solid #0e6b63"><b>C CONT · Planejamento Tributário</b></div>' +
          '<h2 style="color:#0b4f4a">' +
          esc(titulo) +
          '</h2>' +
          corpoHtml +
          '<p style="font-size:11px;color:#6b7a76;margin-top:20px">C Consulting Group — Resultados importam! Mensagem automática do sistema de planejamento tributário.</p></div>'
        )
      }

      /** Relatório mensal da inteligência adaptativa montado no servidor (para o envio automático). */
      function relatorioInteligencia(mes) {
        const lista = $app.findRecordsByFilter('pt_inteligencia', 'mes = {:mes}', 'created', 0, 0, {
          mes: mes,
        })
        let html = ''
        if (!lista.length)
          html = '<p><b>Não foram encontradas novidades relevantes neste mês.</b></p>'
        for (const r of lista) {
          let d = {}
          try {
            d = JSON.parse(r.getString('dados') || '{}')
          } catch (err) {
            d = {}
          }
          const ap = d.aprovacoes || {}
          html +=
            '<h3 style="margin-bottom:4px">' +
            esc(r.getString('nome')) +
            "</h3><table style='font-size:13px;border-collapse:collapse'>" +
            [
              ['O que há de novo', d.novidade],
              ['Fonte e fundamento', d.fonte],
              ['Beneficiados', d.beneficiados],
              ['Exemplo de cálculo', d.exemploCalculo],
              ['Grau de risco', d.risco],
              ['Alterações na IA', d.alteracoesIA],
              ['Recomendação', d.recomendacao],
              [
                'Aprovações',
                'Controladoria: ' +
                  (ap.controladoria || 'pendente') +
                  ' · Jurídico: ' +
                  (ap.juridico || 'pendente') +
                  ' · Desenvolvimento: ' +
                  (ap.desenvolvimento || 'pendente'),
              ],
              ['Situação', r.getString('situacao')],
            ]
              .map(
                (l) =>
                  "<tr><td style='padding:3px 8px;font-weight:bold;vertical-align:top'>" +
                  esc(l[0]) +
                  "</td><td style='padding:3px 8px'>" +
                  esc(l[1]) +
                  '</td></tr>',
              )
              .join('') +
            '</table>'
        }
        return html
      }

      // ------------------------------------------------------------------ declarações anuais (ECD/ECF), igual ao painel do servidor
      // Declarações anuais da empresa no servidor (ECD e ECF): o que existe por ano, para baixar, e o que a ECF informa
      // (forma de tributação, IRPJ/CSLL a pagar por período, saldo negativo e retenções sofridas do Y570).
      // Mesma lógica de pocketbase/hooks/api_declaracoes.js do Skip. Saldo negativo é só "CRÉDITO POTENCIAL".

      /** api(caminho) = GET na API ReceitanetBX devolvendo o JSON. */
      function declaracoes(api, cnpj) {
        // Valor do SPED ("1234,56") em número.
        const num = (v) => {
          const s = String(v == null ? '' : v).trim()
          if (!s) return null
          const n = parseFloat(s.replace(/\./g, '').replace(',', '.'))
          return isNaN(n) ? null : n
        }
        const linhas = (id, reg) =>
          api('/v1/sped/arquivos/' + id + '/registros/' + reg + '?limite=10000').linhas || []
        // Última transmissão por ano (o nome traz _AAAAMMDDhhmmss_; sem ele, o maior id).
        const transmissao = (nome) => (/_(\d{14})_/.exec(nome || '') || [])[1] || ''
        const porAno = (lista) => {
          const r = {}
          for (const a of lista) {
            const ano = String(a.dt_ini).slice(0, 4)
            const atual = r[ano]
            const chaveA = transmissao(a.nome) + String(a.id).padStart(12, '0')
            if (!atual || chaveA > transmissao(atual.nome) + String(atual.id).padStart(12, '0'))
              r[ano] = a
          }
          return r
        }
        const FORMA_TRIB = {
          1: 'Lucro Real',
          2: 'Lucro Real/Arbitrado',
          3: 'Lucro Presumido/Real',
          4: 'Lucro Presumido/Real/Arbitrado',
          5: 'Lucro Presumido',
          6: 'Lucro Arbitrado',
          7: 'Lucro Presumido/Arbitrado',
          8: 'Imune do IRPJ',
          9: 'Isenta do IRPJ',
        }

        /** IRPJ/CSLL "a pagar" por período (N030/P030 → N630/N670/P300/P400) e saldo negativo. */
        const apuracao = (id, regPeriodo, regIrpj, codIrpj, regCsll, codCsll) => {
          const periodos = linhas(id, regPeriodo).map((l) => ({
            linha: l.linha,
            per: l.campos[3] || '',
          }))
          const periodoDe = (linha) => {
            let p = ''
            for (const x of periodos) if (x.linha < linha) p = x.per
            return p
          }
          const saida = {}
          const ler = (reg, codigo, campo) => {
            const todas = linhas(id, reg)
            // Linha "a pagar": pelo código do leiaute; se não houver, a última cuja descrição diz "A PAGAR".
            let alvo = todas.filter((l) => String(l.campos[1]) === codigo)
            if (!alvo.length) {
              const porPeriodo = {}
              for (const l of todas)
                if (/A PAGAR|A RECOLHER/i.test(l.campos[2] || ''))
                  porPeriodo[periodoDe(l.linha)] = l
              alvo = Object.keys(porPeriodo).map((k) => porPeriodo[k])
            }
            for (const l of alvo) {
              const per = periodoDe(l.linha) || 'A00'
              const v = num(l.campos[3])
              if (v == null) continue
              const x = saida[per] || (saida[per] = { periodo: per, irpj: null, csll: null })
              x[campo] = v
            }
          }
          ler(regIrpj, codIrpj, 'irpj')
          ler(regCsll, codCsll, 'csll')
          return Object.keys(saida)
            .sort()
            .map((k) => saida[k])
        }

        const ecds = porAno(
          api('/v1/sped/arquivos?cnpj=' + cnpj + '&tipo=ECD&limite=100').arquivos || [],
        )
        const ecfs = porAno(
          api('/v1/sped/arquivos?cnpj=' + cnpj + '&tipo=ECF&limite=100').arquivos || [],
        )
        const anos = {}
        const hoje = new Date()
        for (let a = hoje.getFullYear() - 5; a < hoje.getFullYear(); a++) anos[String(a)] = true
        for (const a of Object.keys(ecds).concat(Object.keys(ecfs))) anos[a] = true
        const arquivo = (a) =>
          a
            ? { id: a.id, nome: a.nome, de: a.dt_ini, ate: a.dt_fin, importadoEm: a.importado_em }
            : null

        const lista = Object.keys(anos)
          .sort()
          .reverse()
          .map((ano) => {
            const ecf = ecfs[ano]
            let info = null
            if (ecf) {
              try {
                const r0010 = (linhas(ecf.id, '0010')[0] || {}).campos || []
                // Campos localizados pelo formato (as versões do leiaute mudam a posição).
                let iTrib = -1
                for (let i = 3; i < r0010.length; i++)
                  if (/^[1-9]$/.test(r0010[i] || '')) {
                    iTrib = i
                    break
                  }
                const formaTrib = iTrib >= 0 ? r0010[iTrib] : null
                let formaApur = null
                for (let i = iTrib + 1; iTrib >= 0 && i < r0010.length; i++)
                  if (r0010[i] === 'A' || r0010[i] === 'T') {
                    formaApur = r0010[i] === 'A' ? 'anual (estimativas mensais)' : 'trimestral'
                    break
                  }
                const presumido = formaTrib === '5' || formaTrib === '7'
                const periodos = presumido
                  ? apuracao(ecf.id, 'P030', 'P300', '15', 'P400', '')
                  : apuracao(ecf.id, 'N030', 'N630', '26', 'N670', '21')
                let retIr = 0
                let retCsll = 0
                const fontes = {}
                for (const l of linhas(ecf.id, 'Y570')) {
                  retIr += num(l.campos[6]) || 0
                  retCsll += num(l.campos[7]) || 0
                  if (l.campos[1]) fontes[l.campos[1]] = true
                }
                const negIrpj = periodos.reduce(
                  (s, p) => s + (p.irpj != null && p.irpj < 0 ? -p.irpj : 0),
                  0,
                )
                const negCsll = periodos.reduce(
                  (s, p) => s + (p.csll != null && p.csll < 0 ? -p.csll : 0),
                  0,
                )
                info = {
                  formaTributacao: formaTrib ? FORMA_TRIB[formaTrib] || formaTrib : null,
                  formaApuracao: presumido ? 'trimestral' : formaApur,
                  periodos: periodos,
                  saldoNegativo: {
                    irpj: Math.round(negIrpj * 100) / 100,
                    csll: Math.round(negCsll * 100) / 100,
                    status: negIrpj + negCsll > 0 ? 'CRÉDITO POTENCIAL' : null,
                  },
                  retencoes: {
                    ir: Math.round(retIr * 100) / 100,
                    csll: Math.round(retCsll * 100) / 100,
                    fontes: Object.keys(fontes).length,
                  },
                }
              } catch (err) {
                info = { erro: err.message || String(err) }
              }
            }
            return { ano: ano, ecd: arquivo(ecds[ano]), ecf: arquivo(ecf), ecfInfo: info }
          })
        return { cnpj: cnpj, anos: lista }
      }

      // ------------------------------------------------------------------ situação atual e perfil a partir do SPED
      // Leitura do SPED já importado na API ReceitanetBX para montar a situação tributária atual (somente leitura).
      // Posições: campos[0] = REG; campos[n] = campo n+1 do leiaute; valores com vírgula decimal.
      //   M200/M600 idx2 = VL_TOT_CRED_DESC, idx12 = VL_TOT_CONT_REC   M210 idx2 = VL_REC_BRT
      //   E110 idx12 = VL_ICMS_RECOLHER                               E520 idx7 = VL_SD_IPI
      //   Perfil: EFD-Contrib 0000 UF idx9, COD_MUN idx10, IND_ATIV idx13 · 0140 estabelecimentos · M105 idx6 VL_BC_PIS (base de crédito)
      //   M400 idx1 CST (04 = monofásico) · EFD ICMS 0000 UF idx8, COD_MUN idx10, IND_ATIV idx14 · C190 CST idx1, CFOP idx2, ALIQ idx3, VL_OPR idx4, VL_BC idx5
      //   ECF 0030 CNAE idx2, UF idx7, COD_MUN idx8 · N630 código 1 (base de cálculo do IRPJ) idx3 · M010/M500 parte B (prejuízo fiscal)

      function situacaoAtual(api, cnpj, matriz, declaracoes) {
        const num = (v) => {
          const s = String(v == null ? '' : v).trim()
          if (!s) return 0
          const n = parseFloat(s.replace(/\./g, '').replace(',', '.'))
          return isNaN(n) ? 0 : n
        }
        const r2 = (v) => Math.round(v * 100) / 100
        const linhas = (id, reg) =>
          api('/v1/sped/arquivos/' + id + '/registros/' + reg + '?limite=10000').linhas || []
        const transmissao = (nome) => (/_(\d{14})_/.exec(nome || '') || [])[1] || ''
        /** Última transmissão de cada mês, os 12 meses mais recentes. */
        const ultimos12 = (lista) => {
          const porMes = {}
          for (const a of lista) {
            const mes = String(a.dt_ini).slice(0, 7)
            const atual = porMes[mes]
            const k = transmissao(a.nome) + String(a.id).padStart(12, '0')
            if (!atual || k > transmissao(atual.nome) + String(atual.id).padStart(12, '0'))
              porMes[mes] = a
          }
          return Object.keys(porMes)
            .sort()
            .reverse()
            .slice(0, 12)
            .map((m) => porMes[m])
        }
        const listar = (doc, tipo) =>
          api('/v1/sped/arquivos?cnpj=' + doc + '&tipo=' + tipo + '&limite=200').arquivos || []
        const avisos = []
        const linhas1 = (id, reg) =>
          api('/v1/sped/arquivos/' + id + '/registros/' + reg + '?limite=1').linhas || []
        const perfil = { setores: {}, operacoes: {}, fontes: {} }
        const marca = (campo, valor, fonte) => {
          if (valor == null || valor === '' || perfil[campo] != null) return
          perfil[campo] = valor
          perfil.fontes[campo] = fonte
        }
        const marcaG = (g, campo, valor, fonte) => {
          if (valor == null || perfil[g][campo] != null) return
          perfil[g][campo] = valor
          perfil.fontes[g + '.' + campo] = fonte
        }

        // EFD-Contribuições (centralizada na matriz)
        let contrib = null
        let arqC = listar(cnpj, 'EFD-CONTRIBUICOES')
        if (!arqC.length && matriz !== cnpj) {
          arqC = listar(matriz, 'EFD-CONTRIBUICOES')
          if (arqC.length)
            avisos.push(
              'EFD-Contribuições lida da matriz (' + matriz + '): valores do CNPJ inteiro.',
            )
        }
        const mesesC = ultimos12(arqC)
        if (mesesC.length) {
          const t = {
            receitaBruta: 0,
            pis: 0,
            cofins: 0,
            creditosPis: 0,
            creditosCofins: 0,
            regime: null,
          }
          for (const a of mesesC) {
            for (const l of linhas(a.id, 'M200')) {
              t.pis += num(l.campos[12])
              t.creditosPis += num(l.campos[2])
            }
            for (const l of linhas(a.id, 'M600')) {
              t.cofins += num(l.campos[12])
              t.creditosCofins += num(l.campos[2])
            }
            for (const l of linhas(a.id, 'M210')) t.receitaBruta += num(l.campos[2])
            if (!t.regime) {
              const r = linhas(a.id, '0110')[0]
              if (r)
                t.regime =
                  r.campos[1] === '1'
                    ? 'não cumulativo'
                    : r.campos[1] === '2'
                      ? 'cumulativo'
                      : 'misto'
            }
            for (const l of linhas(a.id, 'M105'))
              t.basesCredito = (t.basesCredito || 0) + num(l.campos[6])
            if (!t.mono)
              for (const l of linhas(a.id, 'M400')) if (l.campos[1] === '04') t.mono = true
            // A100 IND_OPER 1 = serviço prestado; COD_SIT idx4 (02-05 = cancelada/denegada/inutilizada); VL_DOC idx11, VL_DESC idx13, VL_ISS idx20
            for (const l of linhas(a.id, 'A100')) {
              if (l.campos[1] !== '1' || ['02', '03', '04', '05'].indexOf(String(l.campos[4])) >= 0)
                continue
              t.servicos = true
              t.recServ = (t.recServ || 0) + num(l.campos[11]) - num(l.campos[13])
              t.iss = (t.iss || 0) + num(l.campos[20])
            }
          }
          const ult = mesesC[0]
          const r0 = (linhas1(ult.id, '0000')[0] || {}).campos || []
          const fC = 'EFD-Contribuições ' + String(ult.dt_ini).slice(0, 7)
          if (/^[A-Z]{2}$/.test(r0[9] || '')) marca('uf', r0[9], fC)
          if (/^\d{7}$/.test(r0[10] || '')) marca('codMun', r0[10], fC)
          const ativ = { 0: 'industria', 2: 'comercio', 1: 'servicos', 4: 'imobiliario' }[r0[13]]
          if (ativ) marcaG('setores', ativ, true, fC + ' (0000, indicador de atividade)')
          const estab = linhas(ult.id, '0140').length
          if (estab)
            marcaG(
              'operacoes',
              'filiais',
              estab > 1,
              fC + ' (0140: ' + estab + ' estabelecimento(s))',
            )
          if (t.basesCredito)
            marca(
              'comprasCreditaveis',
              r2((t.basesCredito * 12) / mesesC.length),
              'EFD-Contribuições M105 (bases de crédito, anualizado)',
            )
          if (t.mono) marcaG('operacoes', 'monofasicos', true, 'EFD-Contribuições M400 CST 04')
          if (t.servicos)
            marcaG(
              'setores',
              'servicos',
              true,
              'EFD-Contribuições A100 (notas de serviço emitidas)',
            )
          if (t.recServ > 0)
            marca(
              'receitaServicos',
              r2((t.recServ * 12) / mesesC.length),
              'EFD-Contribuições A100: notas de serviço emitidas (valor − desconto), anualizado',
            )
          if (t.recServ > 0 && t.iss > 0) {
            marca(
              'aliquotaIss',
              Math.round((t.iss / t.recServ) * 10000) / 100,
              'EFD-Contribuições A100: ISS das notas de serviço emitidas ÷ valor dos serviços (alíquota efetiva praticada)',
            )
            marcaG(
              'operacoes',
              'contribuinteIss',
              true,
              'EFD-Contribuições A100 (ISS nas notas emitidas)',
            )
          }
          if (t.receitaBruta)
            marca(
              'receitaAnual',
              r2((t.receitaBruta * 12) / mesesC.length),
              'EFD-Contribuições M210 (receita bruta, anualizada)',
            )
          const datas = mesesC.map((a) => String(a.dt_ini).slice(0, 10)).sort()
          contrib = {
            de: datas[0],
            ate: datas[datas.length - 1],
            meses: mesesC.length,
            receitaBruta: r2(t.receitaBruta),
            pis: r2(t.pis),
            cofins: r2(t.cofins),
            creditosPis: r2(t.creditosPis),
            creditosCofins: r2(t.creditosCofins),
            regime: t.regime,
            iss: r2(t.iss || 0),
          }
          if (mesesC.length < 12)
            avisos.push(
              'EFD-Contribuições com ' +
                mesesC.length +
                ' meses: PIS/COFINS somam só esse período (anualize se for o caso).',
            )
          if (!t.receitaBruta)
            avisos.push('Sem M210 com receita bruta: informe a receita anual no perfil.')
        }

        // EFD ICMS/IPI (por estabelecimento)
        let icms = null
        const mesesI = ultimos12(listar(cnpj, 'EFD-ICMS-IPI'))
        if (mesesI.length) {
          let vIcms = 0,
            vIpi = 0
          const cf = {
            saidas: 0,
            ind: 0,
            com: 0,
            inter: false,
            exp: false,
            imp: false,
            st: false,
            aliqBc: 0,
            bc: 0,
          }
          for (const a of mesesI) {
            for (const l of linhas(a.id, 'E110')) vIcms += num(l.campos[12])
            for (const l of linhas(a.id, 'E520')) vIpi += num(l.campos[7])
            for (const l of linhas(a.id, 'C190')) {
              const cst = String(l.campos[1] || ''),
                cfop = String(l.campos[2] || ''),
                aliq = num(l.campos[3]),
                opr = num(l.campos[4]),
                bc = num(l.campos[5])
              const d = cfop[0]
              if (!/^[1-7]\d{3}$/.test(cfop)) continue
              if ('567'.indexOf(d) >= 0) cf.saidas += opr
              if (d === '6' || d === '2') cf.inter = true
              if (d === '7') cf.exp = true
              if (d === '3') cf.imp = true
              const fim = cfop.slice(1)
              if (
                [
                  '101',
                  '103',
                  '105',
                  '109',
                  '111',
                  '113',
                  '116',
                  '118',
                  '122',
                  '124',
                  '125',
                  '401',
                  '402',
                ].indexOf(fim) >= 0
              )
                cf.ind += opr
              if (
                [
                  '102',
                  '104',
                  '106',
                  '108',
                  '110',
                  '112',
                  '114',
                  '115',
                  '117',
                  '119',
                  '120',
                  '123',
                  '403',
                  '404',
                  '405',
                ].indexOf(fim) >= 0 &&
                '56'.indexOf(d) >= 0
              )
                cf.com += opr
              if (/(10|30|60|70)$/.test(cst)) cf.st = true
              if (d === '5' && aliq > 0 && bc > 0) {
                cf.aliqBc += aliq * bc
                cf.bc += bc
              }
            }
          }
          const fI =
            'EFD ICMS/IPI ' +
            String(mesesI[mesesI.length - 1].dt_ini).slice(0, 7) +
            ' a ' +
            String(mesesI[0].dt_ini).slice(0, 7) +
            ' (C190)'
          marcaG('operacoes', 'contribuinteIcms', true, 'EFD ICMS/IPI entregue')
          if (cf.ind) marcaG('setores', 'industria', true, fI + ': CFOP de produção própria')
          if (cf.com) marcaG('setores', 'comercio', true, fI + ': CFOP de revenda')
          marcaG('operacoes', 'interestadual', cf.inter, fI)
          marcaG('operacoes', 'exporta', cf.exp, fI)
          marcaG('operacoes', 'importa', cf.imp, fI)
          marcaG('operacoes', 'substituicaoTributaria', cf.st, fI + ' (CST 10/30/60/70)')
          if (cf.bc)
            marca(
              'aliquotaIcms',
              Math.round((cf.aliqBc / cf.bc) * 100) / 100,
              fI + ': alíquota média ponderada das saídas internas (pode refletir redução de base)',
            )
          if (cf.saidas)
            marca(
              'receitaAnual',
              r2((cf.saidas * 12) / mesesI.length),
              fI + ': saídas, anualizadas',
            )
          const i0 = (linhas1(mesesI[0].id, '0000')[0] || {}).campos || []
          if (/^[A-Z]{2}$/.test(i0[8] || '')) marca('uf', i0[8], 'EFD ICMS/IPI 0000')
          if (/^\d{7}$/.test(i0[10] || '')) marca('codMun', i0[10], 'EFD ICMS/IPI 0000')
          if (i0[14] === '0')
            marcaG(
              'operacoes',
              'contribuinteIpi',
              true,
              'EFD ICMS/IPI 0000 (industrial ou equiparado)',
            )
          if (vIpi > 0)
            marcaG('operacoes', 'contribuinteIpi', true, 'EFD ICMS/IPI E520 (IPI a recolher)')
          const datas = mesesI.map((a) => String(a.dt_ini).slice(0, 10)).sort()
          icms = {
            de: datas[0],
            ate: datas[datas.length - 1],
            meses: mesesI.length,
            icms: r2(vIcms),
            ipi: r2(vIpi),
            estabelecimentos: 1,
          }
          avisos.push(
            'ICMS/IPI apenas deste estabelecimento; ICMS-ST (E210) e DIFAL não incluídos.',
          )
          if (mesesI.length < 12) avisos.push('EFD ICMS/IPI com ' + mesesI.length + ' meses.')
        }

        // ECF mais recente (forma de tributação e IRPJ/CSLL a pagar)
        let ecf = null
        try {
          const decl = declaracoes(api, cnpj)
          const ultimo = (decl.anos || []).find((a) => a.ecf && a.ecfInfo && !a.ecfInfo.erro)
          if (ultimo) {
            const info = ultimo.ecfInfo
            let irpj = 0,
              csll = 0,
              temIr = false,
              temCs = false
            for (const p of info.periodos || []) {
              if (p.irpj != null && p.irpj > 0) {
                irpj += p.irpj
                temIr = true
              }
              if (p.csll != null && p.csll > 0) {
                csll += p.csll
                temCs = true
              }
            }
            ecf = {
              ano: ultimo.ano,
              formaTributacao: info.formaTributacao,
              formaApuracao: info.formaApuracao,
              irpj: temIr ? r2(irpj) : null,
              csll: temCs ? r2(csll) : null,
              arquivo: ultimo.ecf.nome || String(ultimo.ecf.id),
            }
            if (
              /Real/.test(info.formaTributacao || '') &&
              info.formaApuracao &&
              /anual/.test(info.formaApuracao)
            )
              avisos.push(
                'Lucro Real anual: o valor "a pagar" da ECF já desconta as estimativas mensais pagas. Confira o IRPJ/CSLL devido total (N630/N670) antes de usar.',
              )
            if (/Presumido/.test(info.formaTributacao || '') && !temCs)
              avisos.push(
                'ECF do Presumido sem linha de CSLL a pagar identificada: informe a CSLL manualmente.',
              )
            const fE = 'ECF ' + ultimo.ano
            const id = ultimo.ecf.id
            const c30 = (linhas1(id, '0030')[0] || {}).campos || []
            if (/^\d{7}$/.test(c30[2] || '')) marca('cnae', c30[2], fE + ' (0030)')
            if (/^[A-Z]{2}$/.test(c30[7] || '')) marca('uf', c30[7], fE + ' (0030)')
            if (/^\d{7}$/.test(c30[8] || '')) marca('codMun', c30[8], fE + ' (0030)')
            const f = info.formaTributacao || ''
            const reg =
              /Real/.test(f) && !/Presumido/.test(f)
                ? info.formaApuracao === 'trimestral'
                  ? 'real-trimestral'
                  : 'real-anual'
                : /Presumido/.test(f)
                  ? 'presumido'
                  : /Arbitrado/.test(f)
                    ? 'arbitrado'
                    : /Imune|Isenta/.test(f)
                      ? 'imune'
                      : null
            marca('regime', reg, fE + ' (0010: ' + f + ')')
            if (reg && reg.indexOf('real') === 0) {
              let base = 0,
                achou = false
              for (const l of linhas(id, 'N630'))
                if (String(l.campos[1]) === '1' && /BASE DE C.LCULO/i.test(l.campos[2] || '')) {
                  base += num(l.campos[3])
                  achou = true
                }
              if (achou)
                marca(
                  'lucroContabil',
                  r2(base),
                  fE +
                    ' (N630: base de cálculo do IRPJ somada nos períodos — lucro real após adições/exclusões; negativo = prejuízo)',
                )
              const contas = {}
              for (const l of linhas(id, 'M010'))
                if (
                  l.campos[6] === 'I' &&
                  (/PREJU/i.test(l.campos[2] || '') || /^1\.00[01]$/.test(l.campos[4] || ''))
                )
                  contas[l.campos[1]] = true
              const saldo = {}
              for (const l of linhas(id, 'M500'))
                if (contas[l.campos[1]] && l.campos[2] === 'I')
                  saldo[l.campos[1]] = (l.campos[10] === 'D' ? 1 : -1) * num(l.campos[9])
              const prej = Object.keys(saldo).reduce((a, k) => a + Math.max(saldo[k], 0), 0)
              if (prej > 0)
                marca(
                  'prejuizoFiscal',
                  r2(prej),
                  fE +
                    ' (e-Lalur parte B, M010/M500: saldo final de prejuízo fiscal do IRPJ — conferir)',
                )
            }
          }
        } catch (e) {
          avisos.push('ECF: ' + (e && e.message ? e.message : String(e)))
        }
        if (!ecf && !contrib && !icms)
          avisos.push(
            'Nenhum SPED desta empresa no servidor. Peça os arquivos pelo painel de créditos (Pedir à Receita) ou informe os valores manualmente.',
          )
        return { ecf, contrib, icms, perfil, avisos }
      }
      return {
        rbxConfigurado,
        empresasLocais,
        rbx,
        falhar,
        equipe,
        cnpjValido,
        cnpjMatriz,
        ibge,
        emailConfigurado,
        enviarEmail,
        registrarEnvio,
        destinatarios,
        esc,
        moldura,
        relatorioInteligencia,
        SITE,
        declaracoes,
        situacaoAtual,
      }
    })()
    if (!u.equipe(e)) return e.json(403, { erro: 'Acesso restrito à equipe técnica.' })
    let d
    try {
      d = $app.findRecordById('pt_destinatarios', e.request.pathValue('id'))
    } catch (err) {
      return e.json(404, { erro: 'Destinatário não encontrado.' })
    }
    const email = d.getString('email')
    if (!email) return e.json(422, { erro: 'Destinatário sem e-mail.' })
    if (!u.emailConfigurado()) {
      u.registrarEnvio(
        d.getString('nome'),
        email,
        'teste',
        'Teste de entrega',
        'falhou',
        'Serviço de e-mail (SMTP) não configurado no servidor.',
      )
      return e.json(503, { erro: 'Serviço de e-mail (SMTP) ainda não configurado no servidor.' })
    }
    const ok = u.enviarEmail(
      d.getString('nome'),
      email,
      'teste',
      'Teste de entrega — Planejamento Tributário C CONT',
      u.moldura(
        'Teste de entrega',
        '<p>Mensagem de teste da Gestão de Destinatários. Se você recebeu, o envio está funcionando.</p>',
      ),
      'teste',
    )
    return ok ? e.json(200, { ok: true }) : e.json(502, { erro: 'Falha no envio (ver histórico).' })
  },
  $apis.requireAuth(),
)

/** Aviso de planejamento: só o link autenticado (conteúdo do cliente é sigiloso). */
routerAdd(
  'POST',
  '/backend/v1/pt/enviar-planejamento/{id}',
  (e) => {
    const u = (function () {
      // Biblioteca do Planejamento Tributário para os hooks do Skip (PocketBase 0.36).
      // Não é carregada por require em produção: pocketbase/fonte/gerar-hooks.mjs cola este arquivo dentro de cada rota de
      // api_planejamento.js. Junta: acesso à API ReceitanetBX (só leitura do SPED já importado), e-mail, declarações (ECD/ECF)
      // e a leitura da situação atual/perfil a partir do SPED. Chaves só nos secrets do Skip, nunca no navegador.

      const RBX_URL = () =>
        ($secrets.get('RECEITANETBX_URL') || 'http://127.0.0.1:8000').replace(/\/$/, '')
      const RBX_CHAVE = () => $secrets.get('RECEITANETBX_API_KEY') || ''
      /** Endereço do Skip para os links dos e-mails (secret opcional SITE_URL). */
      const SITE = () => ($secrets.get('SITE_URL') || '').replace(/\/$/, '')

      class ErroApi extends Error {
        constructor(status, mensagem) {
          super(mensagem)
          this.status = status
        }
      }

      /** GET/POST na API ReceitanetBX (somente leitura do SPED já importado; não liga o ReceitanetBX). */
      function rbx(metodo, caminho, corpo, timeout) {
        const res = $http.send({
          url: RBX_URL() + caminho,
          method: metodo,
          headers: {
            'X-API-Key': RBX_CHAVE(),
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: corpo === undefined ? '' : JSON.stringify(corpo),
          timeout: timeout || 120,
        })
        if (res.statusCode >= 400) {
          const j = res.json
          throw new ErroApi(
            res.statusCode,
            (j && typeof j.detail === 'string' && j.detail) ||
              (res.raw || '').slice(0, 300) ||
              'HTTP ' + res.statusCode,
          )
        }
        return res.json
      }

      function falhar(e, err) {
        return e.json(err && err.status ? err.status : 502, {
          erro: err && err.message ? err.message : String(err),
        })
      }

      /** Usuário logado. Onde a tabela de usuários tiver perfis (role), só Dev e Tributarista. */
      function equipe(e) {
        if (!e.auth) return false
        const papel = e.auth.getString('role')
        return !papel || papel === 'dev' || papel === 'tributarista'
      }

      /** A leitura do SPED depende dos secrets da API ReceitanetBX. */
      function rbxConfigurado() {
        return !!$secrets.get('RECEITANETBX_URL') && !!$secrets.get('RECEITANETBX_API_KEY')
      }

      /** Empresas cadastradas neste sistema (coleção empresas, importada da planilha). */
      function empresasLocais() {
        try {
          return $app.findRecordsByFilter('empresas', "cnpj != ''", 'nome', 0, 0).map((r) => ({
            cnpj: r.getString('cnpj'),
            nome: r.getString('nome') || null,
            observacao: r.getString('observacao') || null,
            situacao: r.getString('situacao') || null,
          }))
        } catch (err) {
          return []
        }
      }

      const cnpjValido = (c) => /^\d{14}$/.test(c || '')

      /** CNPJ da matriz (0001) com dígitos verificadores. */
      function cnpjMatriz(cnpj) {
        const base = cnpj.slice(0, 8) + '0001'
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
        const d1 = dv(base)
        const d2 = dv(base + d1)
        return base + d1 + d2
      }

      /** Consulta pública e gratuita do IBGE (nome do município, descrição do CNAE). */
      function ibge(caminho) {
        try {
          const res = $http.send({
            url: 'https://servicodados.ibge.gov.br/api' + caminho,
            method: 'GET',
            timeout: 10,
          })
          return res.statusCode === 200 ? res.json : null
        } catch (err) {
          return null
        }
      }

      // ------------------------------------------------------------------ e-mail (SMTP configurado no PocketBase)
      function emailConfigurado() {
        const s = $app.settings()
        return !!(s.smtp && s.smtp.enabled && s.smtp.host)
      }

      /** Registra o envio no histórico (coleção pt_envios). */
      function registrarEnvio(dest, email, relatorio, assunto, status, detalhe) {
        const r = new Record($app.findCollectionByNameOrId('pt_envios'))
        r.set('destinatario', dest || '')
        r.set('email', email || '')
        r.set('relatorio', relatorio || '')
        r.set('assunto', assunto || '')
        r.set('status', status)
        r.set('detalhe', String(detalhe || '').slice(0, 1900))
        $app.save(r)
      }

      /** Envia um e-mail e registra. Devolve true/false. */
      function enviarEmail(dest, email, relatorio, assunto, html, statusOk) {
        if (!emailConfigurado()) {
          registrarEnvio(
            dest,
            email,
            relatorio,
            assunto,
            'falhou',
            'Serviço de e-mail (SMTP) não configurado no servidor.',
          )
          return false
        }
        try {
          const meta = $app.settings().meta
          const msg = new MailerMessage({
            from: { address: meta.senderAddress, name: meta.senderName || 'C CONT Planejamento' },
            to: [{ address: email, name: dest }],
            subject: assunto,
            html: html,
          })
          $app.newMailClient().send(msg)
          registrarEnvio(dest, email, relatorio, assunto, statusOk || 'enviado', '')
          return true
        } catch (err) {
          registrarEnvio(
            dest,
            email,
            relatorio,
            assunto,
            'falhou',
            err && err.message ? err.message : String(err),
          )
          return false
        }
      }

      /** Destinatários ativos com permissão para o tipo de relatório. */
      function destinatarios(tipo) {
        const lista = $app.findRecordsByFilter(
          'pt_destinatarios',
          "ativo = true && email != ''",
          'grupo',
          0,
          0,
        )
        const saida = []
        for (const r of lista) {
          let rel = []
          try {
            rel = JSON.parse(r.getString('relatorios') || '[]')
          } catch (err) {
            rel = []
          }
          if (rel.indexOf(tipo) >= 0)
            saida.push({
              nome: r.getString('nome'),
              email: r.getString('email'),
              grupo: r.getString('grupo'),
              periodicidade: r.getString('periodicidade'),
            })
        }
        return saida
      }

      const esc = (s) =>
        String(s == null ? '' : s)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')

      /** Moldura padrão dos e-mails. */
      function moldura(titulo, corpoHtml) {
        return (
          '<div style="font-family:Arial,sans-serif;color:#132420;max-width:680px">' +
          '<div style="background:#141726;color:#fff;padding:12px 16px;border-radius:8px;border-bottom:4px solid #0e6b63"><b>C CONT · Planejamento Tributário</b></div>' +
          '<h2 style="color:#0b4f4a">' +
          esc(titulo) +
          '</h2>' +
          corpoHtml +
          '<p style="font-size:11px;color:#6b7a76;margin-top:20px">C Consulting Group — Resultados importam! Mensagem automática do sistema de planejamento tributário.</p></div>'
        )
      }

      /** Relatório mensal da inteligência adaptativa montado no servidor (para o envio automático). */
      function relatorioInteligencia(mes) {
        const lista = $app.findRecordsByFilter('pt_inteligencia', 'mes = {:mes}', 'created', 0, 0, {
          mes: mes,
        })
        let html = ''
        if (!lista.length)
          html = '<p><b>Não foram encontradas novidades relevantes neste mês.</b></p>'
        for (const r of lista) {
          let d = {}
          try {
            d = JSON.parse(r.getString('dados') || '{}')
          } catch (err) {
            d = {}
          }
          const ap = d.aprovacoes || {}
          html +=
            '<h3 style="margin-bottom:4px">' +
            esc(r.getString('nome')) +
            "</h3><table style='font-size:13px;border-collapse:collapse'>" +
            [
              ['O que há de novo', d.novidade],
              ['Fonte e fundamento', d.fonte],
              ['Beneficiados', d.beneficiados],
              ['Exemplo de cálculo', d.exemploCalculo],
              ['Grau de risco', d.risco],
              ['Alterações na IA', d.alteracoesIA],
              ['Recomendação', d.recomendacao],
              [
                'Aprovações',
                'Controladoria: ' +
                  (ap.controladoria || 'pendente') +
                  ' · Jurídico: ' +
                  (ap.juridico || 'pendente') +
                  ' · Desenvolvimento: ' +
                  (ap.desenvolvimento || 'pendente'),
              ],
              ['Situação', r.getString('situacao')],
            ]
              .map(
                (l) =>
                  "<tr><td style='padding:3px 8px;font-weight:bold;vertical-align:top'>" +
                  esc(l[0]) +
                  "</td><td style='padding:3px 8px'>" +
                  esc(l[1]) +
                  '</td></tr>',
              )
              .join('') +
            '</table>'
        }
        return html
      }

      // ------------------------------------------------------------------ declarações anuais (ECD/ECF), igual ao painel do servidor
      // Declarações anuais da empresa no servidor (ECD e ECF): o que existe por ano, para baixar, e o que a ECF informa
      // (forma de tributação, IRPJ/CSLL a pagar por período, saldo negativo e retenções sofridas do Y570).
      // Mesma lógica de pocketbase/hooks/api_declaracoes.js do Skip. Saldo negativo é só "CRÉDITO POTENCIAL".

      /** api(caminho) = GET na API ReceitanetBX devolvendo o JSON. */
      function declaracoes(api, cnpj) {
        // Valor do SPED ("1234,56") em número.
        const num = (v) => {
          const s = String(v == null ? '' : v).trim()
          if (!s) return null
          const n = parseFloat(s.replace(/\./g, '').replace(',', '.'))
          return isNaN(n) ? null : n
        }
        const linhas = (id, reg) =>
          api('/v1/sped/arquivos/' + id + '/registros/' + reg + '?limite=10000').linhas || []
        // Última transmissão por ano (o nome traz _AAAAMMDDhhmmss_; sem ele, o maior id).
        const transmissao = (nome) => (/_(\d{14})_/.exec(nome || '') || [])[1] || ''
        const porAno = (lista) => {
          const r = {}
          for (const a of lista) {
            const ano = String(a.dt_ini).slice(0, 4)
            const atual = r[ano]
            const chaveA = transmissao(a.nome) + String(a.id).padStart(12, '0')
            if (!atual || chaveA > transmissao(atual.nome) + String(atual.id).padStart(12, '0'))
              r[ano] = a
          }
          return r
        }
        const FORMA_TRIB = {
          1: 'Lucro Real',
          2: 'Lucro Real/Arbitrado',
          3: 'Lucro Presumido/Real',
          4: 'Lucro Presumido/Real/Arbitrado',
          5: 'Lucro Presumido',
          6: 'Lucro Arbitrado',
          7: 'Lucro Presumido/Arbitrado',
          8: 'Imune do IRPJ',
          9: 'Isenta do IRPJ',
        }

        /** IRPJ/CSLL "a pagar" por período (N030/P030 → N630/N670/P300/P400) e saldo negativo. */
        const apuracao = (id, regPeriodo, regIrpj, codIrpj, regCsll, codCsll) => {
          const periodos = linhas(id, regPeriodo).map((l) => ({
            linha: l.linha,
            per: l.campos[3] || '',
          }))
          const periodoDe = (linha) => {
            let p = ''
            for (const x of periodos) if (x.linha < linha) p = x.per
            return p
          }
          const saida = {}
          const ler = (reg, codigo, campo) => {
            const todas = linhas(id, reg)
            // Linha "a pagar": pelo código do leiaute; se não houver, a última cuja descrição diz "A PAGAR".
            let alvo = todas.filter((l) => String(l.campos[1]) === codigo)
            if (!alvo.length) {
              const porPeriodo = {}
              for (const l of todas)
                if (/A PAGAR|A RECOLHER/i.test(l.campos[2] || ''))
                  porPeriodo[periodoDe(l.linha)] = l
              alvo = Object.keys(porPeriodo).map((k) => porPeriodo[k])
            }
            for (const l of alvo) {
              const per = periodoDe(l.linha) || 'A00'
              const v = num(l.campos[3])
              if (v == null) continue
              const x = saida[per] || (saida[per] = { periodo: per, irpj: null, csll: null })
              x[campo] = v
            }
          }
          ler(regIrpj, codIrpj, 'irpj')
          ler(regCsll, codCsll, 'csll')
          return Object.keys(saida)
            .sort()
            .map((k) => saida[k])
        }

        const ecds = porAno(
          api('/v1/sped/arquivos?cnpj=' + cnpj + '&tipo=ECD&limite=100').arquivos || [],
        )
        const ecfs = porAno(
          api('/v1/sped/arquivos?cnpj=' + cnpj + '&tipo=ECF&limite=100').arquivos || [],
        )
        const anos = {}
        const hoje = new Date()
        for (let a = hoje.getFullYear() - 5; a < hoje.getFullYear(); a++) anos[String(a)] = true
        for (const a of Object.keys(ecds).concat(Object.keys(ecfs))) anos[a] = true
        const arquivo = (a) =>
          a
            ? { id: a.id, nome: a.nome, de: a.dt_ini, ate: a.dt_fin, importadoEm: a.importado_em }
            : null

        const lista = Object.keys(anos)
          .sort()
          .reverse()
          .map((ano) => {
            const ecf = ecfs[ano]
            let info = null
            if (ecf) {
              try {
                const r0010 = (linhas(ecf.id, '0010')[0] || {}).campos || []
                // Campos localizados pelo formato (as versões do leiaute mudam a posição).
                let iTrib = -1
                for (let i = 3; i < r0010.length; i++)
                  if (/^[1-9]$/.test(r0010[i] || '')) {
                    iTrib = i
                    break
                  }
                const formaTrib = iTrib >= 0 ? r0010[iTrib] : null
                let formaApur = null
                for (let i = iTrib + 1; iTrib >= 0 && i < r0010.length; i++)
                  if (r0010[i] === 'A' || r0010[i] === 'T') {
                    formaApur = r0010[i] === 'A' ? 'anual (estimativas mensais)' : 'trimestral'
                    break
                  }
                const presumido = formaTrib === '5' || formaTrib === '7'
                const periodos = presumido
                  ? apuracao(ecf.id, 'P030', 'P300', '15', 'P400', '')
                  : apuracao(ecf.id, 'N030', 'N630', '26', 'N670', '21')
                let retIr = 0
                let retCsll = 0
                const fontes = {}
                for (const l of linhas(ecf.id, 'Y570')) {
                  retIr += num(l.campos[6]) || 0
                  retCsll += num(l.campos[7]) || 0
                  if (l.campos[1]) fontes[l.campos[1]] = true
                }
                const negIrpj = periodos.reduce(
                  (s, p) => s + (p.irpj != null && p.irpj < 0 ? -p.irpj : 0),
                  0,
                )
                const negCsll = periodos.reduce(
                  (s, p) => s + (p.csll != null && p.csll < 0 ? -p.csll : 0),
                  0,
                )
                info = {
                  formaTributacao: formaTrib ? FORMA_TRIB[formaTrib] || formaTrib : null,
                  formaApuracao: presumido ? 'trimestral' : formaApur,
                  periodos: periodos,
                  saldoNegativo: {
                    irpj: Math.round(negIrpj * 100) / 100,
                    csll: Math.round(negCsll * 100) / 100,
                    status: negIrpj + negCsll > 0 ? 'CRÉDITO POTENCIAL' : null,
                  },
                  retencoes: {
                    ir: Math.round(retIr * 100) / 100,
                    csll: Math.round(retCsll * 100) / 100,
                    fontes: Object.keys(fontes).length,
                  },
                }
              } catch (err) {
                info = { erro: err.message || String(err) }
              }
            }
            return { ano: ano, ecd: arquivo(ecds[ano]), ecf: arquivo(ecf), ecfInfo: info }
          })
        return { cnpj: cnpj, anos: lista }
      }

      // ------------------------------------------------------------------ situação atual e perfil a partir do SPED
      // Leitura do SPED já importado na API ReceitanetBX para montar a situação tributária atual (somente leitura).
      // Posições: campos[0] = REG; campos[n] = campo n+1 do leiaute; valores com vírgula decimal.
      //   M200/M600 idx2 = VL_TOT_CRED_DESC, idx12 = VL_TOT_CONT_REC   M210 idx2 = VL_REC_BRT
      //   E110 idx12 = VL_ICMS_RECOLHER                               E520 idx7 = VL_SD_IPI
      //   Perfil: EFD-Contrib 0000 UF idx9, COD_MUN idx10, IND_ATIV idx13 · 0140 estabelecimentos · M105 idx6 VL_BC_PIS (base de crédito)
      //   M400 idx1 CST (04 = monofásico) · EFD ICMS 0000 UF idx8, COD_MUN idx10, IND_ATIV idx14 · C190 CST idx1, CFOP idx2, ALIQ idx3, VL_OPR idx4, VL_BC idx5
      //   ECF 0030 CNAE idx2, UF idx7, COD_MUN idx8 · N630 código 1 (base de cálculo do IRPJ) idx3 · M010/M500 parte B (prejuízo fiscal)

      function situacaoAtual(api, cnpj, matriz, declaracoes) {
        const num = (v) => {
          const s = String(v == null ? '' : v).trim()
          if (!s) return 0
          const n = parseFloat(s.replace(/\./g, '').replace(',', '.'))
          return isNaN(n) ? 0 : n
        }
        const r2 = (v) => Math.round(v * 100) / 100
        const linhas = (id, reg) =>
          api('/v1/sped/arquivos/' + id + '/registros/' + reg + '?limite=10000').linhas || []
        const transmissao = (nome) => (/_(\d{14})_/.exec(nome || '') || [])[1] || ''
        /** Última transmissão de cada mês, os 12 meses mais recentes. */
        const ultimos12 = (lista) => {
          const porMes = {}
          for (const a of lista) {
            const mes = String(a.dt_ini).slice(0, 7)
            const atual = porMes[mes]
            const k = transmissao(a.nome) + String(a.id).padStart(12, '0')
            if (!atual || k > transmissao(atual.nome) + String(atual.id).padStart(12, '0'))
              porMes[mes] = a
          }
          return Object.keys(porMes)
            .sort()
            .reverse()
            .slice(0, 12)
            .map((m) => porMes[m])
        }
        const listar = (doc, tipo) =>
          api('/v1/sped/arquivos?cnpj=' + doc + '&tipo=' + tipo + '&limite=200').arquivos || []
        const avisos = []
        const linhas1 = (id, reg) =>
          api('/v1/sped/arquivos/' + id + '/registros/' + reg + '?limite=1').linhas || []
        const perfil = { setores: {}, operacoes: {}, fontes: {} }
        const marca = (campo, valor, fonte) => {
          if (valor == null || valor === '' || perfil[campo] != null) return
          perfil[campo] = valor
          perfil.fontes[campo] = fonte
        }
        const marcaG = (g, campo, valor, fonte) => {
          if (valor == null || perfil[g][campo] != null) return
          perfil[g][campo] = valor
          perfil.fontes[g + '.' + campo] = fonte
        }

        // EFD-Contribuições (centralizada na matriz)
        let contrib = null
        let arqC = listar(cnpj, 'EFD-CONTRIBUICOES')
        if (!arqC.length && matriz !== cnpj) {
          arqC = listar(matriz, 'EFD-CONTRIBUICOES')
          if (arqC.length)
            avisos.push(
              'EFD-Contribuições lida da matriz (' + matriz + '): valores do CNPJ inteiro.',
            )
        }
        const mesesC = ultimos12(arqC)
        if (mesesC.length) {
          const t = {
            receitaBruta: 0,
            pis: 0,
            cofins: 0,
            creditosPis: 0,
            creditosCofins: 0,
            regime: null,
          }
          for (const a of mesesC) {
            for (const l of linhas(a.id, 'M200')) {
              t.pis += num(l.campos[12])
              t.creditosPis += num(l.campos[2])
            }
            for (const l of linhas(a.id, 'M600')) {
              t.cofins += num(l.campos[12])
              t.creditosCofins += num(l.campos[2])
            }
            for (const l of linhas(a.id, 'M210')) t.receitaBruta += num(l.campos[2])
            if (!t.regime) {
              const r = linhas(a.id, '0110')[0]
              if (r)
                t.regime =
                  r.campos[1] === '1'
                    ? 'não cumulativo'
                    : r.campos[1] === '2'
                      ? 'cumulativo'
                      : 'misto'
            }
            for (const l of linhas(a.id, 'M105'))
              t.basesCredito = (t.basesCredito || 0) + num(l.campos[6])
            if (!t.mono)
              for (const l of linhas(a.id, 'M400')) if (l.campos[1] === '04') t.mono = true
            // A100 IND_OPER 1 = serviço prestado; COD_SIT idx4 (02-05 = cancelada/denegada/inutilizada); VL_DOC idx11, VL_DESC idx13, VL_ISS idx20
            for (const l of linhas(a.id, 'A100')) {
              if (l.campos[1] !== '1' || ['02', '03', '04', '05'].indexOf(String(l.campos[4])) >= 0)
                continue
              t.servicos = true
              t.recServ = (t.recServ || 0) + num(l.campos[11]) - num(l.campos[13])
              t.iss = (t.iss || 0) + num(l.campos[20])
            }
          }
          const ult = mesesC[0]
          const r0 = (linhas1(ult.id, '0000')[0] || {}).campos || []
          const fC = 'EFD-Contribuições ' + String(ult.dt_ini).slice(0, 7)
          if (/^[A-Z]{2}$/.test(r0[9] || '')) marca('uf', r0[9], fC)
          if (/^\d{7}$/.test(r0[10] || '')) marca('codMun', r0[10], fC)
          const ativ = { 0: 'industria', 2: 'comercio', 1: 'servicos', 4: 'imobiliario' }[r0[13]]
          if (ativ) marcaG('setores', ativ, true, fC + ' (0000, indicador de atividade)')
          const estab = linhas(ult.id, '0140').length
          if (estab)
            marcaG(
              'operacoes',
              'filiais',
              estab > 1,
              fC + ' (0140: ' + estab + ' estabelecimento(s))',
            )
          if (t.basesCredito)
            marca(
              'comprasCreditaveis',
              r2((t.basesCredito * 12) / mesesC.length),
              'EFD-Contribuições M105 (bases de crédito, anualizado)',
            )
          if (t.mono) marcaG('operacoes', 'monofasicos', true, 'EFD-Contribuições M400 CST 04')
          if (t.servicos)
            marcaG(
              'setores',
              'servicos',
              true,
              'EFD-Contribuições A100 (notas de serviço emitidas)',
            )
          if (t.recServ > 0)
            marca(
              'receitaServicos',
              r2((t.recServ * 12) / mesesC.length),
              'EFD-Contribuições A100: notas de serviço emitidas (valor − desconto), anualizado',
            )
          if (t.recServ > 0 && t.iss > 0) {
            marca(
              'aliquotaIss',
              Math.round((t.iss / t.recServ) * 10000) / 100,
              'EFD-Contribuições A100: ISS das notas de serviço emitidas ÷ valor dos serviços (alíquota efetiva praticada)',
            )
            marcaG(
              'operacoes',
              'contribuinteIss',
              true,
              'EFD-Contribuições A100 (ISS nas notas emitidas)',
            )
          }
          if (t.receitaBruta)
            marca(
              'receitaAnual',
              r2((t.receitaBruta * 12) / mesesC.length),
              'EFD-Contribuições M210 (receita bruta, anualizada)',
            )
          const datas = mesesC.map((a) => String(a.dt_ini).slice(0, 10)).sort()
          contrib = {
            de: datas[0],
            ate: datas[datas.length - 1],
            meses: mesesC.length,
            receitaBruta: r2(t.receitaBruta),
            pis: r2(t.pis),
            cofins: r2(t.cofins),
            creditosPis: r2(t.creditosPis),
            creditosCofins: r2(t.creditosCofins),
            regime: t.regime,
            iss: r2(t.iss || 0),
          }
          if (mesesC.length < 12)
            avisos.push(
              'EFD-Contribuições com ' +
                mesesC.length +
                ' meses: PIS/COFINS somam só esse período (anualize se for o caso).',
            )
          if (!t.receitaBruta)
            avisos.push('Sem M210 com receita bruta: informe a receita anual no perfil.')
        }

        // EFD ICMS/IPI (por estabelecimento)
        let icms = null
        const mesesI = ultimos12(listar(cnpj, 'EFD-ICMS-IPI'))
        if (mesesI.length) {
          let vIcms = 0,
            vIpi = 0
          const cf = {
            saidas: 0,
            ind: 0,
            com: 0,
            inter: false,
            exp: false,
            imp: false,
            st: false,
            aliqBc: 0,
            bc: 0,
          }
          for (const a of mesesI) {
            for (const l of linhas(a.id, 'E110')) vIcms += num(l.campos[12])
            for (const l of linhas(a.id, 'E520')) vIpi += num(l.campos[7])
            for (const l of linhas(a.id, 'C190')) {
              const cst = String(l.campos[1] || ''),
                cfop = String(l.campos[2] || ''),
                aliq = num(l.campos[3]),
                opr = num(l.campos[4]),
                bc = num(l.campos[5])
              const d = cfop[0]
              if (!/^[1-7]\d{3}$/.test(cfop)) continue
              if ('567'.indexOf(d) >= 0) cf.saidas += opr
              if (d === '6' || d === '2') cf.inter = true
              if (d === '7') cf.exp = true
              if (d === '3') cf.imp = true
              const fim = cfop.slice(1)
              if (
                [
                  '101',
                  '103',
                  '105',
                  '109',
                  '111',
                  '113',
                  '116',
                  '118',
                  '122',
                  '124',
                  '125',
                  '401',
                  '402',
                ].indexOf(fim) >= 0
              )
                cf.ind += opr
              if (
                [
                  '102',
                  '104',
                  '106',
                  '108',
                  '110',
                  '112',
                  '114',
                  '115',
                  '117',
                  '119',
                  '120',
                  '123',
                  '403',
                  '404',
                  '405',
                ].indexOf(fim) >= 0 &&
                '56'.indexOf(d) >= 0
              )
                cf.com += opr
              if (/(10|30|60|70)$/.test(cst)) cf.st = true
              if (d === '5' && aliq > 0 && bc > 0) {
                cf.aliqBc += aliq * bc
                cf.bc += bc
              }
            }
          }
          const fI =
            'EFD ICMS/IPI ' +
            String(mesesI[mesesI.length - 1].dt_ini).slice(0, 7) +
            ' a ' +
            String(mesesI[0].dt_ini).slice(0, 7) +
            ' (C190)'
          marcaG('operacoes', 'contribuinteIcms', true, 'EFD ICMS/IPI entregue')
          if (cf.ind) marcaG('setores', 'industria', true, fI + ': CFOP de produção própria')
          if (cf.com) marcaG('setores', 'comercio', true, fI + ': CFOP de revenda')
          marcaG('operacoes', 'interestadual', cf.inter, fI)
          marcaG('operacoes', 'exporta', cf.exp, fI)
          marcaG('operacoes', 'importa', cf.imp, fI)
          marcaG('operacoes', 'substituicaoTributaria', cf.st, fI + ' (CST 10/30/60/70)')
          if (cf.bc)
            marca(
              'aliquotaIcms',
              Math.round((cf.aliqBc / cf.bc) * 100) / 100,
              fI + ': alíquota média ponderada das saídas internas (pode refletir redução de base)',
            )
          if (cf.saidas)
            marca(
              'receitaAnual',
              r2((cf.saidas * 12) / mesesI.length),
              fI + ': saídas, anualizadas',
            )
          const i0 = (linhas1(mesesI[0].id, '0000')[0] || {}).campos || []
          if (/^[A-Z]{2}$/.test(i0[8] || '')) marca('uf', i0[8], 'EFD ICMS/IPI 0000')
          if (/^\d{7}$/.test(i0[10] || '')) marca('codMun', i0[10], 'EFD ICMS/IPI 0000')
          if (i0[14] === '0')
            marcaG(
              'operacoes',
              'contribuinteIpi',
              true,
              'EFD ICMS/IPI 0000 (industrial ou equiparado)',
            )
          if (vIpi > 0)
            marcaG('operacoes', 'contribuinteIpi', true, 'EFD ICMS/IPI E520 (IPI a recolher)')
          const datas = mesesI.map((a) => String(a.dt_ini).slice(0, 10)).sort()
          icms = {
            de: datas[0],
            ate: datas[datas.length - 1],
            meses: mesesI.length,
            icms: r2(vIcms),
            ipi: r2(vIpi),
            estabelecimentos: 1,
          }
          avisos.push(
            'ICMS/IPI apenas deste estabelecimento; ICMS-ST (E210) e DIFAL não incluídos.',
          )
          if (mesesI.length < 12) avisos.push('EFD ICMS/IPI com ' + mesesI.length + ' meses.')
        }

        // ECF mais recente (forma de tributação e IRPJ/CSLL a pagar)
        let ecf = null
        try {
          const decl = declaracoes(api, cnpj)
          const ultimo = (decl.anos || []).find((a) => a.ecf && a.ecfInfo && !a.ecfInfo.erro)
          if (ultimo) {
            const info = ultimo.ecfInfo
            let irpj = 0,
              csll = 0,
              temIr = false,
              temCs = false
            for (const p of info.periodos || []) {
              if (p.irpj != null && p.irpj > 0) {
                irpj += p.irpj
                temIr = true
              }
              if (p.csll != null && p.csll > 0) {
                csll += p.csll
                temCs = true
              }
            }
            ecf = {
              ano: ultimo.ano,
              formaTributacao: info.formaTributacao,
              formaApuracao: info.formaApuracao,
              irpj: temIr ? r2(irpj) : null,
              csll: temCs ? r2(csll) : null,
              arquivo: ultimo.ecf.nome || String(ultimo.ecf.id),
            }
            if (
              /Real/.test(info.formaTributacao || '') &&
              info.formaApuracao &&
              /anual/.test(info.formaApuracao)
            )
              avisos.push(
                'Lucro Real anual: o valor "a pagar" da ECF já desconta as estimativas mensais pagas. Confira o IRPJ/CSLL devido total (N630/N670) antes de usar.',
              )
            if (/Presumido/.test(info.formaTributacao || '') && !temCs)
              avisos.push(
                'ECF do Presumido sem linha de CSLL a pagar identificada: informe a CSLL manualmente.',
              )
            const fE = 'ECF ' + ultimo.ano
            const id = ultimo.ecf.id
            const c30 = (linhas1(id, '0030')[0] || {}).campos || []
            if (/^\d{7}$/.test(c30[2] || '')) marca('cnae', c30[2], fE + ' (0030)')
            if (/^[A-Z]{2}$/.test(c30[7] || '')) marca('uf', c30[7], fE + ' (0030)')
            if (/^\d{7}$/.test(c30[8] || '')) marca('codMun', c30[8], fE + ' (0030)')
            const f = info.formaTributacao || ''
            const reg =
              /Real/.test(f) && !/Presumido/.test(f)
                ? info.formaApuracao === 'trimestral'
                  ? 'real-trimestral'
                  : 'real-anual'
                : /Presumido/.test(f)
                  ? 'presumido'
                  : /Arbitrado/.test(f)
                    ? 'arbitrado'
                    : /Imune|Isenta/.test(f)
                      ? 'imune'
                      : null
            marca('regime', reg, fE + ' (0010: ' + f + ')')
            if (reg && reg.indexOf('real') === 0) {
              let base = 0,
                achou = false
              for (const l of linhas(id, 'N630'))
                if (String(l.campos[1]) === '1' && /BASE DE C.LCULO/i.test(l.campos[2] || '')) {
                  base += num(l.campos[3])
                  achou = true
                }
              if (achou)
                marca(
                  'lucroContabil',
                  r2(base),
                  fE +
                    ' (N630: base de cálculo do IRPJ somada nos períodos — lucro real após adições/exclusões; negativo = prejuízo)',
                )
              const contas = {}
              for (const l of linhas(id, 'M010'))
                if (
                  l.campos[6] === 'I' &&
                  (/PREJU/i.test(l.campos[2] || '') || /^1\.00[01]$/.test(l.campos[4] || ''))
                )
                  contas[l.campos[1]] = true
              const saldo = {}
              for (const l of linhas(id, 'M500'))
                if (contas[l.campos[1]] && l.campos[2] === 'I')
                  saldo[l.campos[1]] = (l.campos[10] === 'D' ? 1 : -1) * num(l.campos[9])
              const prej = Object.keys(saldo).reduce((a, k) => a + Math.max(saldo[k], 0), 0)
              if (prej > 0)
                marca(
                  'prejuizoFiscal',
                  r2(prej),
                  fE +
                    ' (e-Lalur parte B, M010/M500: saldo final de prejuízo fiscal do IRPJ — conferir)',
                )
            }
          }
        } catch (e) {
          avisos.push('ECF: ' + (e && e.message ? e.message : String(e)))
        }
        if (!ecf && !contrib && !icms)
          avisos.push(
            'Nenhum SPED desta empresa no servidor. Peça os arquivos pelo painel de créditos (Pedir à Receita) ou informe os valores manualmente.',
          )
        return { ecf, contrib, icms, perfil, avisos }
      }
      return {
        rbxConfigurado,
        empresasLocais,
        rbx,
        falhar,
        equipe,
        cnpjValido,
        cnpjMatriz,
        ibge,
        emailConfigurado,
        enviarEmail,
        registrarEnvio,
        destinatarios,
        esc,
        moldura,
        relatorioInteligencia,
        SITE,
        declaracoes,
        situacaoAtual,
      }
    })()
    if (!u.equipe(e)) return e.json(403, { erro: 'Acesso restrito à equipe técnica.' })
    let p
    try {
      p = $app.findRecordById('pt_planejamentos', e.request.pathValue('id'))
    } catch (err) {
      return e.json(404, { erro: 'Planejamento não encontrado.' })
    }
    const nome = p.getString('nome')
    const link = u.SITE() + '/planejamento-tributario/planejamento/' + p.id + '/relatorios'
    const assunto = 'Planejamento tributário disponível — ' + nome
    const html = u.moldura(
      assunto,
      '<p>O planejamento tributário de <b>' +
        u.esc(nome) +
        '</b> (' +
        u.esc(p.getString('periodo')) +
        ') foi atualizado e está disponível no sistema.</p>' +
        (u.SITE()
          ? "<p><a href='" +
            link +
            "' style='background:#0e6b63;color:#fff;padding:8px 14px;border-radius:6px;text-decoration:none'>Abrir no sistema (acesso autenticado)</a></p>"
          : '<p>Abra o módulo Planejamento Tributário no sistema para ver os relatórios.</p>') +
        "<p style='font-size:12px;color:#5b6b66'>Por sigilo, relatórios de clientes não seguem anexados ao e-mail.</p>",
    )
    const vistos = {}
    let enviados = 0
    let falhas = 0
    for (const tipo of ['executivo', 'tecnico']) {
      for (const d of u.destinatarios(tipo)) {
        if (vistos[d.email]) continue
        vistos[d.email] = true
        if (u.enviarEmail(d.nome, d.email, tipo, assunto, html)) enviados++
        else falhas++
      }
    }
    return e.json(200, {
      enviados,
      falhas,
      detalhe:
        !enviados && !falhas
          ? 'Nenhum destinatário ativo com relatório executivo ou técnico.'
          : u.emailConfigurado()
            ? ''
            : 'SMTP não configurado: envios registrados como falha.',
    })
  },
  $apis.requireAuth(),
)

/** Relatório mensal da inteligência adaptativa (não contém dados de clientes). */
routerAdd(
  'POST',
  '/backend/v1/pt/enviar-inteligencia/{mes}',
  (e) => {
    const u = (function () {
      // Biblioteca do Planejamento Tributário para os hooks do Skip (PocketBase 0.36).
      // Não é carregada por require em produção: pocketbase/fonte/gerar-hooks.mjs cola este arquivo dentro de cada rota de
      // api_planejamento.js. Junta: acesso à API ReceitanetBX (só leitura do SPED já importado), e-mail, declarações (ECD/ECF)
      // e a leitura da situação atual/perfil a partir do SPED. Chaves só nos secrets do Skip, nunca no navegador.

      const RBX_URL = () =>
        ($secrets.get('RECEITANETBX_URL') || 'http://127.0.0.1:8000').replace(/\/$/, '')
      const RBX_CHAVE = () => $secrets.get('RECEITANETBX_API_KEY') || ''
      /** Endereço do Skip para os links dos e-mails (secret opcional SITE_URL). */
      const SITE = () => ($secrets.get('SITE_URL') || '').replace(/\/$/, '')

      class ErroApi extends Error {
        constructor(status, mensagem) {
          super(mensagem)
          this.status = status
        }
      }

      /** GET/POST na API ReceitanetBX (somente leitura do SPED já importado; não liga o ReceitanetBX). */
      function rbx(metodo, caminho, corpo, timeout) {
        const res = $http.send({
          url: RBX_URL() + caminho,
          method: metodo,
          headers: {
            'X-API-Key': RBX_CHAVE(),
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: corpo === undefined ? '' : JSON.stringify(corpo),
          timeout: timeout || 120,
        })
        if (res.statusCode >= 400) {
          const j = res.json
          throw new ErroApi(
            res.statusCode,
            (j && typeof j.detail === 'string' && j.detail) ||
              (res.raw || '').slice(0, 300) ||
              'HTTP ' + res.statusCode,
          )
        }
        return res.json
      }

      function falhar(e, err) {
        return e.json(err && err.status ? err.status : 502, {
          erro: err && err.message ? err.message : String(err),
        })
      }

      /** Usuário logado. Onde a tabela de usuários tiver perfis (role), só Dev e Tributarista. */
      function equipe(e) {
        if (!e.auth) return false
        const papel = e.auth.getString('role')
        return !papel || papel === 'dev' || papel === 'tributarista'
      }

      /** A leitura do SPED depende dos secrets da API ReceitanetBX. */
      function rbxConfigurado() {
        return !!$secrets.get('RECEITANETBX_URL') && !!$secrets.get('RECEITANETBX_API_KEY')
      }

      /** Empresas cadastradas neste sistema (coleção empresas, importada da planilha). */
      function empresasLocais() {
        try {
          return $app.findRecordsByFilter('empresas', "cnpj != ''", 'nome', 0, 0).map((r) => ({
            cnpj: r.getString('cnpj'),
            nome: r.getString('nome') || null,
            observacao: r.getString('observacao') || null,
            situacao: r.getString('situacao') || null,
          }))
        } catch (err) {
          return []
        }
      }

      const cnpjValido = (c) => /^\d{14}$/.test(c || '')

      /** CNPJ da matriz (0001) com dígitos verificadores. */
      function cnpjMatriz(cnpj) {
        const base = cnpj.slice(0, 8) + '0001'
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
        const d1 = dv(base)
        const d2 = dv(base + d1)
        return base + d1 + d2
      }

      /** Consulta pública e gratuita do IBGE (nome do município, descrição do CNAE). */
      function ibge(caminho) {
        try {
          const res = $http.send({
            url: 'https://servicodados.ibge.gov.br/api' + caminho,
            method: 'GET',
            timeout: 10,
          })
          return res.statusCode === 200 ? res.json : null
        } catch (err) {
          return null
        }
      }

      // ------------------------------------------------------------------ e-mail (SMTP configurado no PocketBase)
      function emailConfigurado() {
        const s = $app.settings()
        return !!(s.smtp && s.smtp.enabled && s.smtp.host)
      }

      /** Registra o envio no histórico (coleção pt_envios). */
      function registrarEnvio(dest, email, relatorio, assunto, status, detalhe) {
        const r = new Record($app.findCollectionByNameOrId('pt_envios'))
        r.set('destinatario', dest || '')
        r.set('email', email || '')
        r.set('relatorio', relatorio || '')
        r.set('assunto', assunto || '')
        r.set('status', status)
        r.set('detalhe', String(detalhe || '').slice(0, 1900))
        $app.save(r)
      }

      /** Envia um e-mail e registra. Devolve true/false. */
      function enviarEmail(dest, email, relatorio, assunto, html, statusOk) {
        if (!emailConfigurado()) {
          registrarEnvio(
            dest,
            email,
            relatorio,
            assunto,
            'falhou',
            'Serviço de e-mail (SMTP) não configurado no servidor.',
          )
          return false
        }
        try {
          const meta = $app.settings().meta
          const msg = new MailerMessage({
            from: { address: meta.senderAddress, name: meta.senderName || 'C CONT Planejamento' },
            to: [{ address: email, name: dest }],
            subject: assunto,
            html: html,
          })
          $app.newMailClient().send(msg)
          registrarEnvio(dest, email, relatorio, assunto, statusOk || 'enviado', '')
          return true
        } catch (err) {
          registrarEnvio(
            dest,
            email,
            relatorio,
            assunto,
            'falhou',
            err && err.message ? err.message : String(err),
          )
          return false
        }
      }

      /** Destinatários ativos com permissão para o tipo de relatório. */
      function destinatarios(tipo) {
        const lista = $app.findRecordsByFilter(
          'pt_destinatarios',
          "ativo = true && email != ''",
          'grupo',
          0,
          0,
        )
        const saida = []
        for (const r of lista) {
          let rel = []
          try {
            rel = JSON.parse(r.getString('relatorios') || '[]')
          } catch (err) {
            rel = []
          }
          if (rel.indexOf(tipo) >= 0)
            saida.push({
              nome: r.getString('nome'),
              email: r.getString('email'),
              grupo: r.getString('grupo'),
              periodicidade: r.getString('periodicidade'),
            })
        }
        return saida
      }

      const esc = (s) =>
        String(s == null ? '' : s)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')

      /** Moldura padrão dos e-mails. */
      function moldura(titulo, corpoHtml) {
        return (
          '<div style="font-family:Arial,sans-serif;color:#132420;max-width:680px">' +
          '<div style="background:#141726;color:#fff;padding:12px 16px;border-radius:8px;border-bottom:4px solid #0e6b63"><b>C CONT · Planejamento Tributário</b></div>' +
          '<h2 style="color:#0b4f4a">' +
          esc(titulo) +
          '</h2>' +
          corpoHtml +
          '<p style="font-size:11px;color:#6b7a76;margin-top:20px">C Consulting Group — Resultados importam! Mensagem automática do sistema de planejamento tributário.</p></div>'
        )
      }

      /** Relatório mensal da inteligência adaptativa montado no servidor (para o envio automático). */
      function relatorioInteligencia(mes) {
        const lista = $app.findRecordsByFilter('pt_inteligencia', 'mes = {:mes}', 'created', 0, 0, {
          mes: mes,
        })
        let html = ''
        if (!lista.length)
          html = '<p><b>Não foram encontradas novidades relevantes neste mês.</b></p>'
        for (const r of lista) {
          let d = {}
          try {
            d = JSON.parse(r.getString('dados') || '{}')
          } catch (err) {
            d = {}
          }
          const ap = d.aprovacoes || {}
          html +=
            '<h3 style="margin-bottom:4px">' +
            esc(r.getString('nome')) +
            "</h3><table style='font-size:13px;border-collapse:collapse'>" +
            [
              ['O que há de novo', d.novidade],
              ['Fonte e fundamento', d.fonte],
              ['Beneficiados', d.beneficiados],
              ['Exemplo de cálculo', d.exemploCalculo],
              ['Grau de risco', d.risco],
              ['Alterações na IA', d.alteracoesIA],
              ['Recomendação', d.recomendacao],
              [
                'Aprovações',
                'Controladoria: ' +
                  (ap.controladoria || 'pendente') +
                  ' · Jurídico: ' +
                  (ap.juridico || 'pendente') +
                  ' · Desenvolvimento: ' +
                  (ap.desenvolvimento || 'pendente'),
              ],
              ['Situação', r.getString('situacao')],
            ]
              .map(
                (l) =>
                  "<tr><td style='padding:3px 8px;font-weight:bold;vertical-align:top'>" +
                  esc(l[0]) +
                  "</td><td style='padding:3px 8px'>" +
                  esc(l[1]) +
                  '</td></tr>',
              )
              .join('') +
            '</table>'
        }
        return html
      }

      // ------------------------------------------------------------------ declarações anuais (ECD/ECF), igual ao painel do servidor
      // Declarações anuais da empresa no servidor (ECD e ECF): o que existe por ano, para baixar, e o que a ECF informa
      // (forma de tributação, IRPJ/CSLL a pagar por período, saldo negativo e retenções sofridas do Y570).
      // Mesma lógica de pocketbase/hooks/api_declaracoes.js do Skip. Saldo negativo é só "CRÉDITO POTENCIAL".

      /** api(caminho) = GET na API ReceitanetBX devolvendo o JSON. */
      function declaracoes(api, cnpj) {
        // Valor do SPED ("1234,56") em número.
        const num = (v) => {
          const s = String(v == null ? '' : v).trim()
          if (!s) return null
          const n = parseFloat(s.replace(/\./g, '').replace(',', '.'))
          return isNaN(n) ? null : n
        }
        const linhas = (id, reg) =>
          api('/v1/sped/arquivos/' + id + '/registros/' + reg + '?limite=10000').linhas || []
        // Última transmissão por ano (o nome traz _AAAAMMDDhhmmss_; sem ele, o maior id).
        const transmissao = (nome) => (/_(\d{14})_/.exec(nome || '') || [])[1] || ''
        const porAno = (lista) => {
          const r = {}
          for (const a of lista) {
            const ano = String(a.dt_ini).slice(0, 4)
            const atual = r[ano]
            const chaveA = transmissao(a.nome) + String(a.id).padStart(12, '0')
            if (!atual || chaveA > transmissao(atual.nome) + String(atual.id).padStart(12, '0'))
              r[ano] = a
          }
          return r
        }
        const FORMA_TRIB = {
          1: 'Lucro Real',
          2: 'Lucro Real/Arbitrado',
          3: 'Lucro Presumido/Real',
          4: 'Lucro Presumido/Real/Arbitrado',
          5: 'Lucro Presumido',
          6: 'Lucro Arbitrado',
          7: 'Lucro Presumido/Arbitrado',
          8: 'Imune do IRPJ',
          9: 'Isenta do IRPJ',
        }

        /** IRPJ/CSLL "a pagar" por período (N030/P030 → N630/N670/P300/P400) e saldo negativo. */
        const apuracao = (id, regPeriodo, regIrpj, codIrpj, regCsll, codCsll) => {
          const periodos = linhas(id, regPeriodo).map((l) => ({
            linha: l.linha,
            per: l.campos[3] || '',
          }))
          const periodoDe = (linha) => {
            let p = ''
            for (const x of periodos) if (x.linha < linha) p = x.per
            return p
          }
          const saida = {}
          const ler = (reg, codigo, campo) => {
            const todas = linhas(id, reg)
            // Linha "a pagar": pelo código do leiaute; se não houver, a última cuja descrição diz "A PAGAR".
            let alvo = todas.filter((l) => String(l.campos[1]) === codigo)
            if (!alvo.length) {
              const porPeriodo = {}
              for (const l of todas)
                if (/A PAGAR|A RECOLHER/i.test(l.campos[2] || ''))
                  porPeriodo[periodoDe(l.linha)] = l
              alvo = Object.keys(porPeriodo).map((k) => porPeriodo[k])
            }
            for (const l of alvo) {
              const per = periodoDe(l.linha) || 'A00'
              const v = num(l.campos[3])
              if (v == null) continue
              const x = saida[per] || (saida[per] = { periodo: per, irpj: null, csll: null })
              x[campo] = v
            }
          }
          ler(regIrpj, codIrpj, 'irpj')
          ler(regCsll, codCsll, 'csll')
          return Object.keys(saida)
            .sort()
            .map((k) => saida[k])
        }

        const ecds = porAno(
          api('/v1/sped/arquivos?cnpj=' + cnpj + '&tipo=ECD&limite=100').arquivos || [],
        )
        const ecfs = porAno(
          api('/v1/sped/arquivos?cnpj=' + cnpj + '&tipo=ECF&limite=100').arquivos || [],
        )
        const anos = {}
        const hoje = new Date()
        for (let a = hoje.getFullYear() - 5; a < hoje.getFullYear(); a++) anos[String(a)] = true
        for (const a of Object.keys(ecds).concat(Object.keys(ecfs))) anos[a] = true
        const arquivo = (a) =>
          a
            ? { id: a.id, nome: a.nome, de: a.dt_ini, ate: a.dt_fin, importadoEm: a.importado_em }
            : null

        const lista = Object.keys(anos)
          .sort()
          .reverse()
          .map((ano) => {
            const ecf = ecfs[ano]
            let info = null
            if (ecf) {
              try {
                const r0010 = (linhas(ecf.id, '0010')[0] || {}).campos || []
                // Campos localizados pelo formato (as versões do leiaute mudam a posição).
                let iTrib = -1
                for (let i = 3; i < r0010.length; i++)
                  if (/^[1-9]$/.test(r0010[i] || '')) {
                    iTrib = i
                    break
                  }
                const formaTrib = iTrib >= 0 ? r0010[iTrib] : null
                let formaApur = null
                for (let i = iTrib + 1; iTrib >= 0 && i < r0010.length; i++)
                  if (r0010[i] === 'A' || r0010[i] === 'T') {
                    formaApur = r0010[i] === 'A' ? 'anual (estimativas mensais)' : 'trimestral'
                    break
                  }
                const presumido = formaTrib === '5' || formaTrib === '7'
                const periodos = presumido
                  ? apuracao(ecf.id, 'P030', 'P300', '15', 'P400', '')
                  : apuracao(ecf.id, 'N030', 'N630', '26', 'N670', '21')
                let retIr = 0
                let retCsll = 0
                const fontes = {}
                for (const l of linhas(ecf.id, 'Y570')) {
                  retIr += num(l.campos[6]) || 0
                  retCsll += num(l.campos[7]) || 0
                  if (l.campos[1]) fontes[l.campos[1]] = true
                }
                const negIrpj = periodos.reduce(
                  (s, p) => s + (p.irpj != null && p.irpj < 0 ? -p.irpj : 0),
                  0,
                )
                const negCsll = periodos.reduce(
                  (s, p) => s + (p.csll != null && p.csll < 0 ? -p.csll : 0),
                  0,
                )
                info = {
                  formaTributacao: formaTrib ? FORMA_TRIB[formaTrib] || formaTrib : null,
                  formaApuracao: presumido ? 'trimestral' : formaApur,
                  periodos: periodos,
                  saldoNegativo: {
                    irpj: Math.round(negIrpj * 100) / 100,
                    csll: Math.round(negCsll * 100) / 100,
                    status: negIrpj + negCsll > 0 ? 'CRÉDITO POTENCIAL' : null,
                  },
                  retencoes: {
                    ir: Math.round(retIr * 100) / 100,
                    csll: Math.round(retCsll * 100) / 100,
                    fontes: Object.keys(fontes).length,
                  },
                }
              } catch (err) {
                info = { erro: err.message || String(err) }
              }
            }
            return { ano: ano, ecd: arquivo(ecds[ano]), ecf: arquivo(ecf), ecfInfo: info }
          })
        return { cnpj: cnpj, anos: lista }
      }

      // ------------------------------------------------------------------ situação atual e perfil a partir do SPED
      // Leitura do SPED já importado na API ReceitanetBX para montar a situação tributária atual (somente leitura).
      // Posições: campos[0] = REG; campos[n] = campo n+1 do leiaute; valores com vírgula decimal.
      //   M200/M600 idx2 = VL_TOT_CRED_DESC, idx12 = VL_TOT_CONT_REC   M210 idx2 = VL_REC_BRT
      //   E110 idx12 = VL_ICMS_RECOLHER                               E520 idx7 = VL_SD_IPI
      //   Perfil: EFD-Contrib 0000 UF idx9, COD_MUN idx10, IND_ATIV idx13 · 0140 estabelecimentos · M105 idx6 VL_BC_PIS (base de crédito)
      //   M400 idx1 CST (04 = monofásico) · EFD ICMS 0000 UF idx8, COD_MUN idx10, IND_ATIV idx14 · C190 CST idx1, CFOP idx2, ALIQ idx3, VL_OPR idx4, VL_BC idx5
      //   ECF 0030 CNAE idx2, UF idx7, COD_MUN idx8 · N630 código 1 (base de cálculo do IRPJ) idx3 · M010/M500 parte B (prejuízo fiscal)

      function situacaoAtual(api, cnpj, matriz, declaracoes) {
        const num = (v) => {
          const s = String(v == null ? '' : v).trim()
          if (!s) return 0
          const n = parseFloat(s.replace(/\./g, '').replace(',', '.'))
          return isNaN(n) ? 0 : n
        }
        const r2 = (v) => Math.round(v * 100) / 100
        const linhas = (id, reg) =>
          api('/v1/sped/arquivos/' + id + '/registros/' + reg + '?limite=10000').linhas || []
        const transmissao = (nome) => (/_(\d{14})_/.exec(nome || '') || [])[1] || ''
        /** Última transmissão de cada mês, os 12 meses mais recentes. */
        const ultimos12 = (lista) => {
          const porMes = {}
          for (const a of lista) {
            const mes = String(a.dt_ini).slice(0, 7)
            const atual = porMes[mes]
            const k = transmissao(a.nome) + String(a.id).padStart(12, '0')
            if (!atual || k > transmissao(atual.nome) + String(atual.id).padStart(12, '0'))
              porMes[mes] = a
          }
          return Object.keys(porMes)
            .sort()
            .reverse()
            .slice(0, 12)
            .map((m) => porMes[m])
        }
        const listar = (doc, tipo) =>
          api('/v1/sped/arquivos?cnpj=' + doc + '&tipo=' + tipo + '&limite=200').arquivos || []
        const avisos = []
        const linhas1 = (id, reg) =>
          api('/v1/sped/arquivos/' + id + '/registros/' + reg + '?limite=1').linhas || []
        const perfil = { setores: {}, operacoes: {}, fontes: {} }
        const marca = (campo, valor, fonte) => {
          if (valor == null || valor === '' || perfil[campo] != null) return
          perfil[campo] = valor
          perfil.fontes[campo] = fonte
        }
        const marcaG = (g, campo, valor, fonte) => {
          if (valor == null || perfil[g][campo] != null) return
          perfil[g][campo] = valor
          perfil.fontes[g + '.' + campo] = fonte
        }

        // EFD-Contribuições (centralizada na matriz)
        let contrib = null
        let arqC = listar(cnpj, 'EFD-CONTRIBUICOES')
        if (!arqC.length && matriz !== cnpj) {
          arqC = listar(matriz, 'EFD-CONTRIBUICOES')
          if (arqC.length)
            avisos.push(
              'EFD-Contribuições lida da matriz (' + matriz + '): valores do CNPJ inteiro.',
            )
        }
        const mesesC = ultimos12(arqC)
        if (mesesC.length) {
          const t = {
            receitaBruta: 0,
            pis: 0,
            cofins: 0,
            creditosPis: 0,
            creditosCofins: 0,
            regime: null,
          }
          for (const a of mesesC) {
            for (const l of linhas(a.id, 'M200')) {
              t.pis += num(l.campos[12])
              t.creditosPis += num(l.campos[2])
            }
            for (const l of linhas(a.id, 'M600')) {
              t.cofins += num(l.campos[12])
              t.creditosCofins += num(l.campos[2])
            }
            for (const l of linhas(a.id, 'M210')) t.receitaBruta += num(l.campos[2])
            if (!t.regime) {
              const r = linhas(a.id, '0110')[0]
              if (r)
                t.regime =
                  r.campos[1] === '1'
                    ? 'não cumulativo'
                    : r.campos[1] === '2'
                      ? 'cumulativo'
                      : 'misto'
            }
            for (const l of linhas(a.id, 'M105'))
              t.basesCredito = (t.basesCredito || 0) + num(l.campos[6])
            if (!t.mono)
              for (const l of linhas(a.id, 'M400')) if (l.campos[1] === '04') t.mono = true
            // A100 IND_OPER 1 = serviço prestado; COD_SIT idx4 (02-05 = cancelada/denegada/inutilizada); VL_DOC idx11, VL_DESC idx13, VL_ISS idx20
            for (const l of linhas(a.id, 'A100')) {
              if (l.campos[1] !== '1' || ['02', '03', '04', '05'].indexOf(String(l.campos[4])) >= 0)
                continue
              t.servicos = true
              t.recServ = (t.recServ || 0) + num(l.campos[11]) - num(l.campos[13])
              t.iss = (t.iss || 0) + num(l.campos[20])
            }
          }
          const ult = mesesC[0]
          const r0 = (linhas1(ult.id, '0000')[0] || {}).campos || []
          const fC = 'EFD-Contribuições ' + String(ult.dt_ini).slice(0, 7)
          if (/^[A-Z]{2}$/.test(r0[9] || '')) marca('uf', r0[9], fC)
          if (/^\d{7}$/.test(r0[10] || '')) marca('codMun', r0[10], fC)
          const ativ = { 0: 'industria', 2: 'comercio', 1: 'servicos', 4: 'imobiliario' }[r0[13]]
          if (ativ) marcaG('setores', ativ, true, fC + ' (0000, indicador de atividade)')
          const estab = linhas(ult.id, '0140').length
          if (estab)
            marcaG(
              'operacoes',
              'filiais',
              estab > 1,
              fC + ' (0140: ' + estab + ' estabelecimento(s))',
            )
          if (t.basesCredito)
            marca(
              'comprasCreditaveis',
              r2((t.basesCredito * 12) / mesesC.length),
              'EFD-Contribuições M105 (bases de crédito, anualizado)',
            )
          if (t.mono) marcaG('operacoes', 'monofasicos', true, 'EFD-Contribuições M400 CST 04')
          if (t.servicos)
            marcaG(
              'setores',
              'servicos',
              true,
              'EFD-Contribuições A100 (notas de serviço emitidas)',
            )
          if (t.recServ > 0)
            marca(
              'receitaServicos',
              r2((t.recServ * 12) / mesesC.length),
              'EFD-Contribuições A100: notas de serviço emitidas (valor − desconto), anualizado',
            )
          if (t.recServ > 0 && t.iss > 0) {
            marca(
              'aliquotaIss',
              Math.round((t.iss / t.recServ) * 10000) / 100,
              'EFD-Contribuições A100: ISS das notas de serviço emitidas ÷ valor dos serviços (alíquota efetiva praticada)',
            )
            marcaG(
              'operacoes',
              'contribuinteIss',
              true,
              'EFD-Contribuições A100 (ISS nas notas emitidas)',
            )
          }
          if (t.receitaBruta)
            marca(
              'receitaAnual',
              r2((t.receitaBruta * 12) / mesesC.length),
              'EFD-Contribuições M210 (receita bruta, anualizada)',
            )
          const datas = mesesC.map((a) => String(a.dt_ini).slice(0, 10)).sort()
          contrib = {
            de: datas[0],
            ate: datas[datas.length - 1],
            meses: mesesC.length,
            receitaBruta: r2(t.receitaBruta),
            pis: r2(t.pis),
            cofins: r2(t.cofins),
            creditosPis: r2(t.creditosPis),
            creditosCofins: r2(t.creditosCofins),
            regime: t.regime,
            iss: r2(t.iss || 0),
          }
          if (mesesC.length < 12)
            avisos.push(
              'EFD-Contribuições com ' +
                mesesC.length +
                ' meses: PIS/COFINS somam só esse período (anualize se for o caso).',
            )
          if (!t.receitaBruta)
            avisos.push('Sem M210 com receita bruta: informe a receita anual no perfil.')
        }

        // EFD ICMS/IPI (por estabelecimento)
        let icms = null
        const mesesI = ultimos12(listar(cnpj, 'EFD-ICMS-IPI'))
        if (mesesI.length) {
          let vIcms = 0,
            vIpi = 0
          const cf = {
            saidas: 0,
            ind: 0,
            com: 0,
            inter: false,
            exp: false,
            imp: false,
            st: false,
            aliqBc: 0,
            bc: 0,
          }
          for (const a of mesesI) {
            for (const l of linhas(a.id, 'E110')) vIcms += num(l.campos[12])
            for (const l of linhas(a.id, 'E520')) vIpi += num(l.campos[7])
            for (const l of linhas(a.id, 'C190')) {
              const cst = String(l.campos[1] || ''),
                cfop = String(l.campos[2] || ''),
                aliq = num(l.campos[3]),
                opr = num(l.campos[4]),
                bc = num(l.campos[5])
              const d = cfop[0]
              if (!/^[1-7]\d{3}$/.test(cfop)) continue
              if ('567'.indexOf(d) >= 0) cf.saidas += opr
              if (d === '6' || d === '2') cf.inter = true
              if (d === '7') cf.exp = true
              if (d === '3') cf.imp = true
              const fim = cfop.slice(1)
              if (
                [
                  '101',
                  '103',
                  '105',
                  '109',
                  '111',
                  '113',
                  '116',
                  '118',
                  '122',
                  '124',
                  '125',
                  '401',
                  '402',
                ].indexOf(fim) >= 0
              )
                cf.ind += opr
              if (
                [
                  '102',
                  '104',
                  '106',
                  '108',
                  '110',
                  '112',
                  '114',
                  '115',
                  '117',
                  '119',
                  '120',
                  '123',
                  '403',
                  '404',
                  '405',
                ].indexOf(fim) >= 0 &&
                '56'.indexOf(d) >= 0
              )
                cf.com += opr
              if (/(10|30|60|70)$/.test(cst)) cf.st = true
              if (d === '5' && aliq > 0 && bc > 0) {
                cf.aliqBc += aliq * bc
                cf.bc += bc
              }
            }
          }
          const fI =
            'EFD ICMS/IPI ' +
            String(mesesI[mesesI.length - 1].dt_ini).slice(0, 7) +
            ' a ' +
            String(mesesI[0].dt_ini).slice(0, 7) +
            ' (C190)'
          marcaG('operacoes', 'contribuinteIcms', true, 'EFD ICMS/IPI entregue')
          if (cf.ind) marcaG('setores', 'industria', true, fI + ': CFOP de produção própria')
          if (cf.com) marcaG('setores', 'comercio', true, fI + ': CFOP de revenda')
          marcaG('operacoes', 'interestadual', cf.inter, fI)
          marcaG('operacoes', 'exporta', cf.exp, fI)
          marcaG('operacoes', 'importa', cf.imp, fI)
          marcaG('operacoes', 'substituicaoTributaria', cf.st, fI + ' (CST 10/30/60/70)')
          if (cf.bc)
            marca(
              'aliquotaIcms',
              Math.round((cf.aliqBc / cf.bc) * 100) / 100,
              fI + ': alíquota média ponderada das saídas internas (pode refletir redução de base)',
            )
          if (cf.saidas)
            marca(
              'receitaAnual',
              r2((cf.saidas * 12) / mesesI.length),
              fI + ': saídas, anualizadas',
            )
          const i0 = (linhas1(mesesI[0].id, '0000')[0] || {}).campos || []
          if (/^[A-Z]{2}$/.test(i0[8] || '')) marca('uf', i0[8], 'EFD ICMS/IPI 0000')
          if (/^\d{7}$/.test(i0[10] || '')) marca('codMun', i0[10], 'EFD ICMS/IPI 0000')
          if (i0[14] === '0')
            marcaG(
              'operacoes',
              'contribuinteIpi',
              true,
              'EFD ICMS/IPI 0000 (industrial ou equiparado)',
            )
          if (vIpi > 0)
            marcaG('operacoes', 'contribuinteIpi', true, 'EFD ICMS/IPI E520 (IPI a recolher)')
          const datas = mesesI.map((a) => String(a.dt_ini).slice(0, 10)).sort()
          icms = {
            de: datas[0],
            ate: datas[datas.length - 1],
            meses: mesesI.length,
            icms: r2(vIcms),
            ipi: r2(vIpi),
            estabelecimentos: 1,
          }
          avisos.push(
            'ICMS/IPI apenas deste estabelecimento; ICMS-ST (E210) e DIFAL não incluídos.',
          )
          if (mesesI.length < 12) avisos.push('EFD ICMS/IPI com ' + mesesI.length + ' meses.')
        }

        // ECF mais recente (forma de tributação e IRPJ/CSLL a pagar)
        let ecf = null
        try {
          const decl = declaracoes(api, cnpj)
          const ultimo = (decl.anos || []).find((a) => a.ecf && a.ecfInfo && !a.ecfInfo.erro)
          if (ultimo) {
            const info = ultimo.ecfInfo
            let irpj = 0,
              csll = 0,
              temIr = false,
              temCs = false
            for (const p of info.periodos || []) {
              if (p.irpj != null && p.irpj > 0) {
                irpj += p.irpj
                temIr = true
              }
              if (p.csll != null && p.csll > 0) {
                csll += p.csll
                temCs = true
              }
            }
            ecf = {
              ano: ultimo.ano,
              formaTributacao: info.formaTributacao,
              formaApuracao: info.formaApuracao,
              irpj: temIr ? r2(irpj) : null,
              csll: temCs ? r2(csll) : null,
              arquivo: ultimo.ecf.nome || String(ultimo.ecf.id),
            }
            if (
              /Real/.test(info.formaTributacao || '') &&
              info.formaApuracao &&
              /anual/.test(info.formaApuracao)
            )
              avisos.push(
                'Lucro Real anual: o valor "a pagar" da ECF já desconta as estimativas mensais pagas. Confira o IRPJ/CSLL devido total (N630/N670) antes de usar.',
              )
            if (/Presumido/.test(info.formaTributacao || '') && !temCs)
              avisos.push(
                'ECF do Presumido sem linha de CSLL a pagar identificada: informe a CSLL manualmente.',
              )
            const fE = 'ECF ' + ultimo.ano
            const id = ultimo.ecf.id
            const c30 = (linhas1(id, '0030')[0] || {}).campos || []
            if (/^\d{7}$/.test(c30[2] || '')) marca('cnae', c30[2], fE + ' (0030)')
            if (/^[A-Z]{2}$/.test(c30[7] || '')) marca('uf', c30[7], fE + ' (0030)')
            if (/^\d{7}$/.test(c30[8] || '')) marca('codMun', c30[8], fE + ' (0030)')
            const f = info.formaTributacao || ''
            const reg =
              /Real/.test(f) && !/Presumido/.test(f)
                ? info.formaApuracao === 'trimestral'
                  ? 'real-trimestral'
                  : 'real-anual'
                : /Presumido/.test(f)
                  ? 'presumido'
                  : /Arbitrado/.test(f)
                    ? 'arbitrado'
                    : /Imune|Isenta/.test(f)
                      ? 'imune'
                      : null
            marca('regime', reg, fE + ' (0010: ' + f + ')')
            if (reg && reg.indexOf('real') === 0) {
              let base = 0,
                achou = false
              for (const l of linhas(id, 'N630'))
                if (String(l.campos[1]) === '1' && /BASE DE C.LCULO/i.test(l.campos[2] || '')) {
                  base += num(l.campos[3])
                  achou = true
                }
              if (achou)
                marca(
                  'lucroContabil',
                  r2(base),
                  fE +
                    ' (N630: base de cálculo do IRPJ somada nos períodos — lucro real após adições/exclusões; negativo = prejuízo)',
                )
              const contas = {}
              for (const l of linhas(id, 'M010'))
                if (
                  l.campos[6] === 'I' &&
                  (/PREJU/i.test(l.campos[2] || '') || /^1\.00[01]$/.test(l.campos[4] || ''))
                )
                  contas[l.campos[1]] = true
              const saldo = {}
              for (const l of linhas(id, 'M500'))
                if (contas[l.campos[1]] && l.campos[2] === 'I')
                  saldo[l.campos[1]] = (l.campos[10] === 'D' ? 1 : -1) * num(l.campos[9])
              const prej = Object.keys(saldo).reduce((a, k) => a + Math.max(saldo[k], 0), 0)
              if (prej > 0)
                marca(
                  'prejuizoFiscal',
                  r2(prej),
                  fE +
                    ' (e-Lalur parte B, M010/M500: saldo final de prejuízo fiscal do IRPJ — conferir)',
                )
            }
          }
        } catch (e) {
          avisos.push('ECF: ' + (e && e.message ? e.message : String(e)))
        }
        if (!ecf && !contrib && !icms)
          avisos.push(
            'Nenhum SPED desta empresa no servidor. Peça os arquivos pelo painel de créditos (Pedir à Receita) ou informe os valores manualmente.',
          )
        return { ecf, contrib, icms, perfil, avisos }
      }
      return {
        rbxConfigurado,
        empresasLocais,
        rbx,
        falhar,
        equipe,
        cnpjValido,
        cnpjMatriz,
        ibge,
        emailConfigurado,
        enviarEmail,
        registrarEnvio,
        destinatarios,
        esc,
        moldura,
        relatorioInteligencia,
        SITE,
        declaracoes,
        situacaoAtual,
      }
    })()
    if (!u.equipe(e)) return e.json(403, { erro: 'Acesso restrito à equipe técnica.' })
    const mes = e.request.pathValue('mes')
    if (!/^\d{4}-\d{2}$/.test(mes)) return e.json(422, { erro: 'Mês inválido.' })
    const assunto =
      'NOVAS OPORTUNIDADES DE PLANEJAMENTO TRIBUTÁRIO — ' + mes.split('-').reverse().join('/')
    const html = u.moldura(assunto, u.relatorioInteligencia(mes))
    let enviados = 0
    let falhas = 0
    for (const d of u.destinatarios('inteligencia')) {
      if (u.enviarEmail(d.nome, d.email, 'inteligencia', assunto, html)) enviados++
      else falhas++
    }
    return e.json(200, {
      enviados,
      falhas,
      detalhe:
        !enviados && !falhas
          ? 'Nenhum destinatário ativo com o relatório de inteligência adaptativa.'
          : u.emailConfigurado()
            ? ''
            : 'SMTP não configurado: envios registrados como falha.',
    })
  },
  $apis.requireAuth(),
)

// Envio mensal automático (dia 1º, 8h de Brasília = 11h UTC): relatório do mês anterior aos destinatários "mensal".
// Só dispara se o SMTP estiver configurado e houver destinatários ativos.
cronAdd('pt-inteligencia-mensal', '0 11 1 * *', () => {
  const u = (function () {
    // Biblioteca do Planejamento Tributário para os hooks do Skip (PocketBase 0.36).
    // Não é carregada por require em produção: pocketbase/fonte/gerar-hooks.mjs cola este arquivo dentro de cada rota de
    // api_planejamento.js. Junta: acesso à API ReceitanetBX (só leitura do SPED já importado), e-mail, declarações (ECD/ECF)
    // e a leitura da situação atual/perfil a partir do SPED. Chaves só nos secrets do Skip, nunca no navegador.

    const RBX_URL = () =>
      ($secrets.get('RECEITANETBX_URL') || 'http://127.0.0.1:8000').replace(/\/$/, '')
    const RBX_CHAVE = () => $secrets.get('RECEITANETBX_API_KEY') || ''
    /** Endereço do Skip para os links dos e-mails (secret opcional SITE_URL). */
    const SITE = () => ($secrets.get('SITE_URL') || '').replace(/\/$/, '')

    class ErroApi extends Error {
      constructor(status, mensagem) {
        super(mensagem)
        this.status = status
      }
    }

    /** GET/POST na API ReceitanetBX (somente leitura do SPED já importado; não liga o ReceitanetBX). */
    function rbx(metodo, caminho, corpo, timeout) {
      const res = $http.send({
        url: RBX_URL() + caminho,
        method: metodo,
        headers: {
          'X-API-Key': RBX_CHAVE(),
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: corpo === undefined ? '' : JSON.stringify(corpo),
        timeout: timeout || 120,
      })
      if (res.statusCode >= 400) {
        const j = res.json
        throw new ErroApi(
          res.statusCode,
          (j && typeof j.detail === 'string' && j.detail) ||
            (res.raw || '').slice(0, 300) ||
            'HTTP ' + res.statusCode,
        )
      }
      return res.json
    }

    function falhar(e, err) {
      return e.json(err && err.status ? err.status : 502, {
        erro: err && err.message ? err.message : String(err),
      })
    }

    /** Usuário logado. Onde a tabela de usuários tiver perfis (role), só Dev e Tributarista. */
    function equipe(e) {
      if (!e.auth) return false
      const papel = e.auth.getString('role')
      return !papel || papel === 'dev' || papel === 'tributarista'
    }

    /** A leitura do SPED depende dos secrets da API ReceitanetBX. */
    function rbxConfigurado() {
      return !!$secrets.get('RECEITANETBX_URL') && !!$secrets.get('RECEITANETBX_API_KEY')
    }

    /** Empresas cadastradas neste sistema (coleção empresas, importada da planilha). */
    function empresasLocais() {
      try {
        return $app.findRecordsByFilter('empresas', "cnpj != ''", 'nome', 0, 0).map((r) => ({
          cnpj: r.getString('cnpj'),
          nome: r.getString('nome') || null,
          observacao: r.getString('observacao') || null,
          situacao: r.getString('situacao') || null,
        }))
      } catch (err) {
        return []
      }
    }

    const cnpjValido = (c) => /^\d{14}$/.test(c || '')

    /** CNPJ da matriz (0001) com dígitos verificadores. */
    function cnpjMatriz(cnpj) {
      const base = cnpj.slice(0, 8) + '0001'
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
      const d1 = dv(base)
      const d2 = dv(base + d1)
      return base + d1 + d2
    }

    /** Consulta pública e gratuita do IBGE (nome do município, descrição do CNAE). */
    function ibge(caminho) {
      try {
        const res = $http.send({
          url: 'https://servicodados.ibge.gov.br/api' + caminho,
          method: 'GET',
          timeout: 10,
        })
        return res.statusCode === 200 ? res.json : null
      } catch (err) {
        return null
      }
    }

    // ------------------------------------------------------------------ e-mail (SMTP configurado no PocketBase)
    function emailConfigurado() {
      const s = $app.settings()
      return !!(s.smtp && s.smtp.enabled && s.smtp.host)
    }

    /** Registra o envio no histórico (coleção pt_envios). */
    function registrarEnvio(dest, email, relatorio, assunto, status, detalhe) {
      const r = new Record($app.findCollectionByNameOrId('pt_envios'))
      r.set('destinatario', dest || '')
      r.set('email', email || '')
      r.set('relatorio', relatorio || '')
      r.set('assunto', assunto || '')
      r.set('status', status)
      r.set('detalhe', String(detalhe || '').slice(0, 1900))
      $app.save(r)
    }

    /** Envia um e-mail e registra. Devolve true/false. */
    function enviarEmail(dest, email, relatorio, assunto, html, statusOk) {
      if (!emailConfigurado()) {
        registrarEnvio(
          dest,
          email,
          relatorio,
          assunto,
          'falhou',
          'Serviço de e-mail (SMTP) não configurado no servidor.',
        )
        return false
      }
      try {
        const meta = $app.settings().meta
        const msg = new MailerMessage({
          from: { address: meta.senderAddress, name: meta.senderName || 'C CONT Planejamento' },
          to: [{ address: email, name: dest }],
          subject: assunto,
          html: html,
        })
        $app.newMailClient().send(msg)
        registrarEnvio(dest, email, relatorio, assunto, statusOk || 'enviado', '')
        return true
      } catch (err) {
        registrarEnvio(
          dest,
          email,
          relatorio,
          assunto,
          'falhou',
          err && err.message ? err.message : String(err),
        )
        return false
      }
    }

    /** Destinatários ativos com permissão para o tipo de relatório. */
    function destinatarios(tipo) {
      const lista = $app.findRecordsByFilter(
        'pt_destinatarios',
        "ativo = true && email != ''",
        'grupo',
        0,
        0,
      )
      const saida = []
      for (const r of lista) {
        let rel = []
        try {
          rel = JSON.parse(r.getString('relatorios') || '[]')
        } catch (err) {
          rel = []
        }
        if (rel.indexOf(tipo) >= 0)
          saida.push({
            nome: r.getString('nome'),
            email: r.getString('email'),
            grupo: r.getString('grupo'),
            periodicidade: r.getString('periodicidade'),
          })
      }
      return saida
    }

    const esc = (s) =>
      String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')

    /** Moldura padrão dos e-mails. */
    function moldura(titulo, corpoHtml) {
      return (
        '<div style="font-family:Arial,sans-serif;color:#132420;max-width:680px">' +
        '<div style="background:#141726;color:#fff;padding:12px 16px;border-radius:8px;border-bottom:4px solid #0e6b63"><b>C CONT · Planejamento Tributário</b></div>' +
        '<h2 style="color:#0b4f4a">' +
        esc(titulo) +
        '</h2>' +
        corpoHtml +
        '<p style="font-size:11px;color:#6b7a76;margin-top:20px">C Consulting Group — Resultados importam! Mensagem automática do sistema de planejamento tributário.</p></div>'
      )
    }

    /** Relatório mensal da inteligência adaptativa montado no servidor (para o envio automático). */
    function relatorioInteligencia(mes) {
      const lista = $app.findRecordsByFilter('pt_inteligencia', 'mes = {:mes}', 'created', 0, 0, {
        mes: mes,
      })
      let html = ''
      if (!lista.length)
        html = '<p><b>Não foram encontradas novidades relevantes neste mês.</b></p>'
      for (const r of lista) {
        let d = {}
        try {
          d = JSON.parse(r.getString('dados') || '{}')
        } catch (err) {
          d = {}
        }
        const ap = d.aprovacoes || {}
        html +=
          '<h3 style="margin-bottom:4px">' +
          esc(r.getString('nome')) +
          "</h3><table style='font-size:13px;border-collapse:collapse'>" +
          [
            ['O que há de novo', d.novidade],
            ['Fonte e fundamento', d.fonte],
            ['Beneficiados', d.beneficiados],
            ['Exemplo de cálculo', d.exemploCalculo],
            ['Grau de risco', d.risco],
            ['Alterações na IA', d.alteracoesIA],
            ['Recomendação', d.recomendacao],
            [
              'Aprovações',
              'Controladoria: ' +
                (ap.controladoria || 'pendente') +
                ' · Jurídico: ' +
                (ap.juridico || 'pendente') +
                ' · Desenvolvimento: ' +
                (ap.desenvolvimento || 'pendente'),
            ],
            ['Situação', r.getString('situacao')],
          ]
            .map(
              (l) =>
                "<tr><td style='padding:3px 8px;font-weight:bold;vertical-align:top'>" +
                esc(l[0]) +
                "</td><td style='padding:3px 8px'>" +
                esc(l[1]) +
                '</td></tr>',
            )
            .join('') +
          '</table>'
      }
      return html
    }

    // ------------------------------------------------------------------ declarações anuais (ECD/ECF), igual ao painel do servidor
    // Declarações anuais da empresa no servidor (ECD e ECF): o que existe por ano, para baixar, e o que a ECF informa
    // (forma de tributação, IRPJ/CSLL a pagar por período, saldo negativo e retenções sofridas do Y570).
    // Mesma lógica de pocketbase/hooks/api_declaracoes.js do Skip. Saldo negativo é só "CRÉDITO POTENCIAL".

    /** api(caminho) = GET na API ReceitanetBX devolvendo o JSON. */
    function declaracoes(api, cnpj) {
      // Valor do SPED ("1234,56") em número.
      const num = (v) => {
        const s = String(v == null ? '' : v).trim()
        if (!s) return null
        const n = parseFloat(s.replace(/\./g, '').replace(',', '.'))
        return isNaN(n) ? null : n
      }
      const linhas = (id, reg) =>
        api('/v1/sped/arquivos/' + id + '/registros/' + reg + '?limite=10000').linhas || []
      // Última transmissão por ano (o nome traz _AAAAMMDDhhmmss_; sem ele, o maior id).
      const transmissao = (nome) => (/_(\d{14})_/.exec(nome || '') || [])[1] || ''
      const porAno = (lista) => {
        const r = {}
        for (const a of lista) {
          const ano = String(a.dt_ini).slice(0, 4)
          const atual = r[ano]
          const chaveA = transmissao(a.nome) + String(a.id).padStart(12, '0')
          if (!atual || chaveA > transmissao(atual.nome) + String(atual.id).padStart(12, '0'))
            r[ano] = a
        }
        return r
      }
      const FORMA_TRIB = {
        1: 'Lucro Real',
        2: 'Lucro Real/Arbitrado',
        3: 'Lucro Presumido/Real',
        4: 'Lucro Presumido/Real/Arbitrado',
        5: 'Lucro Presumido',
        6: 'Lucro Arbitrado',
        7: 'Lucro Presumido/Arbitrado',
        8: 'Imune do IRPJ',
        9: 'Isenta do IRPJ',
      }

      /** IRPJ/CSLL "a pagar" por período (N030/P030 → N630/N670/P300/P400) e saldo negativo. */
      const apuracao = (id, regPeriodo, regIrpj, codIrpj, regCsll, codCsll) => {
        const periodos = linhas(id, regPeriodo).map((l) => ({
          linha: l.linha,
          per: l.campos[3] || '',
        }))
        const periodoDe = (linha) => {
          let p = ''
          for (const x of periodos) if (x.linha < linha) p = x.per
          return p
        }
        const saida = {}
        const ler = (reg, codigo, campo) => {
          const todas = linhas(id, reg)
          // Linha "a pagar": pelo código do leiaute; se não houver, a última cuja descrição diz "A PAGAR".
          let alvo = todas.filter((l) => String(l.campos[1]) === codigo)
          if (!alvo.length) {
            const porPeriodo = {}
            for (const l of todas)
              if (/A PAGAR|A RECOLHER/i.test(l.campos[2] || '')) porPeriodo[periodoDe(l.linha)] = l
            alvo = Object.keys(porPeriodo).map((k) => porPeriodo[k])
          }
          for (const l of alvo) {
            const per = periodoDe(l.linha) || 'A00'
            const v = num(l.campos[3])
            if (v == null) continue
            const x = saida[per] || (saida[per] = { periodo: per, irpj: null, csll: null })
            x[campo] = v
          }
        }
        ler(regIrpj, codIrpj, 'irpj')
        ler(regCsll, codCsll, 'csll')
        return Object.keys(saida)
          .sort()
          .map((k) => saida[k])
      }

      const ecds = porAno(
        api('/v1/sped/arquivos?cnpj=' + cnpj + '&tipo=ECD&limite=100').arquivos || [],
      )
      const ecfs = porAno(
        api('/v1/sped/arquivos?cnpj=' + cnpj + '&tipo=ECF&limite=100').arquivos || [],
      )
      const anos = {}
      const hoje = new Date()
      for (let a = hoje.getFullYear() - 5; a < hoje.getFullYear(); a++) anos[String(a)] = true
      for (const a of Object.keys(ecds).concat(Object.keys(ecfs))) anos[a] = true
      const arquivo = (a) =>
        a
          ? { id: a.id, nome: a.nome, de: a.dt_ini, ate: a.dt_fin, importadoEm: a.importado_em }
          : null

      const lista = Object.keys(anos)
        .sort()
        .reverse()
        .map((ano) => {
          const ecf = ecfs[ano]
          let info = null
          if (ecf) {
            try {
              const r0010 = (linhas(ecf.id, '0010')[0] || {}).campos || []
              // Campos localizados pelo formato (as versões do leiaute mudam a posição).
              let iTrib = -1
              for (let i = 3; i < r0010.length; i++)
                if (/^[1-9]$/.test(r0010[i] || '')) {
                  iTrib = i
                  break
                }
              const formaTrib = iTrib >= 0 ? r0010[iTrib] : null
              let formaApur = null
              for (let i = iTrib + 1; iTrib >= 0 && i < r0010.length; i++)
                if (r0010[i] === 'A' || r0010[i] === 'T') {
                  formaApur = r0010[i] === 'A' ? 'anual (estimativas mensais)' : 'trimestral'
                  break
                }
              const presumido = formaTrib === '5' || formaTrib === '7'
              const periodos = presumido
                ? apuracao(ecf.id, 'P030', 'P300', '15', 'P400', '')
                : apuracao(ecf.id, 'N030', 'N630', '26', 'N670', '21')
              let retIr = 0
              let retCsll = 0
              const fontes = {}
              for (const l of linhas(ecf.id, 'Y570')) {
                retIr += num(l.campos[6]) || 0
                retCsll += num(l.campos[7]) || 0
                if (l.campos[1]) fontes[l.campos[1]] = true
              }
              const negIrpj = periodos.reduce(
                (s, p) => s + (p.irpj != null && p.irpj < 0 ? -p.irpj : 0),
                0,
              )
              const negCsll = periodos.reduce(
                (s, p) => s + (p.csll != null && p.csll < 0 ? -p.csll : 0),
                0,
              )
              info = {
                formaTributacao: formaTrib ? FORMA_TRIB[formaTrib] || formaTrib : null,
                formaApuracao: presumido ? 'trimestral' : formaApur,
                periodos: periodos,
                saldoNegativo: {
                  irpj: Math.round(negIrpj * 100) / 100,
                  csll: Math.round(negCsll * 100) / 100,
                  status: negIrpj + negCsll > 0 ? 'CRÉDITO POTENCIAL' : null,
                },
                retencoes: {
                  ir: Math.round(retIr * 100) / 100,
                  csll: Math.round(retCsll * 100) / 100,
                  fontes: Object.keys(fontes).length,
                },
              }
            } catch (err) {
              info = { erro: err.message || String(err) }
            }
          }
          return { ano: ano, ecd: arquivo(ecds[ano]), ecf: arquivo(ecf), ecfInfo: info }
        })
      return { cnpj: cnpj, anos: lista }
    }

    // ------------------------------------------------------------------ situação atual e perfil a partir do SPED
    // Leitura do SPED já importado na API ReceitanetBX para montar a situação tributária atual (somente leitura).
    // Posições: campos[0] = REG; campos[n] = campo n+1 do leiaute; valores com vírgula decimal.
    //   M200/M600 idx2 = VL_TOT_CRED_DESC, idx12 = VL_TOT_CONT_REC   M210 idx2 = VL_REC_BRT
    //   E110 idx12 = VL_ICMS_RECOLHER                               E520 idx7 = VL_SD_IPI
    //   Perfil: EFD-Contrib 0000 UF idx9, COD_MUN idx10, IND_ATIV idx13 · 0140 estabelecimentos · M105 idx6 VL_BC_PIS (base de crédito)
    //   M400 idx1 CST (04 = monofásico) · EFD ICMS 0000 UF idx8, COD_MUN idx10, IND_ATIV idx14 · C190 CST idx1, CFOP idx2, ALIQ idx3, VL_OPR idx4, VL_BC idx5
    //   ECF 0030 CNAE idx2, UF idx7, COD_MUN idx8 · N630 código 1 (base de cálculo do IRPJ) idx3 · M010/M500 parte B (prejuízo fiscal)

    function situacaoAtual(api, cnpj, matriz, declaracoes) {
      const num = (v) => {
        const s = String(v == null ? '' : v).trim()
        if (!s) return 0
        const n = parseFloat(s.replace(/\./g, '').replace(',', '.'))
        return isNaN(n) ? 0 : n
      }
      const r2 = (v) => Math.round(v * 100) / 100
      const linhas = (id, reg) =>
        api('/v1/sped/arquivos/' + id + '/registros/' + reg + '?limite=10000').linhas || []
      const transmissao = (nome) => (/_(\d{14})_/.exec(nome || '') || [])[1] || ''
      /** Última transmissão de cada mês, os 12 meses mais recentes. */
      const ultimos12 = (lista) => {
        const porMes = {}
        for (const a of lista) {
          const mes = String(a.dt_ini).slice(0, 7)
          const atual = porMes[mes]
          const k = transmissao(a.nome) + String(a.id).padStart(12, '0')
          if (!atual || k > transmissao(atual.nome) + String(atual.id).padStart(12, '0'))
            porMes[mes] = a
        }
        return Object.keys(porMes)
          .sort()
          .reverse()
          .slice(0, 12)
          .map((m) => porMes[m])
      }
      const listar = (doc, tipo) =>
        api('/v1/sped/arquivos?cnpj=' + doc + '&tipo=' + tipo + '&limite=200').arquivos || []
      const avisos = []
      const linhas1 = (id, reg) =>
        api('/v1/sped/arquivos/' + id + '/registros/' + reg + '?limite=1').linhas || []
      const perfil = { setores: {}, operacoes: {}, fontes: {} }
      const marca = (campo, valor, fonte) => {
        if (valor == null || valor === '' || perfil[campo] != null) return
        perfil[campo] = valor
        perfil.fontes[campo] = fonte
      }
      const marcaG = (g, campo, valor, fonte) => {
        if (valor == null || perfil[g][campo] != null) return
        perfil[g][campo] = valor
        perfil.fontes[g + '.' + campo] = fonte
      }

      // EFD-Contribuições (centralizada na matriz)
      let contrib = null
      let arqC = listar(cnpj, 'EFD-CONTRIBUICOES')
      if (!arqC.length && matriz !== cnpj) {
        arqC = listar(matriz, 'EFD-CONTRIBUICOES')
        if (arqC.length)
          avisos.push('EFD-Contribuições lida da matriz (' + matriz + '): valores do CNPJ inteiro.')
      }
      const mesesC = ultimos12(arqC)
      if (mesesC.length) {
        const t = {
          receitaBruta: 0,
          pis: 0,
          cofins: 0,
          creditosPis: 0,
          creditosCofins: 0,
          regime: null,
        }
        for (const a of mesesC) {
          for (const l of linhas(a.id, 'M200')) {
            t.pis += num(l.campos[12])
            t.creditosPis += num(l.campos[2])
          }
          for (const l of linhas(a.id, 'M600')) {
            t.cofins += num(l.campos[12])
            t.creditosCofins += num(l.campos[2])
          }
          for (const l of linhas(a.id, 'M210')) t.receitaBruta += num(l.campos[2])
          if (!t.regime) {
            const r = linhas(a.id, '0110')[0]
            if (r)
              t.regime =
                r.campos[1] === '1'
                  ? 'não cumulativo'
                  : r.campos[1] === '2'
                    ? 'cumulativo'
                    : 'misto'
          }
          for (const l of linhas(a.id, 'M105'))
            t.basesCredito = (t.basesCredito || 0) + num(l.campos[6])
          if (!t.mono) for (const l of linhas(a.id, 'M400')) if (l.campos[1] === '04') t.mono = true
          // A100 IND_OPER 1 = serviço prestado; COD_SIT idx4 (02-05 = cancelada/denegada/inutilizada); VL_DOC idx11, VL_DESC idx13, VL_ISS idx20
          for (const l of linhas(a.id, 'A100')) {
            if (l.campos[1] !== '1' || ['02', '03', '04', '05'].indexOf(String(l.campos[4])) >= 0)
              continue
            t.servicos = true
            t.recServ = (t.recServ || 0) + num(l.campos[11]) - num(l.campos[13])
            t.iss = (t.iss || 0) + num(l.campos[20])
          }
        }
        const ult = mesesC[0]
        const r0 = (linhas1(ult.id, '0000')[0] || {}).campos || []
        const fC = 'EFD-Contribuições ' + String(ult.dt_ini).slice(0, 7)
        if (/^[A-Z]{2}$/.test(r0[9] || '')) marca('uf', r0[9], fC)
        if (/^\d{7}$/.test(r0[10] || '')) marca('codMun', r0[10], fC)
        const ativ = { 0: 'industria', 2: 'comercio', 1: 'servicos', 4: 'imobiliario' }[r0[13]]
        if (ativ) marcaG('setores', ativ, true, fC + ' (0000, indicador de atividade)')
        const estab = linhas(ult.id, '0140').length
        if (estab)
          marcaG(
            'operacoes',
            'filiais',
            estab > 1,
            fC + ' (0140: ' + estab + ' estabelecimento(s))',
          )
        if (t.basesCredito)
          marca(
            'comprasCreditaveis',
            r2((t.basesCredito * 12) / mesesC.length),
            'EFD-Contribuições M105 (bases de crédito, anualizado)',
          )
        if (t.mono) marcaG('operacoes', 'monofasicos', true, 'EFD-Contribuições M400 CST 04')
        if (t.servicos)
          marcaG('setores', 'servicos', true, 'EFD-Contribuições A100 (notas de serviço emitidas)')
        if (t.recServ > 0)
          marca(
            'receitaServicos',
            r2((t.recServ * 12) / mesesC.length),
            'EFD-Contribuições A100: notas de serviço emitidas (valor − desconto), anualizado',
          )
        if (t.recServ > 0 && t.iss > 0) {
          marca(
            'aliquotaIss',
            Math.round((t.iss / t.recServ) * 10000) / 100,
            'EFD-Contribuições A100: ISS das notas de serviço emitidas ÷ valor dos serviços (alíquota efetiva praticada)',
          )
          marcaG(
            'operacoes',
            'contribuinteIss',
            true,
            'EFD-Contribuições A100 (ISS nas notas emitidas)',
          )
        }
        if (t.receitaBruta)
          marca(
            'receitaAnual',
            r2((t.receitaBruta * 12) / mesesC.length),
            'EFD-Contribuições M210 (receita bruta, anualizada)',
          )
        const datas = mesesC.map((a) => String(a.dt_ini).slice(0, 10)).sort()
        contrib = {
          de: datas[0],
          ate: datas[datas.length - 1],
          meses: mesesC.length,
          receitaBruta: r2(t.receitaBruta),
          pis: r2(t.pis),
          cofins: r2(t.cofins),
          creditosPis: r2(t.creditosPis),
          creditosCofins: r2(t.creditosCofins),
          regime: t.regime,
          iss: r2(t.iss || 0),
        }
        if (mesesC.length < 12)
          avisos.push(
            'EFD-Contribuições com ' +
              mesesC.length +
              ' meses: PIS/COFINS somam só esse período (anualize se for o caso).',
          )
        if (!t.receitaBruta)
          avisos.push('Sem M210 com receita bruta: informe a receita anual no perfil.')
      }

      // EFD ICMS/IPI (por estabelecimento)
      let icms = null
      const mesesI = ultimos12(listar(cnpj, 'EFD-ICMS-IPI'))
      if (mesesI.length) {
        let vIcms = 0,
          vIpi = 0
        const cf = {
          saidas: 0,
          ind: 0,
          com: 0,
          inter: false,
          exp: false,
          imp: false,
          st: false,
          aliqBc: 0,
          bc: 0,
        }
        for (const a of mesesI) {
          for (const l of linhas(a.id, 'E110')) vIcms += num(l.campos[12])
          for (const l of linhas(a.id, 'E520')) vIpi += num(l.campos[7])
          for (const l of linhas(a.id, 'C190')) {
            const cst = String(l.campos[1] || ''),
              cfop = String(l.campos[2] || ''),
              aliq = num(l.campos[3]),
              opr = num(l.campos[4]),
              bc = num(l.campos[5])
            const d = cfop[0]
            if (!/^[1-7]\d{3}$/.test(cfop)) continue
            if ('567'.indexOf(d) >= 0) cf.saidas += opr
            if (d === '6' || d === '2') cf.inter = true
            if (d === '7') cf.exp = true
            if (d === '3') cf.imp = true
            const fim = cfop.slice(1)
            if (
              [
                '101',
                '103',
                '105',
                '109',
                '111',
                '113',
                '116',
                '118',
                '122',
                '124',
                '125',
                '401',
                '402',
              ].indexOf(fim) >= 0
            )
              cf.ind += opr
            if (
              [
                '102',
                '104',
                '106',
                '108',
                '110',
                '112',
                '114',
                '115',
                '117',
                '119',
                '120',
                '123',
                '403',
                '404',
                '405',
              ].indexOf(fim) >= 0 &&
              '56'.indexOf(d) >= 0
            )
              cf.com += opr
            if (/(10|30|60|70)$/.test(cst)) cf.st = true
            if (d === '5' && aliq > 0 && bc > 0) {
              cf.aliqBc += aliq * bc
              cf.bc += bc
            }
          }
        }
        const fI =
          'EFD ICMS/IPI ' +
          String(mesesI[mesesI.length - 1].dt_ini).slice(0, 7) +
          ' a ' +
          String(mesesI[0].dt_ini).slice(0, 7) +
          ' (C190)'
        marcaG('operacoes', 'contribuinteIcms', true, 'EFD ICMS/IPI entregue')
        if (cf.ind) marcaG('setores', 'industria', true, fI + ': CFOP de produção própria')
        if (cf.com) marcaG('setores', 'comercio', true, fI + ': CFOP de revenda')
        marcaG('operacoes', 'interestadual', cf.inter, fI)
        marcaG('operacoes', 'exporta', cf.exp, fI)
        marcaG('operacoes', 'importa', cf.imp, fI)
        marcaG('operacoes', 'substituicaoTributaria', cf.st, fI + ' (CST 10/30/60/70)')
        if (cf.bc)
          marca(
            'aliquotaIcms',
            Math.round((cf.aliqBc / cf.bc) * 100) / 100,
            fI + ': alíquota média ponderada das saídas internas (pode refletir redução de base)',
          )
        if (cf.saidas)
          marca('receitaAnual', r2((cf.saidas * 12) / mesesI.length), fI + ': saídas, anualizadas')
        const i0 = (linhas1(mesesI[0].id, '0000')[0] || {}).campos || []
        if (/^[A-Z]{2}$/.test(i0[8] || '')) marca('uf', i0[8], 'EFD ICMS/IPI 0000')
        if (/^\d{7}$/.test(i0[10] || '')) marca('codMun', i0[10], 'EFD ICMS/IPI 0000')
        if (i0[14] === '0')
          marcaG(
            'operacoes',
            'contribuinteIpi',
            true,
            'EFD ICMS/IPI 0000 (industrial ou equiparado)',
          )
        if (vIpi > 0)
          marcaG('operacoes', 'contribuinteIpi', true, 'EFD ICMS/IPI E520 (IPI a recolher)')
        const datas = mesesI.map((a) => String(a.dt_ini).slice(0, 10)).sort()
        icms = {
          de: datas[0],
          ate: datas[datas.length - 1],
          meses: mesesI.length,
          icms: r2(vIcms),
          ipi: r2(vIpi),
          estabelecimentos: 1,
        }
        avisos.push('ICMS/IPI apenas deste estabelecimento; ICMS-ST (E210) e DIFAL não incluídos.')
        if (mesesI.length < 12) avisos.push('EFD ICMS/IPI com ' + mesesI.length + ' meses.')
      }

      // ECF mais recente (forma de tributação e IRPJ/CSLL a pagar)
      let ecf = null
      try {
        const decl = declaracoes(api, cnpj)
        const ultimo = (decl.anos || []).find((a) => a.ecf && a.ecfInfo && !a.ecfInfo.erro)
        if (ultimo) {
          const info = ultimo.ecfInfo
          let irpj = 0,
            csll = 0,
            temIr = false,
            temCs = false
          for (const p of info.periodos || []) {
            if (p.irpj != null && p.irpj > 0) {
              irpj += p.irpj
              temIr = true
            }
            if (p.csll != null && p.csll > 0) {
              csll += p.csll
              temCs = true
            }
          }
          ecf = {
            ano: ultimo.ano,
            formaTributacao: info.formaTributacao,
            formaApuracao: info.formaApuracao,
            irpj: temIr ? r2(irpj) : null,
            csll: temCs ? r2(csll) : null,
            arquivo: ultimo.ecf.nome || String(ultimo.ecf.id),
          }
          if (
            /Real/.test(info.formaTributacao || '') &&
            info.formaApuracao &&
            /anual/.test(info.formaApuracao)
          )
            avisos.push(
              'Lucro Real anual: o valor "a pagar" da ECF já desconta as estimativas mensais pagas. Confira o IRPJ/CSLL devido total (N630/N670) antes de usar.',
            )
          if (/Presumido/.test(info.formaTributacao || '') && !temCs)
            avisos.push(
              'ECF do Presumido sem linha de CSLL a pagar identificada: informe a CSLL manualmente.',
            )
          const fE = 'ECF ' + ultimo.ano
          const id = ultimo.ecf.id
          const c30 = (linhas1(id, '0030')[0] || {}).campos || []
          if (/^\d{7}$/.test(c30[2] || '')) marca('cnae', c30[2], fE + ' (0030)')
          if (/^[A-Z]{2}$/.test(c30[7] || '')) marca('uf', c30[7], fE + ' (0030)')
          if (/^\d{7}$/.test(c30[8] || '')) marca('codMun', c30[8], fE + ' (0030)')
          const f = info.formaTributacao || ''
          const reg =
            /Real/.test(f) && !/Presumido/.test(f)
              ? info.formaApuracao === 'trimestral'
                ? 'real-trimestral'
                : 'real-anual'
              : /Presumido/.test(f)
                ? 'presumido'
                : /Arbitrado/.test(f)
                  ? 'arbitrado'
                  : /Imune|Isenta/.test(f)
                    ? 'imune'
                    : null
          marca('regime', reg, fE + ' (0010: ' + f + ')')
          if (reg && reg.indexOf('real') === 0) {
            let base = 0,
              achou = false
            for (const l of linhas(id, 'N630'))
              if (String(l.campos[1]) === '1' && /BASE DE C.LCULO/i.test(l.campos[2] || '')) {
                base += num(l.campos[3])
                achou = true
              }
            if (achou)
              marca(
                'lucroContabil',
                r2(base),
                fE +
                  ' (N630: base de cálculo do IRPJ somada nos períodos — lucro real após adições/exclusões; negativo = prejuízo)',
              )
            const contas = {}
            for (const l of linhas(id, 'M010'))
              if (
                l.campos[6] === 'I' &&
                (/PREJU/i.test(l.campos[2] || '') || /^1\.00[01]$/.test(l.campos[4] || ''))
              )
                contas[l.campos[1]] = true
            const saldo = {}
            for (const l of linhas(id, 'M500'))
              if (contas[l.campos[1]] && l.campos[2] === 'I')
                saldo[l.campos[1]] = (l.campos[10] === 'D' ? 1 : -1) * num(l.campos[9])
            const prej = Object.keys(saldo).reduce((a, k) => a + Math.max(saldo[k], 0), 0)
            if (prej > 0)
              marca(
                'prejuizoFiscal',
                r2(prej),
                fE +
                  ' (e-Lalur parte B, M010/M500: saldo final de prejuízo fiscal do IRPJ — conferir)',
              )
          }
        }
      } catch (e) {
        avisos.push('ECF: ' + (e && e.message ? e.message : String(e)))
      }
      if (!ecf && !contrib && !icms)
        avisos.push(
          'Nenhum SPED desta empresa no servidor. Peça os arquivos pelo painel de créditos (Pedir à Receita) ou informe os valores manualmente.',
        )
      return { ecf, contrib, icms, perfil, avisos }
    }
    return {
      rbxConfigurado,
      empresasLocais,
      rbx,
      falhar,
      equipe,
      cnpjValido,
      cnpjMatriz,
      ibge,
      emailConfigurado,
      enviarEmail,
      registrarEnvio,
      destinatarios,
      esc,
      moldura,
      relatorioInteligencia,
      SITE,
      declaracoes,
      situacaoAtual,
    }
  })()
  if (!u.emailConfigurado()) return
  const d = new Date()
  d.setUTCDate(1)
  d.setUTCMonth(d.getUTCMonth() - 1)
  const mes = d.toISOString().slice(0, 7)
  const assunto =
    'NOVAS OPORTUNIDADES DE PLANEJAMENTO TRIBUTÁRIO — ' + mes.split('-').reverse().join('/')
  const html = u.moldura(assunto, u.relatorioInteligencia(mes))
  for (const x of u.destinatarios('inteligencia'))
    if (x.periodicidade === 'mensal') u.enviarEmail(x.nome, x.email, 'inteligencia', assunto, html)
})

// ------------------------------------------------------------------ usuários
// O banco não aceita autocadastro (migração 0019). Enquanto não houver nenhum usuário, a tela de login permite criar o
// primeiro acesso; depois disso, só quem está logado cadastra outros (página Usuários).
routerAdd('GET', '/backend/v1/pt/primeiro-acesso', (e) => {
  const n = $app.findRecordsByFilter('users', "id != ''", '', 1, 0).length
  return e.json(200, { livre: n === 0 })
})

routerAdd('POST', '/backend/v1/pt/primeiro-acesso', (e) => {
  if ($app.findRecordsByFilter('users', "id != ''", '', 1, 0).length)
    return e.json(403, {
      erro: 'O primeiro acesso já foi criado. Peça a um usuário cadastrado para incluir você.',
    })
  let b = {}
  try {
    b = e.requestInfo().body || {}
  } catch (err) {
    b = {}
  }
  const nome = String(b.nome || '').trim()
  const email = String(b.email || '')
    .trim()
    .toLowerCase()
  const senha = String(b.senha || '')
  if (!nome) return e.json(422, { erro: 'Informe o nome.' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return e.json(422, { erro: 'E-mail inválido.' })
  if (senha.length < 8) return e.json(422, { erro: 'A senha precisa ter pelo menos 8 caracteres.' })
  const r = new Record($app.findCollectionByNameOrId('users'))
  r.set('email', email)
  r.set('name', nome)
  r.setPassword(senha)
  r.setVerified(true)
  $app.save(r)
  return e.json(200, { ok: true })
})

routerAdd(
  'GET',
  '/backend/v1/pt/usuarios',
  (e) => {
    const lista = $app.findRecordsByFilter('users', "id != ''", 'name', 0, 0)
    return e.json(
      200,
      lista.map((r) => ({
        id: r.id,
        nome: r.getString('name'),
        email: r.getString('email'),
        criado: r.getString('created'),
      })),
    )
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/pt/usuarios',
  (e) => {
    let b = {}
    try {
      b = e.requestInfo().body || {}
    } catch (err) {
      b = {}
    }
    const nome = String(b.nome || '').trim()
    const email = String(b.email || '')
      .trim()
      .toLowerCase()
    const senha = String(b.senha || '')
    if (!nome) return e.json(422, { erro: 'Informe o nome.' })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return e.json(422, { erro: 'E-mail inválido.' })
    if (senha.length < 8)
      return e.json(422, { erro: 'A senha precisa ter pelo menos 8 caracteres.' })
    if ($app.findRecordsByFilter('users', 'email = {:email}', '', 1, 0, { email: email }).length)
      return e.json(409, { erro: 'Já existe um usuário com esse e-mail.' })
    const r = new Record($app.findCollectionByNameOrId('users'))
    r.set('email', email)
    r.set('name', nome)
    r.setPassword(senha)
    r.setVerified(true)
    $app.save(r)
    return e.json(200, { ok: true, id: r.id })
  },
  $apis.requireAuth(),
)
