import SessionContext from './sessionContext'

function SessionProvider({ children }) {
  const sessionValue = {
    user: {
      id: 'usr-cpl-001',
      fullName: 'Admin Principal',
      roleLabel: 'Perfil Usuario',
      initials: 'AP',
    },
  }

  return (
    <SessionContext.Provider value={sessionValue}>
      {children}
    </SessionContext.Provider>
  )
}

export default SessionProvider
