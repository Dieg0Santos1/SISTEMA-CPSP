import { Download, Printer, ReceiptText } from 'lucide-react'
import {
  cobrosReceiptRows,
  cobrosReceiptSummaryCards,
  cobrosSeriesStatus,
} from '../../data/cobros/cobrosData'

function CobrosComprobantesPage() {
  return (
    <div className="space-y-6">
      <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid self-start gap-4 lg:grid-cols-3">
          {cobrosReceiptSummaryCards.map((card) => (
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
        </div>

        <article className="rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)]">
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            Series activas
          </h2>
          <div className="mt-5 space-y-3">
            {cobrosSeriesStatus.map((item) => (
              <div key={item.label} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {item.value}
                </p>
                <p className="mt-1 text-sm text-slate-500">{item.helper}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Comprobantes emitidos
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Control de documentos emitidos, disponibles para impresion o descarga.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          >
            <Download size={16} strokeWidth={2.1} />
            Exportar listado
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {cobrosReceiptRows.map((receipt) => (
            <article
              key={receipt.id}
              className="rounded-[24px] border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-2xl bg-cobalt-soft p-3 text-cobalt">
                      <ReceiptText size={18} strokeWidth={2.2} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {receipt.type} {receipt.series}-{receipt.number}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{receipt.issuedTo}</p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${receipt.statusTone}`}
                    >
                      {receipt.status}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span>Emitido {receipt.issuedAt}</span>
                    <span>Monto {receipt.amount}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                  >
                    <Printer size={16} strokeWidth={2.1} />
                    Reimprimir
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)] transition hover:-translate-y-0.5"
                  >
                    <Download size={16} strokeWidth={2.1} />
                    Descargar
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

export default CobrosComprobantesPage
