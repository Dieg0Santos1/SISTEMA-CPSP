import { useEffect, useMemo, useState } from 'react'
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  PencilLine,
  Plus,
  Search,
  Trash2,
  Upload,
  UserCheck,
  UserMinus,
  Users,
  X,
} from 'lucide-react'
import { colegiadosFilters } from '../data/colegiados/colegiadosData'

const statusStyles = {
  HABILITADO: 'bg-emerald-100 text-emerald-700',
  NO_HABILITADO: 'bg-red-100 text-red-600',
}

const emptyForm = {
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  dni: '',
  sexo: '',
  fechaNacimiento: '',
  fechaIniciacion: '',
  ruc: '',
  celular: '',
  email: '',
  direccion: '',
  fotoUrl: '',
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:8080/api/v1'

const formatCount = (value) => value.toLocaleString('en-US')

const formatDate = (value) => {
  if (!value) {
    return 'No registrado'
  }

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

const calculateAge = (value) => {
  if (!value) {
    return 'No registrada'
  }

  const birthDate = new Date(`${value}T00:00:00`)
  const today = new Date()

  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDifference = today.getMonth() - birthDate.getMonth()

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1
  }

  return `${age} años`
}

const formatBirthdayMonthDay = (value) => {
  if (!value) {
    return 'No registrado'
  }

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'long',
  }).format(new Date(`${value}T00:00:00`))
}

const formatStatusLabel = (status) =>
  status === 'HABILITADO' ? 'Habilitado' : 'No Habilitado'

const normalizeDniInput = (value) => value.replace(/\D/g, '').slice(0, 8)

const normalizeCelularInput = (value) => {
  const digits = value.replace(/\D/g, '')

  if (!digits) {
    return ''
  }

  const nationalNumber = digits.startsWith('51') ? digits.slice(2, 11) : digits.slice(0, 9)
  return `+51${nationalNumber}`
}

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'CP'

const getAvatarTone = (name = '') => {
  const palette = [
    'bg-[#1739a6]',
    'bg-[#2b49ba]',
    'bg-[#914414]',
    'bg-[#3758cb]',
    'bg-[#0f766e]',
  ]
  const seed = name.split('').reduce((total, char) => total + char.charCodeAt(0), 0)
  return palette[seed % palette.length]
}

const buildVigenciaLabel = (colegiado) => {
  if (colegiado.estado === 'HABILITADO' && colegiado.habilitadoHasta) {
    return `Habilitado hasta ${formatDate(colegiado.habilitadoHasta)}`
  }

  if (colegiado.ultimaCuotaPeriodo) {
    return `Ultima cuota registrada ${formatDate(colegiado.ultimaCuotaPeriodo)}`
  }

  return 'Sin cuota vigente registrada'
}

const mapColegiadoToRow = (colegiado) => ({
  id: colegiado.id,
  code: colegiado.codigoColegiatura,
  dni: colegiado.dni,
  name: colegiado.nombreCompleto,
  nombres: colegiado.nombre,
  apellidoPaterno: colegiado.apellidoPaterno,
  apellidoMaterno: colegiado.apellidoMaterno,
  initials: getInitials(colegiado.nombreCompleto),
  avatarTone: getAvatarTone(colegiado.nombreCompleto),
  status: formatStatusLabel(colegiado.estado),
  statusCode: colegiado.estado,
  statusTone: statusStyles[colegiado.estado] ?? 'bg-slate-100 text-slate-600',
  photo: colegiado.fotoUrl,
  vigencia: buildVigenciaLabel(colegiado),
  sexo: colegiado.sexo ?? 'No registrado',
  fechaNacimiento: colegiado.fechaNacimiento,
  fechaIniciacion: colegiado.fechaIniciacion,
  email: colegiado.email ?? 'No registrado',
  celular: colegiado.celular ?? 'No registrado',
  ruc: colegiado.ruc ?? 'No registrado',
  direccion: colegiado.direccion ?? 'No registrada',
  ultimaCuotaPeriodo: colegiado.ultimaCuotaPeriodo,
  habilitadoHasta: colegiado.habilitadoHasta,
  especialidades: Array.isArray(colegiado.especialidades) ? colegiado.especialidades : [],
})

const emptyIfPlaceholder = (value) =>
  value === 'No registrado' || value === 'No registrada' ? '' : value ?? ''

