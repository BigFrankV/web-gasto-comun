import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth/';

// Servicio de autenticación
const authService = {
  // Iniciar sesión
  login: async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}login/`, { username, password }, {
        withCredentials: false // Configuración específica para esta petición
      });
      if (response.data.access) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem('user');
  },

  // Cambiar contraseña en el primer inicio de sesión
  changePasswordFirstLogin: async (old_password, new_password) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.post(
        `${API_URL}cambio-password-primer-login/`,
        { old_password, new_password },
        {
          headers: {
            Authorization: `Bearer ${user.access}`,
          },
          withCredentials: false // Configuración específica para esta petición
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cambiar contraseña
  changePassword: async (old_password, new_password) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.post(
        `${API_URL}cambio-password/`,
        { old_password, new_password },
        {
          headers: {
            Authorization: `Bearer ${user.access}`,
          },
          withCredentials: false // Configuración específica para esta petición
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    const user = authService.getCurrentUser();
    return !!user;
  },

  // Verificar si el usuario es administrador
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user && user.rol === 'admin';
  },

  // Verificar si es el primer inicio de sesión
  isFirstLogin: () => {
    const user = authService.getCurrentUser();
    return user && user.first_login;
  },
};

export default authService;
