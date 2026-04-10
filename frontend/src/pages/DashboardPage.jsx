import {
  ArrowRight,
  CheckCheck,
  Download,
  EllipsisVertical,
  TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import MetricCard from '../components/dashboard/MetricCard'
import {
  chartBars,
  quickActions,
  recentActivity,
  statCards,
  upcomingCeremonies,
} from '../data/dashboardData'
import AdminLayout from '../layouts/AdminLayout'

function DashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="flex flex-col gap-3">
          <span className="inline-flex w-fit rounded-full bg-cobalt-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cobalt">
            Resumen ejecutivo
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Panel Institucional
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              Resumen de operaciones y estado actual del Colegio de Psicologos de Lima.
            </p>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-4">
          {statCards.map((card) => (
            <MetricCard key={card.title} {...card} />
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_320px]">
          <article className="rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-2xl font-semibold tracking-tight text-slate-950">
                  Tendencias de Colegiacion
                </p>
                <p className="text-sm text-slate-500">
                  Registros nuevos vs. renovaciones mensuales
                </p>
              </div>

              <div className="inline-flex w-fit rounded-2xl bg-slate-100 p-1">
                <button
                  type="button"
                  className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow-sm"
                >
                  Mensual
                </button>
                <button
                  type="button"
                  className="rounded-xl px-5 py-2 text-sm font-semibold text-slate-500"
                >
                  Anual
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
              <div className="rounded-[28px] bg-[linear-gradient(180deg,#0f172a_0%,#1e40af_100%)] p-5 text-white shadow-[0_18px_42px_-28px_rgba(30,64,175,0.8)]">
                <div className="inline-flex rounded-2xl bg-white/[0.12] p-3 backdrop-blur">
                  <TrendingUp size={22} strokeWidth={2.2} />
                </div>
                <p className="mt-6 text-4xl font-bold tracking-tight">+18%</p>
                <p className="mt-2 text-sm text-blue-100">
                  Crecimiento sostenido en nuevas colegiaturas durante el trimestre.
                </p>
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.08] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-blue-100/80">
                    Punto fuerte
                  </p>
                  <p className="mt-2 text-sm font-medium">Renovaciones al dia en sede central</p>
                </div>
              </div>

              <div className="flex flex-col justify-end rounded-[28px] bg-[linear-gradient(180deg,#f7f9ff_0%,#f2f5ff_100%)] p-5">
                <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Nuevos</p>
                    <p className="mt-2 text-2xl font-bold text-slate-950">428</p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Renov.</p>
                    <p className="mt-2 text-2xl font-bold text-slate-950">311</p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Pend.</p>
                    <p className="mt-2 text-2xl font-bold text-slate-950">58</p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Meta</p>
                    <p className="mt-2 text-2xl font-bold text-slate-950">92%</p>
                  </div>
                </div>

                <div className="flex h-[260px] items-end gap-3 rounded-[28px] bg-white px-5 pb-5 pt-6 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.75)] sm:gap-4">
                  {chartBars.map((bar) => {
                    const totalHeight = `${bar.total * 10}px`
                    const filledHeight = `${bar.filled * 10}px`

                    return (
                      <div key={bar.label} className="flex flex-1 flex-col items-center gap-3">
                        <div
                          className="flex w-full max-w-[72px] items-end overflow-hidden rounded-t-2xl rounded-b-md bg-slate-200"
                          style={{ height: totalHeight }}
                        >
                          <div
                            className="w-full rounded-t-2xl bg-[linear-gradient(180deg,#2953e7_0%,#16369a_100%)]"
                            style={{ height: filledHeight }}
                          />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          {bar.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </article>

          <div className="space-y-5">
            <article className="rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-slate-700">
                  Accesos rapidos
                </h2>
              </div>

              <div className="space-y-3">
                {quickActions.map(({ title, description, primary, icon: Icon, path }) => {
                  const classes = `flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left transition ${
                    primary
                      ? 'bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] text-white shadow-[0_20px_36px_-30px_rgba(30,64,175,0.9)]'
                      : 'bg-cobalt-soft text-slate-800 hover:bg-[#d7e3ff]'
                  }`

                  const content = (
                    <>
                      <div className="flex items-center gap-3">
                        <div
                          className={`rounded-2xl p-3 ${
                            primary ? 'bg-white/[0.12] text-white' : 'bg-white text-cobalt'
                          }`}
                        >
                          <Icon size={18} strokeWidth={2.2} />
                        </div>
                        <div>
                          <p className="font-semibold">{title}</p>
                          <p
                            className={`text-xs ${
                              primary ? 'text-blue-100' : 'text-slate-500'
                            }`}
                          >
                            {description}
                          </p>
                        </div>
                      </div>

                      <ArrowRight size={18} strokeWidth={2.1} />
                    </>
                  )

                  if (path) {
                    return (
                      <Link
                        key={title}
                        to={path}
                        className={classes}
                      >
                        {content}
                      </Link>
                    )
                  }

                  return (
                    <button
                    key={title}
                    type="button"
                    className={classes}
                  >
                    {content}
                  </button>
                  )
                })}
              </div>
            </article>

            <article className="rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-slate-700">
                  Actividad reciente
                </h2>
                <button type="button" className="text-xs font-semibold uppercase tracking-[0.18em] text-cobalt">
                  Ver todo
                </button>
              </div>

              <div className="space-y-4">
                {recentActivity.map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <div className={`mt-1 rounded-2xl p-3 ${item.tone}`}>
                      <CheckCheck size={16} strokeWidth={2.2} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-sm leading-6 text-slate-500">{item.detail}</p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Proximos Colegiados a Juramentar
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Expedientes aprobados y listos para coordinacion institucional.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-cobalt-soft px-4 py-3 text-sm font-semibold text-cobalt"
            >
              <Download size={16} strokeWidth={2.2} />
              Descargar lista
            </button>
          </div>

          <div className="mt-6 overflow-hidden rounded-[26px] border border-slate-200">
            <div className="hidden grid-cols-[1.1fr_1.6fr_1fr_1fr_80px] bg-[#e9f0ff] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500 md:grid">
              <span>Expediente</span>
              <span>Nombre completo</span>
              <span>Especialidad</span>
              <span>Fecha tentativa</span>
              <span>Accion</span>
            </div>

            <div className="divide-y divide-slate-200 bg-white">
              {upcomingCeremonies.map((item) => (
                <div
                  key={item.code}
                  className="grid gap-4 px-5 py-5 md:grid-cols-[1.1fr_1.6fr_1fr_1fr_80px] md:items-center md:px-6"
                >
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                      Expediente
                    </p>
                    <p className="font-semibold text-cobalt">{item.code}</p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                      Nombre completo
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f172a_0%,#60a5fa_100%)] text-sm font-bold text-white">
                        {item.name
                          .split(' ')
                          .slice(1, 3)
                          .map((name) => name[0])
                          .join('')}
                      </div>
                      <span className="font-semibold text-slate-900">{item.name}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                      Especialidad
                    </p>
                    <p className="text-sm text-slate-600">{item.specialty}</p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                      Fecha tentativa
                    </p>
                    <p className="font-semibold text-slate-900">{item.date}</p>
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

          <footer className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>(c) 2026 Colegio de Psicologos de Lima - Sistema de Gestion Institucional</p>
            <div className="flex flex-wrap gap-4">
              <span>Terminos de uso</span>
              <span>Soporte tecnico</span>
              <span>v1.2.4-stable</span>
            </div>
          </footer>
        </section>
      </div>
    </AdminLayout>
  )
}

export default DashboardPage
