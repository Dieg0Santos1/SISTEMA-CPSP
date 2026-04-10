import {
  ChevronLeft,
  ChevronRight,
  Download,
  EllipsisVertical,
  Filter,
  Plus,
} from 'lucide-react'
import AdminLayout from '../layouts/AdminLayout'
import {
  colegiadosFilters,
  colegiadosPagination,
  colegiadosRows,
  colegiadosSummaryCards,
} from '../data/dashboardData'

function ColegiadosPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Panel</span>
              <ChevronRight size={14} />
              <span className="font-semibold text-cobalt">Colegiados</span>
            </div>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Gestion de Colegiados
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              Administre el padron oficial de psicologos colegiados en la region Lima.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#d9e4ff] px-5 py-3 text-sm font-semibold text-cobalt transition hover:bg-[#cfddff]"
            >
              <Download size={16} strokeWidth={2.1} />
              Importar padron
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)] transition hover:-translate-y-0.5"
            >
              <Plus size={16} strokeWidth={2.2} />
              Nuevo Colegiado
            </button>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {colegiadosSummaryCards.map((card) => (
            <article
              key={card.title}
              className={`rounded-[26px] border border-slate-200 bg-[#fdfefe] p-6 shadow-[0_16px_34px_-30px_rgba(15,23,42,0.55)] ${card.accent}`}
            >
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                {card.title}
              </p>
              <p className="mt-3 text-[2.25rem] font-bold tracking-tight text-slate-950">
                {card.value}
              </p>
              <p className={`mt-2 text-sm font-medium ${card.noteTone}`}>{card.note}</p>
            </article>
          ))}
        </section>

        <section className="rounded-[30px] border border-white/80 bg-white p-4 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {colegiadosFilters.map((filter, index) => (
                <button
                  key={filter}
                  type="button"
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    index === 0
                      ? 'bg-cobalt-soft text-cobalt shadow-[inset_0_-2px_0_0_#1739a6]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 self-start rounded-2xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Filter size={16} strokeWidth={2.2} />
              Filtros Avanzados
            </button>
          </div>

          <div className="mt-5 overflow-hidden rounded-[26px] border border-slate-200">
            <div className="hidden grid-cols-[1.05fr_1fr_2fr_1.7fr_1.2fr_90px] bg-[#e8f0ff] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 lg:grid">
              <span>Codigo</span>
              <span>DNI</span>
              <span>Nombre completo</span>
              <span>Especialidad</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>

            <div className="divide-y divide-slate-200 bg-white">
              {colegiadosRows.map((colegiado) => (
                <div
                  key={colegiado.code}
                  className="grid gap-4 px-4 py-5 lg:grid-cols-[1.05fr_1fr_2fr_1.7fr_1.2fr_90px] lg:items-center lg:px-6"
                >
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                      Codigo
                    </p>
                    <p className="font-semibold leading-6 text-cobalt">
                      {colegiado.code.slice(0, 4)}
                      <br />
                      {colegiado.code.slice(4)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                      DNI
                    </p>
                    <p className="text-sm font-medium text-slate-700">{colegiado.dni}</p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                      Nombre completo
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${colegiado.avatarTone}`}
                      >
                        {colegiado.initials}
                      </div>
                      <p className="max-w-[17rem] font-semibold leading-6 text-slate-900">
                        {colegiado.name}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                      Especialidad
                    </p>
                    <p className="max-w-[16rem] text-sm leading-6 text-slate-600">
                      {colegiado.specialty}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                      Estado
                    </p>
                    <span
                      className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${colegiado.statusTone}`}
                    >
                      {colegiado.status}
                    </span>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      <EllipsisVertical size={18} strokeWidth={2.1} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>Mostrando 1 a 10 de 12,482 colegiados</p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:text-slate-700"
              >
                <ChevronLeft size={16} strokeWidth={2.2} />
              </button>

              {colegiadosPagination.map((page, index) => (
                <button
                  key={`${page}-${index}`}
                  type="button"
                  className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition ${
                    index === 0
                      ? 'border-cobalt bg-cobalt text-white'
                      : page === '...'
                        ? 'border-transparent bg-transparent text-slate-400'
                        : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:text-slate-700"
              >
                <ChevronRight size={16} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}

export default ColegiadosPage
