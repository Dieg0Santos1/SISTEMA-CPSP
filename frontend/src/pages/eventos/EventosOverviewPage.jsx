import { useEffect, useMemo, useState } from 'react'
import {
  CalendarClock,
  CalendarDays,
  CheckCheck,
  ChevronRight,
  ClipboardList,
  FileText,
  Plus,
  Search,
  Users,
  X,
} from 'lucide-react'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:8080/api/v1'

const emptyForm = {
  name: '',
  date: '',
  time: '',
  description: '',
}

const statusStyles = {
  HABILITADO: 'bg-emerald-100 text-emerald-700',
  NO_HABILITADO: 'bg-red-100 text-red-600',
}

const formatEventDate = (value) =>
  new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

const sortEventsByDate = (items) =>
  [...items].sort((left, right) => new Date(left.fechaHora) - new Date(right.fechaHora))

const isSameMonth = (date, baseDate) =>
  date.getMonth() === baseDate.getMonth() && date.getFullYear() === baseDate.getFullYear()

const formatStatusLabel = (status) =>
  status === 'HABILITADO' ? 'Habilitado' : 'No habilitado'

const readErrorMessage = async (response, fallbackMessage) => {
  const payload = await response.json().catch(() => null)
  const details = Array.isArray(payload?.details) ? payload.details.join(' ') : ''
  return details || payload?.message || fallbackMessage
}

