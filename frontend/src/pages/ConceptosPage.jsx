import { useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Download,
  PencilLine,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import {
  createTesoreriaConceptoCobro,
  deleteTesoreriaConceptoCobro,
  downloadTesoreriaConceptosCatalogoReport,
  getTesoreriaConceptosCobroCatalogo,
  updateTesoreriaConceptoCobro,
} from '../services/tesoreriaApi'

const categoryOptions = [
  { value: 'Todos', label: 'Todos' },
  { value: 'APORTACIONES', label: 'Aportaciones' },
  { value: 'HABILITACION', label: 'Habilitacion' },
  { value: 'CEREMONIAS', label: 'Ceremonias' },
  { value: 'SERVICIOS', label: 'Servicios' },
  { value: 'CERTIFICACIONES', label: 'Certificaciones' },
  { value: 'ESPECIALIDADES', label: 'Especialidades' },
  { value: 'DESCUENTOS', label: 'Descuentos' },
]

const conceptTypeOptions = [
  { value: 'NORMAL', label: 'Concepto normal' },
  { value: 'DESCUENTO', label: 'Descuento' },
]

const discountTypeOptions = [
  { value: 'MONTO_FIJO', label: 'Monto fijo' },
  { value: 'PORCENTAJE', label: 'Porcentaje' },
]

const discountApplyOptions = [
  { value: 'APORTACIONES', label: 'Aportaciones' },
  { value: 'TODOS_LOS_CONCEPTOS', label: 'Todos los conceptos' },
]

const estadoOptions = [
  { value: 'ACTIVO', label: 'Activo' },
  { value: 'INACTIVO', label: 'Inactivo' },
]

const initialFormValues = {
  codigo: '',
  tipoConcepto: 'NORMAL',
  nombre: '',
  categoria: 'SERVICIOS',
  descripcion: '',
  montoBase: '',
  tipoDescuento: 'MONTO_FIJO',
  valorDescuento: '',
  aplicaDescuentoA: 'APORTACIONES',
  usaPeriodo: false,
  permiteCantidad: false,
  admiteDescuento: false,
  admiteMora: false,
  afectaHabilitacion: false,
  exoneradoIgv: false,
  requiereAdjunto: false,
  estado: 'ACTIVO',
}

const conceptosSyncEventName = 'tesoreria:conceptos-updated'
const conceptosSyncStorageKey = 'tesoreria:conceptos-updated-at'

function formatCurrency(value) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(Number(value ?? 0))
}

function formatCategoryLabel(value) {
  return (
    categoryOptions.find((option) => option.value === value)?.label ??
    value.replaceAll('_', ' ')
  )
}

function formatConceptTypeLabel(value) {
  return value === 'DESCUENTO' ? 'Descuento' : 'Concepto normal'
}

function formatStatusLabel(value) {
  return value === 'ACTIVO' ? 'Activo' : 'Inactivo'
}

function formatDiscountTypeLabel(value) {
  return discountTypeOptions.find((option) => option.value === value)?.label ?? value
}

function formatDiscountApplyLabel(value) {
  return discountApplyOptions.find((option) => option.value === value)?.label ?? value
}

function formatConceptAmount(concept) {
  if (concept.tipoConcepto === 'DESCUENTO') {
    if (concept.tipoDescuento === 'PORCENTAJE') {
      return `${Number(concept.valorDescuento ?? 0).toFixed(2)}%`
    }
    return formatCurrency(concept.valorDescuento)
  }

  return formatCurrency(concept.montoBase)
}

function getStatusTone(status) {
  return status === 'ACTIVO'
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-slate-100 text-slate-600'
}

function getConceptTypeTone(type) {
  return type === 'DESCUENTO'
    ? 'bg-fuchsia-100 text-fuchsia-700'
    : 'bg-cobalt-soft text-cobalt'
}

