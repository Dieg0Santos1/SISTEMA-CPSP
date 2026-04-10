import { createContext } from 'react'

const sessionContext = createContext({
  user: {
    id: 'usr-cpl-001',
    fullName: 'Admin Principal',
    roleLabel: 'Perfil Usuario',
    initials: 'AP',
  },
})

export default sessionContext
