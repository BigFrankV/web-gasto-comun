import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Componente para proteger rutas que requieren autenticación
const ProtectedRoute = ({ requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, isFirstLogin, loading } = useAuth();

  // Mientras se verifica la autenticación, mostramos un indicador de carga
  if (loading) {
    return <div>Cargando...</div>;
  }

  // Si el usuario no está autenticado, redirigimos al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si es el primer inicio de sesión, redirigimos al cambio de contraseña
  if (isFirstLogin) {
    return <Navigate to="/cambio-password-primer-login" replace />;
  }

  // Si se requiere rol de administrador y el usuario no lo tiene, redirigimos al dashboard
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si todo está bien, renderizamos el contenido de la ruta
  return <Outlet />;
};

export default ProtectedRoute;
