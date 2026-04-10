import {
  BarChart3,
  CalendarDays,
  CreditCard,
  FileSpreadsheet,
  FolderKanban,
  Gavel,
  Home,
  Settings,
  UserPlus,
  Users,
  Vote,
} from 'lucide-react'

export const navigationItems = [
  { label: 'Dashboard', icon: Home, path: '/' },
  { label: 'Colegiados', icon: Users, path: '/colegiados' },
  { label: 'Pagos', icon: CreditCard, path: '/pagos' },
  { label: 'Reportes', icon: BarChart3 },
  { label: 'Eventos', icon: CalendarDays },
  { label: 'Inventario', icon: FolderKanban },
  { label: 'Elecciones', icon: Vote },
  { label: 'Tribunal', icon: Gavel, path: '/tribunal' },
]

export const sidebarFooterItems = [
  { label: 'Ajustes', icon: Settings },
  { label: 'Cerrar sesion', icon: null, tone: 'danger' },
]

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
    title: 'Nuevo pago',
    description: 'Aportacion, boleta o constancia',
    icon: CreditCard,
    path: '/pagos',
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

export const colegiadosSummaryCards = [
  {
    title: 'Total registrados',
    value: '12,482',
    note: '+124 este mes',
    accent: 'border-cobalt',
    noteTone: 'text-emerald-600',
  },
  {
    title: 'Habilitados',
    value: '11,204',
    note: '89.7% del padron total',
    accent: 'border-emerald-500',
    noteTone: 'text-slate-500',
  },
  {
    title: 'Deuda pendiente',
    value: '1,278',
    note: 'Accion requerida',
    accent: 'border-red-500',
    noteTone: 'text-red-500',
  },
]

export const colegiadosFilters = [
  'Todos',
  'Habilitados',
  'No Habilitados',
  'Por Habilitar',
]

export const colegiadosRows = [
  {
    code: 'CPL-45091',
    dni: '44521098',
    name: 'Alondra Valdivia Sanchez',
    initials: 'AV',
    avatarTone: 'bg-[#2b49ba]',
    specialty: 'Clinica y Salud Mental',
    status: 'Habilitado',
    statusTone: 'bg-emerald-100 text-emerald-700',
  },
  {
    code: 'CPL-22874',
    dni: '10293847',
    name: 'Roberto Caceres Mendoza',
    initials: 'RC',
    avatarTone: 'bg-[#c6cdf6] text-[#3b50ba]',
    specialty: 'Psicologia Forense',
    status: 'No Habilitado',
    statusTone: 'bg-red-100 text-red-600',
  },
  {
    code: 'CPL-33104',
    dni: '77218394',
    name: 'Maria Lopez Villacorta',
    initials: 'ML',
    avatarTone: 'bg-[#914414]',
    specialty: 'Neuropsicologia',
    status: 'Habilitado',
    statusTone: 'bg-emerald-100 text-emerald-700',
  },
  {
    code: 'CPL-45912',
    dni: '40392817',
    name: 'Juan Perez Garcia',
    initials: 'JP',
    avatarTone: 'bg-[#3758cb]',
    specialty: 'Psicologia Organizacional',
    status: 'Por Habilitar',
    statusTone: 'bg-[#d8e4ff] text-cobalt',
  },
]

export const colegiadosPagination = ['1', '2', '3', '...', '1249']

export const pagosMemberCard = {
  initials: 'JS',
  name: 'Javier Salazar Ruiz',
  code: 'C.P.L. 12845-A',
  statusLabel: 'Habilitado',
  debt: 'S/ 120.00',
}

export const pagosDueItems = [
  { month: 'Octubre 2023', amount: 'S/ 40.00' },
  { month: 'Noviembre 2023', amount: 'S/ 40.00' },
  { month: 'Diciembre 2023', amount: 'S/ 40.00' },
]

export const pagosMonths = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Oct',
  'Nov',
  'Dic',
]

export const pagosSelectedMonths = ['Oct', 'Nov', 'Dic']

