import { useMemo, useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Layers3,
  ReceiptText,
  Search,
  Sparkles,
  Tickets,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { downloadUpcomingCeremoniesReport } from '../services/dashboardApi'
import {
  downloadColegiadosPeriodoReport,
  downloadIngresosPeriodoReport,
} from '../services/reportesApi'
import {
  downloadTesoreriaComprobantesReport,
  downloadTesoreriaConceptosCatalogoReport,
  downloadTesoreriaHistorialReport,
} from '../services/tesoreriaApi'

const ANALYTIC_REPORTS = [
  {
    key: 'colegiados-periodo',
    module: 'Colegiados',
    title: 'Psicologos colegiados por periodo',
    description:
      'Genera el listado de incorporaciones por rango rapido o fechas personalizadas.',
    accent: 'border-cobalt bg-[linear-gradient(180deg,#f7f9ff_0%,#ffffff_100%)]',
    badgeTone: 'bg-cobalt-soft text-cobalt',
    icon: GraduationCap,
  },
  {
    key: 'ingresos-periodo',
    module: 'Tesoreria',
    title: 'Ingresos institucionales por periodo',
    description:
      'Consolida cobros y ventas del rango elegido, con totales listos para PDF o Excel.',
    accent: 'border-emerald-500 bg-[linear-gradient(180deg,#f5fffb_0%,#ffffff_100%)]',
    badgeTone: 'bg-emerald-100 text-emerald-700',
    icon: Wallet,
  },
]

const DIRECT_REPORTS = [
  {
    key: 'historial-caja',
    module: 'Tesoreria',
    title: 'Historial de caja',
    description: 'Exporta el consolidado general de operaciones de caja sin salir del centro de reportes.',
    icon: ReceiptText,
    path: '/caja-cobros/historial',
  },
  {
    key: 'comprobantes-emitidos',
    module: 'Tesoreria',
    title: 'Comprobantes emitidos',
    description: 'Descarga el listado institucional de boletas y facturas emitidas desde cobros y ventas.',
    icon: Tickets,
    path: '/caja-cobros/comprobantes',
  },
  {
    key: 'conceptos-catalogo',
    module: 'Conceptos',
    title: 'Catalogo de conceptos de cobro',
    description: 'Base operativa de conceptos y descuentos configurados para tesoreria.',
    icon: Layers3,
    path: '/conceptos-cobro',
  },
  {
    key: 'juramentacion',
    module: 'Dashboard',
    title: 'Proximos colegiados a juramentar',
    description: 'Lista institucional de expedientes listos para coordinacion de juramentacion.',
    icon: GraduationCap,
    path: '/',
  },
]

const FUTURE_REPORTS = [
  { module: 'Tesoreria', title: 'Aportaciones por periodo' },
  { module: 'Tesoreria', title: 'Colegiados con deuda' },
  { module: 'Tesoreria', title: 'Fraccionamientos por vencer' },
  { module: 'Inventario', title: 'Ventas de productos por periodo' },
  { module: 'Eventos', title: 'Asistencia colegiados vs. otros' },
  { module: 'Colegiados', title: 'Externos registrados por periodo' },
]

const QUICK_RANGE_OPTIONS = [
  { value: '7d', label: '7 dias' },
  { value: '14d', label: '14 dias' },
  { value: '30d', label: '30 dias' },
  { value: 'month', label: 'Mes actual' },
]

function toInputDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function shiftDays(date, amount) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + amount)
  return nextDate
}

function getPresetRange(preset) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (preset === '7d') {
    return { from: toInputDate(shiftDays(today, -6)), to: toInputDate(today) }
  }

  if (preset === '14d') {
    return { from: toInputDate(shiftDays(today, -13)), to: toInputDate(today) }
  }

  if (preset === '30d') {
    return { from: toInputDate(shiftDays(today, -29)), to: toInputDate(today) }
  }

  return {
    from: toInputDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    to: toInputDate(today),
  }
}

function createRangeState(preset, format = 'pdf') {
  return {
    ...getPresetRange(preset),
    preset,
    format,
  }
}