const buildFormValuesFromColegiado = (colegiado) => ({
  nombres: colegiado.nombres ?? '',
  apellidoPaterno: colegiado.apellidoPaterno ?? '',
  apellidoMaterno: colegiado.apellidoMaterno ?? '',
  dni: colegiado.dni ?? '',
  sexo: emptyIfPlaceholder(colegiado.sexo),
  fechaNacimiento: colegiado.fechaNacimiento ?? '',
  fechaIniciacion: colegiado.fechaIniciacion ?? '',
  ruc: emptyIfPlaceholder(colegiado.ruc),
  celular: emptyIfPlaceholder(colegiado.celular),
  email: emptyIfPlaceholder(colegiado.email),
  direccion: emptyIfPlaceholder(colegiado.direccion),
  fotoUrl: colegiado.photo ?? '',
})

const buildColegiadoPayload = (formValues) => ({
  nombre: formValues.nombres.trim(),
  apellidoPaterno: formValues.apellidoPaterno.trim(),
  apellidoMaterno: formValues.apellidoMaterno.trim(),
  dni: formValues.dni.trim(),
  sexo: formValues.sexo,
  fechaNacimiento: formValues.fechaNacimiento,
  fechaIniciacion: formValues.fechaIniciacion,
  ruc: formValues.ruc.trim(),
  celular: formValues.celular.trim(),
  email: formValues.email.trim(),
  direccion: formValues.direccion.trim(),
  fotoUrl: formValues.fotoUrl,
})

