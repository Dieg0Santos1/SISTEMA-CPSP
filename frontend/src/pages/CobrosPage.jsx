import { ChevronRight, Clock3, Receipt, WalletCards } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { cobrosModuleTabs } from '../data/cobros/cobrosData'

function CobrosPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-white/80 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_58%,#eef4ff_100%)] p-6 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.7)] sm:p-7">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-5">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>Panel</span>
                <ChevronRight size={14} />
                <span className="font-semibold text-cobalt">Caja y Cobros</span>
              </div>

              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Caja y Cobros
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                Modulo principal de tesoreria para monitorear caja, registrar operaciones,
                gestionar pendientes y controlar comprobantes sin concentrarlo todo en una
                sola pantalla.
              </p>
            </div>

            <div className="overflow-x-auto rounded-[24px] border border-slate-200 bg-white p-2">
              <div className="inline-flex min-w-full gap-2">
                {cobrosModuleTabs.map((tab) => (
                  <NavLink
                    key={tab.path}
                    to={tab.path}
                    end
                    className={({ isActive }) =>
                      `inline-flex min-w-max items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        isActive
                          ? 'bg-[linear-gradient(135deg,#1739a6_0%,#204edc_100%)] text-white shadow-[0_16px_32px_-24px_rgba(30,64,175,0.95)]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    {tab.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <article className="rounded-[24px] border border-slate-200 bg-white px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-cobalt-soft p-3 text-cobalt">
                  <WalletCards size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Operacion
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    Registro guiado de cobro
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-[24px] border border-slate-200 bg-white px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                  <Clock3 size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Seguimiento
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    Pendientes y vencimientos
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-[24px] border border-slate-200 bg-white px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                  <Receipt size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Emision
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    Historial y comprobantes
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <Outlet />
    </div>
  )
}

export default CobrosPage
