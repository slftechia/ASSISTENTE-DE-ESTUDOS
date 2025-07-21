import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

// Função para validar senha no frontend
const validarSenhaFrontend = (senha) => {
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

export default function Register() {
  const [formData, setFormData] = useState({ 
    nome: '', 
    email: '', 
    senha: '',
    telefone: '',
    cpf: '',
    cargo: '' 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAviso, setShowAviso] = useState(false);
  const [planoSelecionado, setPlanoSelecionado] = useState('');
  const [senhaErros, setSenhaErros] = useState([]);
  const [showSenhaRequisitos, setShowSenhaRequisitos] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Validar senha em tempo real
    if (name === 'senha') {
      const erros = validarSenhaFrontend(value);
      setSenhaErros(erros);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar senha antes de enviar
    const errosSenha = validarSenhaFrontend(formData.senha);
    if (errosSenha.length > 0) {
      setError('Senha não atende aos requisitos de segurança. Verifique os critérios abaixo.');
      setShowSenhaRequisitos(true);
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post('/api/auth/register', formData);
      setSuccess('Parabéns! Cadastro realizado com sucesso. Aguarde...');
      setError('');
      // Se veio de um plano, exibe aviso antes de redirecionar
      const params = new URLSearchParams(location.search);
      const plano = params.get('plano');
      if (plano) {
        setPlanoSelecionado(plano);
        setShowAviso(true);
        setTimeout(async () => {
          try {
            const response = await axios.post('/api/pagamento/mercadopago', {
              nome: plano.charAt(0).toUpperCase() + plano.slice(1),
              email: formData.email
            });
            if (response.data.url) {
              window.location.href = response.data.url;
            } else {
              setError('Erro ao iniciar pagamento. Tente novamente.');
            }
          } catch (err) {
            setError('Erro ao conectar com o Mercado Pago.');
          }
        }, 4000);
      } else {
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
        if (err.response.data.erros) {
          setSenhaErros(err.response.data.erros);
          setShowSenhaRequisitos(true);
        }
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
        {showAviso && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
            <strong>Atenção:</strong> A primeira mensalidade será cobrada com desconto especial. As demais cobranças seguirão o valor normal do plano selecionado. O valor promocional aparecerá na sua fatura/cartão, mesmo que o checkout mostre apenas o valor cheio.
          </div>
        )}
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
              <label htmlFor="telefone" className="sr-only">Telefone</label>
              <input
                id="telefone"
                name="telefone"
                type="tel"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Telefone"
                value={formData.telefone}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="cpf" className="sr-only">CPF</label>
              <input
                id="cpf"
                name="cpf"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="CPF"
                value={formData.cpf}
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
                onFocus={() => setShowSenhaRequisitos(true)}
              />
            </div>
            {showSenhaRequisitos && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
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