import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import esES from 'antd/lib/locale/es_ES';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import CambioPasswordPrimerLogin from './components/auth/CambioPasswordPrimerLogin';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import ResidenteDashboard from './components/residente/ResidenteDashboard';
import Multas from './components/admin/Multas';
import MisMultas from './components/residente/MisMultas';
import './App.css';

// Componente para dirigir al usuario al dashboard correspondiente según su rol
function DashboardRouter() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboard /> : <ResidenteDashboard />;
}

function App() {
  return (
    <ConfigProvider locale={esES}>
      <AuthProvider>
        <div className="app-container">
          <Router>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/cambio-password-primer-login" element={<CambioPasswordPrimerLogin />} />
              
              {/* Rutas protegidas */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  {/* Ruta para decidir qué dashboard mostrar según el rol */}
                  <Route path="/dashboard" element={<DashboardRouter />} />
                  
                  {/* Rutas específicas para residentes */}
                  <Route path="/mis-gastos" element={<div>Mis Gastos (En construcción)</div>} />
                  <Route path="/mis-multas" element={<MisMultas />} />
                  <Route path="/mis-notificaciones" element={<div>Mis Notificaciones (En construcción)</div>} />
                  <Route path="/perfil" element={<div>Mi Perfil (En construcción)</div>} />
                  <Route path="/cambio-password" element={<div>Cambio de Contraseña (En construcción)</div>} />
                  
                  {/* Rutas específicas para administradores */}
                  <Route element={<ProtectedRoute requireAdmin={true} />}>
                    <Route path="/usuarios" element={<div>Gestión de Usuarios (En construcción)</div>} />
                    <Route path="/gastos" element={<div>Gestión de Gastos (En construcción)</div>} />
                    <Route path="/multas" element={<Multas />} />
                    <Route path="/notificaciones" element={<div>Gestión de Notificaciones (En construcción)</div>} />
                    <Route path="/reportes" element={<div>Reportes (En construcción)</div>} />
                  </Route>
                </Route>
              </Route>
              
              {/* Ruta por defecto */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </div>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
