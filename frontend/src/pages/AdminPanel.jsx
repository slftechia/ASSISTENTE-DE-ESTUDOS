import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '', cargo: '', plano: 'Free', pagamentoStatus: 'ativo' });
  const [editId, setEditId] = useState(null);
  const [conversas, setConversas] = useState([]);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [showConversas, setShowConversas] = useState(false);
  const [senhaErros, setSenhaErros] = useState([]);
  const [showSenhaRequisitos, setShowSenhaRequisitos] = useState(false);

  useEffect(() => {
    fetchUsuarios();
    // eslint-disable-next-line
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/auth/admin/public/usuarios');
      setUsuarios(res.data);
      setError('');
    } catch (err) {
      setError('Erro ao buscar usuários.');
    }
    setLoading(false);
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este usuário?')) return;
    try {
      await axios.delete(`/api/auth/admin/public/usuarios/${id}`);
      fetchUsuarios();
    } catch {
      alert('Erro ao remover usuário.');
    }
  };

  const handleEdit = (usuario) => {
    setFormData({ ...usuario, senha: '' });
    setEditId(usuario._id);
    setShowForm(true);
  };

  const handleBlockToggle = async (usuario) => {
    try {
      await axios.put(`/api/auth/admin/public/usuarios/${usuario._id}`, {
        ...usuario,
        pagamentoStatus: usuario.pagamentoStatus === 'ativo' ? 'pendente' : 'ativo',
      });
      fetchUsuarios();
    } catch {
      alert('Erro ao atualizar status do usuário.');
    }
  };

  const fetchConversas = async (userId) => {
    console.log('Buscando conversas para usuário:', userId);
    setShowConversas(true);
    setUsuarioSelecionado(usuarios.find(u => u._id === userId));
    try {
      const res = await axios.get(`/api/auth/admin/public/conversas?userId=${userId}`);
      console.log('Conversas retornadas:', res.data);
      setConversas(res.data);
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
      setConversas([]);
      alert('Erro ao buscar conversas.');
    }
  };

  // Função para validar senha no frontend
  const validarSenhaFrontend = (senha) => {
    if (!senha) return [];
    
    const erros = [];
    
    if (senha.length < 8) {
      erros.push('A senha deve ter pelo menos 8 caracteres');
    }
    
    if (!/[A-Z]/.test(senha)) {
      erros.push('A senha deve conter pelo menos uma letra maiúscula');
    }
    
    if (!/[a-z]/.test(senha)) {
      erros.push('A senha deve conter pelo menos uma letra minúscula');
    }
    
    if (!/\d/.test(senha)) {
      erros.push('A senha deve conter pelo menos um número');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha)) {
      erros.push('A senha deve conter pelo menos um caractere especial (!@#$%^&*...)');
    }
    
    const sequenciasNumericas = ['123', '321', '456', '654', '789', '987', '012', '210'];
    for (const seq of sequenciasNumericas) {
      if (senha.toLowerCase().includes(seq)) {
        erros.push('A senha não pode conter sequências numéricas (123, 321, etc.)');
        break;
      }
    }
    
    const sequenciasTeclado = ['qwe', 'ewq', 'asd', 'dsa', 'zxc', 'cxz', 'tyu', 'uyt', 'ghj', 'jhg', 'bnm', 'mnb'];
    for (const seq of sequenciasTeclado) {
      if (senha.toLowerCase().includes(seq)) {
        erros.push('A senha não pode conter sequências de teclado (qwe, asd, etc.)');
        break;
      }
    }
    
    const anoAtual = new Date().getFullYear();
    const anosAnteriores = [anoAtual - 1, anoAtual - 2, anoAtual - 3];
    for (const ano of anosAnteriores) {
      if (senha.includes(ano.toString())) {
        erros.push('A senha não pode conter anos (datas de nascimento, etc.)');
        break;
      }
    }
    
    const senhasComuns = [
      'password', 'senha', '123456', '12345678', 'qwerty', 'abc123', 'password123',
      'admin', 'administrator', 'user', 'usuario', 'test', 'teste', 'guest', 'convidado',
      'welcome', 'bemvindo', 'hello', 'ola', 'hi', 'oi', 'login', 'entrar', 'access',
      'acesso', 'secret', 'secreto', 'private', 'privado', 'public', 'publico'
    ];
    
    if (senhasComuns.includes(senha.toLowerCase())) {
      erros.push('A senha não pode ser uma senha comum');
    }
    
    if (/(.)\1{2,}/.test(senha)) {
      erros.push('A senha não pode conter caracteres repetidos (aaa, 111, etc.)');
    }
    
    return erros;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validar senha se fornecida
    if (formData.senha) {
      const errosSenha = validarSenhaFrontend(formData.senha);
      if (errosSenha.length > 0) {
        setSenhaErros(errosSenha);
        setShowSenhaRequisitos(true);
        alert('Senha não atende aos requisitos de segurança. Verifique os critérios abaixo.');
        return;
      }
    }
    
    try {
      if (editId) {
        await axios.put(`/api/auth/admin/public/usuarios/${editId}`, formData);
      } else {
        await axios.post('/api/auth/admin/public/usuarios', formData);
      }
      setShowForm(false);
      setEditId(null);
      setFormData({ nome: '', email: '', senha: '', cargo: '', plano: 'Free', pagamentoStatus: 'ativo' });
      setSenhaErros([]);
      setShowSenhaRequisitos(false);
      fetchUsuarios();
    } catch (error) {
      if (error.response?.data?.erros) {
        setSenhaErros(error.response.data.erros);
        setShowSenhaRequisitos(true);
        alert('Senha não atende aos requisitos de segurança.');
      } else {
        alert('Erro ao salvar usuário.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        <button onClick={() => { logout(); navigate('/admin-login'); }} className="bg-red-500 text-white px-4 py-2 rounded">Voltar ao Início</button>
      </div>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}
      <button onClick={() => { setShowForm(true); setEditId(null); setFormData({ nome: '', email: '', senha: '', cargo: '', plano: 'Free', pagamentoStatus: 'ativo' }); }} className="mb-4 bg-blue-600 text-white px-4 py-2 rounded">Novo Usuário</button>
      {showForm && (
        <form onSubmit={handleFormSubmit} className="bg-white p-6 rounded shadow mb-6 max-w-lg">
          <h2 className="text-xl font-bold mb-4">{editId ? 'Editar Usuário' : 'Novo Usuário'}</h2>
          <div className="mb-2">
            <input type="text" name="nome" placeholder="Nome" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} required className="w-full border px-3 py-2 rounded" />
          </div>
          <div className="mb-2">
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required className="w-full border px-3 py-2 rounded" />
          </div>
          <div className="mb-2">
            <input 
              type="password" 
              name="senha" 
              placeholder="Senha" 
              value={formData.senha} 
              onChange={e => {
                setFormData({ ...formData, senha: e.target.value });
                const erros = validarSenhaFrontend(e.target.value);
                setSenhaErros(erros);
              }}
              onFocus={() => setShowSenhaRequisitos(true)}
              className="w-full border px-3 py-2 rounded" 
            />
          </div>
          {showSenhaRequisitos && formData.senha && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-2">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Requisitos de Segurança da Senha:</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li className={formData.senha.length >= 8 ? 'text-green-600' : ''}>✓ Pelo menos 8 caracteres</li>
                <li className={/[A-Z]/.test(formData.senha) ? 'text-green-600' : ''}>✓ Pelo menos uma letra maiúscula</li>
                <li className={/[a-z]/.test(formData.senha) ? 'text-green-600' : ''}>✓ Pelo menos uma letra minúscula</li>
                <li className={/\d/.test(formData.senha) ? 'text-green-600' : ''}>✓ Pelo menos um número</li>
                <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.senha) ? 'text-green-600' : ''}>✓ Pelo menos um caractere especial (!@#$%^&*...)</li>
                <li className={!['123', '321', '456', '654', '789', '987', '012', '210'].some(seq => formData.senha.toLowerCase().includes(seq)) ? 'text-green-600' : ''}>✓ Não pode conter sequências numéricas</li>
                <li className={!['qwe', 'ewq', 'asd', 'dsa', 'zxc', 'cxz', 'tyu', 'uyt', 'ghj', 'jhg', 'bnm', 'mnb'].some(seq => formData.senha.toLowerCase().includes(seq)) ? 'text-green-600' : ''}>✓ Não pode conter sequências de teclado</li>
                <li className={!/(.)\1{2,}/.test(formData.senha) ? 'text-green-600' : ''}>✓ Não pode conter caracteres repetidos</li>
              </ul>
              {senhaErros.length > 0 && (
                <div className="mt-2">
                  <h5 className="text-xs font-semibold text-red-600 mb-1">Problemas encontrados:</h5>
                  <ul className="text-xs text-red-600 space-y-1">
                    {senhaErros.map((erro, index) => (
                      <li key={index}>• {erro}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <div className="mb-2">
            <input type="text" name="cargo" placeholder="Cargo" value={formData.cargo} onChange={e => setFormData({ ...formData, cargo: e.target.value })} required className="w-full border px-3 py-2 rounded" />
          </div>
          <div className="mb-2">
            <select name="plano" value={formData.plano} onChange={e => setFormData({ ...formData, plano: e.target.value })} className="w-full border px-3 py-2 rounded">
              <option value="Free">Free</option>
              <option value="Mensal">Mensal</option>
              <option value="Semestral">Semestral</option>
              <option value="Anual">Anual</option>
            </select>
          </div>
          <div className="mb-2">
            <select name="pagamentoStatus" value={formData.pagamentoStatus} onChange={e => setFormData({ ...formData, pagamentoStatus: e.target.value })} className="w-full border px-3 py-2 rounded">
              <option value="ativo">Ativo</option>
              <option value="pendente">Pendente</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Salvar</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancelar</button>
          </div>
        </form>
      )}
      {showConversas && usuarioSelecionado && (
        <div className="bg-white p-6 rounded shadow mb-6 max-w-2xl">
          <h2 className="text-xl font-bold mb-4">Conversas de {usuarioSelecionado.nome} ({usuarioSelecionado.email})</h2>
          <button onClick={() => setShowConversas(false)} className="mb-4 bg-gray-400 text-white px-4 py-2 rounded">Fechar</button>
          <div className="max-h-96 overflow-y-auto border rounded p-4 bg-gray-50">
            {conversas.length === 0 ? (
              <div className="text-gray-500">Nenhuma conversa encontrada.</div>
            ) : (
              conversas.map((msg, idx) => (
                <div key={msg._id || idx} className={`mb-2 flex ${msg.remetente === 'usuario' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`px-3 py-2 rounded-lg max-w-xs ${msg.remetente === 'usuario' ? 'bg-blue-100 text-blue-900' : 'bg-green-100 text-green-900'}`}>
                    <span className="block text-xs font-semibold mb-1">{msg.remetente === 'usuario' ? usuarioSelecionado.nome : 'Assistente'}</span>
                    <span className="text-sm">{msg.texto}</span>
                    <span className="block text-xs text-gray-400 mt-1">{new Date(msg.data).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {loading ? (
        <div>Carregando usuários...</div>
      ) : (
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="p-2">Nome</th>
              <th className="p-2">Email</th>
              <th className="p-2">Cargo</th>
              <th className="p-2">Plano</th>
              <th className="p-2">Status</th>
              <th className="p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u._id} className="border-t">
                <td className="p-2">{u.nome}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.cargo}</td>
                <td className="p-2">{u.plano}</td>
                <td className="p-2">{u.pagamentoStatus}</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(u)} className="bg-yellow-500 text-white px-2 py-1 rounded min-w-[100px]">Editar</button>
                    <button onClick={() => handleRemove(u._id)} className="bg-red-500 text-white px-2 py-1 rounded min-w-[100px]">Remover</button>
                    <button onClick={() => handleBlockToggle(u)} className={`px-2 py-1 rounded min-w-[100px] ${u.pagamentoStatus === 'ativo' ? 'bg-gray-600 text-white' : 'bg-green-600 text-white'}`}>{u.pagamentoStatus === 'ativo' ? 'Bloquear' : 'Liberar'}</button>
                    <button onClick={() => fetchConversas(u._id)} className="bg-blue-500 text-white px-2 py-1 rounded min-w-[100px]">Conversas</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 