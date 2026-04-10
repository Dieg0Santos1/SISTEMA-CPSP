import {
  ChevronRight,
  Circle,
  Download,
  FileText,
  Printer,
  WalletCards,
} from 'lucide-react'
import AdminLayout from '../layouts/AdminLayout'
import {
  pagosDueItems,
  pagosHistoryRows,
  pagosMemberCard,
  pagosMethods,
  pagosMonths,
  pagosSelectedMonths,
} from '../data/dashboardData'

function PagosPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <section>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Panel</span>
            <ChevronRight size={14} />
            <span className="font-semibold text-cobalt">Pagos</span>
          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Gestion de Pagos y Cuotas
          </h1>
          <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-600 sm:text-base">
            Administre las aportaciones mensuales, verifique el estado de habilitacion y
            mantenga el historial financiero de los miembros colegiados.
          </p>
        </section>

        <section className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-5">
            <article className="rounded-[28px] border border-cobalt bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)]">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cobalt-soft text-2xl font-bold text-cobalt">
                  {pagosMemberCard.initials}
                </div>

                <div>
                  <p className="text-2xl font-semibold tracking-tight text-slate-950">
                    {pagosMemberCard.name}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-500">{pagosMemberCard.code}</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-[22px] bg-[#eef4ff] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-slate-500">Estado actual</span>
                    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                      {pagosMemberCard.statusLabel}
                    </span>
                  </div>
                </div>

                <div className="rounded-[22px] bg-[#fff0e8] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-slate-500">Deuda Total</span>
                    <span className="text-2xl font-bold tracking-tight text-[#bf4c11]">
                      {pagosMemberCard.debt}
                    </span>
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-[28px] border border-white/80 bg-[#f8fbff] p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)]">
              <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-slate-700">
                Proximos vencimientos
              </h2>

              <div className="mt-5 space-y-4">
                {pagosDueItems.map((item) => (
                  <div key={item.month} className="flex items-center justify-between gap-4">
                    <span className="text-base font-medium text-slate-700">{item.month}</span>
                    <span className="text-base font-bold text-red-500">{item.amount}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <article className="rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-2xl bg-cobalt-soft p-3 text-cobalt">
                <WalletCards size={20} strokeWidth={2.2} />
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Registro de Pago
              </h2>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_280px]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                  Seleccionar meses
                </p>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {pagosMonths.map((month) => {
                    const isSelected = pagosSelectedMonths.includes(month)

                    return (
                      <button
                        key={month}
                        type="button"
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                          isSelected
                            ? 'border-cobalt bg-[#dce7ff] text-cobalt shadow-[inset_0_0_0_1px_#1739a6]'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {month}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                    Monto total (S/)
                  </p>
                  <div className="mt-3 rounded-2xl bg-[#eaf1ff] px-5 py-4 text-3xl font-bold tracking-tight text-cobalt">
                    120.00
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                    Metodo de pago
                  </p>

                  <div className="mt-3 space-y-3">
                    {pagosMethods.map((method) => (
                      <button
                        key={method.label}
                        type="button"
                        className={`flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left text-sm font-semibold transition ${
                          method.active
                            ? 'bg-[#eaf1ff] text-cobalt'
                            : 'bg-[#f5f8ff] text-slate-700 hover:bg-[#edf2ff]'
                        }`}
                      >
                        <Circle
                          size={14}
                          className={method.active ? 'fill-cobalt text-cobalt' : 'text-slate-400'}
                        />
                        <span>{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-cobalt transition hover:bg-cobalt-soft"
              >
                <Printer size={16} strokeWidth={2.2} />
                Imprimir Proforma
              </button>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)] transition hover:-translate-y-0.5"
              >
                <WalletCards size={16} strokeWidth={2.2} />
                Procesar Pago
              </button>
            </div>
          </article>
        </section>

        <section className="rounded-[30px] border border-white/80 bg-white p-4 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Historial Reciente de Pagos
            </h2>

            <button
              type="button"
              className="inline-flex items-center gap-2 self-start rounded-2xl px-3 py-2 text-sm font-semibold text-cobalt transition hover:bg-cobalt-soft"
            >
              <Download size={16} strokeWidth={2.2} />
              Descargar Reporte
            </button>
          </div>

          <div className="mt-5 overflow-hidden rounded-[26px] border border-slate-200">
            <div className="hidden grid-cols-[1.05fr_1.15fr_1.3fr_1fr_0.9fr_80px] bg-[#e8f0ff] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 lg:grid">
              <span>ID Operacion</span>
              <span>Fecha</span>
              <span>Concepto</span>
              <span>Metodo</span>
              <span>Monto</span>
              <span>Acciones</span>
            </div>

            <div className="divide-y divide-slate-200 bg-white">
              {pagosHistoryRows.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-4 px-4 py-5 lg:grid-cols-[1.05fr_1.15fr_1.3fr_1fr_0.9fr_80px] lg:items-center lg:px-6"
                >
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                      ID Operacion
                    </p>
                    <p className="font-semibold text-cobalt">{item.id}</p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                      Fecha
                    </p>
                    <p className="max-w-[11rem] text-sm leading-6 text-slate-600">{item.date}</p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                      Concepto
                    </p>
                    <p className="max-w-[12rem] text-sm font-medium leading-6 text-slate-900">
                      {item.concept}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                      Metodo
                    </p>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${item.methodTone}`}
                    >
                      {item.method}
                    </span>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                      Monto
                    </p>
                    <p className="text-xl font-bold tracking-tight text-slate-950">{item.amount}</p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      <FileText size={18} strokeWidth={2.1} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}

export default PagosPage
