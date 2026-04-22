import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Minus,
  Package2,
  Plus,
  Printer,
  ReceiptText,
  Search,
  ShoppingBag,
  Trash2,
  WalletCards,
  X,
} from 'lucide-react'
import { cobrosPaymentMethods } from '../../data/cobros/cobrosData'
import {
  getInventarioDashboard,
  getInventarioVentaDetail,
  getInventarioVentaPdf,
  getInventarioVentaClientes,
  getInventarioVentasPanel,
  markInventarioVentaPrinted,
  postInventarioVenta,
} from '../../services/inventarioApi'

function getTodayInputValue() {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 10)
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(Number(value ?? 0))
}

function formatDate(value) {
  if (!value) {
    return '--'
  }

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function buildBuyerKey(buyer) {
  return `${buyer.tipoRegistro}-${buyer.id}`
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

function SaleReceiptModal({ receipt, onClose, onPrint }) {
  if (!receipt) {
    return null
  }

  const boletaLabel =
    receipt.serie && receipt.numeroComprobante
      ? `${receipt.serie}-${String(receipt.numeroComprobante).padStart(7, '0')}`
      : receipt.referencia

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[32px] border border-white/80 bg-white shadow-[0_28px_90px_-38px_rgba(15,23,42,0.75)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-6 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cobalt">Boleta emitida</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Resumen de compra
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              La venta ya quedo registrada con el correlativo activo de boletas.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-14 w-14 items-center justify-center rounded-[22px] border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-950"
            aria-label="Cerrar resumen de venta"
          >
            <X size={22} strokeWidth={2.2} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-6 sm:px-8">
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_320px]">
            <div className="rounded-[28px] border border-cobalt/15 bg-[#f8fbff] p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full bg-cobalt-soft px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cobalt">
                  Boleta
                </span>
                <span className="text-2xl font-semibold tracking-tight text-slate-950">
                  {boletaLabel}
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Comprador
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">{receipt.clienteNombre}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {receipt.clienteCodigo} / DNI {receipt.clienteDocumento}
                  </p>
                </div>

                <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Emision
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {formatDate(receipt.fechaVenta)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{receipt.metodoPago}</p>
                </div>
              </div>

              {receipt.observacion ? (
                <div className="mt-4 rounded-[22px] border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Observacion
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{receipt.observacion}</p>
                </div>
              ) : null}
            </div>

            <div className="rounded-[28px] border border-emerald-200 bg-white p-5 shadow-[0_16px_40px_-32px_rgba(15,23,42,0.55)]">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                Total cobrado
              </p>
              <p className="mt-4 text-[2.6rem] font-bold tracking-tight text-slate-950">
                {formatCurrency(receipt.total)}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {receipt.items.length} item{receipt.items.length === 1 ? '' : 's'} en la boleta.
              </p>

              <button
                type="button"
                onClick={onPrint}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)] transition hover:-translate-y-0.5"
              >
                <Printer size={17} strokeWidth={2.3} />
                Imprimir boleta
              </button>
            </div>
          </section>

          <section className="overflow-hidden rounded-[28px] border border-slate-200">
            <div className="hidden grid-cols-[1.6fr_120px_120px_140px_140px] bg-[#e9f0ff] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 md:grid">
              <span>Producto</span>
              <span>Codigo</span>
              <span>Cantidad</span>
              <span>Precio</span>
              <span>Total</span>
            </div>

            <div className="divide-y divide-slate-200 bg-white">
              {receipt.items.map((item, index) => (
                <div
                  key={`${item.codigo}-${index}`}
                  className={`grid gap-3 px-5 py-4 md:grid-cols-[1.6fr_120px_120px_140px_140px] md:items-center md:px-6 ${
                    index % 2 === 1 ? 'bg-[#f8fbff]' : 'bg-white'
                  }`}
                >
                  <div className="font-semibold text-slate-950">{item.nombre}</div>
                  <div className="text-sm text-slate-600">{item.codigo}</div>
                  <div className="text-sm font-semibold text-slate-800">{item.cantidad}</div>
                  <div className="text-sm text-slate-600">{formatCurrency(item.precioUnitario)}</div>
                  <div className="text-sm font-semibold text-slate-950">
                    {formatCurrency(item.totalLinea)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function CobrosVentaProductosPage() {
  const [products, setProducts] = useState([])
  const [buyers, setBuyers] = useState([])
  const [salesPanel, setSalesPanel] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [completedSale, setCompletedSale] = useState(null)
  const [buyerSearch, setBuyerSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [buyersPage, setBuyersPage] = useState(1)
  const [productsPage, setProductsPage] = useState(1)
  const [salesPage, setSalesPage] = useState(1)
  const [selectedBuyer, setSelectedBuyer] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [saleDate, setSaleDate] = useState(getTodayInputValue())
  const [paymentMethod, setPaymentMethod] = useState(cobrosPaymentMethods[0]?.label ?? 'Efectivo')
  const [observation, setObservation] = useState('')

  const loadData = useCallback(async ({ preserveBuyer = true } = {}) => {
    setErrorMessage('')

    try {
      const [dashboard, clients, ventas] = await Promise.all([
        getInventarioDashboard(),
        getInventarioVentaClientes(),
        getInventarioVentasPanel(),
      ])

      setProducts(Array.isArray(dashboard?.productos) ? dashboard.productos : [])
      setBuyers(Array.isArray(clients) ? clients : [])
      setSalesPanel(ventas)

      if (preserveBuyer) {
        setSelectedBuyer((current) => {
          if (!current) {
            return current
          }

          const refreshedBuyer = clients.find(
            (buyer) => buildBuyerKey(buyer) === buildBuyerKey(current),
          )

          return refreshedBuyer ?? null
        })
      }
    } catch (error) {
      setErrorMessage(error.message || 'No se pudo cargar la venta de productos.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const totalAvailableProducts = useMemo(
    () => products.filter((product) => product.stockActual > 0).length,
    [products],
  )

  const totalStock = useMemo(
    () => products.reduce((sum, product) => sum + Number(product.stockActual ?? 0), 0),
    [products],
  )

  const filteredBuyers = useMemo(() => {
    const normalizedSearch = buyerSearch.trim().toLowerCase()

    if (!normalizedSearch) {
      return buyers
    }

    return buyers.filter((buyer) =>
      [buyer.nombreCompleto, buyer.codigo, buyer.documento, buyer.detalle]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch)),
    )
  }, [buyerSearch, buyers])

  const buyersPageSize = 5
  const totalBuyersPages = Math.max(1, Math.ceil(filteredBuyers.length / buyersPageSize))
  const safeBuyersPage = Math.min(buyersPage, totalBuyersPages)
  const paginatedBuyers = filteredBuyers.slice(
    (safeBuyersPage - 1) * buyersPageSize,
    safeBuyersPage * buyersPageSize,
  )

  const filteredProducts = useMemo(() => {
    const normalizedSearch = productSearch.trim().toLowerCase()

    return products.filter((product) => {
      if (product.stockActual <= 0) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      return [product.nombre, product.codigo, product.categoria, product.descripcion]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch))
    })
  }, [productSearch, products])

  const productsPageSize = 3
  const totalProductsPages = Math.max(1, Math.ceil(filteredProducts.length / productsPageSize))
  const safeProductsPage = Math.min(productsPage, totalProductsPages)
  const paginatedProducts = filteredProducts.slice(
    (safeProductsPage - 1) * productsPageSize,
    safeProductsPage * productsPageSize,
  )

  const cartSummary = useMemo(() => {
    const units = cartItems.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = cartItems.reduce((sum, item) => sum + item.quantity * Number(item.unitPrice), 0)

    return {
      units,
      subtotal,
    }
  }, [cartItems])

  const cartItemsById = useMemo(
    () =>
      cartItems.reduce((map, item) => {
        map.set(item.id, item)
        return map
      }, new Map()),
    [cartItems],
  )

  const salesRows = salesPanel?.ventas ?? []
  const salesPageSize = 5
  const totalSalesPages = Math.max(1, Math.ceil(salesRows.length / salesPageSize))
  const safeSalesPage = Math.min(salesPage, totalSalesPages)
  const paginatedSales = salesRows.slice(
    (safeSalesPage - 1) * salesPageSize,
    safeSalesPage * salesPageSize,
  )

  useEffect(() => {
    setSalesPage(1)
  }, [salesRows.length])

  useEffect(() => {
    setProductsPage(1)
  }, [productSearch, products.length])

  useEffect(() => {
    setBuyersPage(1)
  }, [buyerSearch, buyers.length])

  const addProductToCart = (product) => {
    setCartItems((current) => {
      const existingItem = current.find((item) => item.id === product.id)

      if (existingItem) {
        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, product.stockActual),
              }
            : item,
        )
      }

      return [
        ...current,
        {
          id: product.id,
          code: product.codigo,
          name: product.nombre,
          category: product.categoria,
          unitPrice: Number(product.precioReferencia),
          quantity: 1,
          maxStock: product.stockActual,
        },
      ]
    })
  }

  const updateCartItemQuantity = (productId, nextQuantity) => {
    setCartItems((current) =>
      current
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: Math.max(1, Math.min(nextQuantity, item.maxStock)),
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const removeCartItem = (productId) => {
    setCartItems((current) => current.filter((item) => item.id !== productId))
  }

  const handleSubmitSale = async () => {
    if (!selectedBuyer || cartItems.length === 0 || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const response = await postInventarioVenta({
        clienteTipo: selectedBuyer.tipoRegistro,
        clienteId: selectedBuyer.id,
        metodoPago: paymentMethod,
        fechaVenta: saleDate,
        observacion: observation.trim() || null,
        items: cartItems.map((item) => ({
          productoId: item.id,
          cantidad: item.quantity,
        })),
      })

      setCartItems([])
      setObservation('')
      await loadData()
      setCompletedSale(response)
    } catch (error) {
      setErrorMessage(error.message || 'No se pudo registrar la venta.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrintCompletedSale = useCallback(async () => {
    if (!completedSale) {
      return
    }

    try {
      const { blob } = await getInventarioVentaPdf(completedSale.id)
      openPdfBlob(blob)

      if (!completedSale.impreso) {
        markInventarioVentaPrinted(completedSale.id)
          .then(() => getInventarioVentaDetail(completedSale.id))
          .then((updatedSale) => {
            setCompletedSale(updatedSale)
          })
          .catch(() => {})
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo abrir la boleta PDF.')
    }
  }, [completedSale])

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-4">
        <article className="rounded-[28px] border border-cobalt/20 bg-white p-5 shadow-[0_16px_40px_-32px_rgba(15,23,42,0.55)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                Productos listos
              </p>
              <p className="mt-3 text-[2.1rem] font-bold tracking-tight text-slate-950">
                {totalAvailableProducts}
              </p>
            </div>
            <div className="rounded-2xl bg-cobalt-soft p-3 text-cobalt">
              <Package2 size={20} strokeWidth={2.2} />
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Catalogo disponible para venta inmediata desde caja.
          </p>
        </article>

        <article className="rounded-[28px] border border-emerald-200 bg-white p-5 shadow-[0_16px_40px_-32px_rgba(15,23,42,0.55)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                Unidades en stock
              </p>
              <p className="mt-3 text-[2.1rem] font-bold tracking-tight text-slate-950">
                {totalStock}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
              <ShoppingBag size={20} strokeWidth={2.2} />
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Unidades vivas que pueden convertirse en venta real.
          </p>
        </article>

        <article className="rounded-[28px] border border-amber-200 bg-white p-5 shadow-[0_16px_40px_-32px_rgba(15,23,42,0.55)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                Ventas registradas
              </p>
              <p className="mt-3 text-[2.1rem] font-bold tracking-tight text-slate-950">
                {salesPanel?.ventasRegistradas ?? 0}
              </p>
            </div>
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <ReceiptText size={20} strokeWidth={2.2} />
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Operaciones ya trazadas con salida real de inventario.
          </p>
        </article>

        <article className="rounded-[28px] border border-violet-200 bg-white p-5 shadow-[0_16px_40px_-32px_rgba(15,23,42,0.55)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                Monto vendido
              </p>
              <p className="mt-3 text-[2.1rem] font-bold tracking-tight text-slate-950">
                {formatCurrency(salesPanel?.montoRecaudado ?? 0)}
              </p>
            </div>
            <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
              <WalletCards size={20} strokeWidth={2.2} />
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Recaudacion acumulada del flujo de productos institucionales.
          </p>
        </article>
      </section>

      {errorMessage ? (
        <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.4fr)_360px]">
        <div className="space-y-6">
          <article className="rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
            <div className="border-b border-slate-200 pb-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cobalt">
                1. Comprador
              </p>
              <div className="mt-3">
                <label className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-cobalt focus-within:bg-white">
                  <Search
                    size={18}
                    className="text-slate-400 transition group-focus-within:text-cobalt"
                  />
                  <input
                    type="search"
                    value={buyerSearch}
                    onChange={(event) => setBuyerSearch(event.target.value)}
                    placeholder="Buscar por codigo, nombre o DNI"
                    className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </label>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-[26px] border border-slate-200">
              <div className="hidden grid-cols-[140px_120px_1.4fr_120px] bg-[#e9f0ff] px-5 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 md:grid">
                <span>Codigo</span>
                <span>DNI</span>
                <span>Nombre</span>
                <span>Tipo</span>
              </div>

              <div className="divide-y divide-slate-200 bg-white">
                {!isLoading && filteredBuyers.length === 0 ? (
                  <div className="px-5 py-8 text-sm text-slate-500">
                    No encontramos coincidencias para ese comprador.
                  </div>
                ) : (
                  paginatedBuyers.map((buyer, index) => {
                    const isActive =
                      selectedBuyer && buildBuyerKey(selectedBuyer) === buildBuyerKey(buyer)

                    return (
                      <button
                        key={buildBuyerKey(buyer)}
                        type="button"
                        onClick={() => setSelectedBuyer(buyer)}
                        className={`grid w-full gap-3 px-5 py-4 text-left transition md:grid-cols-[140px_120px_1.4fr_120px] md:items-center ${
                          index % 2 === 1 ? 'bg-[#f8fbff]' : 'bg-white'
                        } ${isActive ? 'bg-[#eff4ff]' : 'hover:bg-slate-50'}`}
                      >
                        <div className="text-sm font-semibold text-slate-900">{buyer.codigo}</div>
                        <div className="text-sm text-slate-600">DNI {buyer.documento}</div>
                        <div>
                          <p className="font-semibold text-slate-950">{buyer.nombreCompleto}</p>
                        </div>
                        <div>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${
                              buyer.tipoRegistro === 'COLEGIADO'
                                ? 'bg-cobalt-soft text-cobalt'
                                : 'bg-violet-100 text-violet-700'
                            }`}
                          >
                            {buyer.tipoRegistro === 'COLEGIADO' ? 'Colegiado' : 'Otro'}
                          </span>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                Mostrando {filteredBuyers.length === 0 ? 0 : (safeBuyersPage - 1) * buyersPageSize + 1}{' '}
                a {Math.min(safeBuyersPage * buyersPageSize, filteredBuyers.length)} de{' '}
                {filteredBuyers.length} compradores
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setBuyersPage((current) => Math.max(1, current - 1))}
                  disabled={safeBuyersPage === 1}
                  className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Anterior
                </button>
                <div className="rounded-2xl bg-[#eef4ff] px-4 py-3 text-sm font-semibold text-slate-700">
                  {safeBuyersPage} / {totalBuyersPages}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setBuyersPage((current) => Math.min(totalBuyersPages, current + 1))
                  }
                  disabled={safeBuyersPage === totalBuyersPages}
                  className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </article>

          <article className="rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-cobalt">
                  2. Productos
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Agrega materiales del inventario al carrito y manten el control del stock sin
                  salir de caja.
                </p>
              </div>

              <label className="group flex w-full max-w-xl items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-cobalt focus-within:bg-white">
                <Search
                  size={18}
                  className="text-slate-400 transition group-focus-within:text-cobalt"
                />
                <input
                  type="search"
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  placeholder="Buscar por nombre, codigo o categoria"
                  className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>
            </div>

            {isLoading ? (
              <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-[#f8fbff] px-4 py-10 text-center text-sm text-slate-500">
                Cargando catalogo de productos...
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div className="mt-6 grid gap-3 xl:grid-cols-3">
                  {paginatedProducts.map((product) => {
                    const cartItem = cartItemsById.get(product.id)

                    return (
                      <article
                        key={product.id}
                        className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-[0_16px_34px_-30px_rgba(15,23,42,0.55)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="rounded-full bg-cobalt-soft px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cobalt">
                              {product.categoria}
                            </span>
                            <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                              {product.nombre}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">{product.codigo}</p>
                          </div>
                          <div className="rounded-2xl bg-[#edf6ff] p-2.5 text-cobalt">
                            <Package2 size={16} strokeWidth={2.2} />
                          </div>
                        </div>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <div className="rounded-[20px] border border-slate-200 bg-white p-3">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                              Precio
                            </p>
                            <p className="mt-1.5 text-base font-bold text-slate-950">
                              {formatCurrency(product.precioReferencia)}
                            </p>
                          </div>
                          <div className="rounded-[20px] border border-slate-200 bg-white p-3">
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                              Stock
                            </p>
                            <p className="mt-1.5 text-base font-bold text-slate-950">
                              {product.stockActual}
                            </p>
                          </div>
                        </div>

                        {cartItem ? (
                          <div className="mt-4 flex items-center justify-between gap-3 rounded-[20px] border border-cobalt/15 bg-[#eff4ff] px-3 py-3">
                            <div className="inline-flex items-center gap-2 rounded-2xl border border-cobalt/20 bg-white px-2 py-2">
                              <button
                                type="button"
                                onClick={() => updateCartItemQuantity(cartItem.id, cartItem.quantity - 1)}
                                className="rounded-xl p-1 text-cobalt transition hover:bg-cobalt-soft"
                              >
                                <Minus size={14} strokeWidth={2.4} />
                              </button>
                              <span className="min-w-[42px] text-center text-sm font-semibold text-slate-950">
                                {cartItem.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateCartItemQuantity(cartItem.id, cartItem.quantity + 1)}
                                disabled={cartItem.quantity >= cartItem.maxStock}
                                className="rounded-xl p-1 text-cobalt transition hover:bg-cobalt-soft disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Plus size={14} strokeWidth={2.4} />
                              </button>
                            </div>
                            <p className="text-sm font-semibold text-cobalt">
                              {formatCurrency(cartItem.quantity * cartItem.unitPrice)}
                            </p>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addProductToCart(product)}
                            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)] transition hover:-translate-y-0.5"
                          >
                            <Plus size={16} strokeWidth={2.4} />
                            Agregar al carrito
                          </button>
                        )}
                      </article>
                    )
                  })}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-500">
                    Mostrando {filteredProducts.length === 0 ? 0 : (safeProductsPage - 1) * productsPageSize + 1}{' '}
                    a {Math.min(safeProductsPage * productsPageSize, filteredProducts.length)} de{' '}
                    {filteredProducts.length} productos
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setProductsPage((current) => Math.max(1, current - 1))}
                      disabled={safeProductsPage === 1}
                      className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Anterior
                    </button>
                    <div className="rounded-2xl bg-[#eef4ff] px-4 py-3 text-sm font-semibold text-slate-700">
                      {safeProductsPage} / {totalProductsPages}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setProductsPage((current) => Math.min(totalProductsPages, current + 1))
                      }
                      disabled={safeProductsPage === totalProductsPages}
                      className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-[#f8fbff] px-4 py-10 text-center text-sm text-slate-500">
                No encontramos productos vendibles con ese criterio.
              </div>
            )}
          </article>
        </div>

        <aside className="rounded-[30px] border border-[#1f2845] bg-[#19223c] p-5 text-white shadow-[0_18px_50px_-38px_rgba(15,23,42,0.88)] sm:p-6">
          <div className="border-b border-white/10 pb-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/65">
              3. Cierre de venta
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Resumen y salida</h2>
          </div>

          <div className="mt-5 space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                    Comprador
                  </p>
                  {selectedBuyer ? (
                    <div className="mt-3">
                      <p className="font-semibold text-white">{selectedBuyer.nombreCompleto}</p>
                      <p className="mt-1 text-sm text-slate-300">
                        {selectedBuyer.codigo} /{' '}
                        {selectedBuyer.tipoRegistro === 'COLEGIADO' ? 'Colegiado habilitado' : 'Otro'}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-300">
                      Aun no seleccionas a quien se emitira la venta.
                    </p>
                  )}
                </div>
                {selectedBuyer ? (
                  <button
                    type="button"
                    onClick={() => setSelectedBuyer(null)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:text-white"
                  >
                    Cambiar
                  </button>
                ) : null}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                  Items del carrito
                </p>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                  {cartSummary.units} unidades
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {cartItems.length > 0 ? (
                  cartItems.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-[22px] border border-white/10 bg-[#202a49] px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-white">{item.name}</p>
                          <p className="mt-1 text-sm text-slate-300">
                            {item.code} / {item.quantity} und
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white">
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeCartItem(item.id)}
                            className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:border-rose-300/40 hover:text-rose-200"
                          >
                            <Trash2 size={15} strokeWidth={2.2} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[22px] border border-dashed border-white/15 bg-white/[0.04] px-4 py-8 text-center text-sm text-slate-300">
                    Aun no agregas productos al carrito.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                  Metodo de pago
                </span>
                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-white/30"
                >
                  {cobrosPaymentMethods.map((method) => (
                    <option key={method.label} value={method.label} className="text-slate-950">
                      {method.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="grid gap-4">
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                    Fecha de venta
                  </span>
                  <input
                    type="date"
                    value={saleDate}
                    onChange={(event) => setSaleDate(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                    Observacion
                  </span>
                  <textarea
                    value={observation}
                    onChange={(event) => setObservation(event.target.value)}
                    rows={3}
                    placeholder="Detalle opcional para la venta"
                    className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-white/30"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-[#202a49] p-5 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                Total de la venta
              </p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Items</span>
                  <span className="font-semibold">{cartItems.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Unidades</span>
                  <span className="font-semibold">{cartSummary.units}</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-slate-300">Total</span>
                  <span className="text-2xl font-bold tracking-tight">
                    {formatCurrency(cartSummary.subtotal)}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmitSale}
              disabled={!selectedBuyer || cartItems.length === 0 || isSubmitting || !saleDate}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] px-5 py-4 text-base font-semibold text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {isSubmitting ? 'Registrando venta...' : 'Registrar venta'}
            </button>
          </div>
        </aside>
      </section>

      <section className="rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cobalt">
              Historial rapido
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Ultimas ventas registradas
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            Mostrando {salesRows.length === 0 ? 0 : (safeSalesPage - 1) * salesPageSize + 1} a{' '}
            {Math.min(safeSalesPage * salesPageSize, salesRows.length)} de {salesRows.length}{' '}
            ventas
          </p>
        </div>

        {isLoading ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-[#f8fbff] px-4 py-10 text-center text-sm text-slate-500">
            Cargando historial de ventas...
          </div>
        ) : salesRows.length > 0 ? (
          <>
            <div className="mt-6 overflow-hidden rounded-[26px] border border-slate-200">
              <div className="hidden grid-cols-[120px_1.35fr_1fr_0.9fr_0.85fr_120px] bg-[#e9f0ff] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 lg:grid">
                <span>Referencia</span>
                <span>Cliente</span>
                <span>Items</span>
                <span>Pago</span>
                <span>Fecha</span>
                <span>Total</span>
              </div>

              <div className="divide-y divide-slate-200 bg-white">
                {paginatedSales.map((sale, index) => (
                  <div
                    key={sale.id}
                    className={`grid gap-4 px-5 py-5 lg:grid-cols-[120px_1.35fr_1fr_0.9fr_0.85fr_120px] lg:items-center lg:px-6 ${
                      index % 2 === 1 ? 'bg-[#f8fbff]' : 'bg-white'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-slate-950">{sale.referencia}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {sale.clienteTipo === 'COLEGIADO' ? 'Colegiado' : 'Otro'}
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold text-slate-950">{sale.clienteNombre}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {sale.clienteCodigo} / {sale.clienteDetalle}
                      </p>
                    </div>

                    <div>
                      <p className="font-medium text-slate-800">{sale.resumenItems}</p>
                      <p className="mt-1 text-sm text-slate-500">{sale.totalUnidades} unidades</p>
                    </div>

                    <div>
                      <span className="inline-flex rounded-full bg-cobalt-soft px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cobalt">
                        {sale.metodoPago}
                      </span>
                    </div>

                    <div className="text-sm text-slate-600">{formatDate(sale.fechaVenta)}</div>

                    <div className="text-right text-lg font-semibold text-slate-950">
                      {formatCurrency(sale.total)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSalesPage((current) => Math.max(1, current - 1))}
                disabled={safeSalesPage === 1}
                className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Anterior
              </button>
              <div className="rounded-2xl bg-[#eef4ff] px-4 py-3 text-sm font-semibold text-slate-700">
                {safeSalesPage} / {totalSalesPages}
              </div>
              <button
                type="button"
                onClick={() => setSalesPage((current) => Math.min(totalSalesPages, current + 1))}
                disabled={safeSalesPage === totalSalesPages}
                className="inline-flex rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Siguiente
              </button>
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-[#f8fbff] px-4 py-10 text-center text-sm text-slate-500">
            Aun no hay ventas de productos registradas.
          </div>
        )}
      </section>

      <SaleReceiptModal
        receipt={completedSale}
        onClose={() => setCompletedSale(null)}
        onPrint={handlePrintCompletedSale}
      />
    </div>
  )
}

export default CobrosVentaProductosPage
