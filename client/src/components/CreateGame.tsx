import { useState } from 'react';
import type { LanguageCode, RoomStatus } from '../types/game';
import { LanguagePicker } from './LanguagePicker';

interface CreateGameProps {
  roomId: string;
  status: RoomStatus;
  error: string;
  onCreate: (language: LanguageCode) => void;
  onBack: () => void;
}

export function CreateGame({ roomId, status, error, onCreate, onBack }: CreateGameProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode | ''>('');

  if (status === 'waiting') {
    return (
      <main className="game game--setup">
        <div className="setup-card">
          <h1 className="setup-title">Waiting for a player</h1>
          <p className="lobby-note">Share this room code:</p>
          <p className="room-code">{roomId}</p>
          <button className="text-button" type="button" onClick={onBack}>
            Back to multiplayer
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="game game--setup">
      <div className="setup-card">
        <h1 className="setup-title">Create a game</h1>
        <LanguagePicker
          selectedLanguage={selectedLanguage}
          onSelectLanguage={setSelectedLanguage}
        />
        <button
          className="setup-start-button"
          type="button"
          onClick={() => selectedLanguage && onCreate(selectedLanguage)}
          disabled={!selectedLanguage || status === 'pending'}
        >
          {status === 'pending' ? 'Creating room…' : 'Create room'}
        </button>
        {error ? <p className="lobby-error" role="alert">{error}</p> : null}
        <button className="text-button" type="button" onClick={onBack}>
          Back to multiplayer
        </button>
      </div>
    </main>
  );
}
