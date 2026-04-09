import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from '../pages/HomePage'

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
