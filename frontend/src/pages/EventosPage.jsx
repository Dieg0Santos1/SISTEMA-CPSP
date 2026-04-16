import { CalendarDays, ChevronRight, FileText, Gift, Users } from 'lucide-react'
import { eventosQuickStats } from '../data/eventos/eventosData'
import EventosOverviewPage from './eventos/EventosOverviewPage'

function EventosPage() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-white/80 bg-[linear-gradient(135deg,#0f172a_0%,#1739a6_48%,#dbe7ff_100%)] p-6 text-white shadow-[0_22px_60px_-34px_rgba(15,23,42,0.8)] sm:p-7">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-sm text-blue-100/80">
              <span>Panel</span>
              <ChevronRight size={14} />
              <span className="font-semibold text-white">Eventos</span>
            </div>

            <div className="max-w-4xl">
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-50 backdrop-blur">
                Modulo de eventos
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Eventos institucionales
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-blue-50/88 sm:text-base">
                Vista independiente para organizar asistencia, controlar presentes y
                seguir la operacion de una jornada sin mezclarla con el modulo
                electoral.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <article className="rounded-[28px] border border-white/15 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-white/12 p-3 text-white">
                  <CalendarDays size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100/80">
                    Enfoque del modulo
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    Registro de asistentes, presentes y seguimiento de jornada.
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-[28px] border border-white/15 bg-white p-5 text-slate-900 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.85)] xl:row-span-2">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-cobalt-soft p-3 text-cobalt">
                  <Users size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Vista preparada
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">
                    Modulo separado para operacion en campo
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {eventosQuickStats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[22px] border border-slate-200 bg-[#f8fbff] p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                      {item.value}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{item.helper}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3">
                <div className="flex items-center gap-3 rounded-[22px] bg-[linear-gradient(135deg,#eff4ff_0%,#ffffff_100%)] p-4">
                  <div className="rounded-2xl bg-white p-3 text-cobalt shadow-sm">
                    <Gift size={18} strokeWidth={2.2} />
                  </div>
                  <p className="text-sm leading-6 text-slate-600">
                    Control visual de presentes sin depender de flujos electorales.
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-[22px] bg-[linear-gradient(135deg,#eff4ff_0%,#ffffff_100%)] p-4">
                  <div className="rounded-2xl bg-white p-3 text-cobalt shadow-sm">
                    <FileText size={18} strokeWidth={2.2} />
                  </div>
                  <p className="text-sm leading-6 text-slate-600">
                    Vista conectada para registrar asistencia y consultar el padron real.
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <EventosOverviewPage />
    </div>
  )
}

export default EventosPage
