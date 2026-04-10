import {
  ChevronLeft,
  ChevronRight,
  FilePlus2,
  MoreVertical,
  UserRound,
} from 'lucide-react'
import AdminLayout from '../layouts/AdminLayout'
import {
  tribunalCases,
  tribunalPagination,
  tribunalSummaryCards,
} from '../data/dashboardData'

function TribunalPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Tribunal de Honor
            </h1>
            <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-600 sm:text-base">
              Gestion de expedientes disciplinarios, procesos eticos y resoluciones
              institucionales.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)] transition hover:-translate-y-0.5"
          >
            <FilePlus2 size={17} strokeWidth={2.2} />
            Registrar Nueva Denuncia
          </button>
        </section>

        <section className="grid gap-4 lg:grid-cols-4">
          {tribunalSummaryCards.map(({ title, value, accent, iconTone, icon: Icon }) => (
            <article
              key={title}
              className={`rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_16px_34px_-30px_rgba(15,23,42,0.55)] ${accent}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                    {title}
                  </p>
                  <p className="mt-2 text-[2.15rem] font-bold tracking-tight text-slate-950">
                    {value}
                  </p>
                </div>

                <div className={`rounded-2xl bg-slate-50 p-3 ${iconTone}`}>
                  <Icon size={20} strokeWidth={2.2} />
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-[30px] border border-white/80 bg-white p-4 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
          <div className="overflow-hidden rounded-[26px] border border-slate-200">
            <div className="hidden grid-cols-[1.15fr_2.1fr_1fr_1.1fr_90px] bg-[#e8f0ff] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 lg:grid">
              <span>Expediente</span>
              <span>Partes involucradas</span>
              <span>Estado</span>
              <span>Ultima actuacion</span>
              <span>Acciones</span>
            </div>

            <div className="divide-y divide-slate-200 bg-white">
              {tribunalCases.map((item, index) => (
                <div
                  key={item.code}
                  className={`grid gap-4 px-4 py-5 lg:grid-cols-[1.15fr_2.1fr_1fr_1.1fr_90px] lg:items-center lg:px-6 ${
                    index % 2 === 1 ? 'bg-[#f8fbff]' : 'bg-white'
                  }`}
                >
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                      Expediente
                    </p>
                    <p className="font-semibold text-cobalt">{item.code}</p>
                    <p className="mt-1 text-xs text-slate-400">{item.registeredAt}</p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                      Partes involucradas
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${item.avatarTone}`}
                      >
                        <UserRound size={16} strokeWidth={2.3} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{item.person}</p>
                        <p className="text-sm leading-6 text-slate-500">{item.detail}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                      Estado
                    </p>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${item.statusTone}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                      Ultima actuacion
                    </p>
                    <p className="font-medium text-slate-900">{item.lastAction}</p>
                    <p className="mt-1 text-xs text-slate-400">{item.actionDate}</p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      <MoreVertical size={18} strokeWidth={2.1} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>Mostrando 1-4 de 248 expedientes activos</p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:text-slate-700"
              >
                <ChevronLeft size={16} strokeWidth={2.2} />
              </button>

              {tribunalPagination.map((page, index) => (
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

export default TribunalPage
