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
  const {
    roomId,
    status,
    error,
    language,
    restored,
    restoreCount,
    createRoom,
    joinRoom,
    leaveRoom,
  } = useRoom('multiplayer');

  const backToLobby = () => {
    leaveRoom();
    setView('menu');
  };

  // 'finished' keeps the final board up, so a refresh after the round still
  // shows the result instead of dropping back to the menu.
  if (roomId && (status === 'playing' || status === 'finished')) {
    return (
      <Game
        key={`${roomId}:${restoreCount}`}
        roomId={roomId}
        mode="multiplayer"
        language={language}
        restored={restored}
        onExit={onExit}
      />
    );
  }

  // Reached either by pressing "Create game" or by refreshing while the room
  // is still waiting for an opponent — both need the room code on screen.
  if (view === 'create' || (roomId && status === 'waiting')) {
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
