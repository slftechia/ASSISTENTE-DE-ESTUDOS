import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CARGOS = [
  { id: 'professor_iniciais', nome: 'Professor de Anos Iniciais' },
  { id: 'professor_artes_cenicas', nome: 'Professor de Artes Cênicas e/ou Teatro' },
  { id: 'professor_artes_musica', nome: 'Professor de Artes/Música' },
  { id: 'professor_artes_visuais', nome: 'Professor de Artes Plásticas e/ou Visuais' },
  { id: 'professor_ciencias', nome: 'Professor de Ciências' },
  { id: 'professor_danca', nome: 'Professor de Dança' },
  { id: 'professor_educacao_especial', nome: 'Professor de Educação Especial – Sala Multimeios' },
  { id: 'professor_educacao_fisica', nome: 'Professor de Educação Física' },
  { id: 'professor_educacao_infantil', nome: 'Professor de Educação Infantil' },
  { id: 'professor_espanhol', nome: 'Professor de Espanhol' },
  { id: 'professor_geografia', nome: 'Professor de Geografia' },
  { id: 'professor_historia', nome: 'Professor de História' },
  { id: 'professor_ingles', nome: 'Professor de Inglês' },
  { id: 'professor_libras', nome: 'Professor de LIBRAS' },
  { id: 'professor_matematica', nome: 'Professor de Matemática' },
  { id: 'professor_portugues', nome: 'Professor de Português' },
  { id: 'professor_portugues_ingles', nome: 'Professor de Português e Inglês' },
  { id: 'professor_aux_ciencias', nome: 'Professor Auxiliar de Atividades de Ciências' },
  { id: 'professor_aux_educacao_especial', nome: 'Professor Auxiliar de Educação Especial (Profissional de Apoio)' },
  { id: 'professor_aux_educacao_infantil', nome: 'Professor Auxiliar de Educação Infantil' },
  { id: 'professor_aux_ensino_fundamental', nome: 'Professor Auxiliar de Ensino Fundamental' },
  { id: 'professor_aux_tecnologia', nome: 'Professor Auxiliar de Tecnologia Educacional' },
  { id: 'professor_aux_interprete', nome: 'Professor Auxiliar Intérprete Educacional' },
  { id: 'administrador', nome: 'Administrador Escolar' },
  { id: 'orientador', nome: 'Orientador Educacional' },
  { id: 'supervisor', nome: 'Supervisor Escolar' },
  { id: 'monitor', nome: 'Monitor Escolar' },
  { id: 'auxiliar', nome: 'Auxiliar de Sala' }
];

export default function Register() {
  const [formData, setFormData] = useState({ 
    nome: '', 
    email: '', 
    senha: '',
    cargo: '' 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post('/api/auth/register', formData);
      setSuccess('Parabéns! Cadastro realizado com sucesso. Saia e faça seu login para acessar seu ambiente.');
      setError('');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Erro ao registrar.');
      }
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Criar Conta
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
          {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{success}</div>}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="nome" className="sr-only">Nome</label>
              <input
                id="nome"
                name="nome"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Nome"
                value={formData.nome}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="senha" className="sr-only">Senha</label>
              <input
                id="senha"
                name="senha"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={formData.senha}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="cargo" className="sr-only">Cargo</label>
              <select
                id="cargo"
                name="cargo"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                value={formData.cargo}
                onChange={handleChange}
              >
                <option value="">Selecione sua Função</option>
                {CARGOS.map((cargo) => (
                  <option key={cargo.id} value={cargo.id}>
                    {cargo.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Voltar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 