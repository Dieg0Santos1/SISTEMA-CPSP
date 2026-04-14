import { createElement } from 'react'
import {
  CalendarDays,
  CheckCheck,
  FileText,
  ShieldCheck,
  Users,
  Vote,
} from 'lucide-react'
import {
  eleccionesSummaryCards,
  habilitacionRows,
  habilitacionRules,
  mesasGeneradas,
  procesoElectoralSteps,
} from '../../data/eventos/eventosData'

const summaryIcons = [ShieldCheck, CalendarDays, Users, FileText]

function EleccionesPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-white/80 bg-[linear-gradient(135deg,#fff9eb_0%,#ffffff_40%,#eef4ff_100%)] p-6 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-4xl">
            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
              Modulo de elecciones
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Elecciones institucionales
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Pantalla separada para que tesoreria, secretaria y comite electoral
              gestionen el padron habilitado, la asignacion de mesas y el seguimiento
              del proceso sin mezclarlo con la operacion de eventos.
            </p>
          </div>

          <div className="rounded-[26px] border border-amber-200 bg-white px-5 py-4 shadow-sm xl:max-w-sm">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">
              Condicion de 3 meses
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              La validacion electoral considera continuidad minima de tres meses
              previos al corte para determinar si un colegiado queda habilitado u
              observado en el padron.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        {eleccionesSummaryCards.map((card, index) => (
          <article
            key={card.title}
            className={`rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.55)] ${card.accent}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                  {card.title}
                </p>
                <p className="mt-3 text-[2.15rem] font-bold tracking-tight text-slate-950">
                  {card.value}
                </p>
              </div>

              <div className={`rounded-2xl p-3 ${card.iconTone}`}>
                {createElement(summaryIcons[index], { size: 20, strokeWidth: 2.2 })}
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">{card.note}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.45fr)_420px]">
        <article className="rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cobalt-soft p-3 text-cobalt">
              <ShieldCheck size={20} strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                Validacion de colegiados habilitados
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                Padron con regla de continuidad minima
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {habilitacionRules.map((rule) => (
              <div
                key={rule}
                className="rounded-[22px] border border-slate-200 bg-[#f8fbff] px-4 py-3 text-sm leading-6 text-slate-600"
              >
                {rule}
              </div>
            ))}
          </div>

          <div className="mt-5 overflow-hidden rounded-[26px] border border-slate-200">
            <div className="hidden grid-cols-[1.2fr_1fr_0.8fr_1.4fr] bg-[#e9f0ff] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 lg:grid">
              <span>Colegiado</span>
              <span>Ultimos pagos</span>
              <span>Estado</span>
              <span>Observacion</span>
            </div>

            <div className="divide-y divide-slate-200 bg-white">
              {habilitacionRows.map((row, index) => (
                <div
                  key={row.code}
                  className={`grid gap-4 px-5 py-5 lg:grid-cols-[1.2fr_1fr_0.8fr_1.4fr] lg:items-center lg:px-6 ${
                    index % 2 === 1 ? 'bg-[#f8fbff]' : 'bg-white'
                  }`}
                >
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                      Colegiado
                    </p>
                    <p className="font-semibold text-slate-950">{row.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{row.code}</p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                      Ultimos pagos
                    </p>
                    <p className="text-sm font-medium text-slate-700">{row.lastPayments}</p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                      Estado
                    </p>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${row.statusTone}`}
                    >
                      {row.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                      Observacion
                    </p>
                    <p className="text-sm leading-6 text-slate-500">{row.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-[30px] border border-white/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
              <Vote size={20} strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                Generacion aleatoria de mesas
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                Sorteo listo para publicar
              </h2>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {mesasGeneradas.map((mesa) => (
              <article
                key={mesa.table}
                className="rounded-[24px] border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                      {mesa.table}
                    </p>
                    <p className="mt-1 font-semibold text-slate-950">{mesa.place}</p>
                  </div>
                  <span className="rounded-full bg-cobalt-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cobalt">
                    {mesa.reserve}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-[#f8fbff] px-3 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Presidente
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {mesa.president}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#f8fbff] px-3 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Secretario
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {mesa.secretary}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#f8fbff] px-3 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Vocal
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {mesa.member}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-cobalt-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cobalt">
              Registro del proceso electoral
            </span>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              Hitos visibles para seguimiento institucional
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              La vista propone un tablero de etapas para saber que ya se cerro, que
              sigue en revision y que componentes faltan habilitar cuando conectemos la
              logica real.
            </p>
          </div>

          <div className="rounded-[22px] border border-slate-200 bg-[#f8fbff] px-4 py-3 text-sm text-slate-600">
            Ultima actualizacion visual: 14 Abr 2026
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-4">
          {procesoElectoralSteps.map((step) => (
            <article
              key={step.stage}
              className="rounded-[26px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="rounded-2xl bg-slate-900 p-3 text-white">
                  <CheckCheck size={18} strokeWidth={2.2} />
                </div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${step.statusTone}`}
                >
                  {step.status}
                </span>
              </div>

              <p className="mt-4 text-lg font-semibold tracking-tight text-slate-950">
                {step.stage}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">{step.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default EleccionesPage