export const pagosMethods = [
  { label: 'Efectivo', active: true },
  { label: 'Transferencia' },
  { label: 'POS / Tarjeta' },
]

export const pagosHistoryRows = [
  {
    id: '#772183',
    date: '15 Sep 2023, 10:45 AM',
    concept: 'Cuotas Jul - Set 2023',
    method: 'Transferencia',
    methodTone: 'bg-[#dbe5ff] text-[#4d63c2]',
    amount: 'S/ 120.00',
  },
  {
    id: '#769942',
    date: '12 Jun 2023, 03:20 PM',
    concept: 'Cuotas Abr - Jun 2023',
    method: 'Efectivo',
    methodTone: 'bg-[#e5ecff] text-cobalt',
    amount: 'S/ 120.00',
  },
  {
    id: '#761508',
    date: '05 Mar 2023, 09:10 AM',
    concept: 'Cuotas Ene - Mar 2023',
    method: 'POS / Tarjeta',
    methodTone: 'bg-slate-100 text-slate-600',
    amount: 'S/ 120.00',
  },
]

export const tribunalSummaryCards = [
  {
    title: 'Total activos',
    value: '124',
    accent: 'border-cobalt',
    iconTone: 'text-cobalt',
    icon: FileSpreadsheet,
  },
  {
    title: 'En audiencia',
    value: '18',
    accent: 'border-amber-500',
    iconTone: 'text-amber-500',
    icon: Gavel,
  },
  {
    title: 'Sentenciados',
    value: '42',
    accent: 'border-emerald-500',
    iconTone: 'text-emerald-500',
    icon: Vote,
  },
  {
    title: 'Archivados',
    value: '64',
    accent: 'border-slate-300',
    iconTone: 'text-slate-500',
    icon: FolderKanban,
  },
]

export const tribunalCases = [
  {
    code: 'TH-2024-0082',
    registeredAt: 'Registrado: 12 Oct 2023',
    person: 'Dra. Claudia Espinoza M.',
    detail: 'vs. Institucion Educativa Los Alamos',
    initials: 'CE',
    avatarTone: 'bg-[#e8f0ff] text-cobalt',
    status: 'En Investigacion',
    statusTone: 'bg-[#fff0c8] text-[#a26400]',
    lastAction: 'Recepcion de pruebas',
    actionDate: 'Hace 2 dias',
  },
  {
    code: 'TH-2023-0145',
    registeredAt: 'Registrado: 04 Jun 2023',
    person: 'Lic. Roberto Carranza T.',
    detail: 'Queja por mala praxis etica',
    initials: 'RC',
    avatarTone: 'bg-[#edf2ff] text-cobalt',
    status: 'Audiencia',
    statusTone: 'bg-[#dbe7ff] text-cobalt',
    lastAction: 'Citacion a comparendo',
    actionDate: 'Manana, 09:00 AM',
  },
  {
    code: 'TH-2023-0091',
    registeredAt: 'Registrado: 15 Mar 2023',
    person: 'Ps. Martha Velasquez',
    detail: 'Denuncia por competencia desleal',
    initials: 'MV',
    avatarTone: 'bg-[#eefcf3] text-[#14804a]',
    status: 'Sentencia',
    statusTone: 'bg-[#d7f8e5] text-[#14804a]',
    lastAction: 'Resolucion N° 452-CPL',
    actionDate: 'Hace 1 semana',
  },
  {
    code: 'TH-2022-0312',
    registeredAt: 'Registrado: 02 Dic 2022',
    person: 'Dr. Sergio Gonzales P.',
    detail: 'Falsificacion de documentos',
    initials: 'SG',
    avatarTone: 'bg-[#eef3f8] text-slate-600',
    status: 'Archivado',
    statusTone: 'bg-slate-100 text-slate-600',
    lastAction: 'Caducidad de plazos',
    actionDate: 'Hace 3 meses',
  },
]

export const tribunalPagination = ['1', '2', '3', '...', '12']
