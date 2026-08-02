import { useCallback, useEffect, useState } from 'react';
import type {
  FlashHint,
  HelpUsage,
  HintKind,
  LetterState,
  Outcome,
  PlayerStatus,
  RoomReconnectedPayload,
  SubmittedGuess,
} from '../types/game';
import { socket } from '../lib/socket';
import { WORD_LENGTH } from '../constants';
import { getPlayerId } from '../lib/player';

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
export function useGame(roomId: string) {
  const [guesses, setGuesses] = useState<SubmittedGuess[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>('playing');
  const [opponentRows, setOpponentRows] = useState<LetterState[][]>([]);
  const [helpUsage, setHelpUsage] = useState<HelpUsage>(INITIAL_HELP_USAGE);
  const [flashHint, setFlashHint] = useState<FlashHint>(INITIAL_FLASH_HINT);
  const [message, setMessage] = useState<string>('');
  const [solution, setSolution] = useState<string>('');
  const [outcome, setOutcome] = useState<Outcome | null>(null);

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

    const handleRoomReconnected = ({
      guesses: restoredGuesses,
      status,
      helpUsage: restoredHelpUsage,
      opponentRows: restoredOpponentRows,
      roomStatus,
      solution: revealedSolution,
    }: RoomReconnectedPayload) => {
      setGuesses(restoredGuesses);
      setPlayerStatus(status);
      setHelpUsage(restoredHelpUsage);
      setOpponentRows(restoredOpponentRows);
      setCurrentGuess([]);
      setIsSubmitting(false);
      setMessage('');

      if (roomStatus === 'finished') {
        // The server only sends the word once the round is over.
        setSolution(revealedSolution ?? '');
        setOutcome(status === 'won' ? 'won' : 'lost');
      } else {
        setSolution('');
        setOutcome(null);
      }
    };

    socket.on('guess_result', handleGuessResult);
    socket.on('invalid_guess', handleInvalidGuess);
    socket.on('opponent_progress', handleOpponentProgress);
    socket.on('game_over', handleGameOver);
    socket.on('player_left', handlePlayerLeft);
    socket.on('hint_result', handleHintResult);
    socket.on('room_reconnected', handleRoomReconnected);

    return () => {
      socket.off('guess_result', handleGuessResult);
      socket.off('invalid_guess', handleInvalidGuess);
      socket.off('opponent_progress', handleOpponentProgress);
      socket.off('game_over', handleGameOver);
      socket.off('player_left', handlePlayerLeft);
      socket.off('hint_result', handleHintResult);
      socket.off('room_reconnected', handleRoomReconnected);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (playerStatus !== 'playing' || outcome || isSubmitting) return;

      if (e.key === 'Backspace') {
        setCurrentGuess((prev) => prev.slice(0, -1));
        return;
      }

      if (e.key === 'Enter') {
        if (currentGuess.length !== WORD_LENGTH) return;
        setIsSubmitting(true);
        socket.emit('submit_guess', { roomId, guess: currentGuess.join('') });
        return;
      }

      if (/^\p{L}$/u.test(e.key) && currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((prev) => [...prev, e.key.toLowerCase()]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, isSubmitting, outcome, playerStatus, roomId]);

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
    requestHint,
  };
}
