import { Navigate, Route, Routes } from 'react-router-dom'
import ColegiadosPage from '../pages/ColegiadosPage'
import DashboardPage from '../pages/DashboardPage'
import PagosPage from '../pages/PagosPage'
import TribunalPage from '../pages/TribunalPage'

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/colegiados" element={<ColegiadosPage />} />
      <Route path="/pagos" element={<PagosPage />} />
      <Route path="/tribunal" element={<TribunalPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
