import {
  Bell,
  ChevronRight,
  CircleHelp,
  LogOut,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { navigationItems, sidebarFooterItems } from '../data/dashboardData'

function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#dce6ff_0%,#edf3ff_14%,#f6f8fe_100%)] p-3 text-slate-900 sm:p-4">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1480px] overflow-hidden rounded-[34px] border border-white/[0.7] bg-white/[0.65] shadow-[0_30px_120px_-48px_rgba(30,64,175,0.48)] backdrop-blur-xl">
        <aside className="hidden w-[270px] shrink-0 border-r border-slate-200/80 bg-[linear-gradient(180deg,#f7f9ff_0%,#f9fbff_100%)] px-5 py-6 lg:flex lg:flex-col">
          <div className="flex items-center gap-3 rounded-3xl bg-white px-4 py-3 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
              <ShieldCheck size={22} strokeWidth={2.2} />
            </div>

            <div>
              <p className="text-xl font-bold tracking-tight text-cobalt">C.P.L. Admin</p>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
                Clinical Archive
              </p>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {navigationItems.map(({ label, icon: Icon, path }) =>
              path ? (
                <NavLink
                  key={label}
                  to={path}
                  className={({ isActive }) =>
                    `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-medium transition ${
                      isActive
                        ? 'bg-cobalt-soft text-cobalt shadow-[0_10px_24px_-18px_rgba(30,64,175,0.8)]'
                        : 'text-slate-600 hover:bg-white hover:text-slate-900'
                    }`
                  }
                >
                  <Icon size={18} strokeWidth={2.2} />
                  <span>{label}</span>
                </NavLink>
              ) : (
                <button
                  key={label}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
                >
                  <Icon size={18} strokeWidth={2.2} />
                  <span>{label}</span>
                </button>
              ),
            )}
          </nav>

          <div className="mt-auto space-y-2 pt-8">
            {sidebarFooterItems.map(({ label, icon: Icon, tone }) => (
              <button
                key={label}
                type="button"
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-medium transition ${
                  tone === 'danger'
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                {Icon ? <Icon size={18} strokeWidth={2.2} /> : <LogOut size={18} strokeWidth={2.2} />}
                <span>{label}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200/80 bg-white/[0.7] px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-1 items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 lg:hidden"
                >
                  <ChevronRight size={18} />
                </button>

                <label className="group flex w-full max-w-3xl items-center gap-3 rounded-2xl border border-transparent bg-slate-100/90 px-4 py-3 transition focus-within:border-cobalt focus-within:bg-white">
                  <Search size={18} className="text-slate-400 transition group-focus-within:text-cobalt" />
                  <input
                    type="search"
                    placeholder="Buscar colegiado, DNI o expediente..."
                    className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between gap-4 xl:justify-end">
                <div className="flex items-center gap-2">
                  {[Bell, CircleHelp].map((Icon, index) => (
                    <button
                      key={index}
                      type="button"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:-translate-y-0.5 hover:text-cobalt"
                    >
                      <Icon size={18} strokeWidth={2.1} />
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">Admin Principal</p>
                    <p className="text-xs text-slate-500">Perfil Usuario</p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_100%)] text-sm font-bold text-white">
                    AP
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-7">{children}</main>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
