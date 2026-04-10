import { useMemo, useState } from 'react'
import {
  ChevronRight,
  Download,
  FileText,
  Plus,
  Search,
} from 'lucide-react'
import {
  conceptosCategoryFilters,
  conceptosRows,
  conceptosSummaryCards,
} from '../data/conceptos/conceptosData'

function ConceptosPage() {
  const [activeFilter, setActiveFilter] = useState(conceptosCategoryFilters[0])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedConceptId, setSelectedConceptId] = useState(conceptosRows[0].id)

  const filteredConcepts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return conceptosRows.filter((concept) => {
      const matchesFilter =
        activeFilter === 'Todos' ? true : concept.category === activeFilter

      const matchesSearch =
        normalizedSearch.length === 0
          ? true
          : [concept.code, concept.name, concept.description]
              .some((value) => value.toLowerCase().includes(normalizedSearch))

      return matchesFilter && matchesSearch
    })
  }, [activeFilter, searchTerm])

  const selectedConcept =
    filteredConcepts.find((concept) => concept.id === selectedConceptId) ??
    filteredConcepts[0] ??
    conceptosRows[0]

  return (
    <div className="space-y-6">
        <section className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Panel</span>
              <ChevronRight size={14} />
              <span className="font-semibold text-cobalt">Conceptos de Cobro</span>
            </div>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Conceptos de Cobro
            </h1>
            <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-600 sm:text-base">
              Administre el catalogo de conceptos que utiliza tesoreria para generar
              operaciones, calcular reglas y emitir comprobantes.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              <Download size={16} strokeWidth={2.1} />
              Exportar catalogo
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)] transition hover:-translate-y-0.5"
            >
              <Plus size={16} strokeWidth={2.2} />
              Nuevo concepto
            </button>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-4">
          {conceptosSummaryCards.map((card) => (
            <article
              key={card.title}
              className={`rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_-30px_rgba(15,23,42,0.5)] ${card.accent}`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
                {card.title}
              </p>
              <p className="mt-3 text-[2.1rem] font-bold tracking-tight text-slate-950">
                {card.value}
              </p>
              <p className={`mt-2 text-sm font-medium ${card.noteTone}`}>{card.note}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_350px]">
          <article className="rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                  {conceptosCategoryFilters.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setActiveFilter(filter)}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        activeFilter === filter
                          ? 'bg-cobalt-soft text-cobalt shadow-[inset_0_-2px_0_0_#1739a6]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                <label className="group flex w-full max-w-sm items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-cobalt focus-within:bg-white">
                  <Search size={18} className="text-slate-400 transition group-focus-within:text-cobalt" />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Buscar por codigo, nombre o descripcion"
                    className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </label>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-[26px] border border-slate-200">
              <div className="hidden grid-cols-[1fr_1.6fr_1.1fr_1fr_0.9fr] bg-[#e8f0ff] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 lg:grid">
                <span>Codigo</span>
                <span>Concepto</span>
                <span>Categoria</span>
                <span>Monto</span>
                <span>Estado</span>
              </div>

              <div className="divide-y divide-slate-200 bg-white">
                {filteredConcepts.map((concept) => (
                  <button
                    key={concept.id}
                    type="button"
                    onClick={() => setSelectedConceptId(concept.id)}
                    className={`grid w-full gap-4 px-4 py-5 text-left transition lg:grid-cols-[1fr_1.6fr_1.1fr_1fr_0.9fr] lg:items-center lg:px-6 ${
                      selectedConcept?.id === concept.id
                        ? 'bg-[#f5f8ff]'
                        : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                        Codigo
                      </p>
                      <p className="font-semibold text-cobalt">{concept.code}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                        Concepto
                      </p>
                      <p className="font-semibold text-slate-900">{concept.name}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {concept.description}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                        Categoria
                      </p>
                      <p className="text-sm font-medium text-slate-700">{concept.category}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                        Monto
                      </p>
                      <p className="text-sm font-semibold text-slate-900">{concept.amount}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                        Estado
                      </p>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${concept.statusTone}`}>
                        {concept.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </article>

          <article className="rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)]">
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-2xl bg-cobalt-soft p-3 text-cobalt">
                <FileText size={20} strokeWidth={2.2} />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                  Regla del concepto
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Vista preparada para futura configuracion detallada.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Concepto</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {selectedConcept?.name}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {selectedConcept?.description}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Codigo</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {selectedConcept?.code}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Monto base</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {selectedConcept?.amount}
                  </p>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Parametros operativos
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedConcept?.requiresPeriod ? (
                    <span className="rounded-full bg-cobalt-soft px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cobalt">
                      Usa periodo
                    </span>
                  ) : null}
                  {selectedConcept?.allowsQuantity ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                      Permite cantidad
                    </span>
                  ) : null}
                  {selectedConcept?.allowsDiscount ? (
                    <span className="rounded-full bg-amber-100 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                      Admite descuento
                    </span>
                  ) : null}
                  {selectedConcept?.affectsHabilitation ? (
                    <span className="rounded-full bg-[#eef2ff] px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
                      Afecta habilitacion
                    </span>
                  ) : null}
                  {selectedConcept?.exoneratedIgv ? (
                    <span className="rounded-full bg-fuchsia-100 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-fuchsia-700">
                      Exonerado IGV
                    </span>
                  ) : null}
                  {selectedConcept?.requiresAttachment ? (
                    <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-700">
                      Requiere adjunto
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#0f172a_0%,#1e40af_100%)] p-4 text-white">
                <p className="text-xs uppercase tracking-[0.18em] text-blue-100/80">
                  Modelo de cobro
                </p>
                <p className="mt-2 text-xl font-semibold">{selectedConcept?.billingMode}</p>
                <p className="mt-2 text-sm text-blue-100">
                  Cuando conectemos backend, este panel puede leer reglas reales desde base
                  de datos sin cambiar la interfaz.
                </p>
              </div>
            </div>
          </article>
        </section>
    </div>
  )
}

export default ConceptosPage
