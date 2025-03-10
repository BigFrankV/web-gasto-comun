import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import axios from 'axios'; // Importar axios

// Crear el contexto de autenticación
const AuthContext = createContext();

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar usuario desde localStorage al iniciar la aplicación
    const loadUser = () => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      if (currentUser && currentUser.access) {
        setToken(currentUser.access);
        // Configurar el token en el header por defecto para todas las solicitudes de axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${currentUser.access}`;
      } else {
        // Limpiar el header de autorización si no hay token
        delete axios.defaults.headers.common['Authorization'];
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Función para iniciar sesión
  const login = async (username, password) => {
    try {
      const data = await authService.login(username, password);
      setUser(data);
      if (data && data.access) {
        setToken(data.access);
        // Configurar el token en el header por defecto para todas las solicitudes de axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    // Limpiar el header de autorización
    delete axios.defaults.headers.common['Authorization'];
  };

  // Función para cambiar contraseña en el primer inicio de sesión
  const changePasswordFirstLogin = async (oldPassword, newPassword) => {
    try {
      const data = await authService.changePasswordFirstLogin(oldPassword, newPassword);
      // Actualizar el estado del usuario para reflejar que ya no es su primer inicio de sesión
      if (user) {
        const updatedUser = { ...user, first_login: false };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Función para cambiar contraseña
  const changePassword = async (oldPassword, newPassword) => {
    try {
      const data = await authService.changePassword(oldPassword, newPassword);
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Valores que se proporcionarán a través del contexto
  const value = {
    user,
    loading,
    login,
    logout,
    changePasswordFirstLogin,
    changePassword,
    isAuthenticated: !!user,
    isAdmin: user?.rol === 'admin',
    isFirstLogin: user?.first_login,
    token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
