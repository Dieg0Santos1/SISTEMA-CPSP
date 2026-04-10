import {
  CreditCard,
  FileSpreadsheet,
  UserPlus,
  Users,
} from 'lucide-react'

export const statCards = [
  {
    title: 'Total colegiados',
    value: '12,482',
    note: '+2.4%',
    helper: 'vs. el mes anterior',
    accent: 'border-cobalt',
    badgeTone: 'bg-cobalt-soft text-cobalt',
    icon: Users,
  },
  {
    title: 'Habilitados',
    value: '9,856',
    note: '79%',
    helper: 'del total institucional',
    accent: 'border-emerald-500',
    badgeTone: 'bg-emerald-100 text-emerald-600',
    icon: UserPlus,
  },
  {
    title: 'Inactivos',
    value: '2,626',
    note: '411',
    helper: 'en revision documental',
    accent: 'border-amber-700',
    badgeTone: 'bg-amber-100 text-amber-700',
    icon: FileSpreadsheet,
  },
  {
    title: 'Ingresos mensuales',
    value: 'S/ 142.5k',
    note: 'Meta 95%',
    helper: 'recaudacion acumulada',
    accent: 'border-indigo-600',
    badgeTone: 'bg-indigo-100 text-indigo-700',
    icon: CreditCard,
  },
]

export const chartBars = [
  { label: 'Ene', total: 16, filled: 8 },
  { label: 'Feb', total: 18, filled: 11 },
  { label: 'Mar', total: 17, filled: 10 },
  { label: 'Abr', total: 19, filled: 13 },
  { label: 'May', total: 16, filled: 7 },
  { label: 'Jun', total: 20, filled: 14 },
]

export const quickActions = [
  {
    title: 'Registrar colegiado',
    description: 'Alta de expediente y validacion inicial',
    primary: true,
    icon: UserPlus,
    path: '/colegiados',
  },
  {
    title: 'Registrar cobro',
    description: 'Aportaciones, boletas y conceptos',
    icon: CreditCard,
    path: '/caja-cobros',
  },
  {
    title: 'Generar reporte',
    description: 'Resumen por fechas o ingresos',
    icon: FileSpreadsheet,
  },
]

export const recentActivity = [
  {
    title: 'Dr. Carlos Mendoza',
    detail: 'Colegiatura habilitada exitosamente',
    time: 'Hace 12 min',
    tone: 'bg-emerald-100 text-emerald-600',
  },
  {
    title: 'S/ 450.00 recibidos',
    detail: 'Pago de cuotas ordinarias - Anual',
    time: 'Hace 45 min',
    tone: 'bg-indigo-100 text-indigo-600',
  },
  {
    title: 'Actualizacion de datos',
    detail: 'Cambio de domicilio fiscal - Sede Sur',
    time: 'Hace 2 h',
    tone: 'bg-slate-100 text-slate-500',
  },
]

export const upcomingCeremonies = [
  {
    code: '#EXP-2026-892',
    name: 'Lic. Ana Paula Ruiz',
    specialty: 'Clinica / Infantil',
    date: '15 Jul 2026',
  },
  {
    code: '#EXP-2026-895',
    name: 'Lic. Mateo San Roman',
    specialty: 'Organizacional',
    date: '15 Jul 2026',
  },
  {
    code: '#EXP-2026-901',
    name: 'Lic. Elena Valdivia',
    specialty: 'Educativa',
    date: '22 Jul 2026',
  },
]