function EventosOverviewPage() {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [formValues, setFormValues] = useState(emptyForm)
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [isLoadingSelectedEvent, setIsLoadingSelectedEvent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdatingAttendance, setIsUpdatingAttendance] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [memberSearch, setMemberSearch] = useState('')

  const loadEvents = async (preferredEventId = null) => {
    setIsLoadingEvents(true)

    try {
      const response = await fetch(`${API_BASE_URL}/eventos`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'No se pudo cargar la lista de eventos.'))
      }

      const data = sortEventsByDate(await response.json())
      setEvents(data)

      if (data.length === 0) {
        setSelectedEventId(null)
        setSelectedEvent(null)
        return
      }

      const nextSelectedId =
        preferredEventId && data.some((eventItem) => eventItem.id === preferredEventId)
          ? preferredEventId
          : data.some((eventItem) => eventItem.id === selectedEventId)
            ? selectedEventId
            : data[0].id

      setSelectedEventId(nextSelectedId)
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo conectar con el backend de eventos.',
      )
    } finally {
      setIsLoadingEvents(false)
    }
  }

  const loadSelectedEvent = async (eventId) => {
    setIsLoadingSelectedEvent(true)

    try {
      const response = await fetch(`${API_BASE_URL}/eventos/${eventId}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, 'No se pudo cargar el detalle del evento.'),
        )
      }

      const data = await response.json()
      setSelectedEvent(data)
      setEvents((current) =>
        current.map((eventItem) =>
          eventItem.id === data.id
            ? {
                ...eventItem,
                nombre: data.nombre,
                descripcion: data.descripcion,
                fechaHora: data.fechaHora,
                asistenciasRegistradas: data.asistenciasRegistradas,
              }
            : eventItem,
        ),
      )
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar el detalle del evento.',
      )
      setSelectedEvent(null)
    } finally {
      setIsLoadingSelectedEvent(false)
    }
  }

  useEffect(() => {
    loadEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedEventId) {
      setSelectedEvent(null)
      return
    }

    loadSelectedEvent(selectedEventId)
  }, [selectedEventId])

  useEffect(() => {
    if (!isCreateModalOpen) {
      return undefined
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsCreateModalOpen(false)
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isCreateModalOpen])

  const currentDate = useMemo(() => new Date(), [])
  const totalEvents = events.length
  const upcomingEvents = useMemo(
    () =>
      sortEventsByDate(
        events.filter((eventItem) => new Date(eventItem.fechaHora) >= currentDate),
      ),
    [events, currentDate],
  )
  const nextEvent = upcomingEvents[0] ?? events[0] ?? null
  const eventsThisMonth = useMemo(
    () =>
      events.filter((eventItem) =>
        isSameMonth(new Date(eventItem.fechaHora), currentDate),
      ).length,
    [events, currentDate],
  )
  const attendedMembersCount = selectedEvent?.asistenciasRegistradas ?? 0
  const availableMembersCount = selectedEvent?.colegiados.length ?? 0
  const attendancePercent =
    availableMembersCount === 0
      ? 0
      : Math.round((attendedMembersCount / availableMembersCount) * 100)
  const filteredMembers = useMemo(() => {
    if (!selectedEvent) {
      return []
    }

    const normalizedSearch = memberSearch.trim().toLowerCase()

    if (!normalizedSearch) {
      return selectedEvent.colegiados
    }

    return selectedEvent.colegiados.filter((member) =>
      [member.nombreCompleto, member.codigoColegiatura]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch)),
    )
  }, [memberSearch, selectedEvent])

  const handleInputChange = (event) => {
    const { name, value } = event.target

    setFormValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleCreateEvent = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/eventos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          nombre: formValues.name.trim(),
          fecha: formValues.date,
          hora: formValues.time,
          descripcion: formValues.description.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'No se pudo crear el evento.'))
      }

      const createdEvent = await response.json()
      setFormValues(emptyForm)
      setIsCreateModalOpen(false)
      setSelectedEvent(createdEvent)
      await loadEvents(createdEvent.id)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo crear el evento.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleMember = async (memberId, isChecked) => {
    if (!selectedEvent) {
      return
    }

    setIsUpdatingAttendance(String(memberId))
    setErrorMessage('')

    try {
      const response = await fetch(
        `${API_BASE_URL}/eventos/${selectedEvent.id}/asistencias/${memberId}`,
        {
          method: isChecked ? 'DELETE' : 'PUT',
          credentials: 'include',
        },
      )

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(
            response,
            'No se pudo actualizar la asistencia del colegiado.',
          ),
        )
      }

      const updatedEvent = await response.json()
      setSelectedEvent(updatedEvent)
      setEvents((current) =>
        current.map((eventItem) =>
          eventItem.id === updatedEvent.id
            ? {
                ...eventItem,
                nombre: updatedEvent.nombre,
                descripcion: updatedEvent.descripcion,
                fechaHora: updatedEvent.fechaHora,
                asistenciasRegistradas: updatedEvent.asistenciasRegistradas,
              }
            : eventItem,
        ),
      )
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar la asistencia del colegiado.',
      )
    } finally {
      setIsUpdatingAttendance('')
    }
  }

  return (
    <div className="space-y-6">
      {errorMessage ? (
        <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="rounded-[28px] border border-cobalt bg-white p-6 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.55)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                Eventos creados
              </p>
              <p className="mt-3 text-[2.35rem] font-bold tracking-tight text-slate-950">
                {totalEvents}
              </p>
            </div>

            <div className="rounded-2xl bg-cobalt-soft p-3 text-cobalt">
              <ClipboardList size={20} strokeWidth={2.2} />
            </div>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Total de jornadas registradas actualmente en la base de datos.
          </p>
        </article>

        <article className="rounded-[28px] border border-emerald-500 bg-white p-6 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.55)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                Programados este mes
              </p>
              <p className="mt-3 text-[2.35rem] font-bold tracking-tight text-slate-950">
                {eventsThisMonth}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
              <CalendarDays size={20} strokeWidth={2.2} />
            </div>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            Conteo calculado sobre las fechas registradas para el mes en curso.
          </p>
        </article>

        <article className="rounded-[28px] border border-amber-400 bg-white p-6 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.55)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                Evento mas proximo
              </p>
              <p className="mt-3 text-xl font-bold tracking-tight text-slate-950">
                {nextEvent ? nextEvent.nombre : 'Sin eventos'}
              </p>
            </div>

            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <CalendarClock size={20} strokeWidth={2.2} />
            </div>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {nextEvent ? formatEventDate(nextEvent.fechaHora) : 'Crea un evento para iniciar.'}
          </p>
        </article>
      </section>

      <section className="rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Eventos</span>
              <ChevronRight size={14} />
              <span className="font-semibold text-cobalt">Gestion de jornadas</span>
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              Agenda de eventos creados
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Haz clic sobre cualquier evento para revisar sus datos y registrar la
              asistencia de los colegiados desde la misma vista.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)] transition hover:-translate-y-0.5"
          >
            <Plus size={17} strokeWidth={2.2} />
            Nuevo evento
          </button>
        </div>

        <div className="mt-6 grid gap-6 2xl:grid-cols-[350px_minmax(0,1fr)]">
          <article className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                  Lista de eventos
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {isLoadingEvents ? 'Cargando registros...' : `${totalEvents} registros visibles`}
                </p>
              </div>

            </div>

            {isLoadingEvents ? (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                Cargando eventos registrados...
              </div>
            ) : events.length > 0 ? (
              <div className="space-y-3">
                {events.map((eventItem) => {
                  const isActive = eventItem.id === selectedEventId

                  return (
                    <button
                      key={eventItem.id}
                      type="button"
                      onClick={() => setSelectedEventId(eventItem.id)}
                      className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
                        isActive
                          ? 'border-cobalt bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] text-white shadow-[0_16px_30px_-24px_rgba(30,64,175,0.85)]'
                          : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-lg font-semibold tracking-tight">
                        {eventItem.nombre}
                      </p>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                Aun no hay eventos registrados en la base de datos.
              </div>
            )}
          </article>

          <article className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.45)] sm:p-6">
            {isLoadingSelectedEvent ? (
              <div className="flex min-h-[320px] items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-[#f8fbff] p-6 text-center text-sm text-slate-500">
                Cargando detalle del evento...
              </div>
            ) : selectedEvent ? (
              <>
                <div className="flex flex-col gap-5 border-b border-slate-200 pb-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="max-w-3xl">
                    <span className="inline-flex rounded-full bg-cobalt-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cobalt">
                      Evento seleccionado
                    </span>
                    <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                      {selectedEvent.nombre}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {selectedEvent.descripcion}
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-[#f8fbff] px-4 py-4 xl:max-w-xs">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                      Fecha y hora
                    </p>
                    <p className="mt-2 text-base font-semibold text-slate-950">
                      {formatEventDate(selectedEvent.fechaHora)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-3">
                  <article className="rounded-[24px] border border-slate-200 bg-[#f8fbff] p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-cobalt-soft p-3 text-cobalt">
                        <Users size={18} strokeWidth={2.2} />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                          Asistencias registradas
                        </p>
                        <p className="mt-1 text-2xl font-bold text-slate-950">
                          {attendedMembersCount}
                        </p>
                      </div>
                    </div>
                  </article>

                  <article className="rounded-[24px] border border-slate-200 bg-[#f8fbff] p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                        <CheckCheck size={18} strokeWidth={2.2} />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                          Porcentaje de asistencia
                        </p>
                        <p className="mt-1 text-2xl font-bold text-slate-950">
                          {attendancePercent}%
                        </p>
                      </div>
                    </div>
                  </article>

                  <article className="rounded-[24px] border border-slate-200 bg-[#f8fbff] p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                        <FileText size={18} strokeWidth={2.2} />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                          Padron disponible
                        </p>
                        <p className="mt-1 text-2xl font-bold text-slate-950">
                          {availableMembersCount}
                        </p>
                      </div>
                    </div>
                  </article>
                </div>

                <div className="mt-6">
                  <label className="group flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-cobalt focus-within:bg-white">
                    <Search
                      size={18}
                      className="text-slate-400 transition group-focus-within:text-cobalt"
                    />
                    <input
                      type="search"
                      value={memberSearch}
                      onChange={(event) => setMemberSearch(event.target.value)}
                      placeholder="Buscar colegiado por codigo o nombre"
                      className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </label>
                </div>

                <div className="mt-4 overflow-hidden rounded-[26px] border border-slate-200">
                  <div className="hidden grid-cols-[92px_1.3fr_1fr_0.9fr_90px] bg-[#e9f0ff] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 lg:grid">
                    <span>Check</span>
                    <span>Colegiado</span>
                    <span>Especialidad</span>
                    <span>Estado</span>
                    <span>Asistencia</span>
                  </div>

                  <div className="divide-y divide-slate-200 bg-white">
                    {filteredMembers.map((member, index) => {
                      const isChecked = member.asistio
                      const isUpdating = isUpdatingAttendance === String(member.colegiadoId)

                      return (
                        <label
                          key={member.colegiadoId}
                          className={`grid cursor-pointer gap-4 px-5 py-5 lg:grid-cols-[92px_1.3fr_1fr_0.9fr_90px] lg:items-center lg:px-6 ${
                            index % 2 === 1 ? 'bg-[#f8fbff]' : 'bg-white'
                          }`}
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={isUpdating}
                              onChange={() =>
                                handleToggleMember(member.colegiadoId, member.asistio)
                              }
                              className="h-5 w-5 rounded border-slate-300 accent-[#1739a6] disabled:cursor-not-allowed disabled:opacity-60"
                            />
                          </div>

                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                              Colegiado
                            </p>
                            <p className="font-semibold text-slate-950">
                              {member.nombreCompleto}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {member.codigoColegiatura}
                            </p>
                          </div>

                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                              Especialidad
                            </p>
                            <p className="text-sm font-medium text-slate-700">
                              {member.especialidadPrincipal}
                            </p>
                          </div>

                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                              Estado
                            </p>
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
                                statusStyles[member.estado] ?? 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {formatStatusLabel(member.estado)}
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
                              {isUpdating ? 'Guardando' : isChecked ? 'Asistio' : 'Pendiente'}
                            </span>
                          </div>
                        </label>
                      )
                    })}

                    {filteredMembers.length === 0 ? (
                      <div className="px-5 py-10 text-center text-sm text-slate-500">
                        No encontramos colegiados con ese criterio de busqueda.
                      </div>
                    ) : null}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex min-h-[320px] items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-[#f8fbff] p-6 text-center">
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    Aun no hay un evento seleccionado
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Crea un evento o selecciona uno de la lista para empezar a registrar
                    asistencias.
                  </p>
                </div>
              </div>
            )}
          </article>
        </div>
      </section>

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-8 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[32px] border border-white/80 bg-white shadow-[0_24px_70px_-36px_rgba(15,23,42,0.8)]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-cobalt">
                  Nuevo evento
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  Crear evento institucional
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Completa los campos base para registrar una nueva jornada en el
                  sistema.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                aria-label="Cerrar modal"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              >
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-6 px-6 py-6 sm:px-8 sm:py-7">
              <div className="grid gap-5">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Nombre del evento
                  </span>
                  <input
                    type="text"
                    name="name"
                    value={formValues.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej. Jornada de intervencion clinica"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cobalt"
                  />
                </label>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Fecha</span>
                    <input
                      type="date"
                      name="date"
                      value={formValues.date}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cobalt"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-semibold text-slate-700">Hora</span>
                    <input
                      type="time"
                      name="time"
                      value={formValues.time}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cobalt"
                    />
                  </label>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Descripcion breve
                  </span>
                  <textarea
                    name="description"
                    value={formValues.description}
                    onChange={handleInputChange}
                    required
                    rows="5"
                    placeholder="Describe el objetivo o enfoque principal del evento."
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cobalt"
                  />
                </label>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Creando...' : 'Crear evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default EventosOverviewPage
