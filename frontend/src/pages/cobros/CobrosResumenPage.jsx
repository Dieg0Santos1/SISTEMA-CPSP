import { ArrowRight, TriangleAlert } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import {
  cobrosCashSnapshot,
  cobrosCollectionChannels,
  cobrosHistoryRows,
  cobrosOperationalAlerts,
  cobrosPendingRows,
  cobrosQuickActions,
  cobrosSummaryCards,
} from '../../data/cobros/cobrosData'

function CobrosResumenPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-4">
        {cobrosSummaryCards.map((card) => (
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

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_380px]">
        <article className="rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Accesos rapidos de tesoreria
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Prioriza la tarea que quieres resolver sin entrar a una pantalla cargada.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {cobrosQuickActions.map((action) => (
              <NavLink
                key={action.path}
                to={action.path}
                className={`rounded-[24px] border px-5 py-5 transition ${
                  action.tone === 'bg-cobalt text-white'
                    ? 'border-cobalt bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)]'
                    : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <p className="text-lg font-semibold tracking-tight">{action.title}</p>
                <p
                  className={`mt-2 text-sm leading-6 ${
                    action.tone === 'bg-cobalt text-white'
                      ? 'text-blue-100'
                      : 'text-slate-500'
                  }`}
                >
                  {action.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
                  Abrir vista
                  <ArrowRight size={16} strokeWidth={2.1} />
                </span>
              </NavLink>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-[26px] border border-slate-200 bg-[linear-gradient(180deg,#fbfcff_0%,#f6f9ff_100%)] p-5">
              <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                Ritmo del dia
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Distribucion simple para monitorear por donde esta entrando la caja.
              </p>

              <div className="mt-5 space-y-4">
                {cobrosCollectionChannels.map((channel) => (
                  <div key={channel.label}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-slate-700">{channel.label}</span>
                      <span className="font-semibold text-slate-900">{channel.value}%</span>
                    </div>
                    <div className="mt-2 h-2.5 rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${channel.tone}`}
                        style={{ width: `${channel.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[26px] border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                Estado rapido de caja
              </h3>
              <div className="mt-5 space-y-3">
                {cobrosCashSnapshot.map((item) => (
                  <div key={item.title} className="rounded-2xl bg-slate-50 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {item.title}
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-950">{item.value}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.helper}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </article>

        <article className="rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)]">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <TriangleAlert size={18} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                Alertas operativas
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Lo que requiere reaccion inmediata del equipo de tesoreria.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {cobrosOperationalAlerts.map((alert) => (
              <div
                key={alert.title}
                className={`rounded-[22px] border px-4 py-4 ${alert.tone}`}
              >
                <p className="text-sm font-semibold">{alert.title}</p>
                <p className="mt-2 text-sm leading-6">{alert.description}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_0.9fr]">
        <article className="rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Pendientes destacados
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Vista resumida para decidir rapido a quien cobrar primero.
              </p>
            </div>
            <NavLink
              to="/caja-cobros/pendientes"
              className="text-sm font-semibold text-cobalt transition hover:text-slate-900"
            >
              Ver todos
            </NavLink>
          </div>

          <div className="mt-5 space-y-3">
            {cobrosPendingRows.slice(0, 3).map((row) => (
              <div key={row.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{row.memberName}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {row.memberCode} · {row.concept} · {row.detail}
                    </p>
                  </div>
                  <span
                    className={`inline-flex self-start rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${row.statusTone}`}
                  >
                    {row.status}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div className="flex flex-wrap items-center gap-3 text-slate-500">
                    <span>Vence {row.dueDate}</span>
                    <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-700">
                      {row.category}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-900">{row.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Ultimas operaciones
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Ultimos cobros emitidos para consulta rapida.
              </p>
            </div>
            <NavLink
              to="/caja-cobros/historial"
              className="text-sm font-semibold text-cobalt transition hover:text-slate-900"
            >
              Ir al historial
            </NavLink>
          </div>

          <div className="mt-5 space-y-3">
            {cobrosHistoryRows.slice(0, 3).map((item) => (
              <div key={item.id} className="rounded-[24px] border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{item.concept}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.memberName}</p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${item.methodTone}`}
                  >
                    {item.method}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                  <div className="text-slate-500">
                    <p>{item.date}</p>
                    <p className="mt-1">{item.document}</p>
                  </div>
                  <span className="font-semibold text-slate-900">{item.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}

export default CobrosResumenPage