function formatDateLabel(value) {
  if (!value) {
    return '--'
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function moduleTone(module) {
  if (module === 'Tesoreria') {
    return 'bg-cobalt-soft text-cobalt'
  }

  if (module === 'Colegiados') {
    return 'bg-emerald-100 text-emerald-700'
  }

  if (module === 'Eventos') {
    return 'bg-amber-100 text-amber-700'
  }

  if (module === 'Inventario') {
    return 'bg-violet-100 text-violet-700'
  }

  if (module === 'Conceptos') {
    return 'bg-sky-100 text-sky-700'
  }

  return 'bg-slate-100 text-slate-700'
}

function ReportesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [moduleFilter, setModuleFilter] = useState('Todos')
  const [pendingActionKey, setPendingActionKey] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [colegiadosConfig, setColegiadosConfig] = useState(() => createRangeState('30d'))
  const [ingresosConfig, setIngresosConfig] = useState(() => createRangeState('month'))

  const moduleOptions = useMemo(
    () => [
      'Todos',
      ...Array.from(
        new Set(
          [...ANALYTIC_REPORTS, ...DIRECT_REPORTS, ...FUTURE_REPORTS].map(
            (report) => report.module,
          ),
        ),
      ),
    ],
    [],
  )

  const normalizedSearch = searchTerm.trim().toLowerCase()

  const matchesFilter = (report) => {
    const matchesModule = moduleFilter === 'Todos' || report.module === moduleFilter
    const matchesSearchText =
      !normalizedSearch ||
      [report.title, report.description, report.module]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch))

    return matchesModule && matchesSearchText
  }

  const visibleAnalyticReports = ANALYTIC_REPORTS.filter(matchesFilter)
  const visibleDirectReports = DIRECT_REPORTS.filter(matchesFilter)
  const visibleFutureReports = FUTURE_REPORTS.filter(matchesFilter)

  function applyPreset(setter, preset) {
    setter((current) => ({
      ...current,
      ...getPresetRange(preset),
      preset,
    }))
  }

  function handleRangeChange(setter, field, value) {
    setter((current) => ({
      ...current,
      [field]: value,
      preset: 'custom',
    }))
  }

  async function handleAnalyticDownload(reportKey) {
    const config = reportKey === 'colegiados-periodo' ? colegiadosConfig : ingresosConfig

    if (!config.from || !config.to) {
      setErrorMessage('Debes seleccionar la fecha inicial y final del reporte.')
      return
    }

    setPendingActionKey(`${reportKey}-${config.format}`)
    setErrorMessage('')

    try {
      if (reportKey === 'colegiados-periodo') {
        await downloadColegiadosPeriodoReport(config)
      } else {
        await downloadIngresosPeriodoReport(config)
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo generar el reporte solicitado.',
      )
    } finally {
      setPendingActionKey('')
    }
  }

  async function handleDirectDownload(reportKey, format) {
    setPendingActionKey(`${reportKey}-${format}`)
    setErrorMessage('')

    try {
      if (reportKey === 'historial-caja') {
        await downloadTesoreriaHistorialReport({ format })
      } else if (reportKey === 'comprobantes-emitidos') {
        await downloadTesoreriaComprobantesReport({ format })
      } else if (reportKey === 'conceptos-catalogo') {
        await downloadTesoreriaConceptosCatalogoReport({ format })
      } else if (reportKey === 'juramentacion') {
        await downloadUpcomingCeremoniesReport(format)
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo descargar el reporte solicitado.',
      )
    } finally {
      setPendingActionKey('')
    }
  }

  const activeReportsCount =
    ANALYTIC_REPORTS.length + DIRECT_REPORTS.length

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3">
        <span className="inline-flex w-fit rounded-full bg-cobalt-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cobalt">
          Centro de reportes
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Reportes
          </h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600 sm:text-base">
            Genera reportes analiticos por periodo, descarga los operativos que ya estan listos y
            ubica rapido los reportes contextuales que dependen de un evento o producto concreto.
          </p>
        </div>
      </section>

      {errorMessage ? (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      <section className="rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)]">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <label className="relative block xl:min-w-[420px] xl:max-w-[620px] xl:flex-1">
            <Search
              size={18}
              strokeWidth={2.1}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nombre de reporte, modulo o descripcion"
              className="w-full rounded-[22px] border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-cobalt focus:ring-2 focus:ring-cobalt/15"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {moduleOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setModuleFilter(option)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  moduleFilter === option
                    ? 'bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] text-white shadow-[0_16px_30px_-22px_rgba(30,64,175,0.9)]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
              Analisis institucional
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Generadores rapidos
            </h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <Sparkles size={14} strokeWidth={2.1} />
            {activeReportsCount} reportes activos
          </span>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {visibleAnalyticReports.length ? (
            visibleAnalyticReports.map((report) => {
              const Icon = report.icon
              const config =
                report.key === 'colegiados-periodo' ? colegiadosConfig : ingresosConfig
              const setConfig =
                report.key === 'colegiados-periodo' ? setColegiadosConfig : setIngresosConfig
              const isPending = pendingActionKey === `${report.key}-${config.format}`

              return (
                <article
                  key={report.key}
                  className={`rounded-[30px] border p-6 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] ${report.accent}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`rounded-2xl p-3 ${report.badgeTone}`}>
                        <Icon size={20} strokeWidth={2.2} />
                      </div>
                      <div>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${report.badgeTone}`}
                        >
                          {report.module}
                        </span>
                        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                          {report.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {report.description}
                        </p>
                      </div>
                    </div>

                    <BarChart3 size={18} strokeWidth={2.2} className="text-slate-300" />
                  </div>

                  <div className="mt-5 rounded-[24px] border border-white/80 bg-white/90 p-5">
                    <div className="flex flex-wrap gap-2">
                      {QUICK_RANGE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => applyPreset(setConfig, option.value)}
                          className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                            config.preset === option.value
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_180px]">
                      <label className="block">
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                          Desde
                        </span>
                        <input
                          type="date"
                          value={config.from}
                          onChange={(event) => handleRangeChange(setConfig, 'from', event.target.value)}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cobalt focus:ring-2 focus:ring-cobalt/15"
                        />
                      </label>

                      <label className="block">
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                          Hasta
                        </span>
                        <input
                          type="date"
                          value={config.to}
                          onChange={(event) => handleRangeChange(setConfig, 'to', event.target.value)}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cobalt focus:ring-2 focus:ring-cobalt/15"
                        />
                      </label>

                      <label className="block">
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                          Formato
                        </span>
                        <select
                          value={config.format}
                          onChange={(event) =>
                            setConfig((current) => ({ ...current, format: event.target.value }))
                          }
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-cobalt focus:ring-2 focus:ring-cobalt/15"
                        >
                          <option value="pdf">PDF institucional</option>
                          <option value="xlsx">Excel operativo</option>
                        </select>
                      </label>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <p className="text-sm text-slate-500">
                        Rango elegido:
                        <span className="ml-2 font-semibold text-slate-700">
                          {formatDateLabel(config.from)} - {formatDateLabel(config.to)}
                        </span>
                      </p>

                      <button
                        type="button"
                        onClick={() => handleAnalyticDownload(report.key)}
                        disabled={isPending}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                      >
                        {config.format === 'pdf' ? (
                          <FileText size={18} strokeWidth={2.1} />
                        ) : (
                          <FileSpreadsheet size={18} strokeWidth={2.1} />
                        )}
                        {isPending ? 'Generando...' : 'Generar reporte'}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-200 bg-white px-6 py-10 text-sm text-slate-500 xl:col-span-2">
              No hay generadores analiticos visibles con el filtro actual.
            </div>
          )}
        </div>
      </section>

      <section className="space-y-5">
        <article className="rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                Operativos
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Descarga inmediata
              </h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {visibleDirectReports.length} disponibles
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {visibleDirectReports.length ? (
              visibleDirectReports.map((report) => {
                const Icon = report.icon
                const pdfBusy = pendingActionKey === `${report.key}-pdf`
                const xlsxBusy = pendingActionKey === `${report.key}-xlsx`

                return (
                  <article
                    key={report.key}
                    className="rounded-[24px] border border-slate-200 bg-slate-50/80 px-5 py-4"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl bg-white p-3 text-cobalt shadow-sm">
                          <Icon size={18} strokeWidth={2.2} />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${moduleTone(report.module)}`}
                            >
                              {report.module}
                            </span>
                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                              Directo
                            </span>
                          </div>
                          <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">
                            {report.title}
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {report.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 xl:justify-end">
                        <button
                          type="button"
                          onClick={() => handleDirectDownload(report.key, 'xlsx')}
                          disabled={pdfBusy || xlsxBusy}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <FileSpreadsheet size={16} strokeWidth={2.1} />
                          {xlsxBusy ? 'Generando...' : 'Excel'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDirectDownload(report.key, 'pdf')}
                          disabled={pdfBusy || xlsxBusy}
                          className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                          <FileText size={16} strokeWidth={2.1} />
                          {pdfBusy ? 'Generando...' : 'PDF'}
                        </button>

                        <Link
                          to={report.path}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                        >
                          Abrir modulo
                          <ArrowRight size={16} strokeWidth={2.1} />
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-200 px-5 py-10 text-center text-sm text-slate-500">
                No hay reportes directos que coincidan con el filtro actual.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-[30px] border border-white/80 bg-white p-6 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)]">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-fuchsia-100 p-3 text-fuchsia-700">
              <Sparkles size={18} strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                Proxima capa analitica
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                Siguientes reportes
              </h2>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2.5">
            {visibleFutureReports.length ? (
              visibleFutureReports.map((report) => (
                <div
                  key={`${report.module}-${report.title}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    {report.module}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">{report.title}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-200 px-5 py-8 text-sm text-slate-500">
                No hay reportes futuros visibles con el filtro actual.
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  )
}

export default ReportesPage
