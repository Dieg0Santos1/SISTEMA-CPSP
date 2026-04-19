import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Eye, LoaderCircle, Search } from 'lucide-react'
import FractionationDetailModal from '../../components/cobros/FractionationDetailModal'
import {
  getTesoreriaFraccionamientoDetail,
  getTesoreriaFraccionamientos,
} from '../../services/tesoreriaApi'

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

const rowStateToneMap = {
  ACTIVO: 'bg-fuchsia-100 text-fuchsia-700',
  PAGADO: 'bg-emerald-100 text-emerald-700',
  ANULADO: 'bg-slate-200 text-slate-600',
}

function CobrosFraccionamientosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedFractionation, setSelectedFractionation] = useState(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadFraccionamientos() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const response = await getTesoreriaFraccionamientos({
          search: searchTerm,
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
              : 'No se pudo cargar el panel de fraccionamientos.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadFraccionamientos()

    return () => {
      isMounted = false
    }
  }, [currentPage, searchTerm])

  const summaryCards = useMemo(
    () => [
      {
        title: 'Total fraccionamientos',
        value: data?.totalFraccionamientos ?? 0,
        helper: 'Convenios creados en tesoreria',
        tone: 'text-cobalt',
        accent: 'border-[#dbe5ff] bg-[linear-gradient(180deg,#ffffff_0%,#f4f8ff_100%)]',
      },
      {
        title: 'Convenios activos',
        value: data?.conveniosActivos ?? 0,
        helper: 'Siguen con cuotas por cobrar',
        tone: 'text-fuchsia-600',
        accent: 'border-[#efd8ff] bg-[linear-gradient(180deg,#ffffff_0%,#fbf4ff_100%)]',
      },
      {
        title: 'Total refinanciado',
        value: formatCurrency(data?.montoTotalRefinanciado),
        helper: 'Monto acumulado en convenios',
        tone: 'text-emerald-600',
        accent: 'border-emerald-100 bg-[linear-gradient(180deg,#ffffff_0%,#f2fff8_100%)]',
      },
      {
        title: 'Saldo pendiente',
        value: formatCurrency(data?.saldoPendienteTotal),
        helper: 'Pendiente por recaudar en cuotas',
        tone: 'text-amber-700',
        accent: 'border-[#ffe7bf] bg-[linear-gradient(180deg,#ffffff_0%,#fff9ef_100%)]',
      },
    ],
    [data],
  )

  const rows = data?.rows?.content ?? []
  const totalPages = data?.rows?.totalPages ?? 1
  const page = data?.rows?.page ?? currentPage

  async function handleOpenDetail(row) {
    setIsDetailLoading(true)
    setDetailError('')

    try {
      const response = await getTesoreriaFraccionamientoDetail(row.fraccionamientoId)
      setSelectedFractionation(response)
    } catch (error) {
      setDetailError(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar el detalle del fraccionamiento.',
      )
    } finally {
      setIsDetailLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article
            key={card.title}
            className={`rounded-[26px] border p-6 shadow-[0_14px_40px_-30px_rgba(15,23,42,0.5)] ${card.accent}`}
          >
            <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${card.tone}`}>
              {card.title}
            </p>
            <p className={`mt-6 text-[2.15rem] font-bold leading-none tracking-tight ${card.tone}`}>
              {isLoading ? '--' : card.value}
            </p>
            <p className={`mt-3 text-sm font-medium ${card.tone}`}>{card.helper}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Seguimiento de fraccionamientos
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Controla convenios activos, revisa la siguiente cuota y consulta el detalle completo
              sin salir de tesoreria.
            </p>
          </div>

          <label className="group flex w-full xl:max-w-[340px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-cobalt focus-within:bg-white">
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
              placeholder="Buscar por codigo o nombre"
              className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        {errorMessage ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        {detailError ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {detailError}
          </div>
        ) : null}

        <div className="mt-5 overflow-hidden rounded-[26px] border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <th className="px-5 py-4">Codigo</th>
                  <th className="px-5 py-4">Nombre</th>
                  <th className="px-5 py-4">Cuotas</th>
                  <th className="px-5 py-4">Prox. pago</th>
                  <th className="px-5 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white text-sm">
                {rows.map((row) => (
                  <tr key={row.fraccionamientoId}>
                    <td className="px-5 py-4 font-semibold text-cobalt">{row.codigoColegiatura}</td>
                    <td className="px-5 py-4">
                      <div className="min-w-[220px]">
                        <p className="font-semibold text-slate-950">{row.nombreCompleto}</p>
                        <span
                          className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${
                            rowStateToneMap[row.estado] ?? 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {row.estado}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-950">{row.cuotaActual}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {row.tieneCuotaPendiente
                          ? 'Siguiente cargo programado'
                          : 'Sin cuota pendiente'}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{formatDate(row.proximoPago)}</td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(row)}
                        disabled={isDetailLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isDetailLoading ? (
                          <LoaderCircle size={16} className="animate-spin" />
                        ) : (
                          <Eye size={16} strokeWidth={2.1} />
                        )}
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!isLoading && rows.length === 0 ? (
            <div className="border-t border-slate-200 px-5 py-12 text-center text-sm text-slate-500">
              Aun no hay fraccionamientos registrados.
            </div>
          ) : null}
        </div>

        {rows.length > 0 ? (
          <div className="mt-5 flex flex-col gap-4 border-t border-slate-200 pt-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Mostrando {((page ?? 1) - 1) * (data?.rows?.size ?? 5) + 1} a{' '}
              {Math.min((page ?? 1) * (data?.rows?.size ?? 5), data?.rows?.totalElements ?? rows.length)} de{' '}
              {data?.rows?.totalElements ?? rows.length} fraccionamientos
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

      {selectedFractionation ? (
        <FractionationDetailModal
          fractionation={selectedFractionation.detalle}
          memberName={selectedFractionation.nombreCompleto}
          memberCode={selectedFractionation.codigoColegiatura}
          onClose={() => setSelectedFractionation(null)}
        />
      ) : null}
    </div>
  )
}

export default CobrosFraccionamientosPage
