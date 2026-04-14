import {
  BarChart3,
  CalendarDays,
  CreditCard,
  FileText,
  FolderKanban,
  Gavel,
  Home,
  Settings,
  Users,
  Vote,
} from 'lucide-react'

export const navigationItems = [
  { label: 'Dashboard', icon: Home, path: '/', end: true },
  { label: 'Colegiados', icon: Users, path: '/colegiados' },
  { label: 'Caja y Cobros', icon: CreditCard, path: '/caja-cobros' },
  { label: 'Conceptos de Cobro', icon: FileText, path: '/conceptos-cobro' },
  { label: 'Reportes', icon: BarChart3 },
  { label: 'Eventos', icon: CalendarDays, path: '/eventos' },
  { label: 'Inventario', icon: FolderKanban, path: '/inventario' },
  { label: 'Elecciones', icon: Vote, path: '/elecciones' },
  { label: 'Tribunal', icon: Gavel, path: '/tribunal' },
]

export const sidebarFooterItems = [
  { label: 'Ajustes', icon: Settings },
  { label: 'Cerrar sesion', icon: null, tone: 'danger' },
]
