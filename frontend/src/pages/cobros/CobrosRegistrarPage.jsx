import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Printer,
  ReceiptText,
  Search,
  Trash2,
} from 'lucide-react'
import {
  getTesoreriaColegiadoCobranza,
  getTesoreriaColegiados,
  getTesoreriaConceptosCobro,
  markTesoreriaCobroPrinted,
  postTesoreriaCobro,
} from '../../services/tesoreriaApi'

const pageSize = 5
const documentOptions = [
  { value: 'BOLETA', label: 'Boleta' },
  { value: 'FACTURA', label: 'Factura' },
]
const paymentOptions = [
  { value: 'Efectivo', requestValue: 'EFECTIVO' },
  { value: 'Yape/Plin', requestValue: 'YAPE_PLIN' },
  { value: 'Transferencia', requestValue: 'TRANSFERENCIA' },
  { value: 'POS/Tarjeta', requestValue: 'POS_TARJETA' },
]
const periodToneByStatus = {
  PAID: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  GRACE: 'border-amber-200 bg-amber-50 text-amber-700',
  OVERDUE: 'border-rose-200 bg-rose-50 text-rose-700',
}
const stateToneMap = {
  HABILITADO: 'bg-emerald-100 text-emerald-700',
  NO_HABILITADO: 'bg-rose-100 text-rose-700',
}

function getTodayInLimaISO() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const parts = formatter.formatToParts(new Date())
  const year = parts.find((part) => part.type === 'year')?.value ?? '0000'
  const month = parts.find((part) => part.type === 'month')?.value ?? '01'
  const day = parts.find((part) => part.type === 'day')?.value ?? '01'

  return `${year}-${month}-${day}`
}

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

function buildConceptAmountLabel(concept) {
  if (!concept) {
    return '-'
  }

  return formatCurrency(concept.montoBase)
}

function buildConceptModeLabel(concept) {
  if (!concept) {
    return '-'
  }

  if (concept.usaPeriodo) {
    return 'Por periodo'
  }

  if (concept.permiteCantidad) {
    return 'Por cantidad'
  }

  return 'Monto fijo'
}

function buildConceptChips(concept) {
  if (!concept) {
    return []
  }

  const chips = [concept.categoria]

  if (concept.exoneradoIgv) {
    chips.push('Exonerado IGV')
  }

  if (concept.afectaHabilitacion) {
    chips.push('Impacta habilitacion')
  }

  return chips
}

function createPrintableHtml(receipt) {
  const itemRows = receipt.items
    .map(
      (item) => `
        <tr>
          <td>${item.concepto}</td>
          <td>${item.periodoReferencia ?? '-'}</td>
          <td style="text-align:center;">${item.cantidad}</td>
          <td style="text-align:right;">S/ ${Number(item.montoUnitario ?? 0).toFixed(2)}</td>
          <td style="text-align:right;">S/ ${Number(item.totalLinea ?? 0).toFixed(2)}</td>
        </tr>`,
    )
    .join('')

  return `<!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <title>${receipt.tipoComprobante} ${receipt.serie}-${String(receipt.numeroComprobante).padStart(7, '0')}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
        h1, p { margin: 0; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .badge { display: inline-block; padding: 6px 12px; border-radius: 999px; background: #dbeafe; color: #1739a6; font-weight: 700; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; }
        .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-bottom: 24px; }
        .card { border: 1px solid #dbe3f0; border-radius: 16px; padding: 12px 16px; }
        .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.16em; color: #64748b; font-weight: 700; }
        .value { margin-top: 8px; font-size: 16px; font-weight: 700; }
        table { width: 100%; border-collapse: collapse; margin-top: 24px; }
        th, td { border-bottom: 1px solid #e2e8f0; padding: 10px 8px; font-size: 14px; }
        th { text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: #475569; }
        .totals { margin-top: 24px; margin-left: auto; width: 280px; }
        .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .totals-row.total { font-size: 18px; font-weight: 700; border-top: 1px solid #cbd5e1; margin-top: 8px; padding-top: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <p class="badge">${receipt.tipoComprobante}</p>
          <h1 style="margin-top:12px;">${receipt.serie}-${String(receipt.numeroComprobante).padStart(7, '0')}</h1>
          <p style="margin-top:10px; color:#475569;">Emitido el ${new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(`${receipt.fechaEmision}T00:00:00`))}</p>
        </div>
        <div style="text-align:right;">
          <p class="label">Metodo de pago</p>
          <p class="value">${receipt.metodoPago}</p>
        </div>
      </div>
      <div class="grid">
        <div class="card">
          <p class="label">Colegiado</p>
          <p class="value">${receipt.colegiadoNombre}</p>
        </div>
        <div class="card">
          <p class="label">Codigo / DNI</p>
          <p class="value">${receipt.codigoColegiatura} / ${receipt.dni}</p>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Periodo</th>
            <th>Cantidad</th>
            <th>Monto unitario</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <div class="totals">
        <div class="totals-row"><span>Subtotal</span><strong>S/ ${Number(receipt.subtotal ?? 0).toFixed(2)}</strong></div>
        <div class="totals-row"><span>Descuento</span><strong>S/ ${Number(receipt.descuentoTotal ?? 0).toFixed(2)}</strong></div>
        <div class="totals-row"><span>Mora</span><strong>S/ ${Number(receipt.moraTotal ?? 0).toFixed(2)}</strong></div>
        <div class="totals-row total"><span>Total</span><strong>S/ ${Number(receipt.total ?? 0).toFixed(2)}</strong></div>
      </div>
    </body>
  </html>`
}

