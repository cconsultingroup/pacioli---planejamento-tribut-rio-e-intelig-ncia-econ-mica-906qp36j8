import { describe, it, expect } from 'vitest'
import {
  linhasParaTexto,
  parseProcuracao,
  parseRegimeTributacao,
  parseSituacao,
  extrairDataISO,
  extrairDataHoraPocketBase,
} from './importar-empresas'

describe('importar-empresas', () => {
  it('faz parse de procuração com e sem validade', () => {
    expect(parseProcuracao('Sim')).toEqual({ procuracao: 'sim', validade: '' })
    expect(parseProcuracao('Sim (validade 30/12/2030)')).toEqual({
      procuracao: 'sim',
      validade: '2030-12-30',
    })
    expect(parseProcuracao('Sim (validade 29/12/2026)')).toEqual({
      procuracao: 'sim',
      validade: '2026-12-29',
    })
    expect(parseProcuracao('Não')).toEqual({ procuracao: 'nao', validade: '' })
    expect(parseProcuracao('')).toEqual({ procuracao: '', validade: '' })
  })

  it('normaliza regimes de tributação', () => {
    expect(parseRegimeTributacao('Simples Nacional')).toBe('simples_nacional')
    expect(parseRegimeTributacao('Lucro Presumido')).toBe('lucro_presumido')
    expect(parseRegimeTributacao('Lucro Real')).toBe('lucro_real')
    expect(parseRegimeTributacao('Regime não informado')).toBe('nao_informado')
    expect(parseRegimeTributacao('')).toBe('')
  })

  it('normaliza situação cadastral', () => {
    expect(parseSituacao('ATIVA')).toBe('ativa')
    expect(parseSituacao('INATIVA')).toBe('inativa')
    expect(parseSituacao('')).toBe('')
  })

  it('extrai data e hora para PocketBase', () => {
    expect(extrairDataHoraPocketBase('16/10/2026, 15:10')).toBe('2026-10-16 15:10:00.000Z')
    expect(extrairDataISO('30/12/2030')).toBe('2030-12-30')
  })

  it('faz parse de matriz com cabeçalhos exatos da planilha', () => {
    const planilha = [
      [
        'Razão social',
        'CNPJ',
        'Regime de tributação',
        'Situação cadastral',
        'Procuração eletrônica',
        'Vendedor responsável',
        'Cadastrado em',
        'Observações',
      ],
      [
        'Empresa Teste Alpha LTDA',
        '11.222.333/0001-44',
        'Lucro Presumido',
        'ATIVA',
        'Sim (validade 30/12/2030)',
        'Vendedor A',
        '16/10/2026, 15:10',
        'Obs teste',
      ],
      [
        'Empresa Teste Beta S.A.',
        '22.333.444/0001-55',
        'Regime não informado',
        'INATIVA',
        'Sim',
        '',
        '25/10/2026, 15:42',
        '',
      ],
    ]

    const res = linhasParaTexto(planilha)
    expect(res.validas).toBe(2)
    expect(res.itens[0]).toEqual({
      nome: 'Empresa Teste Alpha LTDA',
      cnpj: '11222333000144',
      situacao: 'ativa',
      regime_tributacao: 'lucro_presumido',
      procuracao: 'sim',
      procuracao_validade: '2030-12-30',
      vendedor_responsavel: 'Vendedor A',
      cadastrado_em: '2026-10-16 15:10:00.000Z',
      observacao: 'Obs teste',
    })

    expect(res.itens[1]).toEqual({
      nome: 'Empresa Teste Beta S.A.',
      cnpj: '22333444000155',
      situacao: 'inativa',
      regime_tributacao: 'nao_informado',
      procuracao: 'sim',
      procuracao_validade: '',
      vendedor_responsavel: '',
      cadastrado_em: '2026-10-25 15:42:00.000Z',
      observacao: '',
    })
  })
})
