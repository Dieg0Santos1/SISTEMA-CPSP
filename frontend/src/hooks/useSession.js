import { useContext } from 'react'
import sessionContext from '../context/sessionContext'

function useSession() {
  return useContext(sessionContext)
}

export default useSession
