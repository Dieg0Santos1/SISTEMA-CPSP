import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, FileSearch, Search, X } from 'lucide-react'
import {
  downloadTesoreriaHistorialReport,
  getTesoreriaCobroPdf,
  getTesoreriaHistorial,
  markTesoreriaCobroPrinted,
} from '../../services/tesoreriaApi'
import {
  getInventarioVentaPdf,
  markInventarioVentaPrinted,
} from '../../services/inventarioApi'

const methodFilters = ['Todos', 'Efectivo', 'Yape/Plin', 'Transferencia', 'POS/Tarjeta']

function formatCurrency(value) {
  return `S/ ${Number(value ?? 0).toFixed(2)}`
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

function openPdfBlob(blob) {
  const url = URL.createObjectURL(blob)
  const pdfWindow = window.open(url, '_blank')

  if (!pdfWindow) {
    URL.revokeObjectURL(url)
    throw new Error('No se pudo abrir el comprobante PDF.')
  }

  window.setTimeout(() => URL.revokeObjectURL(url), 60000)
}

function CobrosHistorialPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeMethod, setActiveMethod] = useState(methodFilters[0])
  const [currentPage, setCurrentPage] = useState(1)
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [activeRowActionId, setActiveRowActionId] = useState(null)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [activeExportFormat, setActiveExportFormat] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadHistorial() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const response = await getTesoreriaHistorial({
          search: searchTerm,
          metodoPago: activeMethod,
          page: currentPage,
          size: 5,
        })

        if (isMounted) {
          setData(response)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'No se pudo cargar el historial de cobros.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadHistorial()

    return () => {
      isMounted = false
    }
  }, [activeMethod, currentPage, searchTerm])

  const summaryCards = useMemo(
    () => [
      {
        title: 'Hoy',
        value: formatCurrency(data?.totalHoy),
        helper: `${data?.operacionesHoy ?? 0} operaciones`,
        tone: 'text-emerald-600',
      },
      {
        title: 'Ultimos 7 dias',
        value: formatCurrency(data?.totalUltimosSieteDias),
        helper: `${data?.operacionesUltimosSieteDias ?? 0} operaciones registradas`,
        tone: 'text-fuchsia-600',
      },
      {
        title: 'Ticket promedio',
        value: formatCurrency(data?.ticketPromedio),
        helper: 'Sin incluir anulaciones',
        tone: 'text-cobalt',
      },
    ],
    [data],
  )

  const rows = data?.rows?.content ?? []
  const totalPages = data?.rows?.totalPages ?? 1
  const page = data?.rows?.page ?? currentPage

  function markRowAsPrinted(receiptId, origin) {
    setData((current) => {
      if (!current?.rows?.content) {
        return current
      }

      return {
        ...current,
        rows: {
          ...current.rows,
          content: current.rows.content.map((item) =>
            item.cobroId === receiptId && item.origenOperacion === origin
              ? { ...item, estado: 'EMITIDO' }
              : item,
          ),
        },
      }
    })
  }

  async function resolveReceiptFile(row) {
    if (row.origenOperacion === 'VENTA_PRODUCTO') {
      return getInventarioVentaPdf(row.cobroId)
    }

    return getTesoreriaCobroPdf(row.cobroId)
  }

  async function markReceiptPrinted(row) {
    if (row.origenOperacion === 'VENTA_PRODUCTO') {
      await markInventarioVentaPrinted(row.cobroId)
    } else {
      await markTesoreriaCobroPrinted(row.cobroId)
    }

    markRowAsPrinted(row.cobroId, row.origenOperacion)
  }

  async function handleExportReport(format) {
    setIsExporting(true)
    setActiveExportFormat(format)
    setErrorMessage('')

    try {
      await downloadTesoreriaHistorialReport({
        search: searchTerm,
        metodoPago: activeMethod,
        format,
      })
      setIsExportModalOpen(false)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo exportar el historial de caja.',
      )
    } finally {
      setIsExporting(false)
      setActiveExportFormat('')
    }
  }

  async function handleViewDetail(row) {
    const actionKey = `${row.origenOperacion}-${row.cobroId}-view`
    setActiveRowActionId(actionKey)
    setErrorMessage('')

    try {
      const file = await resolveReceiptFile(row)
      openPdfBlob(file.blob)
      await markReceiptPrinted(row)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo abrir el comprobante de esta operacion.',
      )
    } finally {
      setActiveRowActionId(null)
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-3">
        {summaryCards.map((card) => (
          <article
            key={card.title}
            className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_-30px_rgba(15,23,42,0.5)]"
          >
            <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${card.tone}`}>
              {card.title}
            </p>
            <p className={`mt-3 text-[2rem] font-bold tracking-tight ${card.tone}`}>
              {isLoading ? '--' : card.value}
            </p>
            <p className={`mt-2 text-sm ${card.tone}`}>{card.helper}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Historial de caja
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Consulta operativa por persona, comprobante o metodo de pago.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="group flex w-full min-w-[280px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-cobalt focus-within:bg-white">
                <Search
                  size={18}
                  className="text-slate-400 transition group-focus-within:text-cobalt"
                />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder="Buscar por persona, venta o comprobante"
                  className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(true)}
                disabled={isExporting}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
              >
                <Download size={16} strokeWidth={2.1} />
                {isExporting ? 'Exportando...' : 'Exportar reporte'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {methodFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setActiveMethod(filter)
                  setCurrentPage(1)
                }}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activeMethod === filter
                    ? 'bg-cobalt-soft text-cobalt shadow-[inset_0_-2px_0_0_#1739a6]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {errorMessage ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-5 space-y-3">
          {rows.map((row) => (
            <article key={row.cobroId} className="rounded-[24px] border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-cobalt">{row.reference}</p>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-600">
                      {row.origenOperacion === 'VENTA_PRODUCTO' ? 'Venta' : 'Cobro'}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
                        row.metodoPago === 'Efectivo'
                          ? 'bg-emerald-100 text-emerald-700'
                          : row.metodoPago === 'Transferencia'
                            ? 'bg-[#dbe5ff] text-cobalt'
                            : row.metodoPago === 'POS/Tarjeta'
                              ? 'bg-sky-100 text-sky-700'
                              : 'bg-violet-100 text-violet-700'
                      }`}
                    >
                      {row.metodoPago}
                    </span>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                      {row.estado}
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                    {row.conceptoResumen}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{row.colegiadoNombre}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span>{formatDate(row.fechaEmision)}</span>
                    <span>
                      {row.serie}-{String(row.numeroComprobante).padStart(7, '0')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Monto
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">
                      {formatCurrency(row.total)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleViewDetail(row)}
                    disabled={activeRowActionId !== null}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                  >
                    <FileSearch size={16} strokeWidth={2.1} />
                    {activeRowActionId === `${row.origenOperacion}-${row.cobroId}-view`
                      ? 'Abriendo...'
                      : 'Ver detalle'}
                  </button>
                </div>
              </div>
            </article>
          ))}

          {!isLoading && rows.length === 0 ? (
            <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500">
              No encontramos operaciones con ese criterio.
            </div>
          ) : null}
        </div>

        {rows.length > 0 ? (
          <div className="mt-5 flex flex-col gap-4 border-t border-slate-200 pt-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Mostrando {((page ?? 1) - 1) * (data?.rows?.size ?? 5) + 1} a{' '}
              {Math.min((page ?? 1) * (data?.rows?.size ?? 5), data?.rows?.totalElements ?? rows.length)} de{' '}
              {data?.rows?.totalElements ?? rows.length} operaciones
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setCurrentPage((current) => Math.max(1, current - 1))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={16} strokeWidth={2.2} />
              </button>

              <span className="rounded-xl bg-slate-100 px-3 py-2 font-semibold text-slate-700">
                {page} / {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setCurrentPage((current) => Math.min(totalPages, current + 1))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight size={16} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {isExportModalOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[32px] border border-white/80 bg-white shadow-[0_28px_90px_-38px_rgba(15,23,42,0.75)]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-cobalt">
                  Reporte institucional
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                  Exportar historial de caja
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Descarga el reporte con estructura formal y logo institucional.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isExporting) {
                    setIsExportModalOpen(false)
                  }
                }}
                className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-950"
                aria-label="Cerrar exportacion"
              >
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>

            <div className="grid gap-3 px-6 py-6 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleExportReport('xlsx')}
                disabled={isExporting}
                className="inline-flex min-h-[88px] flex-col items-start justify-center rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-left transition hover:border-cobalt hover:bg-[#f8fbff] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-600">
                  Excel
                </span>
                <span className="mt-2 text-lg font-semibold text-slate-950">
                  {activeExportFormat === 'xlsx' ? 'Generando Excel...' : 'Exportar como Excel'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleExportReport('pdf')}
                disabled={isExporting}
                className="inline-flex min-h-[88px] flex-col items-start justify-center rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-left transition hover:border-cobalt hover:bg-[#f8fbff] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-cobalt">
                  PDF
                </span>
                <span className="mt-2 text-lg font-semibold text-slate-950">
                  {activeExportFormat === 'pdf' ? 'Generando PDF...' : 'Exportar como PDF'}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default CobrosHistorialPage
