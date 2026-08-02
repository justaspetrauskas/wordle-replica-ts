import { useCallback, useState } from 'react';
import type { LanguageCode } from '../types/game';
import { useRoom } from '../hooks/useRoom';
import { GameSetup } from './GameSetup';
import { Game } from './Game';

interface SoloGameProps {
  onExit: () => void;
}

export function SoloGame({ onExit }: SoloGameProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode | ''>('');
  const { roomId, status, error, language, restored, restoreCount, createRoom } =
    useRoom('solo');

  // A solo game is a one-player room, so the secret word never reaches the
  // client until the round is over.
  const startGame = useCallback(() => {
    if (!selectedLanguage) return;
    createRoom(selectedLanguage);
  }, [createRoom, selectedLanguage]);

  if (roomId && (status === 'playing' || status === 'finished')) {
    return (
      <Game
        key={`${roomId}:${restoreCount}`}
        roomId={roomId}
        mode="solo"
        language={language}
        restored={restored}
        onExit={onExit}
        onPlayAgain={startGame}
      />
    );
  }

  return (
    <GameSetup
      selectedLanguage={selectedLanguage}
      onSelectLanguage={setSelectedLanguage}
      onStart={startGame}
      onBack={onExit}
      isStarting={status === 'pending'}
      error={error}
    />
  );
}
