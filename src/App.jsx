import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MenuPage from './pages/MenuPage';
import ChatPage from './pages/ChatPage';
import ApostilasPage from './pages/ApostilasPage';
import SimuladosPage from './pages/SimuladosPage';
import DicasPage from './pages/DicasPage';
import ComunidadePage from './pages/ComunidadePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/apostilas" element={<ApostilasPage />} />
        <Route path="/simulados" element={<SimuladosPage />} />
        <Route path="/dicas" element={<DicasPage />} />
        <Route path="/comunidade" element={<ComunidadePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App; 