function CobrosRegistrarPage() {
  const [memberSearch, setMemberSearch] = useState('')
  const [membersPage, setMembersPage] = useState(1)
  const [membersData, setMembersData] = useState(null)
  const [membersLoading, setMembersLoading] = useState(true)
  const [membersError, setMembersError] = useState('')
  const [concepts, setConcepts] = useState([])
  const [conceptsLoading, setConceptsLoading] = useState(true)
  const [conceptsError, setConceptsError] = useState('')
  const [selectedConceptId, setSelectedConceptId] = useState('')
  const [selectedPeriods, setSelectedPeriods] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [selectedMemberId, setSelectedMemberId] = useState(null)
  const [selectedMemberDetail, setSelectedMemberDetail] = useState(null)
  const [memberDetailLoading, setMemberDetailLoading] = useState(false)
  const [memberDetailError, setMemberDetailError] = useState('')
  const [draftItems, setDraftItems] = useState([])
  const [documentType, setDocumentType] = useState('BOLETA')
  const [emissionDate, setEmissionDate] = useState(getTodayInLimaISO())
  const [paymentMethod, setPaymentMethod] = useState('Efectivo')
  const [observation, setObservation] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [isPrintSaving, setIsPrintSaving] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadMembers() {
      setMembersLoading(true)
      setMembersError('')

      try {
        const response = await getTesoreriaColegiados({
          search: memberSearch,
          page: membersPage,
          size: pageSize,
        })

        if (!isMounted) {
          return
        }

        setMembersData(response)
        const firstMemberId = response.content?.[0]?.id ?? null
        setSelectedMemberId((current) => {
          if (current && response.content?.some((item) => item.id === current)) {
            return current
          }

          return firstMemberId
        })
      } catch (error) {
        if (isMounted) {
          setMembersError(
            error instanceof Error
              ? error.message
              : 'No se pudo cargar la lista de colegiados.',
          )
        }
      } finally {
        if (isMounted) {
          setMembersLoading(false)
        }
      }
    }

    loadMembers()

    return () => {
      isMounted = false
    }
  }, [memberSearch, membersPage])

  useEffect(() => {
    let isMounted = true

    async function loadConcepts() {
      setConceptsLoading(true)
      setConceptsError('')

      try {
        const response = await getTesoreriaConceptosCobro()

        if (!isMounted) {
          return
        }

        setConcepts(response)
        setSelectedConceptId((current) => current || response[0]?.id?.toString() || '')
      } catch (error) {
        if (isMounted) {
          setConceptsError(
            error instanceof Error
              ? error.message
              : 'No se pudo cargar el catalogo de conceptos.',
          )
        }
      } finally {
        if (isMounted) {
          setConceptsLoading(false)
        }
      }
    }

    loadConcepts()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!selectedMemberId) {
      setSelectedMemberDetail(null)
      return
    }

    let isMounted = true

    async function loadCobranzaDetail() {
      setMemberDetailLoading(true)
      setMemberDetailError('')

      try {
        const response = await getTesoreriaColegiadoCobranza(selectedMemberId)

        if (!isMounted) {
          return
        }

        setSelectedMemberDetail(response)
        setDraftItems([])
        setSelectedPeriods([])
      } catch (error) {
        if (isMounted) {
          setMemberDetailError(
            error instanceof Error
              ? error.message
              : 'No se pudo cargar el detalle de cobranza.',
          )
        }
      } finally {
        if (isMounted) {
          setMemberDetailLoading(false)
        }
      }
    }

    loadCobranzaDetail()

    return () => {
      isMounted = false
    }
  }, [selectedMemberId])

  const selectedConcept = useMemo(
    () => concepts.find((item) => String(item.id) === selectedConceptId) ?? null,
    [concepts, selectedConceptId],
  )

  useEffect(() => {
    if (!selectedConcept) {
      return
    }

    setQuantity(1)
    setSelectedPeriods([])
  }, [selectedConcept])

  const members = membersData?.content ?? []
  const memberTotalPages = membersData?.totalPages ?? 1
  const facturaBlocked = documentType === 'FACTURA' && !selectedMemberDetail?.ruc
  const canAddItem =
    selectedConcept &&
    selectedMemberDetail &&
    (!selectedConcept.usaPeriodo || selectedPeriods.length > 0) &&
    (!selectedConcept.permiteCantidad || quantity >= 1)

  const draftSummary = useMemo(() => {
    const subtotal = draftItems.reduce((sum, item) => sum + Number(item.total ?? 0), 0)
    const itemsCount = draftItems.reduce((sum, item) => sum + Number(item.itemsCount ?? 0), 0)
    return { subtotal, itemsCount }
  }, [draftItems])

  function togglePeriod(periodo) {
    setSelectedPeriods((current) =>
      current.includes(periodo)
        ? current.filter((value) => value !== periodo)
        : [...current, periodo],
    )
  }

  function handleAddItem() {
    if (!selectedConcept || !selectedMemberDetail) {
      return
    }

    if (selectedConcept.codigo === 'CER-JUR' && !selectedMemberDetail.ceremoniaPendiente) {
      setSubmitError('La ceremonia ya fue cancelada para este colegiado.')
      return
    }

    if (selectedConcept.usaPeriodo && selectedPeriods.length === 0) {
      setSubmitError('Selecciona al menos un periodo para continuar.')
      return
    }

    const conceptQuantity = selectedConcept.usaPeriodo
      ? selectedPeriods.length
      : selectedConcept.permiteCantidad
        ? quantity
        : 1

    const total = Number(selectedConcept.montoBase ?? 0) * conceptQuantity

    setDraftItems((current) => [
      ...current,
      {
        id: `draft-${Date.now()}-${current.length + 1}`,
        conceptoId: selectedConcept.id,
        codigo: selectedConcept.codigo,
        concepto: selectedConcept.nombre,
        categoria: selectedConcept.categoria,
        usaPeriodo: selectedConcept.usaPeriodo,
        periodos: selectedConcept.usaPeriodo
          ? selectedPeriods
              .map((periodo) =>
                selectedMemberDetail.periodosMensuales.find((item) => item.periodo === periodo),
              )
              .filter(Boolean)
          : [],
        quantity: conceptQuantity,
        baseAmount: Number(selectedConcept.montoBase ?? 0),
        total,
        itemsCount: selectedConcept.usaPeriodo ? selectedPeriods.length : 1,
      },
    ])

    setSubmitError('')
    setSelectedPeriods([])
    setQuantity(1)
  }

  function handleRemoveDraftItem(draftId) {
    setDraftItems((current) => current.filter((item) => item.id !== draftId))
  }

  function handleClearDraft() {
    setDraftItems([])
    setSubmitError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!selectedMemberDetail) {
      setSubmitError('Selecciona un colegiado antes de registrar el cobro.')
      return
    }

    if (draftItems.length === 0) {
      setSubmitError('Agrega al menos un item al comprobante.')
      return
    }

    if (facturaBlocked) {
      setSubmitError('Para emitir factura, el colegiado debe tener RUC registrado.')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const payload = {
        colegiadoId: selectedMemberDetail.id,
        tipoComprobante: documentType,
        fechaEmision: emissionDate,
        metodoPago:
          paymentOptions.find((item) => item.value === paymentMethod)?.requestValue ?? 'EFECTIVO',
        observacion: observation.trim() || null,
        items: draftItems.flatMap((item) => {
          if (item.usaPeriodo) {
            return item.periodos.map((period) => ({
              conceptoCobroId: item.conceptoId,
              periodoReferencia: period.periodo,
              cantidad: 1,
              descuento: '0.00',
              mora: '0.00',
            }))
          }

          return [
            {
              conceptoCobroId: item.conceptoId,
              periodoReferencia: null,
              cantidad: item.quantity,
              descuento: '0.00',
              mora: '0.00',
            },
          ]
        }),
      }

      const response = await postTesoreriaCobro(payload)
      setReceipt(response)
      setDraftItems([])
      setObservation('')
      setQuantity(1)
      setSelectedPeriods([])

      const [membersResponse, detailResponse] = await Promise.all([
        getTesoreriaColegiados({ search: memberSearch, page: membersPage, size: pageSize }),
        getTesoreriaColegiadoCobranza(selectedMemberDetail.id),
      ])

      setMembersData(membersResponse)
      setSelectedMemberDetail(detailResponse)
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'No se pudo registrar el cobro.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handlePrintReceipt() {
    if (!receipt) {
      return
    }

    setIsPrintSaving(true)

    try {
      const printWindow = window.open('', '_blank', 'width=960,height=720')

      if (!printWindow) {
        throw new Error(
          'No se pudo abrir la ventana de impresion. Verifica el bloqueo de ventanas emergentes.',
        )
      }

      printWindow.document.write(createPrintableHtml(receipt))
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()

      if (!receipt.impreso) {
        await markTesoreriaCobroPrinted(receipt.cobroId)
        setReceipt((current) => (current ? { ...current, impreso: true } : current))
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'No se pudo completar el flujo de impresion.',
      )
    } finally {
      setIsPrintSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_0.7fr] xl:items-stretch">
        <article className="h-full rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                1. Seleccion del colegiado
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Busca por nombre, codigo institucional o DNI.
              </p>
            </div>

            <label className="group flex w-full max-w-[520px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-cobalt focus-within:bg-white">
              <Search size={18} className="text-slate-400 transition group-focus-within:text-cobalt" />
              <input
                type="search"
                value={memberSearch}
                onChange={(event) => {
                  setMemberSearch(event.target.value)
                  setMembersPage(1)
                }}
                placeholder="Buscar colegiado"
                className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>
          </div>

          {membersError ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {membersError}
            </div>
          ) : null}

          <div className="mt-5 overflow-hidden rounded-[26px] border border-slate-200">
            <div className="grid grid-cols-[1fr_0.9fr_1.6fr_0.95fr] gap-4 bg-[#dfe9ff] px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
              <span>Codigo</span>
              <span>DNI</span>
              <span>Nombre completo</span>
              <span>Estado</span>
            </div>

            <div className="divide-y divide-slate-200 bg-white">
              {membersLoading ? (
                <div className="px-6 py-12 text-center text-sm text-slate-500">
                  Cargando colegiados...
                </div>
              ) : members.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-slate-500">
                  No encontramos colegiados con ese criterio.
                </div>
              ) : (
                members.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setSelectedMemberId(member.id)}
                    className={`grid w-full grid-cols-[1fr_0.9fr_1.6fr_0.95fr] gap-4 px-6 py-5 text-left transition ${
                      selectedMemberId === member.id
                        ? 'bg-[linear-gradient(90deg,#f4f8ff_0%,#ffffff_100%)] shadow-[inset_4px_0_0_0_#204edc]'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-semibold text-cobalt">{member.codigoColegiatura}</span>
                    <span className="font-medium text-slate-700">{member.dni}</span>
                    <span className="font-semibold text-slate-900">{member.nombreCompleto}</span>
                    <span>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
                          stateToneMap[member.estado] ?? 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {member.estado === 'NO_HABILITADO' ? 'No Habilitado' : 'Habilitado'}
                      </span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {members.length > 0 ? (
            <div className="mt-5 flex items-center justify-between gap-4 text-sm text-slate-500">
              <p>
                Mostrando {((membersData?.page ?? membersPage) - 1) * (membersData?.size ?? pageSize) + 1}
                {' '}a{' '}
                {Math.min(
                  (membersData?.page ?? membersPage) * (membersData?.size ?? pageSize),
                  membersData?.totalElements ?? members.length,
                )}{' '}
                de {membersData?.totalElements ?? members.length} colegiados
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={(membersData?.page ?? membersPage) <= 1}
                  onClick={() => setMembersPage((current) => Math.max(1, current - 1))}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft size={16} strokeWidth={2.2} />
                </button>
                <span className="rounded-xl bg-slate-100 px-3 py-2 font-semibold text-slate-700">
                  {membersData?.page ?? membersPage} / {memberTotalPages}
                </span>
                <button
                  type="button"
                  disabled={(membersData?.page ?? membersPage) >= memberTotalPages}
                  onClick={() => setMembersPage((current) => Math.min(memberTotalPages, current + 1))}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRight size={16} strokeWidth={2.2} />
                </button>
              </div>
            </div>
          ) : null}
        </article>

        <article className="h-full rounded-[30px] border border-white/80 bg-white p-4 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-cobalt-soft p-3 text-cobalt">
              <ReceiptText size={18} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                Colegiado seleccionado
              </h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Datos clave para validar deuda, ultimo pago y estado antes de emitir.
              </p>
            </div>
          </div>

          {memberDetailError ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {memberDetailError}
            </div>
          ) : null}

          {memberDetailLoading ? (
            <div className="mt-6 flex items-center justify-center rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-12 text-sm text-slate-500">
              Cargando detalle del colegiado...
            </div>
          ) : selectedMemberDetail ? (
            <div className="mt-5 rounded-[24px] border border-cobalt bg-[linear-gradient(180deg,#f6f9ff_0%,#ffffff_100%)] p-4">
              <h3 className="text-[1.45rem] font-semibold tracking-tight text-slate-950">
                {selectedMemberDetail.nombreCompleto}
              </h3>
              <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">
                {selectedMemberDetail.codigoColegiatura} · DNI {selectedMemberDetail.dni}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${
                    stateToneMap[selectedMemberDetail.estado] ?? 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {selectedMemberDetail.estado === 'NO_HABILITADO' ? 'No Habilitado' : 'Habilitado'}
                </span>
                {selectedMemberDetail.ceremoniaPendiente ? (
                  <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">
                    Ceremonia pendiente
                  </span>
                ) : null}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white px-3.5 py-3.5 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.7)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Saldo pendiente
                  </p>
                  <p className="mt-1.5 text-[1.5rem] font-bold tracking-tight text-slate-950">
                    {formatCurrency(selectedMemberDetail.saldoPendienteTotal)}
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-3.5 py-3.5 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.7)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Ultimo pago
                  </p>
                  <p className="mt-1.5 text-[1.25rem] font-bold tracking-tight text-slate-950">
                    {formatDate(selectedMemberDetail.fechaUltimoPago)}
                  </p>
                </div>
              </div>

              <div className="mt-3.5 rounded-[20px] bg-[#111a33] px-3.5 py-3.5 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Estado proyectado
                </p>
                <p className="mt-1.5 text-sm leading-6 text-slate-100">
                  {selectedMemberDetail.habilitadoHasta
                    ? `Habilitado hasta ${formatDate(selectedMemberDetail.habilitadoHasta)}.`
                    : 'Aun no registra un pago que habilite.'}
                </p>
                {selectedMemberDetail.ultimoPeriodoPagado ? (
                  <p className="mt-1.5 text-xs text-slate-300 sm:text-sm">
                    Ultimo periodo pagado: {selectedMemberDetail.ultimoPeriodoPagado}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-12 text-center text-sm text-slate-500">
              Selecciona un colegiado para ver su detalle de cobranza.
            </div>
          )}
        </article>
      </section>

      <form onSubmit={handleSubmit} className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_0.7fr] xl:items-stretch">
        <article className="h-full rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                2. Conceptos del comprobante
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Configura cada item antes de incorporarlo al cobro.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClearDraft}
              className="rounded-2xl bg-cobalt-soft px-4 py-3 text-sm font-semibold text-cobalt transition hover:bg-[#dbe5ff]"
            >
              Limpiar
            </button>
          </div>

          {conceptsError ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {conceptsError}
            </div>
          ) : null}

          <div className="mt-5 rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#fbfcff_0%,#f6f9ff_100%)] p-5">
            <div className="grid gap-4 lg:grid-cols-3">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
                  Concepto
                </span>
                <select
                  value={selectedConceptId}
                  onChange={(event) => setSelectedConceptId(event.target.value)}
                  disabled={conceptsLoading}
                  className="mt-3 h-[68px] w-full rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 outline-none transition focus:border-cobalt"
                >
                  {concepts.map((concept) => (
                    <option key={concept.id} value={concept.id}>
                      {concept.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
                  Cantidad
                </span>
                <input
                  type="number"
                  min="1"
                  value={selectedConcept?.usaPeriodo ? selectedPeriods.length || 1 : quantity}
                  onChange={(event) => setQuantity(Number(event.target.value) || 1)}
                  disabled={!selectedConcept?.permiteCantidad || selectedConcept?.usaPeriodo}
                  className="mt-3 h-[68px] w-full rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 outline-none transition disabled:bg-slate-100 disabled:text-slate-400"
                />
              </label>

              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
                  Monto del concepto
                </span>
                <div className="mt-3 flex h-[68px] flex-col justify-center rounded-2xl border border-slate-200 bg-white px-5">
                  <p className="text-lg font-semibold text-slate-950">
                    {buildConceptAmountLabel(selectedConcept)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {buildConceptModeLabel(selectedConcept)}
                  </p>
                </div>
              </div>
            </div>

            {selectedConcept?.usaPeriodo ? (
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
                  Periodos del concepto
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {selectedMemberDetail?.periodosMensuales?.map((period) => (
                    <button
                      key={period.periodo}
                      type="button"
                      disabled={!period.selectable}
                      onClick={() => togglePeriod(period.periodo)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                        selectedPeriods.includes(period.periodo)
                          ? 'border-cobalt bg-cobalt-soft text-cobalt shadow-[inset_0_-2px_0_0_#1739a6]'
                          : periodToneByStatus[period.status] ?? 'border-slate-200 bg-white text-slate-600'
                      } ${!period.selectable ? 'cursor-not-allowed opacity-90' : 'hover:-translate-y-0.5'}`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
              <div className="flex flex-wrap gap-2">
                {buildConceptChips(selectedConcept).map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
                  >
                    {chip}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                disabled={!canAddItem}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                Agregar item
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {draftItems.map((item) => (
              <article
                key={item.id}
                className="rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-[0_12px_30px_-28px_rgba(15,23,42,0.65)]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-950">{item.concepto}</p>
                      <span className="rounded-full bg-cobalt-soft px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-cobalt">
                        {item.codigo}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{item.categoria}</p>
                    {item.periodos.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.periodos.map((period) => (
                          <span
                            key={`${item.id}-${period.periodo}`}
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              periodToneByStatus[period.status] ?? 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {period.label}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Total
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-950">
                        {formatCurrency(item.total)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDraftItem(item.id)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                    >
                      <Trash2 size={16} strokeWidth={2.1} />
                    </button>
                  </div>
                </div>
              </article>
            ))}

            {draftItems.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                Aun no agregaste items al borrador del comprobante.
              </div>
            ) : null}
          </div>
        </article>

        <article className="h-full rounded-[30px] border border-white/80 bg-[#111a33] p-4 text-white shadow-[0_18px_50px_-38px_rgba(15,23,42,0.9)] sm:p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white/10 p-3 text-white">
              <CalendarDays size={18} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-white">
                3. Confirmar y emitir
              </h2>
              <p className="mt-1 text-xs text-slate-300 sm:text-sm">
                Ultimos datos para cerrar la operacion.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3.5">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                Tipo de comprobante
              </span>
              <select
                value={documentType}
                onChange={(event) => setDocumentType(event.target.value)}
                className="mt-2.5 h-[52px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white outline-none transition focus:border-cobalt"
              >
                {documentOptions.map((option) => (
                  <option key={option.value} value={option.value} className="text-slate-900">
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                Fecha de emision
              </span>
              <input
                type="date"
                value={emissionDate}
                onChange={(event) => setEmissionDate(event.target.value)}
                className="mt-2.5 h-[52px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white outline-none transition focus:border-cobalt"
              />
            </label>

            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                Metodo de pago
              </span>
              <select
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                className="mt-2.5 h-[52px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white outline-none transition focus:border-cobalt"
              >
                {paymentOptions.map((option) => (
                  <option key={option.value} value={option.value} className="text-slate-900">
                    {option.value}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                Observaciones
              </span>
              <textarea
                value={observation}
                onChange={(event) => setObservation(event.target.value)}
                rows={3}
                placeholder="Detalle opcional para tesoreria"
                className="mt-2.5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-medium text-white outline-none transition placeholder:text-slate-400 focus:border-cobalt"
              />
            </label>

            {facturaBlocked ? (
              <div className="rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                Este colegiado no tiene RUC registrado. Para emitir factura primero debe completarse ese dato.
              </div>
            ) : null}

            {submitError ? (
              <div className="rounded-2xl border border-rose-300/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {submitError}
              </div>
            ) : null}
          </div>

          <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
              Resumen del cobro
            </p>
            <div className="mt-3.5 space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-300">Colegiado</span>
                <span className="text-right font-semibold text-white">
                  {selectedMemberDetail ? selectedMemberDetail.nombreCompleto : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-300">Items cargados</span>
                <span className="font-semibold text-white">{draftSummary.itemsCount}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-300">Subtotal</span>
                <span className="font-semibold text-white">{formatCurrency(draftSummary.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-base">
                <span className="font-semibold text-white">Total</span>
                <span className="font-semibold text-white">{formatCurrency(draftSummary.subtotal)}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !selectedMemberDetail || draftItems.length === 0 || facturaBlocked}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isSubmitting ? <LoaderCircle size={16} className="animate-spin" /> : null}
            Registrar cobro
          </button>
        </article>
      </form>

      {receipt ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[32px] border border-white/80 bg-white p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.85)] sm:p-7">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cobalt">
                  Cobro registrado
                </p>
                <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                  {receipt.tipoComprobante} {receipt.serie}-{String(receipt.numeroComprobante).padStart(7, '0')}
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  {receipt.colegiadoNombre} · {receipt.codigoColegiatura} · DNI {receipt.dni}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setReceipt(null)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-4">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Fecha de emision
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {formatDate(receipt.fechaEmision)}
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Metodo de pago
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{receipt.metodoPago}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Total
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {formatCurrency(receipt.total)}
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Estado de impresion
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
                    receipt.impreso ? 'bg-[#dbe5ff] text-cobalt' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {receipt.impreso ? 'Impreso' : 'No Impreso'}
                </span>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-200">
              <div className="grid grid-cols-[1.6fr_0.9fr_0.7fr_0.8fr_0.8fr] gap-4 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <span>Concepto</span>
                <span>Periodo</span>
                <span>Cantidad</span>
                <span>Monto unitario</span>
                <span>Total</span>
              </div>
              <div className="divide-y divide-slate-200 bg-white">
                {receipt.items.map((item, index) => (
                  <div
                    key={`${item.codigoConcepto}-${item.periodoReferencia ?? 'linea'}-${index}`}
                    className="grid grid-cols-[1.6fr_0.9fr_0.7fr_0.8fr_0.8fr] gap-4 px-5 py-4 text-sm"
                  >
                    <span className="font-semibold text-slate-900">{item.concepto}</span>
                    <span className="text-slate-600">{item.periodoReferencia ?? '-'}</span>
                    <span className="text-slate-600">{item.cantidad}</span>
                    <span className="text-slate-600">{formatCurrency(item.montoUnitario)}</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(item.totalLinea)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500">
                {receipt.observacion ? <p>Observacion: {receipt.observacion}</p> : <p>Sin observaciones registradas.</p>}
              </div>

              <button
                type="button"
                onClick={handlePrintReceipt}
                disabled={isPrintSaving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isPrintSaving ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Printer size={16} strokeWidth={2.1} />
                )}
                Imprimir
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default CobrosRegistrarPage
