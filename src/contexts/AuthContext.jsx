import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Configuração do axios
    axios.defaults.baseURL = process.env.NODE_ENV === 'production'
      ? 'https://assistente-estudos-backend.azurewebsites.net'
      : 'http://localhost:5001';
    axios.defaults.withCredentials = true;

    // Configurar interceptor para adicionar token
    axios.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Verificar se há usuário salvo no localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== 'undefined') {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Checagem automática do status de pagamento
  useEffect(() => {
    async function checkPagamentoStatus() {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = res.data;
        // Se não for admin nem teste e pagamento não for ativo, faz logout
        if (
          userData.email !== 'admin@admin.com' &&
          userData.email !== 'teste@teste.com' &&
          ['Mensal', 'Semestral', 'Anual'].includes(userData.plano) &&
          userData.pagamentoStatus !== 'ativo'
        ) {
          alert('Seu acesso está bloqueado por falta de pagamento. Regularize sua assinatura para continuar.');
          await logout();
        } else {
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (err) {
        // Se der erro, faz logout por segurança
        await logout();
      }
    }
    checkPagamentoStatus();
    // eslint-disable-next-line
  }, []);

  const login = async (userData) => {
    try {
      const response = await axios.post('/api/auth/login', userData);
      const { token, ...user } = response.data;
      
      if (!token) {
        throw new Error('Token não recebido do servidor');
      }
      
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      
      // Configurar o token no axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return user;
    } catch (error) {
      console.error('Erro no login:', error);
      throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}; 