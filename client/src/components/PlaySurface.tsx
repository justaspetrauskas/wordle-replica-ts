import type { ReactNode } from 'react';
import type {
  CategoryId,
  GameStatus,
  LetterState,
  LanguageCode,
  PlayerStatus,
  RoomMode,
  RoomReconnectedPayload,
} from '../types/game';
import { useGame } from '../hooks/useGame';
import { Board } from './Board';
import { CategoryWash } from './CategoryWash';
import { ColorKey, PageShell, TopBar } from './Chrome';
import { HelpFlash, HelpsBar } from './Helps';
import { Keyboard } from './Keyboard';

export interface GameView {
  opponentRows: LetterState[][];
  playerStatus: PlayerStatus;
  guessCount: number;
}

interface PlaySurfaceProps {
  roomId: string;
  mode: RoomMode;
  language: LanguageCode;
  category: CategoryId;
  restored: RoomReconnectedPayload | null;
  /** A room still waiting for its second player cannot accept guesses. */
  waiting?: boolean;
  backTo: string;
  headerCenter?: ReactNode;
  headerRight?: ReactNode;
  /**
   * A render prop rather than a node: the opponent's rows come from the game
   * state this component owns, so the aside has to be built from the inside.
   */
  aside?: (view: GameView) => ReactNode;
  /** Rendered under the board, above the keyboard. */
  sideNote?: ReactNode;
  onPlayAgain?: () => void;
  playAgainLabel?: string;
}

export function PlaySurface({
  roomId,
  mode,
  language,
  category,
  restored,
  waiting = false,
  backTo,
  headerCenter,
  headerRight,
  aside,
  sideNote,
  onPlayAgain,
  playAgainLabel = 'New game',
}: PlaySurfaceProps) {
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
    shake,
    pressLetter,
    pressEnter,
    pressBackspace,
    requestHint,
  } = useGame(roomId, restored);

  const gameStatus: GameStatus =
    playerStatus === 'playing' && !outcome ? 'playing' : 'ended';

  const column = (
    <div>
      <ColorKey />
      <p className="mb-2 mt-2 h-5 text-center text-sm text-coral-ink" role="alert">
        {waiting ? 'Waiting for a second player…' : message}
      </p>

      <Board guesses={guesses} currentGuess={currentGuess} shake={shake} />

      {gameStatus === 'playing' && !waiting ? (
        <div className="mt-4">
          <HelpsBar
            gameStatus={gameStatus}
            helpUsage={helpUsage}
            onRevealLetter={() => requestHint('revealLetter')}
            onSuggestWord={() => requestHint('suggestWord')}
            onFlashSolution={() => requestHint('flashSolution')}
          />
        </div>
      ) : null}

      {sideNote}

      {outcome ? (
        <div className="mx-auto mt-6 max-w-md text-center">
          <p className="font-display text-2xl sm:text-3xl">
            {outcome === 'won' ? 'Solved' : 'The word was'}
          </p>
          {solution ? (
            <p className="mt-1 font-accent text-3xl font-bold uppercase tracking-[0.18em] sm:text-4xl">
              {solution}
            </p>
          ) : null}
          {onPlayAgain ? (
            <button
              type="button"
              onClick={onPlayAgain}
              className="mt-4 font-accent font-semibold text-coral-ink underline underline-offset-4"
            >
              {playAgainLabel}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="sticky bottom-0 -mx-4 mt-3 bg-paper/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-sm sm:static sm:mx-0 sm:mt-4 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-0 sm:backdrop-blur-none">
        <Keyboard
          language={language}
          letterStates={letterStates}
          disabled={!canType || waiting}
          onLetter={pressLetter}
          onEnter={pressEnter}
          onBackspace={pressBackspace}
        />
      </div>
    </div>
  );

  return (
    <PageShell wide={mode === 'multiplayer'} className="pb-2">
      <CategoryWash category={category} />
      <HelpFlash hint={flashHint} />
      <TopBar backTo={backTo} center={headerCenter} right={headerRight} />

      {aside ? (
        <div className="mt-3 grid gap-8 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_220px]">
          {column}
          {/* The centre scrim does not reach out here, so the panel carries its
              own paper backing or the opponent's bars vanish into the art. */}
          <aside className="hidden rounded-2xl border-l border-ink/10 bg-paper/75 p-5 backdrop-blur-[1px] lg:block">
            {aside({ opponentRows, playerStatus, guessCount: guesses.length })}
          </aside>
        </div>
      ) : (
        <div className="mt-4">{column}</div>
      )}
    </PageShell>
  );
}
