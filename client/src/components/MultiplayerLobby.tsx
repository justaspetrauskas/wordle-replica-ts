import { useState } from 'react';
import type { LobbyView } from '../types/game';
import { useRoom } from '../hooks/useRoom';
import { CreateGame } from './CreateGame';
import { JoinGame } from './JoinGame';
import { Game } from './Game';

interface MultiplayerLobbyProps {
  onExit: () => void;
}

export function MultiplayerLobby({ onExit }: MultiplayerLobbyProps) {
  const [view, setView] = useState<LobbyView>('menu');
  const { roomId, status, error, createRoom, joinRoom } = useRoom();

  const backToLobby = () => setView('menu');

  if (status === 'playing' && roomId) {
    return <Game key={roomId} roomId={roomId} mode="multiplayer" onExit={onExit} />;
  }

  if (view === 'create') {
    return (
      <CreateGame
        roomId={roomId}
        status={status}
        error={error}
        onCreate={(language) => createRoom(language, 'multiplayer')}
        onBack={backToLobby}
      />
    );
  }

  if (view === 'join') {
    return (
      <JoinGame
        status={status}
        error={error}
        onJoin={joinRoom}
        onBack={backToLobby}
      />
    );
  }

  return (
    <main className="game game--setup">
      <div className="setup-card">
        <h1 className="setup-title">Multiplayer</h1>
        <div className="menu-actions">
          <button
            className="menu-button menu-button--primary"
            type="button"
            onClick={() => setView('create')}
          >
            Create game
          </button>
          <button
            className="menu-button"
            type="button"
            onClick={() => setView('join')}
          >
            Join game
          </button>
        </div>
        <button className="text-button" type="button" onClick={onExit}>
          Back to home
        </button>
      </div>
    </main>
  );
}
