import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Configuração do axios
    axios.defaults.baseURL = process.env.NODE_ENV === 'production'
      ? 'https://assistente-estudos-backend.azurewebsites.net'
      : 'http://localhost:5001';
    axios.defaults.withCredentials = true;

    // Configurar interceptor para adicionar token do admin
    axios.interceptors.request.use((config) => {
      const token = localStorage.getItem('admin_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Verificar se há admin salvo no localStorage
    const storedAdmin = localStorage.getItem('admin_user');
    if (storedAdmin && storedAdmin !== 'undefined') {
      setAdmin(JSON.parse(storedAdmin));
    }
    setLoading(false);
  }, []);

  const login = async (userData) => {
    try {
      const response = await axios.post('/api/auth/login', userData);
      const { token, ...user } = response.data;
      if (!token) {
        throw new Error('Token não recebido do servidor');
      }
      if (user.email !== 'admin@admin.com') {
        throw new Error('Apenas o usuário administrador pode acessar este painel.');
      }
      setAdmin(user);
      localStorage.setItem('admin_user', JSON.stringify(user));
      localStorage.setItem('admin_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
  };

  const value = {
    admin,
    login,
    logout,
    isAuthenticated: !!admin
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth deve ser usado dentro de um AdminAuthProvider');
  }
  return context;
}; 