import { useCallback, useEffect, useState } from 'react';
import type { FlashHint, GameStatus, HelpUsage, LanguageCode } from '../types/game';
import { fetchWords } from '../lib/api';
import { MAX_GUESSES, WORD_LENGTH } from '../constants';

const INITIAL_HELP_USAGE: HelpUsage = {
  revealLetter: false,
  suggestWord: false,
  flashSolution: false,
};

export function useGameState(selectedLanguage: LanguageCode | '') {
  const [solution, setSolution] = useState<string>('');
  const [wordPool, setWordPool] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<(string | null)[]>(Array(MAX_GUESSES).fill(null));
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [currentGuessIndex, setCurrentGuessIndex] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [helpUsage, setHelpUsage] = useState<HelpUsage>(INITIAL_HELP_USAGE);
  const [flashHint, setFlashHint] = useState<FlashHint>({ visible: false, top: 50, left: 50, word: '' });

  const startNewGame = useCallback(async () => {
    if (!selectedLanguage) return;

    const words = await fetchWords(selectedLanguage);
    const randomIndex = Math.floor(Math.random() * words.length);
    const word = words[randomIndex] ?? '';

    setSolution(word);
    setWordPool(words);
    setGuesses(Array(MAX_GUESSES).fill(null));
    setCurrentGuess([]);
    setCurrentGuessIndex(0);
    setHelpUsage(INITIAL_HELP_USAGE);
    setFlashHint({ visible: false, top: 50, left: 50, word: '' });
    setGameStatus('playing');
  }, [selectedLanguage]);

  const handleRevealLetterHelp = useCallback(() => {
    if (gameStatus !== 'playing' || !solution || helpUsage.revealLetter) return;

    const unrevealedIndexes = solution
      .split('')
      .map((_, index) => index)
      .filter((index) => !guesses.some((guess) => guess?.[index] === solution[index]));

    const hintIndexPool = unrevealedIndexes.length > 0
      ? unrevealedIndexes
      : solution.split('').map((_, index) => index);

    const randomIndex = hintIndexPool[Math.floor(Math.random() * hintIndexPool.length)];
    const hintLetter = solution[randomIndex];

    setHelpUsage((prev) => ({ ...prev, revealLetter: true }));
    window.alert(`Hint: letter ${randomIndex + 1} is "${hintLetter.toUpperCase()}".`);
  }, [gameStatus, guesses, helpUsage.revealLetter, solution]);

  const handleSuggestWordHelp = useCallback(() => {
    if (gameStatus !== 'playing' || !solution || helpUsage.suggestWord) return;

    const candidates = wordPool.filter((word) => {
      if (word === solution || word.length !== solution.length) return false;
      return word.split('').some((letter, index) => letter === solution[index]);
    });

    setHelpUsage((prev) => ({ ...prev, suggestWord: true }));

    if (candidates.length === 0) {
      window.alert('No candidate word found for this hint.');
      return;
    }

    const randomIndex = Math.floor(Math.random() * candidates.length);
    window.alert(`Try this word: ${candidates[randomIndex].toUpperCase()}`);
  }, [gameStatus, helpUsage.suggestWord, solution, wordPool]);

  const handleFlashSolutionHelp = useCallback(() => {
    if (gameStatus !== 'playing' || !solution || helpUsage.flashSolution) return;

    const top = Math.floor(Math.random() * 80) + 10;
    const left = Math.floor(Math.random() * 80) + 10;

    setHelpUsage((prev) => ({ ...prev, flashSolution: true }));
    setFlashHint({ visible: true, top, left, word: solution.toUpperCase() });

    setTimeout(() => {
      setFlashHint((prev) => ({ ...prev, visible: false }));
    }, 300);
  }, [gameStatus, helpUsage.flashSolution, solution]);

  const promptRestart = useCallback((didWin: boolean) => {
    const message = didWin
      ? 'You guessed the word! Restart game?'
      : `You ran out of guesses. The word was "${solution}". Restart game?`;

    if (window.confirm(message)) {
      void startNewGame();
    } else {
      setGameStatus('ended');
    }
  }, [solution, startNewGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatus !== 'playing' || !solution || currentGuessIndex >= MAX_GUESSES) return;

      if (e.key === 'Backspace') {
        setCurrentGuess((prev) => prev.slice(0, -1));
        return;
      }

      if (e.key === 'Enter') {
        if (currentGuess.length !== WORD_LENGTH) return;

        const submittedGuess = currentGuess.join('');

        setGuesses((prev) => {
          const updated = [...prev];
          updated[currentGuessIndex] = submittedGuess;
          return updated;
        });

        if (submittedGuess === solution) {
          setCurrentGuessIndex((prev) => prev + 1);
          setGameStatus('ended');
          setCurrentGuess([]);
          promptRestart(true);
          return;
        }

        if (currentGuessIndex === MAX_GUESSES - 1) {
          setGameStatus('ended');
          setCurrentGuess([]);
          promptRestart(false);
          return;
        }

        setCurrentGuessIndex((prev) => prev + 1);
        setCurrentGuess([]);
        return;
      }

      if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((prev) => [...prev, e.key.toLowerCase()]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, currentGuessIndex, gameStatus, promptRestart, solution]);

  return {
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
  };
}
