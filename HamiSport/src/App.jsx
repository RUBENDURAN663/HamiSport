import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Admin     from './pages/Admin'
import Login     from './pages/Login'
import Register  from './pages/Register'
import Home      from './pages/Home'
import Library   from './pages/Library'
import Nutrition from './pages/Nutrition'
import Dashboard from './pages/Dashboard'
import Routines  from './pages/Routines'

import './styles/global.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={
            <ProtectedRoute><Home /></ProtectedRoute>
          }/>
          <Route path="/library" element={
            <ProtectedRoute><Library /></ProtectedRoute>
          }/>
          <Route path="/nutrition" element={
            <ProtectedRoute><Nutrition /></ProtectedRoute>
          }/>
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          }/>
          <Route path="/routines" element={
            <ProtectedRoute><Routines /></ProtectedRoute>
          }/>
          <Route path="/admin" element={
            <ProtectedRoute><Admin /></ProtectedRoute>
          }/>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App