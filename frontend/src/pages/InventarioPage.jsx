import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen,
  CalendarDays,
  CheckCheck,
  ChevronRight,
  ClipboardList,
  FileBarChart2,
  FolderKanban,
  PackageCheck,
  ShoppingBag,
  X,
} from 'lucide-react'
import { inventoryProcessCards } from '../data/inventario/inventarioData'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:8080/api/v1'

const statusStyles = {
  HABILITADO: 'bg-emerald-100 text-emerald-700',
  NO_HABILITADO: 'bg-red-100 text-red-600',
}

const movementStyles = {
  INGRESO: 'bg-emerald-100 text-emerald-700',
  ENTREGA: 'bg-cobalt-soft text-cobalt',
  REVERSA_ENTREGA: 'bg-sky-100 text-sky-700',
  VENTA: 'bg-amber-100 text-amber-700',
}

const readErrorMessage = async (response, fallbackMessage) => {
  const payload = await response.json().catch(() => null)
  const details = Array.isArray(payload?.details) ? payload.details.join(' ') : ''
  return details || payload?.message || fallbackMessage
}

function formatCount(value) {
  return value.toLocaleString('en-US')
}

function formatCurrency(value) {
  if (value === null || value === undefined) {
    return 'S/ --'
  }

  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(Number(value))
}

