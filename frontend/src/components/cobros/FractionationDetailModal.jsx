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

function buildFractionationReference(cuota, totalInstallments) {
  if (!cuota) {
    return ''
  }

  return `Cuota ${cuota.numeroCuota}/${totalInstallments}`
}

const fractionationStateToneMap = {
  ACTIVO: 'bg-fuchsia-100 text-fuchsia-700',
  PAGADO: 'bg-emerald-100 text-emerald-700',
  ANULADO: 'bg-slate-200 text-slate-600',
}

function FractionationDetailModal({ fractionation, memberName, memberCode, onClose }) {
  if (!fractionation) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[32px] border border-white/80 bg-white p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.85)] sm:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cobalt">
              Fraccionamiento
            </p>
            <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {fractionation.estado === 'ACTIVO'
                ? 'Detalle del convenio activo'
                : 'Detalle del fraccionamiento'}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {memberName} · {memberCode}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
          >
            Cerrar
          </button>
        </div>

        <div className="mt-5 space-y-5">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Estado
              </p>
              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
                  fractionationStateToneMap[fractionation.estado] ?? 'bg-slate-100 text-slate-700'
                }`}
              >
                {fractionation.estado}
              </span>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Total refinanciado
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {formatCurrency(fractionation.montoTotal)}
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Cuotas
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {fractionation.cuotasPagadas}/{fractionation.numeroCuotas}
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Saldo pendiente
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {formatCurrency(fractionation.saldoPendiente)}
              </p>
            </div>
          </div>

          {fractionation.periodosIncluidos?.length ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Periodos incluidos
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {fractionation.periodosIncluidos.map((periodo) => (
                  <span
                    key={periodo}
                    className="rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-semibold text-fuchsia-700"
                  >
                    {periodo}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="overflow-hidden rounded-[24px] border border-slate-200">
            <div className="grid grid-cols-[0.8fr_1fr_1fr_1fr] gap-4 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <span>Cuota</span>
              <span>Monto</span>
              <span>Mes de cuota</span>
              <span>Estado</span>
            </div>
            <div className="divide-y divide-slate-200 bg-white">
              {fractionation.cuotas?.map((cuota) => (
                <div
                  key={cuota.id}
                  className="grid grid-cols-[0.8fr_1fr_1fr_1fr] gap-4 px-5 py-4 text-sm"
                >
                  <span className="font-semibold text-slate-950">
                    {buildFractionationReference(cuota, fractionation.numeroCuotas)}
                  </span>
                  <span className="text-slate-600">{formatCurrency(cuota.monto)}</span>
                  <span className="text-slate-600">{formatDate(cuota.fechaVencimiento)}</span>
                  <span>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${
                        cuota.pagada
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {cuota.pagada ? 'Pagada' : 'Pendiente'}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FractionationDetailModal