function buildSummaryCards(summary) {
  return [
    {
      title: 'Conceptos activos',
      value: String(summary.activos ?? 0),
      note: `${summary.activos ?? 0} operativos en tesoreria`,
      accent: 'border-cobalt',
      noteTone: 'text-cobalt',
    },
    {
      title: 'Categorias',
      value: String(summary.categorias ?? 0),
      note: 'Cobros institucionales',
      accent: 'border-emerald-500',
      noteTone: 'text-emerald-600',
    },
    {
      title: 'Afectan habilitacion',
      value: String(summary.afectanHabilitacion ?? 0),
      note: 'Aportaciones y habilitacion',
      accent: 'border-amber-500',
      noteTone: 'text-amber-600',
    },
    {
      title: 'Descuentos configurados',
      value: String(summary.descuentosConfigurados ?? 0),
      note: 'Reglas comerciales listas para tesoreria',
      accent: 'border-fuchsia-500',
      noteTone: 'text-fuchsia-600',
    },
  ]
}

function normalizeConceptForForm(concept) {
  return {
    codigo: concept.codigo,
    tipoConcepto: concept.tipoConcepto ?? 'NORMAL',
    nombre: concept.nombre,
    categoria: concept.categoria,
    descripcion: concept.descripcion ?? '',
    montoBase: String(concept.montoBase ?? ''),
    tipoDescuento: concept.tipoDescuento ?? 'MONTO_FIJO',
    valorDescuento: concept.valorDescuento != null ? String(concept.valorDescuento) : '',
    aplicaDescuentoA: concept.aplicaDescuentoA ?? 'APORTACIONES',
    usaPeriodo: concept.usaPeriodo,
    permiteCantidad: concept.permiteCantidad,
    admiteDescuento: concept.admiteDescuento,
    admiteMora: concept.admiteMora,
    afectaHabilitacion: concept.afectaHabilitacion,
    exoneradoIgv: concept.exoneradoIgv,
    requiereAdjunto: concept.requiereAdjunto,
    estado: concept.estado,
  }
}

function notifyConceptCatalogUpdated() {
  if (typeof window === 'undefined') {
    return
  }

  const updatedAt = String(Date.now())
  window.localStorage.setItem(conceptosSyncStorageKey, updatedAt)
  window.dispatchEvent(
    new CustomEvent(conceptosSyncEventName, {
      detail: { updatedAt },
    }),
  )
}

