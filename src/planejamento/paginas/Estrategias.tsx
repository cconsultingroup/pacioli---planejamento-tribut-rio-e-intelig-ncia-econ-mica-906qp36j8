import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/planejamento/ui/card'
import { Input } from '@/planejamento/ui/input'
import { SeloRisco, brl, classeSelect, useManual } from '@/planejamento/components/comuns'
import { Skeleton } from '@/planejamento/ui/skeleton'

export default function Estrategias() {
  const { manual } = useManual()
  const [busca, setBusca] = useState('')
  const [bloco, setBloco] = useState('')
  const [modelo, setModelo] = useState('')
  if (!manual) return <Skeleton className="h-96 w-full" />
  const modelos = [...new Set(manual.estrategias.map((e) => e.modelo))].sort()
  const b = busca.toLowerCase()
  const lista = manual.estrategias.filter(
    (e) =>
      (!bloco || String(e.bloco) === bloco) &&
      (!modelo || e.modelo === modelo) &&
      (!b ||
        e.titulo.toLowerCase().includes(b) ||
        e.codigo.includes(b) ||
        e.mecanismo.join(' ').toLowerCase().includes(b) ||
        e.fontes.join(' ').toLowerCase().includes(b)),
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Base de estratégias</h1>
        <p className="text-sm text-muted-foreground">
          {manual.titulo} · versão {manual.versao} · {manual.estrategias.length} estratégias (
          {manual.estrategias.filter((e) => e.origem === 'inteligencia').length} incorporadas pela
          inteligência adaptativa).
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Input
          className="w-72"
          placeholder="Buscar (nome, número, texto, fonte)"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <select
          className={classeSelect + ' w-auto'}
          value={bloco}
          onChange={(e) => setBloco(e.target.value)}
        >
          <option value="">Todos os blocos</option>
          {manual.blocos.map((x) => (
            <option key={x.numero} value={x.numero}>
              Bloco {String(x.numero).padStart(2, '0')} · {x.nome}
            </option>
          ))}
        </select>
        <select
          className={classeSelect + ' w-auto'}
          value={modelo}
          onChange={(e) => setModelo(e.target.value)}
        >
          <option value="">Todos os modelos</option>
          {modelos.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <span className="self-center text-sm text-muted-foreground">{lista.length} resultados</span>
      </div>
      {manual.blocos
        .filter((x) => !bloco || String(x.numero) === bloco)
        .map((bl) => {
          const itens = lista.filter((e) => e.bloco === bl.numero)
          if (!itens.length) return null
          return (
            <Card key={bl.numero}>
              <CardContent className="pt-5">
                <h2 className="font-display text-lg font-bold">
                  Bloco {String(bl.numero).padStart(2, '0')} · {bl.nome}
                </h2>
                <p className="mb-3 text-xs text-muted-foreground">{bl.intro}</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {itens.map((e) => (
                    <Link
                      key={e.numero}
                      to={`/planejamento-tributario/estrategias/${e.numero}`}
                      className="rounded-lg border p-3 transition-colors hover:border-primary/50 hover:bg-muted/30"
                    >
                      <div className="text-sm font-medium">
                        {e.codigo} · {e.titulo}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{e.modelo}</span>
                        <SeloRisco risco={e.risco} />
                        {e.memoria.economiaIlustrativa != null && (
                          <span>exemplo do manual: {brl(e.memoria.economiaIlustrativa)}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      {lista.some((e) => e.bloco == null) && (
        <Card>
          <CardContent className="pt-5">
            <h2 className="font-display text-lg font-bold">
              Incorporadas pela inteligência adaptativa
            </h2>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {lista
                .filter((e) => e.bloco == null)
                .map((e) => (
                  <Link
                    key={e.numero}
                    to={`/planejamento-tributario/estrategias/${e.numero}`}
                    className="rounded-lg border p-3 text-sm hover:bg-muted/30"
                  >
                    {e.codigo} · {e.titulo}
                  </Link>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
