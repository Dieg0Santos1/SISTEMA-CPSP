import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import ColegiadosPage from '../pages/ColegiadosPage'
import CobrosPage from '../pages/CobrosPage'
import ConceptosPage from '../pages/ConceptosPage'
import DashboardPage from '../pages/DashboardPage'
import EventosPage from '../pages/EventosPage'
import InventarioPage from '../pages/InventarioPage'
import TribunalPage from '../pages/TribunalPage'
import CobrosComprobantesPage from '../pages/cobros/CobrosComprobantesPage'
import CobrosHistorialPage from '../pages/cobros/CobrosHistorialPage'
import CobrosRegistrarPage from '../pages/cobros/CobrosRegistrarPage'
import CobrosResumenPage from '../pages/cobros/CobrosResumenPage'
import EleccionesPage from '../pages/eventos/EleccionesPage'

function AdminShell() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}

function AppRouter() {
  return (
    <Routes>
      <Route element={<AdminShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/colegiados" element={<ColegiadosPage />} />
        <Route path="/caja-cobros" element={<CobrosPage />}>
          <Route index element={<Navigate to="resumen" replace />} />
          <Route path="resumen" element={<CobrosResumenPage />} />
          <Route path="registrar" element={<CobrosRegistrarPage />} />
          <Route path="historial" element={<CobrosHistorialPage />} />
          <Route path="comprobantes" element={<CobrosComprobantesPage />} />
        </Route>
        <Route path="/eventos" element={<EventosPage />} />
        <Route path="/inventario" element={<InventarioPage />} />
        <Route path="/elecciones" element={<EleccionesPage />} />
        <Route path="/conceptos-cobro" element={<ConceptosPage />} />
        <Route path="/tribunal" element={<TribunalPage />} />
      </Route>
      <Route path="/eventos/gestion" element={<Navigate to="/eventos" replace />} />
      <Route path="/eventos/elecciones" element={<Navigate to="/elecciones" replace />} />
      <Route path="/pagos" element={<Navigate to="/caja-cobros/registrar" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
