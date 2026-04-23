import { useCallback, useState } from 'react';
import './App.css';
import type { LanguageCode } from './types/game';
import { useGameState } from './hooks/useGameState';
import { GameSetup } from './components/GameSetup';
import { Board } from './components/Board';
import { HelpPanel } from './components/HelpPanel';
import { FlashHint } from './components/FlashHint';

function App() {
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
    </main>
  );
}

export default App;
