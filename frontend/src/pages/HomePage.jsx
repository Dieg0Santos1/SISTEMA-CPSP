import {
  BarChart3,
  CalendarDays,
  FileBadge2,
  FolderKanban,
  Landmark,
  Scale,
  ShieldCheck,
  Users,
} from 'lucide-react'

const modules = [
  {
    name: 'Colegiados',
    description: 'Registro, edicion, historial y especialidades de cada profesional.',
    icon: Users,
  },
  {
    name: 'Pagos y boletas',
    description: 'Aportaciones, metodos de pago, historial y control de boletas.',
    icon: Landmark,
  },
  {
    name: 'Reportes',
    description: 'Consultas administrativas por fechas, ingresos y estado operativo.',
    icon: BarChart3,
  },
  {
    name: 'Consulta publica',
    description: 'Busqueda externa de colegiados y validacion de habilitacion.',
    icon: ShieldCheck,
  },
  {
    name: 'Eventos',
    description: 'Programacion, asistentes y control operativo por actividad.',
    icon: CalendarDays,
  },
  {
    name: 'Inventario',
    description: 'Materiales, stock, ventas y movimientos internos.',
    icon: FolderKanban,
  },
  {
    name: 'Elecciones',
    description: 'Validacion de votantes y administracion de mesas electorales.',
    icon: FileBadge2,
  },
  {
    name: 'Tribunal de honor',
    description: 'Denuncias, seguimiento de casos y registro de sentencias.',
    icon: Scale,
  },
]

function HomePage() {
  return (
    <main className="min-h-screen px-6 py-10 text-slate-900 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="rounded-[28px] border border-white/60 bg-white/80 p-8 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-700">
                Base inicial del frontend en dev
              </span>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  Sistema CPSP
                </h1>
                <p className="text-base leading-7 text-slate-600 sm:text-lg">
                  Frontend listo para crecer por modulos con React, Vite, Tailwind
                  y React Router.
                </p>
              </div>
            </div>

            <div className="grid gap-3 rounded-3xl bg-slate-900 p-5 text-slate-50 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-300">Stack</p>
                <p className="text-lg font-semibold">React + Vite + Tailwind</p>
              </div>
              <div>
                <p className="text-sm text-slate-300">Enrutado</p>
                <p className="text-lg font-semibold">React Router</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {modules.map((module) => {
            const IconComponent = module.icon

            return (
              <article
                key={module.name}
                className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 inline-flex rounded-2xl bg-sky-50 p-3 text-sky-700">
                  <IconComponent size={24} strokeWidth={2} />
                </div>
                <h2 className="mb-2 text-xl font-semibold tracking-tight">
                  {module.name}
                </h2>
                <p className="text-sm leading-6 text-slate-600">
                  {module.description}
                </p>
              </article>
            )
          })}
        </section>
      </div>
    </main>
  )
}

export default HomePage
