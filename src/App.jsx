import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import PeoplePage from './pages/PeoplePage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/harta" element={<MapPage />} />
        <Route path="/persoane" element={<PeoplePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;