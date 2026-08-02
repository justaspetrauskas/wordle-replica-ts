import { useCallback, useState } from 'react';
import './App.css';
import type { GameMode } from './types/game';
import { Home } from './components/Home';
import { SoloGame } from './components/SoloGame';
import { MultiplayerLobby } from './components/MultiplayerLobby';
import { clearSavedRoom, getSavedRoom } from './lib/room';

function App() {
  // A refresh lands back on the screen that owns the saved room, so the
  // reconnect handshake can run without the player navigating there by hand.
  const [gameMode, setGameMode] = useState<GameMode | null>(
    () => getSavedRoom()?.mode ?? null
  );

  const backToHome = useCallback(() => {
    clearSavedRoom();
    setGameMode(null);
  }, []);

  if (gameMode === 'solo') {
    return <SoloGame onExit={backToHome} />;
  }

  if (gameMode === 'multiplayer') {
    return <MultiplayerLobby onExit={backToHome} />;
  }

  return <Home onSelectMode={setGameMode} />;
}

export default App;
