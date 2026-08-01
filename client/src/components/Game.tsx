import { useCallback, useState } from 'react';
import type { LanguageCode } from '../types/game';
import { useGameState } from '../hooks/useGameState';
import { GameSetup } from './GameSetup';
import { Board } from './Board';
import { HelpPanel } from './HelpPanel';
import { FlashHint } from './FlashHint';

interface GameProps {
  onExit: () => void;
}

export function Game({ onExit }: GameProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode | ''>('');
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  const {
    solution,
    guesses,
    currentGuess,
    currentGuessIndex,
    gameStatus,
    helpUsage,
    flashHint,
    startNewGame,
    handleRevealLetterHelp,
    handleSuggestWordHelp,
    handleFlashSolutionHelp,
  } = useGameState(selectedLanguage);

  const handleStartGame = useCallback(() => {
    if (!selectedLanguage) return;
    setHasStarted(true);
    void startNewGame();
  }, [selectedLanguage, startNewGame]);

  if (!hasStarted) {
    return (
      <GameSetup
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
        onStart={handleStartGame}
        onBack={onExit}
      />
    );
  }

  return (
    <main className="game">
      <HelpPanel
        gameStatus={gameStatus}
        helpUsage={helpUsage}
        onRevealLetter={handleRevealLetterHelp}
        onSuggestWord={handleSuggestWordHelp}
        onFlashSolution={handleFlashSolutionHelp}
      />
      <FlashHint hint={flashHint} />

      <Board
        guesses={guesses}
        currentGuess={currentGuess}
        currentGuessIndex={currentGuessIndex}
        gameStatus={gameStatus}
        solution={solution}
      />

      <button className="text-button" type="button" onClick={onExit}>
        Back to home
      </button>
    </main>
  );
}
