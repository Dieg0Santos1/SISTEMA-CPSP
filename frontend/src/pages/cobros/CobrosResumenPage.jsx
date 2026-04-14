import { NavLink } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { getTesoreriaResumen } from '../../services/tesoreriaApi'

function formatCurrency(value) {
  return `S/ ${Number(value ?? 0).toFixed(2)}`
}

function formatCount(value) {
  return Number(value ?? 0).toLocaleString('en-US')
}

function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

const methodToneStyles = {
  Efectivo: 'bg-emerald-100 text-emerald-700',
  'Yape/Plin': 'bg-violet-100 text-violet-700',
  Transferencia: 'bg-[#dbe5ff] text-cobalt',
  'POS/Tarjeta': 'bg-sky-100 text-sky-700',
}

function CobrosResumenPage() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadResumen() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const response = await getTesoreriaResumen()
        if (isMounted) {
          setData(response)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'No se pudo cargar el resumen de tesoreria.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadResumen()

    return () => {
      isMounted = false
    }
  }, [])

  const summaryCards = useMemo(
    () => [
      {
        title: 'Recaudacion del dia',
        value: formatCurrency(data?.recaudacionDia),
        note: `${formatCount(data?.operacionesDia)} operaciones cerradas en caja principal`,
        accent: 'border-cobalt',
        noteTone: 'text-cobalt',
      },
      {
        title: 'Pendientes urgentes',
        value: formatCount(data?.pendientesUrgentes),
        note: 'Vencen hoy o estan fuera de plazo',
        accent: 'border-amber-500',
        noteTone: 'text-amber-600',
      },
      {
        title: 'Comprobantes emitidos',
        value: formatCount(data?.comprobantesEmitidos),
        note: 'Boletas y facturas registradas',
        accent: 'border-emerald-500',
        noteTone: 'text-emerald-600',
      },
      {
        title: 'Bol. No Impresas',
        value: formatCount(data?.boletasNoImpresas),
        note: 'Boletas listas para impresion',
        accent: 'border-violet-400',
        noteTone: 'text-violet-600',
      },
    ],
    [data],
  )

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article
            key={card.title}
            className={`rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_-30px_rgba(15,23,42,0.5)] ${card.accent}`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
              {card.title}
            </p>
            <p className="mt-3 text-[2.1rem] font-bold tracking-tight text-slate-950">
              {isLoading ? '--' : card.value}
            </p>
            <p className={`mt-2 text-sm font-medium ${card.noteTone}`}>{card.note}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_0.8fr]">
        <article className="rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Informacion del dia
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Vista operativa resumida para monitorear caja sin saturar la pantalla.
              </p>
            </div>
          </div>

          {errorMessage ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-[26px] border border-slate-200 bg-[linear-gradient(180deg,#fbfcff_0%,#f6f9ff_100%)] p-5">
              <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                Ritmo del dia
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Distribucion simple para monitorear por donde esta entrando la caja.
              </p>

              <div className="mt-5 space-y-4">
                {(data?.canalesDia ?? []).map((channel) => (
                  <div key={channel.label}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-slate-700">{channel.label}</span>
                      <span
                        className={`font-semibold ${
                          channel.label === 'Efectivo'
                            ? 'text-emerald-600'
                            : channel.label === 'Transferencia'
                              ? 'text-cobalt'
                              : channel.label === 'POS/Tarjeta'
                                ? 'text-sky-500'
                                : 'text-violet-500'
                        }`}
                      >
                        {channel.percentage}%
                      </span>
                    </div>
                    <div className="mt-2 h-2.5 rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          channel.label === 'Efectivo'
                            ? 'bg-emerald-500'
                            : channel.label === 'Transferencia'
                              ? 'bg-cobalt'
                              : channel.label === 'POS/Tarjeta'
                                ? 'bg-sky-400'
                                : 'bg-violet-400'
                        }`}
                        style={{ width: `${channel.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}

                {!isLoading && (data?.canalesDia?.length ?? 0) === 0 ? (
                  <p className="text-sm text-slate-500">Aun no hay operaciones registradas hoy.</p>
                ) : null}
              </div>
            </article>

            <article className="rounded-[26px] border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                Estado rapido de caja
              </h3>
              <div className="mt-5 space-y-3">
                {(data?.estadoCaja ?? []).map((item) => (
                  <div
                    key={item.title}
                    className={`rounded-2xl border px-4 py-4 ${
                      item.title === 'Efectivo'
                        ? 'border-emerald-100 bg-emerald-50'
                        : item.title === 'Transferencia'
                          ? 'border-[#d8e6ff] bg-[#eef4ff]'
                          : item.title === 'POS/Tarjeta'
                            ? 'border-sky-100 bg-sky-50'
                            : 'border-violet-100 bg-violet-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-semibold uppercase tracking-[0.18em] ${
                            item.title === 'Efectivo'
                              ? 'text-emerald-700'
                              : item.title === 'Transferencia'
                                ? 'text-cobalt'
                                : item.title === 'POS/Tarjeta'
                                  ? 'text-sky-600'
                                  : 'text-violet-600'
                          }`}
                        >
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm leading-snug text-slate-500">
                          {item.operationsCount} operaciones registradas
                        </p>
                      </div>
                      <p className="shrink-0 text-lg font-semibold text-slate-950">
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
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
            {(data?.ultimasOperaciones ?? []).slice(0, 3).map((item) => (
              <div key={item.cobroId} className="rounded-[24px] border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{item.conceptoResumen}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.colegiadoNombre}</p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
                      methodToneStyles[item.metodoPago] ?? 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.metodoPago}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                  <div className="text-slate-500">
                    <p>{formatDate(item.fechaEmision)}</p>
                    <p className="mt-1">
                      {item.serie}-{String(item.numeroComprobante).padStart(7, '0')}
                    </p>
                  </div>
                  <span className="font-semibold text-slate-900">{formatCurrency(item.total)}</span>
                </div>
              </div>
            ))}

            {!isLoading && (data?.ultimasOperaciones?.length ?? 0) === 0 ? (
              <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500">
                Aun no hay operaciones registradas.
              </div>
            ) : null}
          </div>
        </article>
      </section>
    </div>
  )
}

export default CobrosResumenPage
