export const eventosSummaryCards = [
  {
    title: 'Asistentes esperados',
    value: '248',
    note: '192 confirmados y 31 invitados institucionales',
    accent: 'border-cobalt',
    iconTone: 'bg-cobalt-soft text-cobalt',
  },
  {
    title: 'Presentes preparados',
    value: '220',
    note: '45 requieren validacion final de entrega',
    accent: 'border-amber-400',
    iconTone: 'bg-amber-100 text-amber-700',
  },
  {
    title: 'Puntos de control',
    value: '06',
    note: 'Recepcion, padron, entrega y soporte en sala',
    accent: 'border-emerald-500',
    iconTone: 'bg-emerald-100 text-emerald-700',
  },
]

export const eventosQuickStats = [
  {
    label: 'Eventos activos',
    value: '04',
    helper: 'Jornadas visibles para coordinacion interna',
  },
  {
    label: 'Cobertura prevista',
    value: '81%',
    helper: 'Promedio de asistencias registradas por evento',
  },
]

export const eventosInitialRecords = [
  {
    id: 'evento-001',
    name: 'Jornada de actualizacion clinica',
    dateTime: '2026-04-18T19:00',
    description:
      'Sesion orientada a protocolos de atencion, casos complejos y estandares de intervencion para colegiados habilitados.',
    attendanceMemberIds: ['col-001', 'col-003', 'col-005', 'col-008'],
  },
  {
    id: 'evento-002',
    name: 'Encuentro de liderazgo institucional',
    dateTime: '2026-04-27T18:30',
    description:
      'Espacio de trabajo para coordinadores, comisiones y representantes regionales con foco en gestion colegial.',
    attendanceMemberIds: ['col-002', 'col-004', 'col-006'],
  },
  {
    id: 'evento-003',
    name: 'Taller de etica y ejercicio profesional',
    dateTime: '2026-05-06T17:00',
    description:
      'Actividad formativa para revisar criterios eticos, documentacion sensible y toma de decisiones en practica profesional.',
    attendanceMemberIds: ['col-001', 'col-004', 'col-007', 'col-009'],
  },
  {
    id: 'evento-004',
    name: 'Ceremonia de bienvenida a nuevos colegiados',
    dateTime: '2026-05-14T11:00',
    description:
      'Acto institucional de integracion con entrega de materiales, presentacion de servicios y recorrido de modulos.',
    attendanceMemberIds: ['col-003', 'col-006', 'col-010'],
  },
]

export const eventosMockMembers = [
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
  {
    id: 'col-009',
    name: 'Jorge Luis Ponce Alarcon',
    code: 'C.P.L. 11204',
    specialty: 'Psicologia juridica',
    status: 'Habilitado',
    statusTone: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'col-010',
    name: 'Sandra Milagros Loayza Peña',
    code: 'C.P.L. 17731',
    specialty: 'Psicologia social',
    status: 'Habilitada',
    statusTone: 'bg-emerald-100 text-emerald-700',
  },
]

export const asistentesRows = [
  {
    id: 'evt-001',
    name: 'Rosa Elena Vargas Mena',
    code: 'C.P.L. 14321',
    area: 'Psicologia clinica',
    ticket: 'Asistencia validada',
    attendanceStatus: 'Confirmada',
    attendanceTone: 'bg-emerald-100 text-emerald-700',
    giftStatus: 'Entregado',
    giftTone: 'bg-cobalt-soft text-cobalt',
  },
  {
    id: 'evt-002',
    name: 'Carlos Alberto Huaman Soto',
    code: 'C.P.L. 11872',
    area: 'Mesa de invitados',
    ticket: 'Acreditacion pendiente',
    attendanceStatus: 'En cola',
    attendanceTone: 'bg-amber-100 text-amber-700',
    giftStatus: 'Reservado',
    giftTone: 'bg-slate-100 text-slate-600',
  },
  {
    id: 'evt-003',
    name: 'Lucia Cardenas Montes',
    code: 'C.P.L. 16304',
    area: 'Neuropsicologia',
    ticket: 'Ingreso preferente',
    attendanceStatus: 'Confirmada',
    attendanceTone: 'bg-emerald-100 text-emerald-700',
    giftStatus: 'Pendiente',
    giftTone: 'bg-rose-100 text-rose-700',
  },
  {
    id: 'evt-004',
    name: 'Fernando Medina Ruiz',
    code: 'Invitado',
    area: 'Consejo directivo',
    ticket: 'Cortesia institucional',
    attendanceStatus: 'Acreditar',
    attendanceTone: 'bg-sky-100 text-sky-700',
    giftStatus: 'Listo en modulo',
    giftTone: 'bg-violet-100 text-violet-700',
  },
]

