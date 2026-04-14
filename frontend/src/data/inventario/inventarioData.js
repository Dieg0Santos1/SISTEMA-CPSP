export const inventoryMembers = [
  {
    id: 'col-001',
    name: 'Flor de Maria Abad Quispe',
    code: 'C.P.L. 15428',
    specialty: 'Psicologia clinica',
    status: 'Habilitada',
    statusTone: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'col-002',
    name: 'Javier Raul Paredes Soto',
    code: 'C.P.L. 11872',
    specialty: 'Psicologia educativa',
    status: 'Habilitado',
    statusTone: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'col-003',
    name: 'Lucia Cardenas Montes',
    code: 'C.P.L. 16304',
    specialty: 'Neuropsicologia',
    status: 'Habilitada',
    statusTone: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'col-004',
    name: 'Rosa Elena Vargas Mena',
    code: 'C.P.L. 14321',
    specialty: 'Psicologia organizacional',
    status: 'Habilitada',
    statusTone: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'col-005',
    name: 'Carlos Alberto Huaman Soto',
    code: 'C.P.L. 12688',
    specialty: 'Psicologia comunitaria',
    status: 'Habilitado',
    statusTone: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'col-006',
    name: 'Ana Maria Villacorta Salas',
    code: 'C.P.L. 17112',
    specialty: 'Psicologia de la salud',
    status: 'Habilitada',
    statusTone: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'col-007',
    name: 'Miguel Angel Ochoa Sialer',
    code: 'C.P.L. 10941',
    specialty: 'Psicologia forense',
    status: 'Habilitado',
    statusTone: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'col-008',
    name: 'Diana Paola Sotelo Ruiz',
    code: 'C.P.L. 16883',
    specialty: 'Psicologia infantil',
    status: 'Habilitada',
    statusTone: 'bg-emerald-100 text-emerald-700',
  },
]

export const inventoryInitialProducts = [
  {
    id: 'producto-almanaque',
    name: 'Almanaques institucionales 2026',
    category: 'Material institucional',
    description:
      'Almanaque anual para entrega a colegiados con fechas clave, servicios y canales institucionales.',
    stock: 180,
    deliveredMemberIds: ['col-001', 'col-003', 'col-004', 'col-006', 'col-008'],
    soldUnits: 24,
    priceLabel: 'S/ 12.00',
    tone: 'border-cobalt',
    badgeTone: 'bg-cobalt-soft text-cobalt',
  },
  {
    id: 'producto-libreta',
    name: 'Libretas institucionales',
    category: 'Material de bienvenida',
    description:
      'Libreta de uso profesional para jornadas, ceremonias y atencion en eventos institucionales.',
    stock: 125,
    deliveredMemberIds: ['col-002', 'col-003', 'col-005'],
    soldUnits: 17,
    priceLabel: 'S/ 18.00',
    tone: 'border-emerald-500',
    badgeTone: 'bg-emerald-100 text-emerald-700',
  },
]

export const inventoryMovementHistory = [
  {
    id: 'mov-001',
    product: 'Almanaques institucionales 2026',
    type: 'Ingreso',
    typeTone: 'bg-emerald-100 text-emerald-700',
    detail: 'Reposicion para campana de abril',
    quantity: '+80',
    date: '12 Abr 2026',
  },
  {
    id: 'mov-002',
    product: 'Libretas institucionales',
    type: 'Entrega',
    typeTone: 'bg-cobalt-soft text-cobalt',
    detail: 'Entrega en mesa de bienvenida',
    quantity: '-3',
    date: '13 Abr 2026',
  },
  {
    id: 'mov-003',
    product: 'Almanaques institucionales 2026',
    type: 'Venta',
    typeTone: 'bg-amber-100 text-amber-700',
    detail: 'Venta directa en caja',
    quantity: '-6',
    date: '13 Abr 2026',
  },
  {
    id: 'mov-004',
    product: 'Libretas institucionales',
    type: 'Ingreso',
    typeTone: 'bg-emerald-100 text-emerald-700',
    detail: 'Lote inicial para nuevas entregas',
    quantity: '+50',
    date: '10 Abr 2026',
  },
]

export const inventoryProcessCards = [
  {
    title: 'Registro de materiales',
    detail: 'Catalogo base de productos institucionales disponibles para entrega o venta.',
  },
  {
    title: 'Control de stock',
    detail: 'Seguimiento visual del saldo disponible y alertas por producto.',
  },
  {
    title: 'Venta de materiales',
    detail: 'Resumen de unidades vendidas y precio de referencia.',
  },
  {
    title: 'Historial de movimientos',
    detail: 'Trazabilidad de ingresos, ventas y entregas a colegiados.',
  },
]
