import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AssistenteEstudos from './pages/AssistenteEstudos';
import Apostilas from './pages/Apostilas';
import Simulados from './pages/Simulados';
import ChatAssistente from './pages/ChatAssistente';
import DicasEstudo from './pages/DicasEstudo';
import Videoaulas from './pages/Videoaulas';
// import Comunidade from './pages/Comunidade';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import ChatModal from './components/ChatModal';
import BtnEdital from './components/BtnEdital';
import AmbienteSupervisor from './pages/AmbienteSupervisor';
import AmbienteOrientador from './pages/AmbienteOrientador';
import AmbienteAdministrador from './pages/AmbienteAdministrador';
import AmbienteAuxiliar from './pages/AmbienteAuxiliar';
import AmbienteProfessorIniciais from './pages/AmbienteProfessorIniciais';
import AmbienteProfessorInfantil from './pages/AmbienteProfessorInfantil';
import AmbienteMonitor from './pages/AmbienteMonitor';
import AmbienteGenerico from './pages/AmbienteGenerico';
import AmbienteGeral from './pages/AmbienteGeral';
import Register from './pages/Register';
import MapasMentais from './pages/MapasMentais';

// Componente PrivateRoute para proteção das rotas
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  const [chatOpen, setChatOpen] = useState(false);
  return (
    <Router>
      <AuthProvider>
        {/* <BtnEdital /> */}
        <ChatModal isOpen={chatOpen} onClose={() => setChatOpen(false)}>
          <ChatAssistente onClose={() => setChatOpen(false)} />
        </ChatModal>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/assistente"
            element={
              <PrivateRoute>
                <AssistenteEstudos />
              </PrivateRoute>
            }
          />
          <Route
            path="/apostilas"
            element={
              <PrivateRoute>
                <Apostilas />
              </PrivateRoute>
            }
          />
          <Route
            path="/apostilas/:cargo"
            element={
              <PrivateRoute>
                <Apostilas />
              </PrivateRoute>
            }
          />
          <Route
            path="/simulados"
            element={
              <PrivateRoute>
                <Simulados />
              </PrivateRoute>
            }
          />
          <Route
            path="/dicas/:cargo"
            element={
              <PrivateRoute>
                <DicasEstudo />
              </PrivateRoute>
            }
          />
          <Route
            path="/videoaulas"
            element={
              <PrivateRoute>
                <Videoaulas />
              </PrivateRoute>
            }
          />
          <Route
            path="/ambiente/supervisor"
            element={
              <PrivateRoute>
                <AmbienteSupervisor />
              </PrivateRoute>
            }
          />
          <Route
            path="/ambiente/orientador"
            element={
              <PrivateRoute>
                <AmbienteOrientador />
              </PrivateRoute>
            }
          />
          <Route
            path="/ambiente/administrador"
            element={
              <PrivateRoute>
                <AmbienteAdministrador />
              </PrivateRoute>
            }
          />
          <Route
            path="/ambiente/auxiliar"
            element={
              <PrivateRoute>
                <AmbienteAuxiliar />
              </PrivateRoute>
            }
          />
          <Route
            path="/ambiente/professor_iniciais"
            element={
              <PrivateRoute>
                <AmbienteProfessorIniciais />
              </PrivateRoute>
            }
          />
          <Route
            path="/ambiente/professor_infantil"
            element={
              <PrivateRoute>
                <AmbienteProfessorInfantil />
              </PrivateRoute>
            }
          />
          <Route
            path="/ambiente/monitor"
            element={
              <PrivateRoute>
                <AmbienteMonitor />
              </PrivateRoute>
            }
          />
          <Route
            path="/ambiente/geral"
            element={
              <PrivateRoute>
                <AmbienteGeral />
              </PrivateRoute>
            }
          />
          <Route
            path="/ambiente/:cargo"
            element={
              <PrivateRoute>
                <AmbienteGenerico />
              </PrivateRoute>
            }
          />
          <Route
            path="/mapas-mentais"
            element={
              <PrivateRoute>
                <MapasMentais />
              </PrivateRoute>
            }
          />
          {/* <Route path="/comunidade" element={<Comunidade />} /> */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;