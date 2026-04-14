import { useEffect, useState } from 'react'
import {
  CalendarClock,
  CalendarDays,
  CheckCheck,
  ChevronRight,
  ClipboardList,
  FileText,
  Plus,
  Users,
  X,
} from 'lucide-react'
import {
  eventosInitialRecords,
  eventosMockMembers,
} from '../../data/eventos/eventosData'

const EVENT_REFERENCE_DATE = new Date('2026-04-14T09:00:00')

const emptyForm = {
  name: '',
  date: '',
  time: '',
  description: '',
}

const formatEventDate = (value) =>
  new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

const formatShortDate = (value) =>
  new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(value))

const sortEventsByDate = (items) =>
  [...items].sort((left, right) => new Date(left.dateTime) - new Date(right.dateTime))

const isSameMonth = (date, baseDate) =>
  date.getMonth() === baseDate.getMonth() && date.getFullYear() === baseDate.getFullYear()

function EventosOverviewPage() {
  const [events, setEvents] = useState(() => sortEventsByDate(eventosInitialRecords))
  const [selectedEventId, setSelectedEventId] = useState(eventosInitialRecords[0]?.id ?? null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [formValues, setFormValues] = useState(emptyForm)

  const selectedEvent = events.find((eventItem) => eventItem.id === selectedEventId) ?? null
  const totalEvents = events.length
  const upcomingEvents = sortEventsByDate(
    events.filter((eventItem) => new Date(eventItem.dateTime) >= EVENT_REFERENCE_DATE),
  )
  const nextEvent = upcomingEvents[0] ?? events[0] ?? null
  const eventsThisMonth = events.filter((eventItem) =>
    isSameMonth(new Date(eventItem.dateTime), EVENT_REFERENCE_DATE),
  ).length
  const attendedMembersCount = selectedEvent?.attendanceMemberIds.length ?? 0
  const availableMembersCount = eventosMockMembers.length

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

  const handleInputChange = (event) => {
    const { name, value } = event.target

    setFormValues((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleCreateEvent = (event) => {
    event.preventDefault()

    const nextEventRecord = {
      id: `evento-${Date.now()}`,
      name: formValues.name.trim(),
      dateTime: `${formValues.date}T${formValues.time}`,
      description: formValues.description.trim(),
      attendanceMemberIds: [],
    }

    const sortedEvents = sortEventsByDate([...events, nextEventRecord])
    setEvents(sortedEvents)
    setSelectedEventId(nextEventRecord.id)
    setFormValues(emptyForm)
    setIsCreateModalOpen(false)
  }

  const handleToggleMember = (memberId) => {
    if (!selectedEvent) {
      return
    }

    setEvents((current) =>
      current.map((eventItem) => {
        if (eventItem.id !== selectedEvent.id) {
          return eventItem
        }

        const isSelected = eventItem.attendanceMemberIds.includes(memberId)

        return {
          ...eventItem,
          attendanceMemberIds: isSelected
            ? eventItem.attendanceMemberIds.filter((currentId) => currentId !== memberId)
            : [...eventItem.attendanceMemberIds, memberId],
        }
      }),
    )
  }

  return (
    <div className="space-y-6">
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
            Vista local con eventos registrados manualmente desde el modulo.
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
            Jornadas ubicadas dentro del corte visible de abril de 2026.
          </p>
        </article>

        <article className="rounded-[28px] border border-amber-400 bg-white p-6 shadow-[0_16px_40px_-30px_rgba(15,23,42,0.55)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                Evento mas proximo
              </p>
              <p className="mt-3 text-xl font-bold tracking-tight text-slate-950">
                {nextEvent ? nextEvent.name : 'Sin eventos'}
              </p>
            </div>

            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <CalendarClock size={20} strokeWidth={2.2} />
            </div>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {nextEvent ? formatEventDate(nextEvent.dateTime) : 'Crea un evento para iniciar.'}
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

        <div className="mt-6 grid gap-6 2xl:grid-cols-[430px_minmax(0,1fr)]">
          <article className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                  Lista de eventos
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {totalEvents} registros visibles en esta vista
                </p>
              </div>

              <span className="rounded-full bg-cobalt-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cobalt">
                Local
              </span>
            </div>

            <div className="space-y-3">
              {events.map((eventItem) => {
                const isActive = eventItem.id === selectedEventId
                const attendanceCount = eventItem.attendanceMemberIds.length

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
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-70">
                          {formatShortDate(eventItem.dateTime)}
                        </p>
                        <p className="mt-2 text-lg font-semibold tracking-tight">
                          {eventItem.name}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${
                          isActive
                            ? 'bg-white/15 text-white'
                            : 'bg-cobalt-soft text-cobalt'
                        }`}
                      >
                        {attendanceCount} asistencias
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 opacity-85">
                      {eventItem.description}
                    </p>
                    <p className="mt-3 text-sm font-medium opacity-85">
                      {formatEventDate(eventItem.dateTime)}
                    </p>
                  </button>
                )
              })}
            </div>
          </article>

          <article className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.45)] sm:p-6">
            {selectedEvent ? (
              <>
                <div className="flex flex-col gap-5 border-b border-slate-200 pb-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="max-w-3xl">
                    <span className="inline-flex rounded-full bg-cobalt-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cobalt">
                      Evento seleccionado
                    </span>
                    <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                      {selectedEvent.name}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {selectedEvent.description}
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-[#f8fbff] px-4 py-4 xl:max-w-xs">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                      Fecha y hora
                    </p>
                    <p className="mt-2 text-base font-semibold text-slate-950">
                      {formatEventDate(selectedEvent.dateTime)}
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
                          {Math.round((attendedMembersCount / availableMembersCount) * 100)}%
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

                <div className="mt-6 overflow-hidden rounded-[26px] border border-slate-200">
                  <div className="hidden grid-cols-[92px_1.3fr_1fr_0.9fr_90px] bg-[#e9f0ff] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 lg:grid">
                    <span>Check</span>
                    <span>Colegiado</span>
                    <span>Especialidad</span>
                    <span>Estado</span>
                    <span>Asistencia</span>
                  </div>

                  <div className="divide-y divide-slate-200 bg-white">
                    {eventosMockMembers.map((member, index) => {
                      const isChecked = selectedEvent.attendanceMemberIds.includes(member.id)

                      return (
                        <label
                          key={member.id}
                          className={`grid cursor-pointer gap-4 px-5 py-5 lg:grid-cols-[92px_1.3fr_1fr_0.9fr_90px] lg:items-center lg:px-6 ${
                            index % 2 === 1 ? 'bg-[#f8fbff]' : 'bg-white'
                          }`}
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleMember(member.id)}
                              className="h-5 w-5 rounded border-slate-300 accent-[#1739a6]"
                            />
                          </div>

                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                              Colegiado
                            </p>
                            <p className="font-semibold text-slate-950">{member.name}</p>
                            <p className="mt-1 text-sm text-slate-500">{member.code}</p>
                          </div>

                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                              Especialidad
                            </p>
                            <p className="text-sm font-medium text-slate-700">
                              {member.specialty}
                            </p>
                          </div>

                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 lg:hidden">
                              Estado
                            </p>
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
                              {isChecked ? 'Asistio' : 'Pendiente'}
                            </span>
                          </div>
                        </label>
                      )
                    })}
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
                  Completa los campos base para generar una nueva vista de evento en el
                  modulo.
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
                  className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)] transition hover:-translate-y-0.5"
                >
                  Crear evento
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
