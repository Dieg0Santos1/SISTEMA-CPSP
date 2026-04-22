import { useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  ReceiptText,
  Search,
  X,
} from 'lucide-react'
import {
  downloadTesoreriaComprobantesReport,
  getTesoreriaCobroPdf,
  getTesoreriaComprobantes,
  markTesoreriaCobroPrinted,
} from '../../services/tesoreriaApi'
import {
  getInventarioVentaPdf,
  markInventarioVentaPrinted,
} from '../../services/inventarioApi'

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

function downloadPdfFile(filename, blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 60000)
}

function CobrosComprobantesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeSeriesIndex, setActiveSeriesIndex] = useState(0)
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [activeReceiptActionId, setActiveReceiptActionId] = useState(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [activeExportFormat, setActiveExportFormat] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadComprobantes() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const response = await getTesoreriaComprobantes({
          search: searchTerm,
          page: currentPage,
          size: 5,
        })

        if (isMounted) {
          setData(response)
          setActiveSeriesIndex((current) =>
            response.seriesActivas?.length ? Math.min(current, response.seriesActivas.length - 1) : 0,
          )
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'No se pudieron cargar los comprobantes emitidos.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadComprobantes()

    return () => {
      isMounted = false
    }
  }, [currentPage, searchTerm])

  const summaryCards = useMemo(
    () => [
      {
        title: 'Boletas emitidas',
        value: data?.boletasEmitidas ?? 0,
        helper: 'Tesoreria y ventas de inventario',
        tone: 'text-cobalt',
        accent: 'border-[#dbe5ff] bg-[linear-gradient(180deg,#ffffff_0%,#f4f8ff_100%)]',
      },
      {
        title: 'Facturas emitidas',
        value: data?.facturasEmitidas ?? 0,
        helper: 'Serie F001 activa',
        tone: 'text-fuchsia-600',
        accent: 'border-[#efd8ff] bg-[linear-gradient(180deg,#ffffff_0%,#fbf4ff_100%)]',
      },
      {
        title: 'No Impresas',
        value: data?.noImpresas ?? 0,
        helper: 'Listas para reimpresion o descarga',
        tone: 'text-amber-700',
        accent: 'border-[#ffe7bf] bg-[linear-gradient(180deg,#ffffff_0%,#fff9ef_100%)]',
      },
    ],
    [data],
  )

  const rows = data?.rows?.content ?? []
  const totalPages = data?.rows?.totalPages ?? 1
  const page = data?.rows?.page ?? currentPage
  const seriesActivas = data?.seriesActivas ?? []
  const activeSeries = seriesActivas[activeSeriesIndex] ?? seriesActivas[0]

  async function handleExportListado(format) {
    setIsExporting(true)
    setActiveExportFormat(format)
    setErrorMessage('')

    try {
      await downloadTesoreriaComprobantesReport({
        search: searchTerm,
        printStatus: 'Todos',
        tipo: 'Todos',
        format,
      })
      setIsExportModalOpen(false)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo exportar el listado de comprobantes.',
      )
    } finally {
      setIsExporting(false)
      setActiveExportFormat('')
    }
  }

  function markRowAsPrinted(receiptId, origin) {
    setData((current) => {
      if (!current?.rows?.content) {
        return current
      }

      const nextRows = current.rows.content.map((item) =>
        item.cobroId === receiptId && item.origenOperacion === origin
          ? { ...item, impreso: true }
          : item,
      )
      const currentPending = current.rows.content.filter((item) => !item.impreso).length
      const nextPending = nextRows.filter((item) => !item.impreso).length

      return {
        ...current,
        noImpresas: Math.max(0, (current.noImpresas ?? 0) - Math.max(0, currentPending - nextPending)),
        rows: {
          ...current.rows,
          content: nextRows,
        },
      }
    })
  }

  async function resolveReceiptFile(receipt) {
    if (receipt.origenOperacion === 'VENTA_PRODUCTO') {
      return getInventarioVentaPdf(receipt.cobroId)
    }

    return getTesoreriaCobroPdf(receipt.cobroId)
  }

  async function markReceiptPrinted(receipt) {
    if (receipt.impreso) {
      return
    }

    if (receipt.origenOperacion === 'VENTA_PRODUCTO') {
      await markInventarioVentaPrinted(receipt.cobroId)
    } else {
      await markTesoreriaCobroPrinted(receipt.cobroId)
    }

    markRowAsPrinted(receipt.cobroId, receipt.origenOperacion)
  }

  async function handlePrintReceipt(receipt) {
    const actionKey = `${receipt.origenOperacion}-${receipt.cobroId}-print`
    setActiveReceiptActionId(actionKey)
    setErrorMessage('')

    try {
      const file = await resolveReceiptFile(receipt)
      openPdfBlob(file.blob)
      await markReceiptPrinted(receipt)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo abrir el comprobante para impresion.',
      )
    } finally {
      setActiveReceiptActionId(null)
    }
  }

  async function handleDownloadReceipt(receipt) {
    const actionKey = `${receipt.origenOperacion}-${receipt.cobroId}-download`
    setActiveReceiptActionId(actionKey)
    setErrorMessage('')

    try {
      const file = await resolveReceiptFile(receipt)
      downloadPdfFile(file.filename, file.blob)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo descargar el comprobante.',
      )
    } finally {
      setActiveReceiptActionId(null)
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 md:items-start xl:grid-cols-4 xl:items-start">
        {summaryCards.map((card) => (
          <article
            key={card.title}
            className={`rounded-[26px] border p-6 shadow-[0_14px_40px_-30px_rgba(15,23,42,0.5)] ${card.accent}`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${card.tone}`}>
                {card.title}
              </p>
              <span
                className={`inline-flex h-3 w-3 rounded-full shadow-[0_0_0_6px_rgba(255,255,255,0.9)] ${card.tone.replace('text-', 'bg-')}`}
              />
            </div>
            <p className={`mt-7 text-[2.35rem] font-bold leading-none tracking-tight ${card.tone}`}>
              {isLoading ? '--' : card.value}
            </p>
            <p className={`mt-4 text-sm font-medium ${card.tone}`}>{card.helper}</p>
          </article>
        ))}

        <article className="rounded-[26px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)]">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">Series activas</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setActiveSeriesIndex((current) =>
                    current === 0 ? Math.max(0, seriesActivas.length - 1) : current - 1,
                  )
                }
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:text-slate-900"
              >
                <ChevronLeft size={16} strokeWidth={2.2} />
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveSeriesIndex((current) =>
                    current === Math.max(0, seriesActivas.length - 1) ? 0 : current + 1,
                  )
                }
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:text-slate-900"
              >
                <ChevronRight size={16} strokeWidth={2.2} />
              </button>
            </div>
          </div>

          {activeSeries ? (
            <>
              <div className="mt-5 w-full rounded-[16px] border border-slate-200 bg-slate-50 px-5 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Serie {activeSeries.serie}
                </p>
                <p className="mt-2 text-[1.45rem] font-bold leading-none tracking-tight text-slate-950">
                  {String(activeSeries.correlativoActual).padStart(7, '0')}
                </p>
                <p className="mt-1.5 text-[0.88rem] font-medium leading-snug text-slate-500">
                  {activeSeries.tipo === 'BOLETA'
                    ? 'Correlativo actual de boletas'
                    : 'Correlativo actual de facturas'}
                </p>
              </div>

              <div className="mt-4 flex justify-center gap-2">
                {seriesActivas.map((item, index) => (
                  <button
                    key={item.serie}
                    type="button"
                    onClick={() => setActiveSeriesIndex(index)}
                    className={`h-2.5 rounded-full transition ${
                      index === activeSeriesIndex ? 'w-8 bg-cobalt' : 'w-2.5 bg-slate-300'
                    }`}
                    aria-label={`Ver serie ${item.serie}`}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              No hay series activas configuradas.
            </div>
          )}
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
                placeholder="Buscar por comprobante, serie o comprador"
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
              {isExporting ? 'Exportando...' : 'Exportar listado'}
            </button>
          </div>
        </div>

        {errorMessage ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-5 space-y-3">
          {rows.map((receipt) => (
            <article key={receipt.cobroId} className="rounded-[24px] border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="rounded-2xl bg-cobalt-soft p-3 text-cobalt">
                      <ReceiptText size={18} strokeWidth={2.2} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {receipt.tipoComprobante === 'BOLETA' ? 'Boleta' : 'Factura'} {receipt.serie}-
                        {String(receipt.numeroComprobante).padStart(7, '0')}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{receipt.colegiadoNombre}</p>
                    </div>
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-600">
                      {receipt.origenOperacion === 'VENTA_PRODUCTO' ? 'Venta' : 'Cobro'}
                    </span>
                    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                      {receipt.estado}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
                        receipt.impreso
                          ? 'bg-[#dbe5ff] text-cobalt'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {receipt.impreso ? 'Impreso' : 'No Impreso'}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span>Emitido {formatDate(receipt.fechaEmision)}</span>
                    <span>Monto {formatCurrency(receipt.total)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => handlePrintReceipt(receipt)}
                    disabled={activeReceiptActionId !== null}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                  >
                    <Printer size={16} strokeWidth={2.1} />
                    {activeReceiptActionId === `${receipt.origenOperacion}-${receipt.cobroId}-print`
                      ? 'Abriendo...'
                      : 'Reimprimir'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadReceipt(receipt)}
                    disabled={activeReceiptActionId !== null}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)] transition hover:-translate-y-0.5"
                  >
                    <Download size={16} strokeWidth={2.1} />
                    {activeReceiptActionId === `${receipt.origenOperacion}-${receipt.cobroId}-download`
                      ? 'Descargando...'
                      : 'Descargar'}
                  </button>
                </div>
              </div>
            </article>
          ))}

          {!isLoading && rows.length === 0 ? (
            <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500">
              No encontramos comprobantes con ese criterio de busqueda.
            </div>
          ) : null}
        </div>

        {rows.length > 0 ? (
          <div className="mt-5 flex flex-col gap-4 border-t border-slate-200 pt-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Mostrando {((page ?? 1) - 1) * (data?.rows?.size ?? 5) + 1} a{' '}
              {Math.min((page ?? 1) * (data?.rows?.size ?? 5), data?.rows?.totalElements ?? rows.length)} de{' '}
              {data?.rows?.totalElements ?? rows.length} comprobantes
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
                  Exportar comprobantes emitidos
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Descarga el listado formal de boletas y facturas con logo institucional.
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
                onClick={() => handleExportListado('xlsx')}
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
                onClick={() => handleExportListado('pdf')}
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

export default CobrosComprobantesPage
