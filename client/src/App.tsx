import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Setup } from './pages/Setup';
import { SoloGame } from './pages/SoloGame';
import { Room } from './pages/Room';

/**
 * The URL is the source of truth for which room the player is in, so a room
 * link can be shared and a refresh lands back in the same place.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Setup />} />
        <Route path="/play" element={<SoloGame />} />
        <Route path="/room/:code" element={<Room />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