function ColegiadosPage() {
  const [rows, setRows] = useState([])
  const [activeFilter, setActiveFilter] = useState(colegiadosFilters[0])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [formMode, setFormMode] = useState('create')
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEspecialidadesModalOpen, setIsEspecialidadesModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedColegiado, setSelectedColegiado] = useState(null)
  const [shouldReturnToDetail, setShouldReturnToDetail] = useState(false)
  const [formValues, setFormValues] = useState(emptyForm)
  const [photoPreview, setPhotoPreview] = useState('')
  const [especialidadesForm, setEspecialidadesForm] = useState([''])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingEspecialidades, setIsSavingEspecialidades] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const itemsPerPage = 3
  const isEditMode = formMode === 'edit'

  async function loadColegiados() {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/colegiados`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('No se pudo cargar el padron desde el backend.')
      }

      const data = await response.json()
      const mappedRows = data.map(mapColegiadoToRow)
      setRows(mappedRows)

      if (selectedColegiado) {
        const refreshedSelected = mappedRows.find((colegiado) => colegiado.id === selectedColegiado.id)
        setSelectedColegiado(refreshedSelected ?? null)
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo conectar con el backend de colegiados.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return rows.filter((colegiado) => {
      const matchesFilter =
        activeFilter === 'Todos' ? true : colegiado.status === activeFilter

      const matchesSearch =
        normalizedSearch.length === 0
          ? true
          : [
              colegiado.code,
              colegiado.dni,
              colegiado.name,
              colegiado.vigencia,
              colegiado.email,
              ...colegiado.especialidades,
            ].some((value) => value.toLowerCase().includes(normalizedSearch))

      return matchesFilter && matchesSearch
    })
  }, [activeFilter, rows, searchTerm])

  const summaryCards = useMemo(() => {
    const totalRegistrados = rows.length
    const habilitados = rows.filter((colegiado) => colegiado.status === 'Habilitado').length
    const noHabilitados = rows.filter((colegiado) => colegiado.status !== 'Habilitado').length
    const habilitadosPercent =
      totalRegistrados === 0 ? 0 : (habilitados / totalRegistrados) * 100

    return [
      {
        title: 'Total registrados',
        value: formatCount(totalRegistrados),
        note: totalRegistrados === 0 ? 'Sin registros' : 'Padron activo',
        helper: 'Registro total',
        icon: Users,
        accent: 'border-[#d9e5ff]',
        badgeTone: 'bg-[#dce8ff] text-cobalt',
      },
      {
        title: 'Habilitados',
        value: formatCount(habilitados),
        note: `${habilitadosPercent.toFixed(1)}%`,
        helper: 'Al dia con sus pagos',
        icon: UserCheck,
        accent: 'border-[#d7f7e7]',
        badgeTone: 'bg-[#d8fae8] text-emerald-700',
      },
      {
        title: 'Usuarios no habilitados',
        value: formatCount(noHabilitados),
        note: formatCount(noHabilitados),
        helper: 'Requieren regularizar sus pagos',
        icon: UserMinus,
        accent: 'border-[#ffe9b5]',
        badgeTone: 'bg-[#fff1c9] text-amber-700',
      },
    ]
  }, [rows])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage))
  const safePage = Math.min(currentPage, totalPages)
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)

  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage
    return filteredRows.slice(start, start + itemsPerPage)
  }, [filteredRows, safePage])

  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
    setCurrentPage(1)
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setActiveFilter('Todos')
    setCurrentPage(1)
  }

  const openCreateModal = () => {
    setFormMode('create')
    setShouldReturnToDetail(false)
    setErrorMessage('')
    setFormValues(emptyForm)
    setPhotoPreview('')
    setIsCreateModalOpen(true)
  }

  const closeCreateModal = () => {
    const shouldReopenDetail =
      formMode === 'edit' && shouldReturnToDetail && Boolean(selectedColegiado)

    setIsCreateModalOpen(false)
    setFormMode('create')
    setShouldReturnToDetail(false)
    setFormValues(emptyForm)
    setPhotoPreview('')

    if (shouldReopenDetail) {
      setIsDetailModalOpen(true)
    }
  }

  const openDetailModal = (colegiado) => {
    setSelectedColegiado(colegiado)
    setIsDetailModalOpen(true)
  }

  const closeDetailModal = () => {
    setIsDetailModalOpen(false)
  }

  const openEditModal = (colegiado, options = {}) => {
    setSelectedColegiado(colegiado)
    setFormMode('edit')
    setShouldReturnToDetail(Boolean(options.returnToDetail))
    setErrorMessage('')
    setFormValues(buildFormValuesFromColegiado(colegiado))
    setPhotoPreview(colegiado.photo ?? '')
    setIsDetailModalOpen(false)
    setIsCreateModalOpen(true)
  }

  const openEspecialidadesModal = (colegiado) => {
    setSelectedColegiado(colegiado)
    setEspecialidadesForm(
      colegiado.especialidades.length > 0 ? [...colegiado.especialidades] : [''],
    )
    setIsEspecialidadesModalOpen(true)
  }

  const closeEspecialidadesModal = () => {
    setIsEspecialidadesModalOpen(false)
    setEspecialidadesForm([''])
  }

  const openDeleteModal = (colegiado) => {
    setSelectedColegiado(colegiado)
    setErrorMessage('')
    setIsDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false)
  }

  const handleInputChange = (event) => {
    const { name } = event.target
    let { value } = event.target

    if (name === 'dni') {
      value = normalizeDniInput(value)
    }

    if (name === 'celular') {
      value = normalizeCelularInput(value)
    }

    setFormValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      setFormValues((current) => ({
        ...current,
        fotoUrl: '',
      }))
      setPhotoPreview('')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''

      setFormValues((current) => ({
        ...current,
        fotoUrl: result,
      }))
      setPhotoPreview(result)
    }
    reader.readAsDataURL(file)
  }

  const handleEspecialidadChange = (index, value) => {
    setEspecialidadesForm((current) =>
      current.map((especialidad, currentIndex) =>
        currentIndex === index ? value : especialidad,
      ),
    )
  }

  const addEspecialidadField = () => {
    setEspecialidadesForm((current) => (current.length >= 3 ? current : [...current, '']))
  }

  const removeEspecialidadField = (index) => {
    setEspecialidadesForm((current) => {
      const nextValues = current.filter((_, currentIndex) => currentIndex !== index)
      return nextValues.length > 0 ? nextValues : ['']
    })
  }

  const handleSubmitColegiado = async (event) => {
    event.preventDefault()

    const isEditMode = formMode === 'edit' && selectedColegiado

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const response = await fetch(
        isEditMode
          ? `${API_BASE_URL}/colegiados/${selectedColegiado.id}`
          : `${API_BASE_URL}/colegiados`,
        {
          method: isEditMode ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(buildColegiadoPayload(formValues)),
        },
      )

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        const details = Array.isArray(payload?.details) ? payload.details.join(' ') : ''
        throw new Error(
          details ||
            payload?.message ||
            (isEditMode
              ? 'No se pudieron guardar los cambios del colegiado.'
              : 'No se pudo registrar el colegiado en el backend.'),
        )
      }

      const savedColegiado = mapColegiadoToRow(await response.json())

      if (isEditMode) {
        setRows((current) =>
          current.map((colegiado) =>
            colegiado.id === savedColegiado.id ? savedColegiado : colegiado,
          ),
        )
        setSelectedColegiado(savedColegiado)

        if (shouldReturnToDetail) {
          setIsDetailModalOpen(true)
        }
      } else {
        await loadColegiados()
        setActiveFilter('Todos')
        setSearchTerm('')
        setCurrentPage(1)
      }

      closeCreateModal()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : isEditMode
            ? 'No se pudieron guardar los cambios del colegiado.'
            : 'No se pudo registrar el colegiado en el backend.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveEspecialidades = async (event) => {
    event.preventDefault()

    if (!selectedColegiado) {
      return
    }

    setIsSavingEspecialidades(true)
    setErrorMessage('')

    try {
      const especialidades = especialidadesForm
        .map((especialidad) => especialidad.trim())
        .filter(Boolean)
        .slice(0, 3)

      const response = await fetch(
        `${API_BASE_URL}/colegiados/${selectedColegiado.id}/especialidades`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ especialidades }),
        },
      )

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        const details = Array.isArray(payload?.details) ? payload.details.join(' ') : ''
        throw new Error(
          details || payload?.message || 'No se pudieron actualizar las especialidades.',
        )
      }

      const updatedColegiado = mapColegiadoToRow(await response.json())

      setRows((current) =>
        current.map((colegiado) =>
          colegiado.id === updatedColegiado.id ? updatedColegiado : colegiado,
        ),
      )
      setSelectedColegiado(updatedColegiado)
      closeEspecialidadesModal()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudieron actualizar las especialidades.',
      )
    } finally {
      setIsSavingEspecialidades(false)
    }
  }

  const handleDeleteColegiado = async () => {
    if (!selectedColegiado) {
      return
    }

    setIsDeleting(true)
    setErrorMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/colegiados/${selectedColegiado.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        const details = Array.isArray(payload?.details) ? payload.details.join(' ') : ''
        throw new Error(
          details || payload?.message || 'No se pudo eliminar el colegiado seleccionado.',
        )
      }

      setRows((current) =>
        current.filter((colegiado) => colegiado.id !== selectedColegiado.id),
      )
      setIsDeleteModalOpen(false)
      setIsDetailModalOpen(false)
      setSelectedColegiado(null)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo eliminar el colegiado seleccionado.',
      )
    } finally {
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    loadColegiados()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (
      !isCreateModalOpen &&
      !isDetailModalOpen &&
      !isEspecialidadesModalOpen &&
      !isDeleteModalOpen
    ) {
      return undefined
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeCreateModal()
        closeDetailModal()
        closeEspecialidadesModal()
        closeDeleteModal()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isCreateModalOpen, isDetailModalOpen, isEspecialidadesModalOpen, isDeleteModalOpen])

  const startResult = filteredRows.length === 0 ? 0 : (safePage - 1) * itemsPerPage + 1
  const endResult = Math.min(safePage * itemsPerPage, filteredRows.length)

  return (
    <div className="space-y-6">
        <section className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Panel</span>
              <ChevronRight size={14} />
              <span className="font-semibold text-cobalt">Colegiados</span>
            </div>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Gestion de Colegiados
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              Administre el padron oficial de psicologos colegiados en la region Lima.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#d9e4ff] px-5 py-3 text-sm font-semibold text-cobalt transition hover:bg-[#cfddff]"
            >
              <Download size={16} strokeWidth={2.1} />
              Importar padron
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)] transition hover:-translate-y-0.5"
            >
              <Plus size={16} strokeWidth={2.2} />
              Nuevo Colegiado
            </button>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {summaryCards.map((card) => (
            <article
              key={card.title}
              className={`rounded-[26px] border bg-white p-5 shadow-[0_14px_40px_-30px_rgba(15,23,42,0.5)] ${card.accent}`}
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
                    {card.title}
                  </p>
                </div>

                <div className={`rounded-2xl p-3 ${card.badgeTone}`}>
                  <card.icon size={20} strokeWidth={2.2} />
                </div>
              </div>

              <div className="flex items-end justify-between gap-4">
                <p className="text-3xl font-bold tracking-tight text-slate-950 sm:text-[2.15rem]">
                  {card.value}
                </p>

                <div className="text-right">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${card.badgeTone}`}
                  >
                    {card.note}
                  </span>
                  <p className="mt-2 max-w-[10rem] text-xs leading-5 text-slate-500">
                    {card.helper}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-[30px] border border-white/80 bg-white p-4 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
          {errorMessage ? (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex flex-col gap-4 border-b border-slate-200 pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {colegiadosFilters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => handleFilterChange(filter)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      activeFilter === filter
                        ? 'bg-cobalt-soft text-cobalt shadow-[inset_0_-2px_0_0_#1739a6]'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-2 self-start rounded-2xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <Filter size={16} strokeWidth={2.2} />
                Filtros Avanzados
              </button>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label className="group flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-cobalt focus-within:bg-white lg:max-w-md">
                <Search
                  size={18}
                  className="text-slate-400 transition group-focus-within:text-cobalt"
                />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Buscar por DNI, nombre, codigo, vigencia, email o especialidad"
                  className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>

              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                  {filteredRows.length} resultado(s)
                </span>
                <span>Filtro activo: {activeFilter}</span>
              </div>
            </div>

          </div>

          <div className="mt-5 overflow-hidden rounded-[26px] border border-slate-200">
            <div className="hidden grid-cols-[0.95fr_0.9fr_2.2fr_1.6fr_1.1fr_148px] bg-[#e8f0ff] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 lg:grid">
              <span>Codigo</span>
              <span>DNI</span>
              <span>Nombre completo</span>
              <span>Vigencia</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>

            <div className="divide-y divide-slate-200 bg-white">
              {isLoading ? (
                <div className="px-6 py-14 text-center text-sm text-slate-500">
                  Cargando colegiados desde el backend...
                </div>
              ) : paginatedRows.length > 0 ? (
                paginatedRows.map((colegiado) => (
                  <div
                    key={colegiado.id}
                    className="grid gap-4 px-4 py-5 transition hover:bg-[#f8fbff] lg:grid-cols-[0.95fr_0.9fr_2.2fr_1.6fr_1.1fr_148px] lg:items-center lg:px-6"
                  >
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                        Codigo
                      </p>
                      <p className="font-semibold leading-6 text-cobalt">
                        {colegiado.code.slice(0, 4)}
                        <br />
                        {colegiado.code.slice(4)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                        DNI
                      </p>
                      <p className="text-sm font-medium text-slate-700">{colegiado.dni}</p>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                        Nombre completo
                      </p>
                      <div className="space-y-1">
                        <p className="max-w-[17rem] font-semibold leading-6 text-slate-900">
                          {colegiado.name}
                        </p>
                        {colegiado.especialidades.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {colegiado.especialidades.slice(0, 2).map((especialidad) => (
                              <span
                                key={especialidad}
                                className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[11px] font-semibold text-cobalt"
                              >
                                {especialidad}
                              </span>
                            ))}
                            {colegiado.especialidades.length > 2 ? (
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                                +{colegiado.especialidades.length - 2}
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                        Vigencia
                      </p>
                      <p className="max-w-[16rem] text-sm leading-6 text-slate-600">
                        {colegiado.vigencia}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                        Estado
                      </p>
                      <span
                        className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${colegiado.statusTone}`}
                      >
                        {colegiado.status}
                      </span>
                    </div>

                    <div className="flex gap-2 lg:justify-end">
                      <button
                        type="button"
                        aria-label={`Ver detalle de ${colegiado.name}`}
                        title="Ver detalle"
                        onClick={() => openDetailModal(colegiado)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                      >
                        <Eye size={18} strokeWidth={2.1} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Editar datos de ${colegiado.name}`}
                        title="Editar colegiado"
                        onClick={() => openEditModal(colegiado)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                      >
                        <PencilLine size={18} strokeWidth={2.1} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Eliminar a ${colegiado.name}`}
                        title="Eliminar colegiado"
                        onClick={() => openDeleteModal(colegiado)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-red-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={18} strokeWidth={2.1} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-14 text-center">
                  <div className="mx-auto max-w-md space-y-3">
                    <div className="mx-auto inline-flex rounded-2xl bg-slate-100 p-4 text-slate-500">
                      <Search size={22} strokeWidth={2.1} />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      No encontramos colegiados con ese criterio
                    </h2>
                    <p className="text-sm leading-6 text-slate-500">
                      Prueba cambiando el filtro o ajustando la busqueda para ver mas
                      resultados.
                    </p>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex rounded-2xl bg-cobalt-soft px-4 py-2 text-sm font-semibold text-cobalt"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Mostrando {startResult} a {endResult} de {filteredRows.length} colegiados
              filtrados
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={16} strokeWidth={2.2} />
              </button>

              {pageNumbers.map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition ${
                    page === safePage
                      ? 'border-cobalt bg-cobalt text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={safePage === totalPages}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight size={16} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </section>

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-5xl rounded-[32px] border border-white/80 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] shadow-[0_24px_70px_-36px_rgba(15,23,42,0.8)]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-cobalt">
                  {isEditMode ? 'Actualizacion de datos' : 'Registro Manual'}
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  {isEditMode ? 'Editar colegiado' : 'Nuevo colegiado'}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  {isEditMode
                    ? 'Corrige o actualiza la informacion del colegiado sin alterar su codigo de colegiatura.'
                    : 'Registra los datos base del colegiado y deja lista su informacion para validacion posterior.'}
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                aria-label="Cerrar modal"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              >
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>

            <form onSubmit={handleSubmitColegiado} className="space-y-6 px-6 py-6 sm:px-8 sm:py-7">
              {errorMessage ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {errorMessage}
                </div>
              ) : null}

              <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
                <div className="rounded-[28px] border border-slate-200 bg-[#f4f7ff] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    Foto del colegiado
                  </p>

                  <div className="mt-4 flex flex-col items-center gap-4">
                    <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-[28px] border border-dashed border-cobalt/30 bg-white">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Vista previa del colegiado"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <Camera size={30} strokeWidth={1.8} />
                          <span className="text-sm font-medium">Sin foto cargada</span>
                        </div>
                      )}
                    </div>

                    <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-cobalt px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#12308d]">
                      <Upload size={16} strokeWidth={2.1} />
                      Subir foto
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>

                    <p className="text-center text-xs leading-5 text-slate-500">
                      Formatos sugeridos: JPG o PNG. La imagen se usa como vista previa
                      del perfil.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  {isEditMode && selectedColegiado ? (
                    <label className="space-y-2 lg:col-span-3">
                      <span className="text-sm font-semibold text-slate-700">
                        Codigo de colegiatura
                      </span>
                      <input
                        type="text"
                        value={selectedColegiado.code}
                        readOnly
                        disabled
                        className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-500 outline-none"
                      />
                      <span className="block text-xs text-slate-500">
                        Este codigo es correlativo y se genera automaticamente.
                      </span>
                    </label>
                  ) : null}

                  <label className="space-y-2 lg:col-span-3">
                    <span className="text-sm font-semibold text-slate-700">Nombres</span>
                    <input
                      type="text"
                      name="nombres"
                      value={formValues.nombres}
                      onChange={handleInputChange}
                      required
                      placeholder="Ingrese los nombres"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cobalt"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">DNI</span>
                    <input
                      type="text"
                      name="dni"
                      value={formValues.dni}
                      onChange={handleInputChange}
                      required
                      maxLength={8}
                      placeholder="Ingrese el DNI"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cobalt"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">
                      Apellido paterno
                    </span>
                    <input
                      type="text"
                      name="apellidoPaterno"
                      value={formValues.apellidoPaterno}
                      onChange={handleInputChange}
                      required
                      placeholder="Apellido paterno"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cobalt"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">
                      Apellido materno
                    </span>
                    <input
                      type="text"
                      name="apellidoMaterno"
                      value={formValues.apellidoMaterno}
                      onChange={handleInputChange}
                      required
                      placeholder="Apellido materno"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cobalt"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Sexo</span>
                    <select
                      name="sexo"
                      value={formValues.sexo}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cobalt"
                    >
                      <option value="">Seleccione una opcion</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">
                      Fecha de nacimiento
                    </span>
                    <input
                      type="date"
                      name="fechaNacimiento"
                      value={formValues.fechaNacimiento}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cobalt"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">
                      Fecha de iniciacion
                    </span>
                    <input
                      type="date"
                      name="fechaIniciacion"
                      value={formValues.fechaIniciacion}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cobalt"
                    />
                  </label>

                  <label className="space-y-2 lg:col-span-1">
                    <span className="text-sm font-semibold text-slate-700">
                      RUC (opcional)
                    </span>
                    <input
                      type="text"
                      name="ruc"
                      value={formValues.ruc}
                      onChange={handleInputChange}
                      placeholder="Ingrese su RUC si aplica"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cobalt"
                    />
                  </label>

                  <label className="space-y-2 lg:col-span-2">
                    <span className="text-sm font-semibold text-slate-700">Celular</span>
                    <input
                      type="tel"
                      name="celular"
                      value={formValues.celular}
                      onChange={handleInputChange}
                      required
                      placeholder="+51999999999"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cobalt"
                    />
                  </label>

                  <div className="grid gap-4 lg:col-span-3 lg:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Direccion</span>
                      <input
                        type="text"
                        name="direccion"
                        value={formValues.direccion}
                        onChange={handleInputChange}
                        placeholder="Direccion del colegiado"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cobalt"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-slate-700">Email</span>
                      <input
                        type="email"
                        name="email"
                        value={formValues.email}
                        onChange={handleInputChange}
                        required
                        placeholder="colegiado@correo.com"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cobalt"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting
                    ? isEditMode
                      ? 'Guardando cambios...'
                      : 'Registrando...'
                    : isEditMode
                      ? 'Guardar cambios'
                      : 'Registrar colegiado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isEspecialidadesModalOpen && selectedColegiado ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[32px] border border-white/80 bg-white shadow-[0_24px_70px_-36px_rgba(15,23,42,0.8)]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-cobalt">
                  Especialidades
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  Editar especialidades
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Registra hasta 3 especialidades para {selectedColegiado.name}.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEspecialidadesModal}
                aria-label="Cerrar modal"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              >
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>

            <form onSubmit={handleSaveEspecialidades} className="space-y-6 px-6 py-6 sm:px-8 sm:py-7">
              <div className="space-y-4">
                {especialidadesForm.map((especialidad, index) => (
                  <div key={`especialidad-${index}`} className="flex items-center gap-3">
                    <label className="flex-1 space-y-2">
                      <span className="text-sm font-semibold text-slate-700">
                        Especialidad {index + 1}
                      </span>
                      <input
                        type="text"
                        value={especialidad}
                        onChange={(event) =>
                          handleEspecialidadChange(index, event.target.value)
                        }
                        placeholder="Ingrese especialidad"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cobalt"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => removeEspecialidadField(index)}
                      className="mt-7 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                    >
                      <X size={18} strokeWidth={2.2} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addEspecialidadField}
                  disabled={especialidadesForm.length >= 3}
                  className="inline-flex items-center gap-2 rounded-2xl border border-dashed border-cobalt/30 bg-[#f5f8ff] px-4 py-3 text-sm font-semibold text-cobalt transition hover:border-cobalt disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={16} strokeWidth={2.2} />
                  Agregar otra especialidad
                </button>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEspecialidadesModal}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingEspecialidades}
                  className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSavingEspecialidades ? 'Guardando...' : 'Guardar especialidades'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isDetailModalOpen && selectedColegiado ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-5xl rounded-[32px] border border-white/80 bg-white shadow-[0_24px_70px_-36px_rgba(15,23,42,0.8)]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-cobalt">
                  Detalle del colegiado
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  {selectedColegiado.name}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Consulta los datos completos registrados y las especialidades asignadas.
                </p>
              </div>

              <button
                type="button"
                onClick={closeDetailModal}
                aria-label="Cerrar modal"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              >
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>

            <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-7">
              <div className="grid gap-4 lg:grid-cols-3">
                <article className="rounded-[28px] border border-slate-200 bg-[#f8fbff] p-5">
                  <div className="flex items-center gap-5">
                    {selectedColegiado.photo ? (
                      <img
                        src={selectedColegiado.photo}
                        alt={`Foto de ${selectedColegiado.name}`}
                        className="h-24 w-24 shrink-0 rounded-[28px] object-cover"
                      />
                    ) : (
                      <div
                        className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-[28px] text-2xl font-bold text-white ${selectedColegiado.avatarTone}`}
                      >
                        {selectedColegiado.initials}
                      </div>
                    )}

                    <div className="space-y-2">
                      <span
                        className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${selectedColegiado.statusTone}`}
                      >
                        {selectedColegiado.status}
                      </span>
                      <p className="text-sm text-slate-500">{selectedColegiado.vigencia}</p>
                    </div>
                  </div>
                </article>

                <article className="rounded-[28px] border border-slate-200 bg-[#f8fbff] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    Edad
                  </p>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                    {calculateAge(selectedColegiado.fechaNacimiento)}
                  </p>
                  <p className="mt-2 text-sm font-medium text-cobalt">
                    Cumpleaños: {formatBirthdayMonthDay(selectedColegiado.fechaNacimiento)}
                  </p>
                </article>

                <article className="rounded-[28px] border border-slate-200 bg-[#f8fbff] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    Especialidades
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {selectedColegiado.especialidades.length > 0 ? (
                      selectedColegiado.especialidades.map((especialidad) => (
                        <span
                          key={especialidad}
                          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-cobalt shadow-[0_8px_18px_-14px_rgba(23,57,166,0.8)]"
                        >
                          {especialidad}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        Este colegiado aun no tiene especialidades registradas.
                      </p>
                    )}
                  </div>
                </article>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <article className="rounded-[24px] border border-slate-200 bg-[#f8fbff] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    Codigo de colegiatura
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {selectedColegiado.code}
                  </p>
                </article>

                <article className="rounded-[24px] border border-slate-200 bg-[#f8fbff] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    DNI
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {selectedColegiado.dni}
                  </p>
                </article>

                <article className="rounded-[24px] border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    Sexo
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {selectedColegiado.sexo}
                  </p>
                </article>

                <article className="rounded-[24px] border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    Nombres
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {selectedColegiado.nombres}
                  </p>
                </article>

                <article className="rounded-[24px] border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    Apellidos
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {selectedColegiado.apellidoPaterno} {selectedColegiado.apellidoMaterno}
                  </p>
                </article>

                <article className="rounded-[24px] border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    Fecha de nacimiento
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {formatDate(selectedColegiado.fechaNacimiento)}
                  </p>
                </article>

                <article className="rounded-[24px] border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    Fecha de iniciacion
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {formatDate(selectedColegiado.fechaIniciacion)}
                  </p>
                </article>

                <article className="rounded-[24px] border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    Celular
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {selectedColegiado.celular}
                  </p>
                </article>

                <article className="rounded-[24px] border border-slate-200 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    RUC
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {selectedColegiado.ruc}
                  </p>
                </article>

                <article className="rounded-[24px] border border-slate-200 bg-white p-4 lg:col-span-1">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    Direccion
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {selectedColegiado.direccion}
                  </p>
                </article>

                <article className="rounded-[24px] border border-slate-200 bg-white p-4 lg:col-span-1">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    Email
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {selectedColegiado.email}
                  </p>
                </article>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => openEspecialidadesModal(selectedColegiado)}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Editar especialidades
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(selectedColegiado, { returnToDetail: true })}
                  className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)] transition hover:-translate-y-0.5"
                >
                  Editar datos
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isDeleteModalOpen && selectedColegiado ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[32px] border border-white/80 bg-white shadow-[0_24px_70px_-36px_rgba(15,23,42,0.8)]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-red-500">
                  Eliminar colegiado
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  Confirmar eliminacion
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Vas a eliminar el registro de {selectedColegiado.name}. Esta accion no se puede
                  deshacer.
                </p>
              </div>

              <button
                type="button"
                onClick={closeDeleteModal}
                aria-label="Cerrar modal"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              >
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>

            <div className="space-y-5 px-6 py-6 sm:px-8 sm:py-7">
              {errorMessage ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {errorMessage}
                </div>
              ) : null}

              <div className="rounded-[24px] border border-slate-200 bg-[#f8fbff] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  Registro seleccionado
                </p>
                <p className="mt-3 text-base font-semibold text-slate-950">
                  {selectedColegiado.name}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedColegiado.code} - DNI {selectedColegiado.dni}
                </p>
              </div>

              <p className="text-sm leading-6 text-slate-500">
                Si el colegiado ya tiene cobros registrados, el sistema bloqueara la eliminacion
                para proteger el historial.
              </p>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteColegiado}
                  disabled={isDeleting}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#b91c1c_0%,#ef4444_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(185,28,28,0.85)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Trash2 size={16} strokeWidth={2.2} />
                  {isDeleting ? 'Eliminando...' : 'Eliminar colegiado'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ColegiadosPage
