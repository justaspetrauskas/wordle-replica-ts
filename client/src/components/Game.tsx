import type {
  GameStatus,
  LanguageCode,
  RoomMode,
  RoomReconnectedPayload,
} from '../types/game';
import { useGame } from '../hooks/useGame';
import { Board } from './Board';
import { HelpPanel } from './HelpPanel';
import { FlashHint } from './FlashHint';
import { Keyboard } from './Keyboard';
import { OpponentBoard } from './OpponentBoard';

interface GameProps {
  roomId: string;
  mode: RoomMode;
  language: LanguageCode;
  restored: RoomReconnectedPayload | null;
  onExit: () => void;
  onPlayAgain?: () => void;
}

export function Game({
  roomId,
  mode,
  language,
  restored,
  onExit,
  onPlayAgain,
}: GameProps) {
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
    letterStates,
    canType,
    pressLetter,
    pressEnter,
    pressBackspace,
    requestHint,
  } = useGame(roomId, restored);

  const gameStatus: GameStatus = playerStatus === 'playing' && !outcome ? 'playing' : 'ended';

  const resultText = outcome === 'won'
    ? 'You guessed it!'
    : `Round over — the word was "${solution.toUpperCase()}".`;

  return (
    <main className="game game--play">
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

      <Keyboard
        language={language}
        letterStates={letterStates}
        disabled={!canType}
        onLetter={pressLetter}
        onEnter={pressEnter}
        onBackspace={pressBackspace}
      />

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