function ConceptFormModal({
  formValues,
  formError,
  isSubmitting,
  mode,
  onCheckboxChange,
  onConceptTypeChange,
  onClose,
  onInputChange,
  onSubmit,
}) {
  const isDiscount = formValues.tipoConcepto === 'DESCUENTO'

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[32px] border border-white/80 bg-white shadow-[0_24px_70px_-36px_rgba(15,23,42,0.8)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cobalt">
              {mode === 'create' ? 'Nuevo concepto' : 'Editar concepto'}
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              {mode === 'create'
                ? 'Registrar concepto de cobro'
                : 'Actualizar concepto de cobro'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Guarda los datos base que usara tesoreria para registrar operaciones reales.
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

        <form onSubmit={onSubmit} className="space-y-5 px-6 py-6 sm:px-8">
          {formError ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {formError}
            </div>
          ) : null}

          <div className="rounded-[24px] border border-slate-200 bg-[#f8fbff] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Tipo de concepto
            </p>
            <div className="mt-4 inline-flex rounded-2xl bg-white p-1 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)]">
              {conceptTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onConceptTypeChange(option.value)}
                  className={`rounded-[14px] px-4 py-2.5 text-sm font-semibold transition ${
                    formValues.tipoConcepto === option.value
                      ? 'bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] text-white shadow-[0_16px_30px_-24px_rgba(30,64,175,0.9)]'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-500">
              {isDiscount
                ? 'Configura una regla comercial para aplicar rebajas por monto fijo o porcentaje.'
                : 'Configura un concepto operativo que tesoreria podra usar en cobros regulares.'}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Codigo</span>
              <input
                type="text"
                name="codigo"
                value={formValues.codigo}
                onChange={onInputChange}
                required
                maxLength={30}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm uppercase text-slate-700 outline-none transition focus:border-cobalt"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">Nombre</span>
              <input
                type="text"
                name="nombre"
                value={formValues.nombre}
                onChange={onInputChange}
                required
                maxLength={120}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cobalt"
              />
            </label>
          </div>

          {isDiscount ? (
            <div className="grid gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Categoria interna</span>
                <div className="flex h-[50px] items-center rounded-2xl border border-slate-200 bg-slate-50 px-4">
                  <span className="inline-flex rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-fuchsia-700">
                    Descuentos
                  </span>
                </div>
              </div>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Tipo de descuento</span>
                <select
                  name="tipoDescuento"
                  value={formValues.tipoDescuento}
                  onChange={onInputChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cobalt"
                >
                  {discountTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Estado</span>
                <select
                  name="estado"
                  value={formValues.estado}
                  onChange={onInputChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cobalt"
                >
                  {estadoOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Categoria</span>
                <select
                  name="categoria"
                  value={formValues.categoria}
                  onChange={onInputChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cobalt"
                >
                  {categoryOptions
                    .filter((option) => !['Todos', 'DESCUENTOS'].includes(option.value))
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Monto base</span>
                <input
                  type="number"
                  name="montoBase"
                  value={formValues.montoBase}
                  onChange={onInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cobalt"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Estado</span>
                <select
                  name="estado"
                  value={formValues.estado}
                  onChange={onInputChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cobalt"
                >
                  {estadoOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Descripcion</span>
            <textarea
              name="descripcion"
              value={formValues.descripcion}
              onChange={onInputChange}
              rows={3}
              maxLength={255}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cobalt"
            />
          </label>

          {isDiscount ? (
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_320px]">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Valor del descuento</span>
                  <input
                    type="number"
                    name="valorDescuento"
                    value={formValues.valorDescuento}
                    onChange={onInputChange}
                    required
                    min="0.01"
                    step="0.01"
                    placeholder={
                      formValues.tipoDescuento === 'PORCENTAJE' ? 'Ej. 10' : 'Ej. 25.00'
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cobalt"
                  />
                  <p className="text-xs text-slate-500">
                    {formValues.tipoDescuento === 'PORCENTAJE'
                      ? 'Ingresa un porcentaje entre 0.01 y 100.'
                      : 'Ingresa el monto fijo que se descontara del cobro.'}
                  </p>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Aplica sobre</span>
                  <select
                    name="aplicaDescuentoA"
                    value={formValues.aplicaDescuentoA}
                    onChange={onInputChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cobalt"
                  >
                    {discountApplyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="rounded-[24px] border border-fuchsia-200 bg-[linear-gradient(180deg,#fff8ff_0%,#fffdfd_100%)] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-600">
                  Vista operativa
                </p>
                <p className="mt-3 text-sm font-semibold text-slate-900">
                  {formatDiscountTypeLabel(formValues.tipoDescuento)}{' '}
                  {formValues.tipoDescuento === 'PORCENTAJE'
                    ? `${formValues.valorDescuento || '0'}%`
                    : formatCurrency(formValues.valorDescuento || 0)}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Aplicara sobre {formatDiscountApplyLabel(formValues.aplicaDescuentoA).toLowerCase()}.
                </p>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Este tipo de concepto no usa periodo, cantidad, mora ni adjuntos. El sistema lo
                  guarda como regla comercial para tesoreria.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-[24px] border border-slate-200 bg-[#f8fbff] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Parametros operativos
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  ['usaPeriodo', 'Usa periodo'],
                  ['permiteCantidad', 'Permite cantidad'],
                  ['admiteDescuento', 'Admite descuento'],
                  ['admiteMora', 'Admite mora'],
                  ['afectaHabilitacion', 'Afecta habilitacion'],
                  ['exoneradoIgv', 'Exonerado IGV'],
                  ['requiereAdjunto', 'Requiere adjunto'],
                ].map(([name, label]) => (
                  <label key={name} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      name={name}
                      checked={formValues[name]}
                      onChange={onCheckboxChange}
                      className="h-4 w-4 rounded border-slate-300 accent-[#1739a6]"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? 'Guardando...'
                : mode === 'create'
                  ? 'Registrar concepto'
                  : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConceptModal({ concept, isSubmitting, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[32px] border border-white/80 bg-white p-6 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.8)] sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-rose-600">
          Eliminar concepto
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
          {concept?.nombre}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Si el concepto ya fue usado en cobros anteriores, el sistema lo dejara como
          inactivo para no romper la trazabilidad.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ConceptosPage() {
  const [activeFilter, setActiveFilter] = useState('Todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [catalog, setCatalog] = useState([])
  const [summary, setSummary] = useState({
    activos: 0,
    categorias: 0,
    afectanHabilitacion: 0,
    descuentosConfigurados: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState('create')
  const [formValues, setFormValues] = useState(initialFormValues)
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingConceptId, setEditingConceptId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [activeExportFormat, setActiveExportFormat] = useState('')
  const pageSize = 4

  async function loadCatalog() {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const response = await getTesoreriaConceptosCobroCatalogo()
      setCatalog(response.conceptos ?? [])
      setSummary({
        activos: response.activos ?? 0,
        categorias: response.categorias ?? 0,
        afectanHabilitacion: response.afectanHabilitacion ?? 0,
        descuentosConfigurados: response.descuentosConfigurados ?? 0,
      })
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCatalog()
  }, [])

  const filteredConcepts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return catalog.filter((concept) => {
      const matchesFilter =
        activeFilter === 'Todos' ? true : concept.categoria === activeFilter

      const matchesSearch =
        normalizedSearch.length === 0
          ? true
          : [
              concept.codigo,
              concept.nombre,
              concept.descripcion ?? '',
              formatConceptTypeLabel(concept.tipoConcepto),
              formatDiscountApplyLabel(concept.aplicaDescuentoA ?? ''),
            ]
              .some((value) => value.toLowerCase().includes(normalizedSearch))

      return matchesFilter && matchesSearch
    })
  }, [activeFilter, catalog, searchTerm])

  const totalPages = Math.max(1, Math.ceil(filteredConcepts.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedConcepts = filteredConcepts.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  )

  function openCreateModal() {
    setFeedbackMessage('')
    setFormMode('create')
    setEditingConceptId(null)
    setFormValues(initialFormValues)
    setFormError('')
    setIsFormOpen(true)
  }

  function openEditModal(concept) {
    setFeedbackMessage('')
    setFormMode('edit')
    setEditingConceptId(concept.id)
    setFormValues(normalizeConceptForForm(concept))
    setFormError('')
    setIsFormOpen(true)
  }

  function closeFormModal() {
    setIsFormOpen(false)
    setFormError('')
    setIsSubmitting(false)
    setEditingConceptId(null)
  }

  function handleInputChange(event) {
    const { name, value } = event.target
    setFormValues((current) => ({
      ...current,
      [name]: name === 'codigo' ? value.toUpperCase() : value,
    }))
  }

  function handleCheckboxChange(event) {
    const { name, checked } = event.target
    setFormValues((current) => ({
      ...current,
      [name]: checked,
    }))
  }

  function handleConceptTypeChange(nextType) {
    setFormValues((current) => {
      if (nextType === 'DESCUENTO') {
        return {
          ...current,
          tipoConcepto: 'DESCUENTO',
          categoria: 'DESCUENTOS',
          montoBase: '0',
          tipoDescuento: current.tipoDescuento || 'MONTO_FIJO',
          valorDescuento: current.valorDescuento,
          aplicaDescuentoA: current.aplicaDescuentoA || 'APORTACIONES',
          usaPeriodo: false,
          permiteCantidad: false,
          admiteDescuento: false,
          admiteMora: false,
          afectaHabilitacion: false,
          exoneradoIgv: false,
          requiereAdjunto: false,
        }
      }

      return {
        ...current,
        tipoConcepto: 'NORMAL',
        categoria:
          current.categoria && current.categoria !== 'DESCUENTOS'
            ? current.categoria
            : 'SERVICIOS',
        montoBase: current.montoBase === '0' ? '' : current.montoBase,
      }
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    setFormError('')
    setErrorMessage('')

    const isDiscount = formValues.tipoConcepto === 'DESCUENTO'
    const payload = {
      ...formValues,
      categoria: isDiscount ? null : formValues.categoria,
      descripcion: formValues.descripcion.trim(),
      montoBase: isDiscount ? null : Number(formValues.montoBase),
      tipoDescuento: isDiscount ? formValues.tipoDescuento : null,
      valorDescuento: isDiscount ? Number(formValues.valorDescuento) : null,
      aplicaDescuentoA: isDiscount ? formValues.aplicaDescuentoA : null,
    }

    try {
      if (formMode === 'create') {
        await createTesoreriaConceptoCobro(payload)
      } else {
        await updateTesoreriaConceptoCobro(editingConceptId, payload)
      }

      notifyConceptCatalogUpdated()
      setFeedbackMessage(
        formMode === 'create'
          ? 'El concepto se registro correctamente.'
          : 'El concepto se actualizo correctamente.',
      )
      setSearchTerm('')
      setCurrentPage(1)
      closeFormModal()
      await loadCatalog()
    } catch (error) {
      setFormError(error.message)
      setIsSubmitting(false)
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) {
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    try {
      const response = await deleteTesoreriaConceptoCobro(deleteTarget.id)
      notifyConceptCatalogUpdated()
      setFeedbackMessage(
        response?.mensaje ??
          'La operacion sobre el concepto se completo correctamente.',
      )
      setDeleteTarget(null)
      setIsSubmitting(false)
      setSearchTerm('')
      setActiveFilter('Todos')
      setCurrentPage(1)
      await loadCatalog()
    } catch (error) {
      setErrorMessage(error.message)
      setIsSubmitting(false)
    }
  }

  async function exportCatalog(format) {
    setIsExporting(true)
    setActiveExportFormat(format)
    setErrorMessage('')

    try {
      await downloadTesoreriaConceptosCatalogoReport({ format })
      setIsExportModalOpen(false)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsExporting(false)
      setActiveExportFormat('')
    }
  }

  const summaryCards = buildSummaryCards(summary)

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Panel</span>
            <ChevronRight size={14} />
            <span className="font-semibold text-cobalt">Conceptos de Cobro</span>
          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Conceptos de Cobro
          </h1>
          <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-600 sm:text-base">
            Administre el catalogo de conceptos que utiliza tesoreria para generar
            operaciones, calcular reglas y emitir comprobantes.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          >
            <Download size={16} strokeWidth={2.1} />
            Exportar catalogo
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)] transition hover:-translate-y-0.5"
          >
            <Plus size={16} strokeWidth={2.2} />
            Nuevo concepto
          </button>
        </div>
      </section>

      {feedbackMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {feedbackMessage}
        </div>
      ) : null}

      {isExportModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[32px] border border-white/80 bg-white shadow-[0_24px_70px_-36px_rgba(15,23,42,0.8)]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-cobalt">
                  Reporte institucional
                </p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  Exportar catalogo de conceptos
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Descarga el catalogo con logo y estructura formal para revision administrativa.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isExporting) {
                    setIsExportModalOpen(false)
                  }
                }}
                aria-label="Cerrar exportacion"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              >
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>

            <div className="grid gap-3 px-6 py-6 sm:grid-cols-2 sm:px-8">
              <button
                type="button"
                onClick={() => exportCatalog('xlsx')}
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
                onClick={() => exportCatalog('pdf')}
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
              {card.value}
            </p>
            <p className={`mt-2 text-sm font-medium ${card.noteTone}`}>{card.note}</p>
          </article>
        ))}
      </section>

      <section>
        <article className="rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <label className="group flex w-full max-w-xl items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-cobalt focus-within:bg-white">
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
                  placeholder="Buscar por codigo, nombre o descripcion"
                  className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>

              <label className="flex w-full max-w-xs flex-col gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Filtro por categoria
                </span>
                <select
                  value={activeFilter}
                  onChange={(event) => {
                    setActiveFilter(event.target.value)
                    setCurrentPage(1)
                  }}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-cobalt"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {errorMessage ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="mt-5 overflow-hidden rounded-[26px] border border-slate-200">
            <div className="hidden grid-cols-[0.95fr_1.8fr_1.1fr_0.9fr_0.9fr_1fr] bg-[#e8f0ff] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 lg:grid">
              <span>Codigo</span>
              <span>Concepto</span>
              <span>Categoria</span>
              <span>Monto</span>
              <span>Estado</span>
              <span className="text-right">Acciones</span>
            </div>

            <div className="divide-y divide-slate-200 bg-white">
              {isLoading ? (
                <div className="px-6 py-10 text-center text-sm font-medium text-slate-500">
                  Cargando conceptos...
                </div>
              ) : paginatedConcepts.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm font-medium text-slate-500">
                  No se encontraron conceptos para ese filtro.
                </div>
              ) : (
                paginatedConcepts.map((concept) => (
                  <div
                    key={concept.id}
                    className="grid w-full gap-4 bg-white px-4 py-5 text-left transition hover:bg-slate-50 lg:grid-cols-[0.95fr_1.8fr_1.1fr_0.9fr_0.9fr_1fr] lg:items-center lg:px-6"
                  >
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                        Codigo
                      </p>
                      <p className="font-semibold text-cobalt">{concept.codigo}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                        Concepto
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">{concept.nombre}</p>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${getConceptTypeTone(
                            concept.tipoConcepto,
                          )}`}
                        >
                          {formatConceptTypeLabel(concept.tipoConcepto)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {concept.descripcion}
                        {concept.tipoConcepto === 'DESCUENTO'
                          ? ` · ${formatDiscountTypeLabel(concept.tipoDescuento)} sobre ${formatDiscountApplyLabel(
                              concept.aplicaDescuentoA,
                            ).toLowerCase()}`
                          : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                        Categoria
                      </p>
                      <p className="text-sm font-medium text-slate-700">
                        {formatCategoryLabel(concept.categoria)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                        Monto
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {formatConceptAmount(concept)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                        Estado
                      </p>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${getStatusTone(
                          concept.estado,
                        )}`}
                      >
                        {formatStatusLabel(concept.estado)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 lg:justify-end">
                      <button
                        type="button"
                        onClick={() => openEditModal(concept)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-cobalt hover:text-cobalt"
                        aria-label={`Editar ${concept.nombre}`}
                      >
                        <PencilLine size={17} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(concept)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-rose-300 hover:text-rose-600"
                        aria-label={`Eliminar ${concept.nombre}`}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-500">
              Mostrando {(safeCurrentPage - 1) * pageSize + (paginatedConcepts.length ? 1 : 0)} a{' '}
              {(safeCurrentPage - 1) * pageSize + paginatedConcepts.length} de {filteredConcepts.length}{' '}
              conceptos
            </p>

            <div className="flex items-center gap-3 self-end">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safeCurrentPage === 1}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                {safeCurrentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={safeCurrentPage === totalPages}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </article>
      </section>

      {isFormOpen ? (
        <ConceptFormModal
          formValues={formValues}
          formError={formError}
          isSubmitting={isSubmitting}
          mode={formMode}
          onCheckboxChange={handleCheckboxChange}
          onConceptTypeChange={handleConceptTypeChange}
          onClose={closeFormModal}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConceptModal
          concept={deleteTarget}
          isSubmitting={isSubmitting}
          onClose={() => {
            setDeleteTarget(null)
            setIsSubmitting(false)
          }}
          onConfirm={handleDeleteConfirm}
        />
      ) : null}
    </div>
  )
}

export default ConceptosPage
