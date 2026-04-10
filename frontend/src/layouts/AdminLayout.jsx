import { createElement, useState } from 'react'
import {
  Bell,
  CircleHelp,
  LogOut,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import useSession from '../hooks/useSession'
import {
  navigationItems,
  sidebarFooterItems,
} from '../data/navigation/navigationData'

const headerActions = [
  { label: 'Notificaciones', icon: Bell },
  { label: 'Ayuda', icon: CircleHelp },
]

function SidebarContent({ onNavigate }) {
  return (
    <>
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
        {navigationItems.map((item) => {
          const iconElement = createElement(item.icon, {
            size: 18,
            strokeWidth: 2.2,
          })

          if (item.path) {
            return (
              <NavLink
                key={item.label}
                to={item.path}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-medium transition ${
                    isActive
                      ? 'bg-cobalt-soft text-cobalt shadow-[0_10px_24px_-18px_rgba(30,64,175,0.8)]'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`
                }
              >
                {iconElement}
                <span>{item.label}</span>
              </NavLink>
            )
          }

          return (
            <button
              key={item.label}
              type="button"
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-medium text-slate-600 transition hover:bg-white hover:text-slate-900"
            >
              {iconElement}
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="mt-auto space-y-2 pt-8">
        {sidebarFooterItems.map((item) => {
          const footerIcon = item.icon
            ? createElement(item.icon, { size: 18, strokeWidth: 2.2 })
            : <LogOut size={18} strokeWidth={2.2} />

          return (
            <button
              key={item.label}
              type="button"
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-medium transition ${
                item.tone === 'danger'
                  ? 'text-red-600 hover:bg-red-50'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              {footerIcon}
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </>
  )
}

function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user } = useSession()
  const displayName = user.fullName.split(' ')[0] ?? user.fullName

  return (
    <div className="h-screen overflow-hidden bg-[linear-gradient(180deg,#dce6ff_0%,#edf3ff_14%,#f6f8fe_100%)] p-3 text-slate-900 sm:p-4">
      {isSidebarOpen ? (
        <div className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menu lateral"
            className="absolute inset-0"
            onClick={() => setIsSidebarOpen(false)}
          />

          <aside className="absolute left-0 top-0 flex h-full w-[290px] flex-col border-r border-slate-300/70 bg-[linear-gradient(180deg,#eef4ff_0%,#e8f0ff_46%,#edf3ff_100%)] px-5 py-6 shadow-[0_28px_80px_-36px_rgba(15,23,42,0.75)]">
            <div className="mb-6 flex items-center justify-end">
              <button
                type="button"
                aria-label="Cerrar menu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X size={18} strokeWidth={2.1} />
              </button>
            </div>

            <SidebarContent onNavigate={() => setIsSidebarOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="mx-auto flex h-full max-w-[1480px] overflow-hidden rounded-[34px] border border-white/[0.82] bg-[#f6f8fe] shadow-[0_24px_80px_-44px_rgba(30,64,175,0.42)]">
        <aside className="hidden h-full w-[270px] shrink-0 overflow-y-auto border-r border-slate-300/70 bg-[linear-gradient(180deg,#eef4ff_0%,#e8f0ff_46%,#edf3ff_100%)] px-5 py-6 shadow-[inset_-1px_0_0_rgba(148,163,184,0.14)] lg:flex lg:flex-col">
          <SidebarContent />
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[linear-gradient(180deg,#f8fbff_0%,#fdfdff_100%)]">
          <header className="border-b border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(244,247,255,0.96)_100%)] px-4 py-2.5 shadow-[0_12px_26px_-28px_rgba(15,23,42,0.42)] sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-1 items-start gap-3">
                <button
                  type="button"
                  aria-label="Abrir menu lateral"
                  className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 lg:hidden"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu size={18} />
                </button>

                <div className="w-full max-w-4xl py-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Panel de trabajo
                  </p>
                  <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <h2 className="text-[1.65rem] font-semibold tracking-tight text-slate-950 sm:text-[1.8rem]">
                      Hola, {displayName}
                    </h2>
                    <p className="text-[1.65rem] font-semibold tracking-tight text-cobalt sm:text-[1.8rem]">
                      Que haremos hoy...?
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 xl:justify-end">
                <div className="flex items-center gap-2">
                  {headerActions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      aria-label={action.label}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:-translate-y-0.5 hover:text-cobalt"
                    >
                      {createElement(action.icon, { size: 18, strokeWidth: 2.1 })}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-1 shadow-sm">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{user.fullName}</p>
                    <p className="text-xs text-slate-500">{user.roleLabel}</p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_100%)] text-sm font-bold text-white">
                    {user.initials}
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,#f7faff_0%,#ffffff_18%,#fcfdff_100%)] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
