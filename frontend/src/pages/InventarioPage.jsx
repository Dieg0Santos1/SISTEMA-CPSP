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
import {
  inventoryInitialProducts,
  inventoryMembers,
  inventoryMovementHistory,
  inventoryProcessCards,
} from '../data/inventario/inventarioData'

function formatCount(value) {
  return value.toLocaleString('en-US')
}

function ProductReportsModal({ product, onClose }) {
  const receivedMembers = inventoryMembers.filter((member) =>
    product.deliveredMemberIds.includes(member.id),
  )

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[32px] border border-white/80 bg-white shadow-[0_24px_70px_-36px_rgba(15,23,42,0.8)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cobalt">
              Reportes
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              {product.name}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Este producto ha sido recibido por {receivedMembers.length} colegiados en
              esta vista local.
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
              {product.stock}
            </p>
          </article>

          <article className="rounded-[24px] border border-slate-200 bg-[#f8fbff] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Vendidos
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {product.soldUnits}
            </p>
          </article>
        </div>

        <div className="px-6 py-6 sm:px-8">
          <div className="overflow-hidden rounded-[26px] border border-slate-200">
            <div className="hidden grid-cols-[1.5fr_1fr_1fr] bg-[#e9f0ff] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 lg:grid">
              <span>Colegiado</span>
              <span>Especialidad</span>
              <span>Estado</span>
            </div>

            <div className="divide-y divide-slate-200 bg-white">
              {receivedMembers.map((member, index) => (
                <div
                  key={member.id}
                  className={`grid gap-4 px-5 py-5 lg:grid-cols-[1.5fr_1fr_1fr] lg:items-center lg:px-6 ${
                    index % 2 === 1 ? 'bg-[#f8fbff]' : 'bg-white'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-slate-950">{member.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{member.code}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700">{member.specialty}</p>
                  </div>

                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${member.statusTone}`}
                    >
                      {member.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductDeliveredModal({ product, onClose, onToggleMember }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-[32px] border border-white/80 bg-white shadow-[0_24px_70px_-36px_rgba(15,23,42,0.8)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cobalt">
              Producto entregado
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              Confirmar entrega de {product.name}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Marca con check a los colegiados que ya recibieron este producto.
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

        <div className="grid gap-4 border-b border-slate-200 px-6 py-5 sm:grid-cols-3 sm:px-8">
          <article className="rounded-[24px] border border-slate-200 bg-[#f8fbff] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Entregados
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {product.deliveredMemberIds.length}
            </p>
          </article>

          <article className="rounded-[24px] border border-slate-200 bg-[#f8fbff] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Pendientes
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {inventoryMembers.length - product.deliveredMemberIds.length}
            </p>
          </article>

          <article className="rounded-[24px] border border-slate-200 bg-[#f8fbff] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Producto
            </p>
            <p className="mt-2 text-base font-semibold text-slate-950">{product.category}</p>
          </article>
        </div>

        <div className="px-6 py-6 sm:px-8">
          <div className="overflow-hidden rounded-[26px] border border-slate-200">
            <div className="hidden grid-cols-[88px_1.45fr_1fr_0.85fr_100px] bg-[#e9f0ff] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 lg:grid">
              <span>Check</span>
              <span>Colegiado</span>
              <span>Especialidad</span>
              <span>Estado</span>
              <span>Entrega</span>
            </div>

            <div className="divide-y divide-slate-200 bg-white">
              {inventoryMembers.map((member, index) => {
                const isChecked = product.deliveredMemberIds.includes(member.id)

                return (
                  <label
                    key={member.id}
                    className={`grid cursor-pointer gap-4 px-5 py-5 lg:grid-cols-[88px_1.45fr_1fr_0.85fr_100px] lg:items-center lg:px-6 ${
                      index % 2 === 1 ? 'bg-[#f8fbff]' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleMember(member.id)}
                        className="h-5 w-5 rounded border-slate-300 accent-[#1739a6]"
                      />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-950">{member.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{member.code}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-700">{member.specialty}</p>
                    </div>

                    <div>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${member.statusTone}`}
                      >
                        {member.status}
                      </span>
                    </div>

                    <div className="flex justify-start lg:justify-center">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
                          isChecked
                            ? 'bg-cobalt-soft text-cobalt'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {isChecked ? 'Entregado' : 'Pendiente'}
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
  const [products, setProducts] = useState(inventoryInitialProducts)
  const [reportProductId, setReportProductId] = useState(null)
  const [deliveryProductId, setDeliveryProductId] = useState(null)

  const reportProduct = products.find((product) => product.id === reportProductId) ?? null
  const deliveryProduct = products.find((product) => product.id === deliveryProductId) ?? null

  const totalProducts = products.length
  const totalStock = useMemo(
    () => products.reduce((total, product) => total + product.stock, 0),
    [products],
  )
  const totalDelivered = useMemo(
    () => products.reduce((total, product) => total + product.deliveredMemberIds.length, 0),
    [products],
  )
  const totalSold = useMemo(
    () => products.reduce((total, product) => total + product.soldUnits, 0),
    [products],
  )

  useEffect(() => {
    if (!reportProduct && !deliveryProduct) {
      return undefined
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setReportProductId(null)
        setDeliveryProductId(null)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [deliveryProduct, reportProduct])

  const handleToggleDelivery = (productId, memberId) => {
    setProducts((current) =>
      current.map((product) => {
        if (product.id !== productId) {
          return product
        }

        const alreadyDelivered = product.deliveredMemberIds.includes(memberId)

        return {
          ...product,
          deliveredMemberIds: alreadyDelivered
            ? product.deliveredMemberIds.filter((currentId) => currentId !== memberId)
            : [...product.deliveredMemberIds, memberId],
        }
      }),
    )
  }

  return (
    <div className="space-y-6">
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
                  Operacion local de inventario
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
            Almanaques y libretas visibles como materiales activos.
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
            Unidades vendidas en la vista operativa actual.
          </p>
        </article>

        <article className="rounded-[28px] border border-violet-400 bg-white p-6 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.55)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                Historial de movimientos
              </p>
              <p className="mt-3 text-[2.2rem] font-bold tracking-tight text-slate-950">
                {inventoryMovementHistory.length}
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
                colegiados desde un modal.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {products.map((product) => (
              <article
                key={product.id}
                className={`rounded-[28px] border bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-[0_16px_34px_-30px_rgba(15,23,42,0.55)] ${product.tone}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${product.badgeTone}`}
                    >
                      {product.category}
                    </span>
                    <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                      {product.name}
                    </h3>
                  </div>

                  <div className="rounded-2xl bg-[#edf6ff] p-3 text-cobalt">
                    <BookOpen size={20} strokeWidth={2.2} />
                  </div>
                </div>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {product.description}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      Stock
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-950">{product.stock}</p>
                  </div>
                  <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      Ventas
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-950">
                      {product.soldUnits}
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      Precio
                    </p>
                    <p className="mt-2 text-lg font-bold text-slate-950">
                      {product.priceLabel}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setReportProductId(product.id)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                  >
                    <FileBarChart2 size={17} strokeWidth={2.2} />
                    Reportes
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryProductId(product.id)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)] transition hover:-translate-y-0.5"
                  >
                    <CheckCheck size={17} strokeWidth={2.2} />
                    Producto entregado
                  </button>
                </div>
              </article>
            ))}
          </div>
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

          <div className="mt-5 space-y-3">
            {inventoryMovementHistory.map((item) => (
              <article
                key={item.id}
                className="rounded-[24px] border border-slate-200 bg-[#f8fbff] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{item.product}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${item.typeTone}`}
                  >
                    {item.type}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">{item.quantity}</span>
                  <span className="text-slate-500">{item.date}</span>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>

      {reportProduct ? (
        <ProductReportsModal
          product={reportProduct}
          onClose={() => setReportProductId(null)}
        />
      ) : null}

      {deliveryProduct ? (
        <ProductDeliveredModal
          product={deliveryProduct}
          onClose={() => setDeliveryProductId(null)}
          onToggleMember={(memberId) => handleToggleDelivery(deliveryProduct.id, memberId)}
        />
      ) : null}
    </div>
  )
}

export default InventarioPage
