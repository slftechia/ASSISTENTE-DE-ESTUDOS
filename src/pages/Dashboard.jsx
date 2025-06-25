import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import VideoSearch from '../components/VideoSearch';
import Assistant from '../components/Assistant';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('videos');
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Assistente de Estudos
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                Olá, {user?.nome}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'videos'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Videoaulas
            </button>
            <button
              onClick={() => setActiveTab('assistant')}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'assistant'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Assistente Virtual
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'videos' ? (
          <VideoSearch />
        ) : (
          <Assistant />
        )}
      </main>
    </div>
  );
};

export default Dashboard; 