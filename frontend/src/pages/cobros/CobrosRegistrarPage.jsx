import { useMemo, useState } from 'react'
import {
  CalendarDays,
  Circle,
  FileText,
  Plus,
  Search,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react'
import {
  cobrosConceptCatalog,
  cobrosDocumentTypes,
  cobrosDraftItems,
  cobrosMemberDirectory,
  cobrosOrigins,
  cobrosPaymentMethods,
  cobrosPeriodOptions,
} from '../../data/cobros/cobrosData'

function formatCurrency(value) {
  return `S/ ${value.toFixed(2)}`
}

function CobrosRegistrarPage() {
  const [memberSearch, setMemberSearch] = useState('')
  const [selectedMemberId, setSelectedMemberId] = useState(cobrosMemberDirectory[0]?.id ?? '')
  const [selectedDocumentType, setSelectedDocumentType] = useState(cobrosDocumentTypes[0])
  const [selectedOrigin, setSelectedOrigin] = useState(cobrosOrigins[0])
  const [selectedMethod, setSelectedMethod] = useState(
    cobrosPaymentMethods.find((method) => method.active)?.label ??
      cobrosPaymentMethods[0]?.label ??
      '',
  )
  const [selectedConceptId, setSelectedConceptId] = useState(cobrosConceptCatalog[0]?.id ?? '')
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [selectedPeriods, setSelectedPeriods] = useState(['Abr 2026', 'May 2026'])
  const [invoiceItems, setInvoiceItems] = useState(cobrosDraftItems)
  const [observation, setObservation] = useState('Operacion de caja principal')

  const filteredMembers = useMemo(() => {
    const normalizedSearch = memberSearch.trim().toLowerCase()

    if (!normalizedSearch) {
      return cobrosMemberDirectory
    }

    return cobrosMemberDirectory.filter((member) =>
      [member.name, member.code, member.dni].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      ),
    )
  }, [memberSearch])

  const selectedMember =
    cobrosMemberDirectory.find((member) => member.id === selectedMemberId) ??
    cobrosMemberDirectory[0]

  const selectedConcept = useMemo(
    () => cobrosConceptCatalog.find((concept) => concept.id === selectedConceptId),
    [selectedConceptId],
  )

  const totals = useMemo(() => {
    return invoiceItems.reduce(
      (summary, item) => {
        const gross = item.unitAmount * item.quantity
        const total = gross - item.discount + item.mora

        return {
          subtotal: summary.subtotal + gross,
          discounts: summary.discounts + item.discount,
          mora: summary.mora + item.mora,
          total: summary.total + total,
        }
      },
      { subtotal: 0, discounts: 0, mora: 0, total: 0 },
    )
  }, [invoiceItems])

  const projectedState = useMemo(() => {
    const affectsHabilitation = invoiceItems.some((item) => item.affectsHabilitation)

    if (totals.total === 0) {
      return 'Sin impacto hasta agregar conceptos al comprobante.'
    }

    return affectsHabilitation
      ? 'La operacion regulariza conceptos con impacto en habilitacion.'
      : 'La operacion es administrativa y no modifica habilitacion.'
  }, [invoiceItems, totals.total])

  const togglePeriod = (period) => {
    setSelectedPeriods((currentPeriods) =>
      currentPeriods.includes(period)
        ? currentPeriods.filter((currentPeriod) => currentPeriod !== period)
        : [...currentPeriods, period],
    )
  }

  const addConceptToInvoice = () => {
    if (!selectedConcept) {
      return
    }

    const quantity = selectedConcept.requiresPeriod
      ? Math.max(selectedPeriods.length, 1)
      : Math.max(selectedQuantity, 1)

    const newItem = {
      id: `invoice-${Date.now()}`,
      conceptId: selectedConcept.id,
      code: selectedConcept.code,
      concept: selectedConcept.name,
      category: selectedConcept.category,
      periodLabel: selectedConcept.requiresPeriod ? selectedPeriods.join(', ') : '-',
      quantity,
      unitAmount: selectedConcept.baseAmount,
      discount: selectedConcept.defaultDiscount,
      mora: selectedConcept.defaultMora,
      affectsHabilitation: selectedConcept.affectsHabilitation,
    }

    setInvoiceItems((currentItems) => [...currentItems, newItem])

    if (!selectedConcept.requiresPeriod) {
      setSelectedQuantity(1)
    }
  }

  const removeInvoiceItem = (itemId) => {
    setInvoiceItems((currentItems) => currentItems.filter((item) => item.id !== itemId))
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Registrar cobro
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Flujo enfocado para cerrar una operacion: selecciona al colegiado, arma el
              comprobante y confirma la emision.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                step: 'Paso 1',
                title: 'Seleccionar colegiado',
                tone: 'border-cobalt bg-cobalt-soft text-cobalt',
              },
              {
                step: 'Paso 2',
                title: 'Agregar conceptos',
                tone: 'border-slate-200 bg-slate-50 text-slate-700',
              },
              {
                step: 'Paso 3',
                title: 'Confirmar y emitir',
                tone: 'border-slate-200 bg-slate-50 text-slate-700',
              },
            ].map((stepCard) => (
              <article
                key={stepCard.step}
                className={`rounded-[22px] border px-4 py-4 ${stepCard.tone}`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                  {stepCard.step}
                </p>
                <p className="mt-2 text-sm font-semibold">{stepCard.title}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_360px]">
        <div className="space-y-5">
          <article className="rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-slate-950">
                  1. Seleccion del colegiado
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Busca por nombre, codigo institucional o DNI.
                </p>
              </div>

              <label className="group flex w-full max-w-md items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-cobalt focus-within:bg-white">
                <Search
                  size={18}
                  className="text-slate-400 transition group-focus-within:text-cobalt"
                />
                <input
                  type="search"
                  value={memberSearch}
                  onChange={(event) => setMemberSearch(event.target.value)}
                  placeholder="Buscar colegiado"
                  className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {filteredMembers.map((member) => {
                const isActive = member.id === selectedMember?.id

                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setSelectedMemberId(member.id)}
                    className={`rounded-[24px] border px-5 py-5 text-left transition ${
                      isActive
                        ? 'border-cobalt bg-[#f6f9ff] shadow-[0_18px_34px_-28px_rgba(30,64,175,0.65)]'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cobalt-soft text-lg font-bold text-cobalt">
                        {member.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold tracking-tight text-slate-950">
                            {member.name}
                          </p>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
                              member.debtAmount > 0
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {member.statusLabel}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {member.code} · DNI {member.dni}
                        </p>
                        <p className="mt-3 text-sm text-slate-600">{member.segment}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                          <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                            Pendientes: {member.pendingItems}
                          </span>
                          <span className="font-semibold text-slate-900">
                            Saldo {member.debtLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </article>

          <article className="rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-6">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-slate-950">
                  2. Conceptos del comprobante
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Configura cada item antes de incorporarlo al cobro.
                </p>
              </div>

              <div className="rounded-2xl bg-cobalt-soft px-4 py-3 text-sm font-semibold text-cobalt">
                Borrador listo para edicion
              </div>
            </div>

            <div className="mt-5 rounded-[26px] border border-slate-200 bg-[linear-gradient(180deg,#fbfcff_0%,#f6f9ff_100%)] p-5">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_160px_220px]">
                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                    Concepto
                  </span>
                  <select
                    value={selectedConceptId}
                    onChange={(event) => setSelectedConceptId(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-cobalt"
                  >
                    {cobrosConceptCatalog.map((concept) => (
                      <option key={concept.id} value={concept.id}>
                        {concept.name} · {formatCurrency(concept.baseAmount)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                    Cantidad
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={selectedQuantity}
                    disabled={!selectedConcept?.allowsQuantity || selectedConcept?.requiresPeriod}
                    onChange={(event) => setSelectedQuantity(Number(event.target.value))}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-cobalt disabled:cursor-not-allowed disabled:bg-slate-100"
                  />
                </label>

                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                    Regla del concepto
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {selectedConcept?.billingMode ?? 'Monto fijo'}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedConcept?.affectsHabilitation
                      ? 'Impacta habilitacion'
                      : 'No impacta habilitacion'}
                  </p>
                </div>
              </div>

              {selectedConcept?.requiresPeriod ? (
                <div className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                    Periodos del concepto
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {cobrosPeriodOptions.map((period) => {
                      const isActive = selectedPeriods.includes(period)

                      return (
                        <button
                          key={period}
                          type="button"
                          onClick={() => togglePeriod(period)}
                          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                            isActive
                              ? 'bg-cobalt-soft text-cobalt shadow-[inset_0_-2px_0_0_#1739a6]'
                              : 'bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {period}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <span className="rounded-full bg-white px-3 py-2">
                    {selectedConcept?.category}
                  </span>
                  <span className="rounded-full bg-white px-3 py-2">
                    {selectedConcept?.exoneratedIgv ? 'Exonerado IGV' : 'Afecto IGV'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={addConceptToInvoice}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-24px_rgba(30,64,175,0.95)] transition hover:-translate-y-0.5"
                >
                  <Plus size={16} strokeWidth={2.2} />
                  Agregar item
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {invoiceItems.map((item) => {
                const lineGross = item.unitAmount * item.quantity
                const lineTotal = lineGross - item.discount + item.mora

                return (
                  <article
                    key={item.id}
                    className="rounded-[24px] border border-slate-200 bg-white p-4"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900">{item.concept}</p>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-600">
                            {item.category}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.code} · Periodo: {item.periodLabel}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right text-sm">
                          <p className="font-semibold text-slate-900">
                            {formatCurrency(lineTotal)}
                          </p>
                          <p className="mt-1 text-slate-500">
                            {item.quantity} x {formatCurrency(item.unitAmount)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeInvoiceItem(item.id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                        >
                          <X size={16} strokeWidth={2.1} />
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </article>
        </div>

        <div className="space-y-5">
          <article className="rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)]">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-cobalt-soft p-3 text-cobalt">
                <UserRound size={18} strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-slate-950">
                  Colegiado seleccionado
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Resumen minimo para registrar sin distraer el flujo.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-cobalt bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] p-4">
              <p className="text-lg font-semibold tracking-tight text-slate-950">
                {selectedMember?.name}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {selectedMember?.code} · DNI {selectedMember?.dni}
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Saldo pendiente
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {selectedMember?.debtLabel}
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Ultimo pago
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {selectedMember?.lastPayment}
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-2xl bg-slate-900 px-4 py-3 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                  Estado proyectado
                </p>
                <p className="mt-2 text-sm leading-6">{projectedState}</p>
              </div>
            </div>
          </article>

          <article className="rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,#0f172a_0%,#1e40af_100%)] p-5 text-white shadow-[0_24px_50px_-36px_rgba(15,23,42,0.85)]">
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-2xl bg-white/[0.12] p-3">
                <FileText size={18} strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-xl font-semibold tracking-tight">
                  3. Confirmar y emitir
                </h3>
                <p className="mt-1 text-sm text-blue-100">
                  Ultimos datos para cerrar la operacion.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-blue-100/80">
                  Tipo de comprobante
                </span>
                <select
                  value={selectedDocumentType}
                  onChange={(event) => setSelectedDocumentType(event.target.value)}
                  className="w-full rounded-2xl border border-white/12 bg-white/[0.08] px-4 py-3 text-sm font-medium text-white outline-none transition focus:border-white/30"
                >
                  {cobrosDocumentTypes.map((documentType) => (
                    <option key={documentType} value={documentType} className="text-slate-900">
                      {documentType}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-blue-100/80">
                  Fecha de emision
                </span>
                <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.08] px-4 py-3">
                  <CalendarDays size={16} className="text-blue-100" />
                  <input
                    type="date"
                    defaultValue="2026-04-10"
                    className="w-full bg-transparent text-sm font-medium text-white outline-none"
                  />
                </div>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-blue-100/80">
                  Origen
                </span>
                <select
                  value={selectedOrigin}
                  onChange={(event) => setSelectedOrigin(event.target.value)}
                  className="w-full rounded-2xl border border-white/12 bg-white/[0.08] px-4 py-3 text-sm font-medium text-white outline-none transition focus:border-white/30"
                >
                  {cobrosOrigins.map((origin) => (
                    <option key={origin} value={origin} className="text-slate-900">
                      {origin}
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-100/80">
                  Metodo de pago
                </p>
                <div className="mt-3 space-y-3">
                  {cobrosPaymentMethods.map((method) => {
                    const isActive = selectedMethod === method.label

                    return (
                      <button
                        key={method.label}
                        type="button"
                        onClick={() => setSelectedMethod(method.label)}
                        className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                          isActive
                            ? 'bg-white text-cobalt'
                            : 'bg-white/[0.08] text-white hover:bg-white/[0.14]'
                        }`}
                      >
                        <Circle
                          size={14}
                          className={isActive ? 'fill-cobalt text-cobalt' : 'text-blue-100'}
                        />
                        <span>{method.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-blue-100/80">
                  Observacion
                </span>
                <textarea
                  value={observation}
                  onChange={(event) => setObservation(event.target.value)}
                  rows="3"
                  className="w-full rounded-2xl border border-white/12 bg-white/[0.08] px-4 py-3 text-sm font-medium text-white outline-none transition focus:border-white/30"
                />
              </label>
            </div>

            <div className="mt-6 space-y-3 rounded-[22px] border border-white/10 bg-white/[0.08] p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-blue-100">Subtotal</span>
                <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-blue-100">Descuentos</span>
                <span className="font-semibold">{formatCurrency(totals.discounts)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-blue-100">Mora</span>
                <span className="font-semibold">{formatCurrency(totals.mora)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-base">
                <span>Total</span>
                <span className="text-xl font-bold">{formatCurrency(totals.total)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                disabled={!selectedMember || invoiceItems.length === 0}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-cobalt transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-white/60"
              >
                <WalletCards size={16} strokeWidth={2.2} />
                Registrar cobro
              </button>
              <button
                type="button"
                disabled={!selectedMember || invoiceItems.length === 0}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/14 bg-white/[0.08] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.14] disabled:cursor-not-allowed disabled:bg-white/[0.05]"
              >
                <FileText size={16} strokeWidth={2.2} />
                Emitir comprobante
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}

export default CobrosRegistrarPage
