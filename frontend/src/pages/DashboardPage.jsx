import { createElement, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCheck,
  CreditCard,
  Download,
  FileSpreadsheet,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import MetricCard from '../components/dashboard/MetricCard'
import {
  downloadUpcomingCeremoniesReport,
  getDashboardOverview,
} from '../services/dashboardApi'

const trendModes = {
  colegiados: {
    label: 'Colegiados',
    title: 'Tendencias institucionales',
    subtitle: 'Colegiados iniciados por mes en el ano actual',
    formatValue: (value) => Number(value ?? 0).toLocaleString('es-PE'),
    statLabels: {
      total: 'Total',
      actual: 'Mes act.',
      promedio: 'Prom.',
      mejor: 'Pico',
    },
  },
  aportaciones: {
    label: 'Aportaciones',
    title: 'Tendencias institucionales',
    subtitle: 'Ingresos por aportaciones mensuales registradas por mes',
    formatValue: (value) => formatCompactCurrency(value),
    statLabels: {
      total: 'Total',
      actual: 'Mes act.',
      promedio: 'Prom.',
      mejor: 'Pico',
    },
  },
}

const quickActions = [
  {
    title: 'Registrar colegiado',
    description: '',
    primary: true,
    icon: UserPlus,
    path: '/colegiados',
  },
  {
    title: 'Registrar cobro',
    description: '',
    icon: CreditCard,
    path: '/caja-cobros/registrar',
  },
  {
    title: 'Generar reporte',
    description: '',
    icon: FileSpreadsheet,
    path: '/reportes',
  },
]

function formatCurrency(value) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0))
}

function formatDisplayCurrency(value) {
  return formatCurrency(value).replace(/\u00a0/g, ' ')
}

function formatCompactCurrency(value) {
  const numericValue = Number(value ?? 0)

  if (Math.abs(numericValue) < 1000) {
    return formatDisplayCurrency(numericValue)
  }

  return `S/ ${new Intl.NumberFormat('es-PE', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(numericValue)}`
}

function formatCount(value) {
  return Number(value ?? 0).toLocaleString('es-PE')
}

function formatSignedPercentage(value) {
  const numericValue = Number(value ?? 0)
  const prefix = numericValue > 0 ? '+' : numericValue < 0 ? '' : '+'
  return `${prefix}${numericValue.toFixed(1)}%`
}

