import { FileSpreadsheet, FolderKanban, Gavel, Vote } from 'lucide-react'

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
    lastAction: 'Resolucion N. 452-CPL',
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
