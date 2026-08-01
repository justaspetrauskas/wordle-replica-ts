import { useState, type FormEvent } from 'react';
import type { RoomStatus } from '../types/game';
import { ROOM_CODE_LENGTH } from '../constants';

interface JoinGameProps {
  status: RoomStatus;
  error: string;
  onJoin: (roomCode: string) => void;
  onBack: () => void;
}

export function JoinGame({ status, error, onJoin, onBack }: JoinGameProps) {
  const [roomCode, setRoomCode] = useState<string>('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onJoin(roomCode);
  };

  return (
    <main className="game game--setup">
      <form className="setup-card" onSubmit={handleSubmit}>
        <h1 className="setup-title">Join a game</h1>
        <label className="lobby-label" htmlFor="room-code">Room code</label>
        <input
          id="room-code"
          className="room-code-input"
          value={roomCode}
          onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
          maxLength={ROOM_CODE_LENGTH}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="ABC123"
        />
        <button
          className="setup-start-button"
          type="submit"
          disabled={!roomCode.trim() || status === 'pending'}
        >
          {status === 'pending' ? 'Joining…' : 'Join room'}
        </button>
        {error ? <p className="lobby-error" role="alert">{error}</p> : null}
        <button className="text-button" type="button" onClick={onBack}>
          Back to multiplayer
        </button>
      </form>
    </main>
  );
}