function formatRelativeTime(timestamp) {
  if (!timestamp) {
    return '--'
  }

  const eventDate = new Date(timestamp)
  const diffMs = Date.now() - eventDate.getTime()

  if (Number.isNaN(diffMs) || diffMs < 0) {
    return '--'
  }

  const diffMinutes = Math.floor(diffMs / 60000)

  if (diffMinutes < 1) {
    return 'Hace instantes'
  }

  if (diffMinutes < 60) {
    return `Hace ${diffMinutes} min`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `Hace ${diffHours} h`
  }

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) {
    return `Hace ${diffDays} d`
  }

  return eventDate.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatTentativeDate(value) {
  if (!value) {
    return '--'
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getActivityTone(tipo) {
  if (tipo === 'COLEGIADO') {
    return 'bg-emerald-100 text-emerald-600'
  }

  if (tipo === 'VENTA') {
    return 'bg-indigo-100 text-indigo-600'
  }

  return 'bg-cobalt-soft text-cobalt'
}

function getActivityTitle(item) {
  if (item?.tipo === 'COLEGIADO') {
    return 'Registro de colegiado'
  }

  if (item?.tipo === 'VENTA') {
    return 'Venta de productos'
  }

  if (item?.tipo === 'COBRO') {
    return 'Cobro registrado'
  }

  return 'Movimiento institucional'
}

function getActivityDetail(item) {
  if (!item) {
    return ''
  }

  if (item.tipo === 'COLEGIADO') {
    return item.title ?? ''
  }

  if (!item.detail) {
    return ''
  }

  if (item.tipo === 'VENTA') {
    const [, buyerName = ''] = item.detail.split(' a ')
    return buyerName
  }

  if (item.tipo === 'COBRO') {
    const [, holderName = ''] = item.detail.split(' - ')
    return holderName
  }

  return item.detail
}

function buildInitials(name) {
  if (!name) {
    return '--'
  }

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function DashboardPage() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [activeTrend, setActiveTrend] = useState('colegiados')
  const [upcomingPage, setUpcomingPage] = useState(1)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [activeExportFormat, setActiveExportFormat] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const response = await getDashboardOverview()
        if (isMounted) {
          setData(response)
          setUpcomingPage(1)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : 'No se pudo cargar el dashboard institucional.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  const statCards = useMemo(
    () => [
      {
        title: 'Total colegiados',
        value: isLoading ? '--' : formatCount(data?.totalColegiados),
        note: formatSignedPercentage(data?.variacionAltasVsMesAnterior),
        helper: 'del total institucional',
        accent: 'border-cobalt',
        badgeTone: 'bg-cobalt-soft text-cobalt',
        icon: Users,
      },
      {
        title: 'Habilitados',
        value: isLoading ? '--' : formatCount(data?.habilitados),
        note: `${data?.habilitadosPorcentaje ?? 0}%`,
        helper: 'del total institucional',
        accent: 'border-emerald-500',
        badgeTone: 'bg-emerald-100 text-emerald-600',
        icon: UserPlus,
      },
      {
        title: 'Inactivos',
        value: isLoading ? '--' : formatCount(data?.inactivos),
        note: `${data?.inactivosPorcentaje ?? 0}%`,
        helper: 'sin habilitacion vigente',
        accent: 'border-amber-700',
        badgeTone: 'bg-amber-100 text-amber-700',
        icon: FileSpreadsheet,
      },
      {
        title: 'Ingresos mensuales',
        value: isLoading ? '--' : formatDisplayCurrency(data?.ingresosMensuales),
        note: data?.mesActualLabel ?? '--',
        helper: 'en total',
        accent: 'border-indigo-600',
        badgeTone: 'bg-indigo-100 text-indigo-700',
        icon: CreditCard,
        valueClassName: 'whitespace-nowrap text-[1.9rem] leading-none sm:text-[2.15rem]',
        helperClassName: 'max-w-[8rem]',
      },
    ],
    [data, isLoading],
  )

  const trendConfig = trendModes[activeTrend]
  const trendData = data?.[activeTrend]
  const trendMaxValue = Math.max(...(trendData?.monthly ?? []).map((item) => Number(item.value ?? 0)), 1)

  const trendStats = useMemo(() => {
    if (!trendData) {
      return []
    }

    return [
      {
        label: trendConfig.statLabels.total,
        value: trendConfig.formatValue(trendData.total),
        helper: `${data?.anioActual ?? new Date().getFullYear()}`,
      },
      {
        label: trendConfig.statLabels.actual,
        value: trendConfig.formatValue(trendData.actual),
        helper: data?.mesActualLabel ?? '--',
      },
      {
        label: trendConfig.statLabels.promedio,
        value: trendConfig.formatValue(trendData.promedio),
        helper: 'promedio mensual',
      },
      {
        label: trendConfig.statLabels.mejor,
        value: trendConfig.formatValue(trendData.mejorMesValor),
        helper: trendData.mejorMesLabel,
      },
    ]
  }, [data?.anioActual, data?.mesActualLabel, trendConfig, trendData])

  const recentActivity = data?.recentActivity ?? []
  const upcomingCeremonies = data?.upcomingCeremonies ?? []
  const recentActivityVisible = recentActivity.slice(0, 3)
  const upcomingPageSize = 5
  const upcomingTotalPages = Math.max(1, Math.ceil(upcomingCeremonies.length / upcomingPageSize))
  const normalizedUpcomingPage = Math.min(upcomingPage, upcomingTotalPages)
  const upcomingPageItems = upcomingCeremonies.slice(
    (normalizedUpcomingPage - 1) * upcomingPageSize,
    normalizedUpcomingPage * upcomingPageSize,
  )

  async function handleUpcomingExport(format) {
    setActiveExportFormat(format)
    setErrorMessage('')

    try {
      await downloadUpcomingCeremoniesReport(format)
      setIsExportModalOpen(false)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo exportar el reporte de juramentacion.',
      )
    } finally {
      setActiveExportFormat('')
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3">
        <span className="inline-flex w-fit rounded-full bg-cobalt-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cobalt">
          Resumen ejecutivo
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Panel Institucional
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            Resumen de operaciones y estado actual del Colegio de Psicologos de Lima.
          </p>
        </div>
      </section>

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-4">
        {statCards.map((card) => (
          <MetricCard key={card.title} {...card} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_320px]">
        <article className="rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-2xl font-semibold tracking-tight text-slate-950">
                {trendConfig.title}
              </p>
              <p className="text-sm text-slate-500">{trendConfig.subtitle}</p>
            </div>

            <div className="inline-flex w-fit rounded-2xl bg-slate-100 p-1">
              {Object.entries(trendModes).map(([key, option]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTrend(key)}
                  className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
                    activeTrend === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-[28px] bg-[linear-gradient(180deg,#f7f9ff_0%,#f2f5ff_100%)] p-5">
            <div className="mb-8 grid grid-cols-2 gap-3 xl:grid-cols-4">
              {trendStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-950">{stat.value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {stat.helper}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex h-[332px] items-end gap-3 rounded-[28px] bg-white px-5 pb-4 pt-5 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.75)] sm:gap-4">
              {(trendData?.monthly ?? []).map((bar) => {
                const filledHeight = `${(Number(bar.value ?? 0) / trendMaxValue) * 100}%`

                return (
                  <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-[256px] w-full max-w-[78px] items-end overflow-hidden rounded-t-2xl rounded-b-md bg-slate-200">
                      <div
                        className="w-full rounded-t-2xl bg-[linear-gradient(180deg,#2953e7_0%,#16369a_100%)]"
                        style={{ height: filledHeight }}
                      />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {bar.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </article>

        <div className="space-y-5">
          <article className="rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-slate-700">
                Accesos rapidos
              </h2>
            </div>

            <div className="space-y-2.5">
              {quickActions.map((action) => {
                const actionIcon = createElement(action.icon, {
                  size: 18,
                  strokeWidth: 2.2,
                })
                const classes = `flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left transition ${
                  action.primary
                    ? 'bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] text-white shadow-[0_20px_36px_-30px_rgba(30,64,175,0.9)]'
                    : 'bg-cobalt-soft text-slate-800 hover:bg-[#d7e3ff]'
                }`

                return (
                  <Link
                    key={action.title}
                    to={action.path}
                    className={classes.replace('px-4 py-4', 'px-3.5 py-3.5')}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`rounded-2xl p-2.5 ${
                          action.primary ? 'bg-white/[0.12] text-white' : 'bg-white text-cobalt'
                        }`}
                      >
                        {actionIcon}
                      </div>
                      <div>
                        <p className="font-semibold">{action.title}</p>
                        <p className={`text-[11px] leading-4 ${action.primary ? 'text-blue-100' : 'text-slate-500'}`}>
                          {action.description}
                        </p>
                      </div>
                    </div>

                    <ArrowRight size={18} strokeWidth={2.1} />
                  </Link>
                )
              })}
            </div>
          </article>

          <article className="rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-slate-700">
                Actividad reciente
              </h2>
              <Link
                to="/caja-cobros/historial"
                className="inline-flex h-9 w-9 items-center justify-center rounded-2xl text-cobalt transition hover:bg-cobalt-soft"
                aria-label="Ver todo"
              >
                <ArrowRight size={18} strokeWidth={2.2} />
              </Link>
            </div>

            <div className="space-y-4">
              {recentActivityVisible.length ? (
                recentActivityVisible.map((item, index) => (
                  <div key={`${item.tipo}-${item.title}-${index}`} className="flex gap-3">
                    <div
                      className={`mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${getActivityTone(item.tipo)}`}
                    >
                      <CheckCheck size={16} strokeWidth={2.2} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{getActivityTitle(item)}</p>
                      <p className="text-sm leading-6 text-slate-500">{getActivityDetail(item)}</p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {formatRelativeTime(item.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
                  Aun no hay actividad reciente registrada.
                </div>
              )}
            </div>
          </article>
        </div>
      </section>

      <section className="rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Proximos Colegiados a Juramentar
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Expedientes aprobados y listos para coordinacion institucional.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            disabled={!upcomingCeremonies.length}
            className="inline-flex items-center gap-2 rounded-2xl bg-cobalt-soft px-4 py-3 text-sm font-semibold text-cobalt disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} strokeWidth={2.2} />
            Descargar lista
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-[26px] border border-slate-200">
          <div className="hidden grid-cols-[1.05fr_1.45fr_1fr_1fr_1fr_80px] bg-[#e9f0ff] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500 md:grid">
            <span>Expediente</span>
            <span>Nombre completo</span>
            <span>DNI</span>
            <span>Especialidad</span>
            <span>Fecha tentativa</span>
            <span>Accion</span>
          </div>

          <div className="divide-y divide-slate-200 bg-white">
            {upcomingPageItems.length ? (
              upcomingPageItems.map((item) => (
                <div
                  key={item.codigo}
                  className="grid gap-4 px-5 py-5 md:grid-cols-[1.05fr_1.45fr_1fr_1fr_1fr_80px] md:items-center md:px-6"
                >
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                      Expediente
                    </p>
                    <p className="font-semibold text-cobalt">{item.codigo}</p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                      Nombre completo
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f172a_0%,#60a5fa_100%)] text-sm font-bold text-white">
                        {buildInitials(item.nombreCompleto)}
                      </div>
                      <span className="font-semibold text-slate-900">{item.nombreCompleto}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                      DNI
                    </p>
                    <p className="text-sm text-slate-600">{item.dni ?? '-'}</p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                      Especialidad
                    </p>
                    <p className="text-sm text-slate-600">{item.especialidad}</p>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 md:hidden">
                      Fecha tentativa
                    </p>
                    <p className="font-semibold text-slate-900">
                      {formatTentativeDate(item.fechaTentativa)}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Link
                      to="/colegiados"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      <ArrowRight size={18} strokeWidth={2.1} />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-sm text-slate-500">
                No hay colegiados pendientes de juramentacion para mostrar por ahora.
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
          <button
            type="button"
            onClick={() => setUpcomingPage((current) => Math.max(1, current - 1))}
            disabled={normalizedUpcomingPage === 1}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 transition hover:border-slate-300 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <ChevronLeft size={18} strokeWidth={2.2} />
          </button>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
            {normalizedUpcomingPage}/{upcomingTotalPages}
          </div>
          <button
            type="button"
            onClick={() => setUpcomingPage((current) => Math.min(upcomingTotalPages, current + 1))}
            disabled={normalizedUpcomingPage === upcomingTotalPages}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400 transition hover:border-slate-300 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <ChevronRight size={18} strokeWidth={2.2} />
          </button>
        </div>
      </section>

      {isExportModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.85)]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cobalt">
                  Exportar juramentacion
                </p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  Descargar lista
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Elige si deseas exportar el reporte como archivo Excel o como PDF.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              >
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              <button
                type="button"
                onClick={() => handleUpcomingExport('xlsx')}
                disabled={activeExportFormat !== ''}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FileSpreadsheet size={18} strokeWidth={2.1} />
                {activeExportFormat === 'xlsx' ? 'Generando Excel...' : 'Exportar como Excel'}
              </button>

              <button
                type="button"
                onClick={() => handleUpcomingExport('pdf')}
                disabled={activeExportFormat !== ''}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                <Download size={18} strokeWidth={2.1} />
                {activeExportFormat === 'pdf' ? 'Generando PDF...' : 'Exportar como PDF'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default DashboardPage
