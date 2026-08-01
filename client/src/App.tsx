import { useCallback, useState } from 'react';
import './App.css';
import type { GameMode } from './types/game';
import { Home } from './components/Home';
import { Game } from './components/Game';
import { MultiplayerLobby } from './components/MultiplayerLobby';

function App() {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);

  const backToHome = useCallback(() => setGameMode(null), []);

  if (gameMode === 'solo') {
    return <Game onExit={backToHome} />;
  }

  if (gameMode === 'multiplayer') {
    return <MultiplayerLobby onExit={backToHome} />;
  }

  return <Home onSelectMode={setGameMode} />;
}

export default App;
