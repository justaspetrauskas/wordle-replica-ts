import { useState } from 'react';
import type { LobbyView } from '../types/game';
import { useMultiplayerRoom } from '../hooks/useMultiplayerRoom';
import { CreateGame } from './CreateGame';
import { JoinGame } from './JoinGame';

interface MultiplayerLobbyProps {
  onExit: () => void;
}

export function MultiplayerLobby({ onExit }: MultiplayerLobbyProps) {
  const [view, setView] = useState<LobbyView>('menu');
  const { roomId, status, error, createRoom, joinRoom } = useMultiplayerRoom();

  const backToLobby = () => setView('menu');

  if (status === 'playing') {
    return (
      <main className="game game--setup">
        <div className="setup-card">
          <h1 className="setup-title">Both players are in</h1>
          <p className="lobby-note">Room <strong>{roomId}</strong> has started.</p>
          <p className="lobby-note">The shared board is not built yet.</p>
          <button className="setup-start-button" type="button" onClick={onExit}>
            Back to home
          </button>
        </div>
      </main>
    );
  }

  if (view === 'create') {
    return (
      <CreateGame
        roomId={roomId}
        status={status}
        error={error}
        onCreate={createRoom}
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