function formatMovementDate(value) {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatMovementType(value) {
  if (value === 'REVERSA_ENTREGA') {
    return 'Reversa'
  }

  return value.charAt(0) + value.slice(1).toLowerCase()
}

function formatMovementQuantity(value) {
  return value > 0 ? `+${value}` : String(value)
}

function formatStatusLabel(status) {
  return status === 'HABILITADO' ? 'Habilitado' : 'No habilitado'
}

function getProductPresentation(product) {
  const productName = product.nombre.toLowerCase()

  if (productName.includes('almanaque')) {
    return {
      tone: 'border-cobalt',
      badgeTone: 'bg-cobalt-soft text-cobalt',
    }
  }

  if (productName.includes('libreta')) {
    return {
      tone: 'border-emerald-500',
      badgeTone: 'bg-emerald-100 text-emerald-700',
    }
  }

  return {
    tone: 'border-slate-300',
    badgeTone: 'bg-slate-100 text-slate-700',
  }
}

function ProductReportsModal({ product, onClose, errorMessage }) {
  const receivedMembers = product.colegiados.filter((member) => member.entregado)
  const enabledMembers = product.colegiados.filter((member) => member.habilitado).length

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[32px] border border-white/80 bg-white shadow-[0_24px_70px_-36px_rgba(15,23,42,0.8)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cobalt">
              Reportes
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              {product.nombre}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Este producto ha sido recibido por {receivedMembers.length} colegiados
              habilitados o previamente registrados.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        {errorMessage ? (
          <div className="px-6 pt-5 sm:px-8">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {errorMessage}
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 border-b border-slate-200 px-6 py-5 sm:grid-cols-3 sm:px-8">
          <article className="rounded-[24px] border border-slate-200 bg-[#f8fbff] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Recibidos
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {receivedMembers.length}
            </p>
          </article>

          <article className="rounded-[24px] border border-slate-200 bg-[#f8fbff] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Stock actual
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {product.stockActual}
            </p>
          </article>

          <article className="rounded-[24px] border border-slate-200 bg-[#f8fbff] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Colegiados habilitados
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {enabledMembers}
            </p>
          </article>
        </div>

        <div className="px-6 py-6 sm:px-8">
          {receivedMembers.length > 0 ? (
            <div className="overflow-hidden rounded-[26px] border border-slate-200">
              <div className="hidden grid-cols-[1.5fr_1fr_1fr] bg-[#e9f0ff] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 lg:grid">
                <span>Colegiado</span>
                <span>Especialidad</span>
                <span>Estado</span>
              </div>

              <div className="divide-y divide-slate-200 bg-white">
                {receivedMembers.map((member, index) => (
                  <div
                    key={member.colegiadoId}
                    className={`grid gap-4 px-5 py-5 lg:grid-cols-[1.5fr_1fr_1fr] lg:items-center lg:px-6 ${
                      index % 2 === 1 ? 'bg-[#f8fbff]' : 'bg-white'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-slate-950">{member.nombreCompleto}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {member.codigoColegiatura}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {member.especialidadPrincipal}
                      </p>
                    </div>

                    <div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
                          statusStyles[member.estado] ?? 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {formatStatusLabel(member.estado)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-[#f8fbff] px-4 py-8 text-center text-sm text-slate-500">
              Este producto aun no registra entregas confirmadas.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProductDeliveredModal({
  product,
  onClose,
  onToggleMember,
  errorMessage,
  activeMemberId,
}) {
  const enabledMembers = product.colegiados.filter((member) => member.habilitado)
  const deliveredMembers = product.colegiados.filter((member) => member.entregado)
  const pendingMembers = enabledMembers.length - deliveredMembers.length

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-[32px] border border-white/80 bg-white shadow-[0_24px_70px_-36px_rgba(15,23,42,0.8)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cobalt">
              Producto entregado
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              Confirmar entrega de {product.nombre}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Solo los colegiados habilitados pueden recibir productos del inventario.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </div>

        {errorMessage ? (
          <div className="px-6 pt-5 sm:px-8">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {errorMessage}
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 border-b border-slate-200 px-6 py-5 sm:grid-cols-3 sm:px-8">
          <article className="rounded-[24px] border border-slate-200 bg-[#f8fbff] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Entregados
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {deliveredMembers.length}
            </p>
          </article>

          <article className="rounded-[24px] border border-slate-200 bg-[#f8fbff] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Pendientes habilitados
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {pendingMembers}
            </p>
          </article>

          <article className="rounded-[24px] border border-slate-200 bg-[#f8fbff] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Producto
            </p>
            <p className="mt-2 text-base font-semibold text-slate-950">
              {product.categoria}
            </p>
          </article>
        </div>

        <div className="px-6 py-6 sm:px-8">
          <div className="mb-4 rounded-[22px] border border-cobalt/15 bg-[#f5f8ff] px-4 py-3 text-sm text-slate-600">
            Los registros no habilitados aparecen bloqueados para proteger la regla de
            negocio del inventario.
          </div>

          <div className="overflow-hidden rounded-[26px] border border-slate-200">
            <div className="hidden grid-cols-[88px_1.45fr_1fr_0.85fr_100px] bg-[#e9f0ff] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 lg:grid">
              <span>Check</span>
              <span>Colegiado</span>
              <span>Especialidad</span>
              <span>Estado</span>
              <span>Entrega</span>
            </div>

            <div className="divide-y divide-slate-200 bg-white">
              {product.colegiados.map((member, index) => {
                const isUpdating = activeMemberId === String(member.colegiadoId)
                const isDisabled = (!member.habilitado && !member.entregado) || isUpdating

                return (
                  <label
                    key={member.colegiadoId}
                    className={`grid gap-4 px-5 py-5 lg:grid-cols-[88px_1.45fr_1fr_0.85fr_100px] lg:items-center lg:px-6 ${
                      index % 2 === 1 ? 'bg-[#f8fbff]' : 'bg-white'
                    } ${isDisabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={member.entregado}
                        disabled={isDisabled}
                        onChange={() => onToggleMember(member)}
                        className="h-5 w-5 rounded border-slate-300 accent-[#1739a6] disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-950">{member.nombreCompleto}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {member.codigoColegiatura}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {member.especialidadPrincipal}
                      </p>
                    </div>

                    <div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
                          member.habilitado
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {member.habilitado ? 'Habilitado' : 'No habilitado'}
                      </span>
                    </div>

                    <div className="flex justify-start lg:justify-center">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
                          member.entregado
                            ? 'bg-cobalt-soft text-cobalt'
                            : member.habilitado
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {isUpdating
                          ? 'Guardando'
                          : member.entregado
                            ? 'Entregado'
                            : member.habilitado
                              ? 'Pendiente'
                              : 'Bloqueado'}
                      </span>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InventarioPage() {
  const [products, setProducts] = useState([])
  const [movements, setMovements] = useState([])
  const [activeModalMode, setActiveModalMode] = useState('')
  const [activeProductId, setActiveProductId] = useState(null)
  const [activeProductDetail, setActiveProductDetail] = useState(null)
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true)
  const [isLoadingProductDetail, setIsLoadingProductDetail] = useState(false)
  const [isUpdatingDelivery, setIsUpdatingDelivery] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const loadDashboard = async () => {
    setIsLoadingDashboard(true)

    try {
      const response = await fetch(`${API_BASE_URL}/inventario`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, 'No se pudo cargar el modulo de inventario.'),
        )
      }

      const data = await response.json()
      setProducts(data.productos)
      setMovements(data.movimientos)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo conectar con el backend de inventario.',
      )
    } finally {
      setIsLoadingDashboard(false)
    }
  }

  const loadProductDetail = async (productId) => {
    setIsLoadingProductDetail(true)

    try {
      const response = await fetch(`${API_BASE_URL}/inventario/productos/${productId}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, 'No se pudo cargar el detalle del producto.'),
        )
      }

      const data = await response.json()
      setActiveProductDetail(data)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar el detalle del producto.',
      )
    } finally {
      setIsLoadingProductDetail(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  useEffect(() => {
    if (!activeModalMode) {
      return undefined
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setActiveModalMode('')
        setActiveProductId(null)
        setActiveProductDetail(null)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [activeModalMode])

  const openProductModal = async (mode, productId) => {
    setErrorMessage('')
    setActiveModalMode(mode)
    setActiveProductId(productId)
    setActiveProductDetail(null)
    await loadProductDetail(productId)
  }

  const closeProductModal = () => {
    setActiveModalMode('')
    setActiveProductId(null)
    setActiveProductDetail(null)
    setIsUpdatingDelivery('')
  }

  const handleToggleDelivery = async (member) => {
    if (!activeProductDetail) {
      return
    }

    setIsUpdatingDelivery(String(member.colegiadoId))
    setErrorMessage('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/inventario/productos/${activeProductDetail.id}/entregas/${member.colegiadoId}`,
        {
          method: member.entregado ? 'DELETE' : 'PUT',
          credentials: 'include',
        },
      )

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(
            response,
            'No se pudo actualizar la entrega del producto.',
          ),
        )
      }

      const updatedProduct = await response.json()
      setActiveProductDetail(updatedProduct)
      await loadDashboard()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar la entrega del producto.',
      )
    } finally {
      setIsUpdatingDelivery('')
    }
  }

  const totalProducts = products.length
  const totalStock = useMemo(
    () => products.reduce((total, product) => total + product.stockActual, 0),
    [products],
  )
  const totalDelivered = useMemo(
    () => products.reduce((total, product) => total + product.entregasRegistradas, 0),
    [products],
  )
  const totalSold = useMemo(
    () => products.reduce((total, product) => total + product.ventasRegistradas, 0),
    [products],
  )

  return (
    <div className="space-y-6">
      {errorMessage ? (
        <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700">
          {errorMessage}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[32px] border border-white/80 bg-[linear-gradient(135deg,#16324f_0%,#0f766e_45%,#dff6f2_100%)] p-6 text-white shadow-[0_22px_60px_-34px_rgba(15,23,42,0.8)] sm:p-7">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-sm text-teal-50/80">
              <span>Panel</span>
              <ChevronRight size={14} />
              <span className="font-semibold text-white">Inventario</span>
            </div>

            <div className="max-w-4xl">
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-teal-50 backdrop-blur">
                Modulo de inventario
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Inventario institucional
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-teal-50/88 sm:text-base">
                Visualiza materiales, stock, ventas y entregas de almanaques y
                libretas para colegiados desde una sola pantalla operativa.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {inventoryProcessCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-[24px] border border-white/15 bg-white/10 p-4 backdrop-blur"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-50/80">
                    {card.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white">{card.detail}</p>
                </article>
              ))}
            </div>
          </div>

          <article className="rounded-[28px] border border-white/15 bg-white p-5 text-slate-900 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.85)]">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-teal-100 p-3 text-teal-700">
                <PackageCheck size={20} strokeWidth={2.2} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Resumen rapido
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  Operacion conectada al backend
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-[22px] border border-slate-200 bg-[#f8fbff] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Materiales registrados
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  {totalProducts}
                </p>
              </div>

              <div className="rounded-[22px] border border-slate-200 bg-[#f8fbff] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Unidades en stock
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  {formatCount(totalStock)}
                </p>
              </div>

              <div className="rounded-[22px] border border-slate-200 bg-[#f8fbff] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Entregas registradas
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  {totalDelivered}
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        <article className="rounded-[28px] border border-cyan-500 bg-white p-6 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.55)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                Registro de materiales
              </p>
              <p className="mt-3 text-[2.2rem] font-bold tracking-tight text-slate-950">
                {totalProducts}
              </p>
            </div>
            <div className="rounded-2xl bg-cyan-100 p-3 text-cyan-700">
              <FolderKanban size={20} strokeWidth={2.2} />
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Almanaques y libretas visibles como materiales activos del sistema.
          </p>
        </article>

        <article className="rounded-[28px] border border-emerald-500 bg-white p-6 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.55)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                Control de stock
              </p>
              <p className="mt-3 text-[2.2rem] font-bold tracking-tight text-slate-950">
                {formatCount(totalStock)}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
              <PackageCheck size={20} strokeWidth={2.2} />
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Suma de unidades disponibles para entrega o venta.
          </p>
        </article>

        <article className="rounded-[28px] border border-amber-400 bg-white p-6 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.55)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                Venta de materiales
              </p>
              <p className="mt-3 text-[2.2rem] font-bold tracking-tight text-slate-950">
                {totalSold}
              </p>
            </div>
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <ShoppingBag size={20} strokeWidth={2.2} />
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Unidades vendidas segun el historial de movimientos real.
          </p>
        </article>

        <article className="rounded-[28px] border border-violet-400 bg-white p-6 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.55)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                Historial de movimientos
              </p>
              <p className="mt-3 text-[2.2rem] font-bold tracking-tight text-slate-950">
                {movements.length}
              </p>
            </div>
            <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
              <ClipboardList size={20} strokeWidth={2.2} />
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Trazabilidad de ingresos, ventas y entregas recientes.
          </p>
        </article>
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.4fr)_420px]">
        <article className="rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cobalt">
                Materiales disponibles
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Productos del inventario
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Cada producto permite consultar reportes y confirmar entregas a
                colegiados desde un modal conectado al backend.
              </p>
            </div>
          </div>

          {isLoadingDashboard ? (
            <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-[#f8fbff] px-4 py-8 text-center text-sm text-slate-500">
              Cargando productos del inventario...
            </div>
          ) : (
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              {products.map((product) => {
                const presentation = getProductPresentation(product)

                return (
                  <article
                    key={product.id}
                    className={`rounded-[28px] border bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-[0_16px_34px_-30px_rgba(15,23,42,0.55)] ${presentation.tone}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${presentation.badgeTone}`}
                        >
                          {product.categoria}
                        </span>
                        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                          {product.nombre}
                        </h3>
                      </div>

                      <div className="rounded-2xl bg-[#edf6ff] p-3 text-cobalt">
                        <BookOpen size={20} strokeWidth={2.2} />
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {product.descripcion}
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                          Stock
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-950">
                          {product.stockActual}
                        </p>
                      </div>
                      <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                          Ventas
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-950">
                          {product.ventasRegistradas}
                        </p>
                      </div>
                      <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                          Precio
                        </p>
                        <p className="mt-2 text-lg font-bold text-slate-950">
                          {formatCurrency(product.precioReferencia)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => openProductModal('report', product.id)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                      >
                        <FileBarChart2 size={17} strokeWidth={2.2} />
                        Reportes
                      </button>

                      <button
                        type="button"
                        onClick={() => openProductModal('delivery', product.id)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)] transition hover:-translate-y-0.5"
                      >
                        <CheckCheck size={17} strokeWidth={2.2} />
                        Producto entregado
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </article>

        <article className="rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
              <CalendarDays size={20} strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                Historial de movimientos
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                Trazabilidad reciente
              </h2>
            </div>
          </div>

          {isLoadingDashboard ? (
            <div className="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-[#f8fbff] px-4 py-8 text-center text-sm text-slate-500">
              Cargando movimientos...
            </div>
          ) : movements.length > 0 ? (
            <div className="mt-5 space-y-3">
              {movements.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[24px] border border-slate-200 bg-[#f8fbff] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{item.productoNombre}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.detalle}</p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
                        movementStyles[item.tipo] ?? 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {formatMovementType(item.tipo)}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700">
                      {formatMovementQuantity(item.cantidad)}
                    </span>
                    <span className="text-slate-500">
                      {formatMovementDate(item.fechaMovimiento)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-[#f8fbff] px-4 py-8 text-center text-sm text-slate-500">
              Aun no hay movimientos registrados.
            </div>
          )}
        </article>
      </section>

      {activeModalMode && activeProductId ? (
        isLoadingProductDetail || !activeProductDetail ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-[32px] border border-white/80 bg-white px-6 py-8 text-center shadow-[0_24px_70px_-36px_rgba(15,23,42,0.8)]">
              <p className="text-lg font-semibold text-slate-950">
                Cargando detalle del producto...
              </p>
            </div>
          </div>
        ) : activeModalMode === 'report' ? (
          <ProductReportsModal
            product={activeProductDetail}
            onClose={closeProductModal}
            errorMessage={errorMessage}
          />
        ) : (
          <ProductDeliveredModal
            product={activeProductDetail}
            onClose={closeProductModal}
            onToggleMember={handleToggleDelivery}
            errorMessage={errorMessage}
            activeMemberId={isUpdatingDelivery}
          />
        )
      ) : null}
    </div>
  )
}

export default InventarioPage
