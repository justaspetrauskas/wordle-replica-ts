import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  FlashHint,
  HelpUsage,
  HintKind,
  KeyState,
  KeyboardLetterStates,
  LetterState,
  Outcome,
  PlayerStatus,
  RoomReconnectedPayload,
  SubmittedGuess,
} from '../types/game';
import { socket } from '../lib/socket';
import { WORD_LENGTH } from '../constants';
import { getPlayerId } from '../lib/player';

/** A better-known state always wins, so a letter never downgrades to absent. */
const STATE_RANK: Record<KeyState, number> = {
  absent: 0,
  present: 1,
  correct: 2,
};

/** Guards against a payload left over from a previous room. */
function restoreFor(
  roomId: string,
  restored: RoomReconnectedPayload | null
): RoomReconnectedPayload | null {
  return restored && restored.roomId === roomId ? restored : null;
}

const INITIAL_HELP_USAGE: HelpUsage = {
  revealLetter: false,
  suggestWord: false,
  flashSolution: false,
};

const INITIAL_FLASH_HINT: FlashHint = { visible: false, top: 50, left: 50, word: '' };

/**
 * Everything the client still owns during a round: the keyboard, the guess
 * being typed, and the tiles. Grading, stored guesses and the win/loss call all
 * come back from the server.
 */
export function useGame(
  roomId: string,
  restored: RoomReconnectedPayload | null
) {
  // Seeded from the reconnect payload on mount. Callers remount this hook with
  // a fresh key when a new payload arrives, so there is no prop-to-state sync.
  const restore = restoreFor(roomId, restored);
  const isFinished = restore?.roomStatus === 'finished';

  const [guesses, setGuesses] = useState<SubmittedGuess[]>(
    () => restore?.guesses ?? []
  );
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>(
    () => restore?.status ?? 'playing'
  );
  const [opponentRows, setOpponentRows] = useState<LetterState[][]>(
    () => restore?.opponentRows ?? []
  );
  const [helpUsage, setHelpUsage] = useState<HelpUsage>(
    () => restore?.helpUsage ?? INITIAL_HELP_USAGE
  );
  const [flashHint, setFlashHint] = useState<FlashHint>(INITIAL_FLASH_HINT);
  const [message, setMessage] = useState<string>('');
  // The server only sends the word once the round is over.
  const [solution, setSolution] = useState<string>(
    () => (isFinished ? restore?.solution ?? '' : '')
  );
  const [outcome, setOutcome] = useState<Outcome | null>(() => {
    if (!isFinished) return null;

    return restore?.status === 'won' ? 'won' : 'lost';
  });

  useEffect(() => {
    const handleGuessResult = ({
      guesses: gradedGuesses,
      status,
    }: { guesses: SubmittedGuess[]; status: PlayerStatus }) => {
      setGuesses(gradedGuesses);
      setPlayerStatus(status);
      setCurrentGuess([]);
      setIsSubmitting(false);
      setMessage('');
    };

    const handleInvalidGuess = ({ message: reason }: { message: string }) => {
      // The typed word is kept so the player can fix it instead of retyping.
      setIsSubmitting(false);
      setMessage(reason);
    };

    const handleOpponentProgress = ({ rows }: { rows: LetterState[][] }) => {
      setOpponentRows(rows);
    };

    const handleGameOver = ({
      winnerId,
      solution: revealedSolution,
    }: { winnerId: string | null; solution: string }) => {
      // The server reports the winner by persistent player id. socket.id is a
      // per-connection value and would never match.
      setSolution(revealedSolution);
      setOutcome(winnerId && winnerId === getPlayerId() ? 'won' : 'lost');
      setIsSubmitting(false);
      setCurrentGuess([]);
    };

    const handlePlayerLeft = () => {
      setMessage('Your opponent left the game.');
    };

    const handleHintResult = ({
      helpUsage: usage,
      message: hintMessage,
      word,
    }: { helpUsage: HelpUsage; message?: string; word?: string }) => {
      setHelpUsage(usage);

      if (word) {
        setFlashHint({
          visible: true,
          top: Math.floor(Math.random() * 80) + 10,
          left: Math.floor(Math.random() * 80) + 10,
          word,
        });

        setTimeout(() => {
          setFlashHint((prev) => ({ ...prev, visible: false }));
        }, 300);

        return;
      }

      setMessage(hintMessage ?? '');
    };

    socket.on('guess_result', handleGuessResult);
    socket.on('invalid_guess', handleInvalidGuess);
    socket.on('opponent_progress', handleOpponentProgress);
    socket.on('game_over', handleGameOver);
    socket.on('player_left', handlePlayerLeft);
    socket.on('hint_result', handleHintResult);

    return () => {
      socket.off('guess_result', handleGuessResult);
      socket.off('invalid_guess', handleInvalidGuess);
      socket.off('opponent_progress', handleOpponentProgress);
      socket.off('game_over', handleGameOver);
      socket.off('player_left', handlePlayerLeft);
      socket.off('hint_result', handleHintResult);
    };
  }, []);

  const canType = playerStatus === 'playing' && !outcome && !isSubmitting;

  // Shared by the physical keyboard and the on-screen one, so both behave
  // identically.
  const pressLetter = useCallback(
    (letter: string) => {
      if (!canType || currentGuess.length >= WORD_LENGTH) return;
      setCurrentGuess((prev) => [...prev, letter.toLowerCase()]);
    },
    [canType, currentGuess.length]
  );

  const pressBackspace = useCallback(() => {
    if (!canType) return;
    setCurrentGuess((prev) => prev.slice(0, -1));
  }, [canType]);

  const pressEnter = useCallback(() => {
    if (!canType || currentGuess.length !== WORD_LENGTH) return;
    setIsSubmitting(true);
    socket.emit('submit_guess', { roomId, guess: currentGuess.join('') });
  }, [canType, currentGuess, roomId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'Backspace') {
        pressBackspace();
        return;
      }

      if (e.key === 'Enter') {
        pressEnter();
        return;
      }

      if (/^\p{L}$/u.test(e.key)) {
        pressLetter(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pressBackspace, pressEnter, pressLetter]);

  /** Colours the on-screen keys from the player's own graded guesses. */
  const letterStates = useMemo<KeyboardLetterStates>(() => {
    const states: KeyboardLetterStates = {};

    for (const guess of guesses) {
      guess.word.split('').forEach((letter, index) => {
        const state = guess.states[index];

        if (state === 'empty' || !state) return;

        const known = states[letter];

        if (!known || STATE_RANK[state] > STATE_RANK[known]) {
          states[letter] = state;
        }
      });
    }

    return states;
  }, [guesses]);

  const requestHint = useCallback((hint: HintKind) => {
    socket.emit('request_hint', { roomId, hint });
  }, [roomId]);

  return {
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
  };
}
