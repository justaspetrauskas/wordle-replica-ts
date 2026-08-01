import type { GameStatus, RoomMode } from '../types/game';
import { useGame } from '../hooks/useGame';
import { Board } from './Board';
import { HelpPanel } from './HelpPanel';
import { FlashHint } from './FlashHint';
import { OpponentBoard } from './OpponentBoard';

interface GameProps {
  roomId: string;
  mode: RoomMode;
  onExit: () => void;
  onPlayAgain?: () => void;
}

export function Game({ roomId, mode, onExit, onPlayAgain }: GameProps) {
  const {
    guesses,
    currentGuess,
    playerStatus,
    opponentRows,
    helpUsage,
    flashHint,
    message,
    solution,
    outcome,
    requestHint,
  } = useGame(roomId);

  const gameStatus: GameStatus = playerStatus === 'playing' && !outcome ? 'playing' : 'ended';

  const resultText = outcome === 'won'
    ? 'You guessed it!'
    : `Round over — the word was "${solution.toUpperCase()}".`;

  return (
    <main className="game">
      <HelpPanel
        gameStatus={gameStatus}
        helpUsage={helpUsage}
        onRevealLetter={() => requestHint('revealLetter')}
        onSuggestWord={() => requestHint('suggestWord')}
        onFlashSolution={() => requestHint('flashSolution')}
      />
      <FlashHint hint={flashHint} />

      <Board guesses={guesses} currentGuess={currentGuess} />

      {mode === 'multiplayer' ? <OpponentBoard rows={opponentRows} /> : null}

      {message ? <p className="lobby-error" role="alert">{message}</p> : null}

      {outcome ? (
        <div className="result-card">
          <p className="result-text">{resultText}</p>
          {onPlayAgain ? (
            <button className="setup-start-button" type="button" onClick={onPlayAgain}>
              Play again
            </button>
          ) : null}
        </div>
      ) : null}

      <button className="text-button" type="button" onClick={onExit}>
        Back to home
      </button>
    </main>
  );
}
