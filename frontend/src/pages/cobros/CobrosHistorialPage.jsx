import { useMemo, useState } from 'react'
import { Download, FileSearch, Search } from 'lucide-react'
import {
  cobrosHistoryRows,
  cobrosHistorySummaryCards,
} from '../../data/cobros/cobrosData'

const methodFilters = ['Todos', 'Efectivo', 'Transferencia', 'POS / Tarjeta']

function CobrosHistorialPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeMethod, setActiveMethod] = useState(methodFilters[0])

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return cobrosHistoryRows.filter((row) => {
      const matchesMethod = activeMethod === 'Todos' ? true : row.method === activeMethod
      const matchesSearch =
        normalizedSearch.length === 0
          ? true
          : [row.id, row.memberName, row.concept, row.document].some((value) =>
              value.toLowerCase().includes(normalizedSearch),
            )

      return matchesMethod && matchesSearch
    })
  }, [activeMethod, searchTerm])

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-3">
        {cobrosHistorySummaryCards.map((card) => (
          <article
            key={card.title}
            className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_-30px_rgba(15,23,42,0.5)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              {card.title}
            </p>
            <p className="mt-3 text-[2rem] font-bold tracking-tight text-slate-950">
              {card.value}
            </p>
            <p className="mt-2 text-sm text-slate-500">{card.helper}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Historial de cobros
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Consulta operativa por colegiado, comprobante o metodo de pago.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="group flex w-full min-w-[280px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-cobalt focus-within:bg-white">
                <Search
                  size={18}
                  className="text-slate-400 transition group-focus-within:text-cobalt"
                />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar por colegiado, cobro o comprobante"
                  className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
              >
                <Download size={16} strokeWidth={2.1} />
                Exportar reporte
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {methodFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveMethod(filter)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activeMethod === filter
                    ? 'bg-cobalt-soft text-cobalt shadow-[inset_0_-2px_0_0_#1739a6]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {filteredRows.map((row) => (
            <article
              key={row.id}
              className="rounded-[24px] border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-cobalt">{row.id}</p>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${row.methodTone}`}
                    >
                      {row.method}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-600">
                      {row.status}
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                    {row.concept}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{row.memberName}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span>{row.date}</span>
                    <span>{row.operator}</span>
                    <span>{row.document}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Monto
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">{row.amount}</p>
                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                  >
                    <FileSearch size={16} strokeWidth={2.1} />
                    Ver detalle
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default CobrosHistorialPage