export const entregaSummary = [
  {
    title: 'Entregados',
    value: '175',
    helper: '79% del stock asignado a la jornada',
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    title: 'Reservados',
    value: '28',
    helper: 'Separados para autoridades e invitados',
    tone: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  {
    title: 'Pendientes',
    value: '17',
    helper: 'Requieren confirmacion de asistencia',
    tone: 'bg-amber-50 text-amber-700 border-amber-200',
  },
]

export const entregaChecklist = [
  {
    title: 'Validar identidad en modulo de recepcion',
    detail: 'Cruce rapido con DNI o codigo de colegiatura.',
  },
  {
    title: 'Marcar entrega contra padron de asistentes',
    detail: 'Evita duplicidades en presentes y kits institucionales.',
  },
  {
    title: 'Registrar incidencias de stock o reposicion',
    detail: 'Permite mover presentes entre mesas si cambia la afluencia.',
  },
]

export const agendaMoments = [
  {
    time: '08:00',
    title: 'Apertura de acreditacion',
    detail: 'Recepcion principal con dos filas diferenciadas.',
  },
  {
    time: '09:15',
    title: 'Control de presentes por bloque',
    detail: 'Entrega guiada por color de credencial y tipo de invitado.',
  },
  {
    time: '10:00',
    title: 'Inicio de programa central',
    detail: 'Cierre parcial de ingresos y monitoreo de sala.',
  },
]

export const eleccionesSummaryCards = [
  {
    title: 'Padron habilitado',
    value: '1,842',
    note: 'Colegiados con pagos al dia dentro del corte electoral',
    accent: 'border-cobalt',
    iconTone: 'bg-cobalt-soft text-cobalt',
  },
  {
    title: 'Observados por 3 meses',
    value: '126',
    note: 'No cumplen continuidad minima exigida',
    accent: 'border-amber-400',
    iconTone: 'bg-amber-100 text-amber-700',
  },
  {
    title: 'Mesas proyectadas',
    value: '18',
    note: 'Distribucion estimada por sede y volumen de votantes',
    accent: 'border-emerald-500',
    iconTone: 'bg-emerald-100 text-emerald-700',
  },
  {
    title: 'Hitos del proceso',
    value: '07',
    note: 'Desde convocatoria hasta proclamacion final',
    accent: 'border-violet-400',
    iconTone: 'bg-violet-100 text-violet-700',
  },
]

export const habilitacionRules = [
  'Solo participan colegiados habilitados con continuidad de 3 meses previos al corte.',
  'La validacion cruza estado vigente, cuotas registradas y observaciones administrativas.',
  'Los observados quedan visibles para revision antes del cierre definitivo del padron.',
]

export const habilitacionRows = [
  {
    name: 'Flor de Maria Abad Quispe',
    code: 'C.P.L. 15428',
    lastPayments: 'Ene, Feb y Mar 2026',
    status: 'Habilitada',
    statusTone: 'bg-emerald-100 text-emerald-700',
    note: 'Cumple continuidad de 3 meses y no registra observaciones.',
  },
  {
    name: 'Javier Raul Paredes Soto',
    code: 'C.P.L. 11872',
    lastPayments: 'Feb y Abr 2026',
    status: 'Observado',
    statusTone: 'bg-amber-100 text-amber-700',
    note: 'Tiene vacio en el periodo requerido y debe regularizar antes del corte.',
  },
  {
    name: 'Lucia Cardenas Montes',
    code: 'C.P.L. 16304',
    lastPayments: 'Ene, Feb y Mar 2026',
    status: 'Habilitada',
    statusTone: 'bg-emerald-100 text-emerald-700',
    note: 'Apta para votar e integrar mesa electoral.',
  },
]

export const mesasGeneradas = [
  {
    table: 'Mesa 01',
    place: 'Sede central - Auditorio A',
    president: 'Rosa Vargas',
    secretary: 'Lucia Cardenas',
    member: 'Miguel Ochoa',
    reserve: '2 suplentes',
  },
  {
    table: 'Mesa 02',
    place: 'Sede central - Auditorio B',
    president: 'Carlos Huaman',
    secretary: 'Diana Sotelo',
    member: 'Jorge Ponce',
    reserve: '1 suplente',
  },
  {
    table: 'Mesa 03',
    place: 'Filial norte - Sala 2',
    president: 'Ana Villacorta',
    secretary: 'Luis Espinoza',
    member: 'Sandra Loayza',
    reserve: '2 suplentes',
  },
]

export const procesoElectoralSteps = [
  {
    stage: 'Convocatoria',
    status: 'Completado',
    statusTone: 'bg-emerald-100 text-emerald-700',
    detail: 'Resolucion publicada y calendario comunicado a los colegiados.',
  },
  {
    stage: 'Cierre de padron habilitado',
    status: 'En revision',
    statusTone: 'bg-amber-100 text-amber-700',
    detail: 'Se estan depurando observados por la regla de 3 meses.',
  },
  {
    stage: 'Asignacion de mesas',
    status: 'Listo para sorteo',
    statusTone: 'bg-cobalt-soft text-cobalt',
    detail: 'Distribucion preliminar lista para generacion aleatoria final.',
  },
  {
    stage: 'Jornada electoral',
    status: 'Pendiente',
    statusTone: 'bg-slate-100 text-slate-600',
    detail: 'Quedara habilitado el registro de incidencias, apertura y cierre.',
  },
]
