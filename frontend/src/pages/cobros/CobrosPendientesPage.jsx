import { useMemo, useState } from 'react'
import { Clock3, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  cobrosPendingRows,
  cobrosPendingSummaryCards,
} from '../../data/cobros/cobrosData'

const statusFilters = ['Todos', 'Vence hoy', 'Pendiente', 'Vencido', 'Programado']

function CobrosPendientesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeStatus, setActiveStatus] = useState(statusFilters[0])
  const [activeCategory, setActiveCategory] = useState('Todas')

  const categoryFilters = useMemo(
    () => ['Todas', ...new Set(cobrosPendingRows.map((row) => row.category))],
    [],
  )

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return cobrosPendingRows.filter((row) => {
      const matchesStatus = activeStatus === 'Todos' ? true : row.status === activeStatus
      const matchesCategory =
        activeCategory === 'Todas' ? true : row.category === activeCategory
      const matchesSearch =
        normalizedSearch.length === 0
          ? true
          : [row.memberName, row.memberCode, row.concept, row.id].some((value) =>
              value.toLowerCase().includes(normalizedSearch),
            )

      return matchesStatus && matchesCategory && matchesSearch
    })
  }, [activeCategory, activeStatus, searchTerm])

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-3">
        {cobrosPendingSummaryCards.map((card) => (
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
                Pendientes de cobro
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Vista operativa para encontrar deudas, vencimientos y acciones rapidas.
              </p>
            </div>

            <label className="group flex w-full max-w-md items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-cobalt focus-within:bg-white">
              <Search
                size={18}
                className="text-slate-400 transition group-focus-within:text-cobalt"
              />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por colegiado, concepto o codigo"
                className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveStatus(filter)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    activeStatus === filter
                      ? 'bg-cobalt-soft text-cobalt shadow-[inset_0_-2px_0_0_#1739a6]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {categoryFilters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveCategory(filter)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    activeCategory === filter
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
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
                    <p className="font-semibold text-slate-900">{row.memberName}</p>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-600">
                      {row.memberCode}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${row.statusTone}`}
                    >
                      {row.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {row.concept} · {row.detail}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span className="rounded-full bg-cobalt-soft px-3 py-1 font-medium text-cobalt">
                      {row.category}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock3 size={14} />
                      Vence {row.dueDate}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Monto
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">{row.amount}</p>
                  </div>

                  <Link
                    to="/caja-cobros/registrar"
                    className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)] transition hover:-translate-y-0.5"
                  >
                    {row.actionLabel}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default CobrosPendientesPage
