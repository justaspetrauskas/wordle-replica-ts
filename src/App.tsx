import { useCallback, useEffect, useState } from 'react'
import './App.css'
import type {
  FlashHint,
  GameStatus,
  HelpUsage,
  LanguageCode,
  LetterState,
  RandomWordResponse,
} from './types/game'

const RANDOM_WORDS_API_URL = 'https://random-words-api.kushcreates.com/api';
const WORD_LENGTH = 5;
const WORD_COUNT = 50;
const LANGUAGE_OPTIONS: Array<{ label: string; value: LanguageCode; flag: string }> = [
  { label: 'English', value: 'en', flag: '🇬🇧' },
  { label: 'Spanish', value: 'es', flag: '🇪🇸' },
  { label: 'Danish', value: 'da', flag: '🇩🇰' },
  { label: 'Lithuanian', value: 'lt', flag: '🇱🇹' },
];

const INITIAL_HELP_USAGE: HelpUsage = {
  revealLetter: false,
  suggestWord: false,
  flashSolution: false,
};

const fetchWords = async (language: LanguageCode): Promise<string[]> => {
  const query = new URLSearchParams({
    language,
    category: 'wordle',
    length: String(WORD_LENGTH),
    words: String(WORD_COUNT),
  });

  const response = await fetch(`${RANDOM_WORDS_API_URL}?${query.toString()}`);
  const data: RandomWordResponse[] = await response.json();
  return data.map((item) => item.word.toLowerCase());
};

function App() {
  const [solution, setSolution] = useState<string>('');
  const [wordPool, setWordPool] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<(string | null)[]>(Array(6).fill(null));
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [currentGuessIndex, setCurrentGuessIndex] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [helpUsage, setHelpUsage] = useState<HelpUsage>(INITIAL_HELP_USAGE);
  const [flashHint, setFlashHint] = useState<FlashHint>({ visible: false, top: 50, left: 50, word: '' });
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode | ''>('');
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  const helpsLeft = Object.values(helpUsage).filter((used) => !used).length;

  const startNewGame = useCallback(async () => {
    if (!selectedLanguage) {
      return;
    }

    const words = await fetchWords(selectedLanguage);
    const randomIndex = Math.floor(Math.random() * words.length);
    const word = words[randomIndex] ?? '';

    setSolution(word);
    setWordPool(words);
    setGuesses(Array(6).fill(null));
    setCurrentGuess([]);
    setCurrentGuessIndex(0);
    setHelpUsage(INITIAL_HELP_USAGE);
    setFlashHint({ visible: false, top: 50, left: 50, word: '' });
    setGameStatus('playing');
  }, [selectedLanguage]);

  const handleStartGame = useCallback(() => {
    if (!selectedLanguage) {
      return;
    }

    setHasStarted(true);
    void startNewGame();
  }, [selectedLanguage, startNewGame]);

  const handleRevealLetterHelp = useCallback(() => {
    if (gameStatus !== 'playing' || !solution || helpUsage.revealLetter) {
      return;
    }

    const unrevealedIndexes = solution
      .split('')
      .map((_, index) => index)
      .filter((index) => {
        return !guesses.some((guess) => guess?.[index] === solution[index]);
      });

    const hintIndexPool = unrevealedIndexes.length > 0
      ? unrevealedIndexes
      : solution.split('').map((_, index) => index);

    const randomIndex = hintIndexPool[Math.floor(Math.random() * hintIndexPool.length)];
    const hintLetter = solution[randomIndex];

    setHelpUsage((prev) => ({ ...prev, revealLetter: true }));
    window.alert(`Hint: letter ${randomIndex + 1} is "${hintLetter.toUpperCase()}".`);
  }, [gameStatus, guesses, helpUsage.revealLetter, solution]);

  const handleSuggestWordHelp = useCallback(() => {
    if (gameStatus !== 'playing' || !solution || helpUsage.suggestWord) {
      return;
    }

    const candidates = wordPool.filter((word) => {
      if (word === solution || word.length !== solution.length) {
        return false;
      }

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
    if (gameStatus !== 'playing' || !solution || helpUsage.flashSolution) {
      return;
    }

    const top = Math.floor(Math.random() * 80) + 10;
    const left = Math.floor(Math.random() * 80) + 10;

    setHelpUsage((prev) => ({ ...prev, flashSolution: true }));
    setFlashHint({
      visible: true,
      top,
      left,
      word: solution.toUpperCase(),
    });

    setTimeout(() => {
      setFlashHint((prev) => ({ ...prev, visible: false }));
    }, 300);
  }, [gameStatus, helpUsage.flashSolution, solution]);

  const promptRestart = useCallback((didWin: boolean) => {
    const message = didWin
      ? 'You guessed the word! Restart game?'
      : `You ran out of guesses. The word was "${solution}". Restart game?`;

    const shouldRestart = window.confirm(message);

    if (shouldRestart) {
      void startNewGame();
    } else {
      setGameStatus('ended');
    }
  }, [solution, startNewGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasStarted || gameStatus !== 'playing' || !solution || currentGuessIndex >= 6) return;

      if (e.key === 'Backspace') {
        setCurrentGuess((prev) => prev.slice(0, -1));
        return;
      }

      if (e.key === 'Enter') {
        if (currentGuess.length !== 5) return;

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

        const isLastGuess = currentGuessIndex === 5;

        if (isLastGuess) {
          setGameStatus('ended');
          setCurrentGuess([]);
          promptRestart(false);
          return;
        }

        setCurrentGuessIndex((prev) => prev + 1);
        setCurrentGuess([]);
        return;
      }

      if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < 5) {
        setCurrentGuess((prev) => [...prev, e.key.toLowerCase()]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentGuess, currentGuessIndex, gameStatus, hasStarted, promptRestart, solution]);

  if (!hasStarted) {
    return (
      <main className="game game--setup">
        <div className="setup-card">
          <h1 className="setup-title">Choose game language</h1>
          <div className="language-flags" role="radiogroup" aria-label="Choose language">
            {LANGUAGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                className={`language-flag ${selectedLanguage === option.value ? 'language-flag--active' : ''}`}
                type="button"
                role="radio"
                aria-checked={selectedLanguage === option.value}
                aria-label={option.label}
                title={option.label}
                onClick={() => setSelectedLanguage(option.value)}
              >
                <span className="language-flag-emoji" aria-hidden="true">{option.flag}</span>
                <span className="language-flag-label">{option.label}</span>
              </button>
            ))}
          </div>
          <button
            className="setup-start-button"
            type="button"
            onClick={handleStartGame}
            disabled={!selectedLanguage}
          >
            Start game
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="game">
      <div className="help-panel">
        <span className="help-count">Helps left: {helpsLeft}</span>

        <div className="help-actions">
          <button
            className="help-button"
            type="button"
            onClick={handleRevealLetterHelp}
            disabled={gameStatus !== 'playing' || helpUsage.revealLetter}
            aria-label="Reveal one letter in correct index"
            title="Reveal one letter in correct index"
          >
            ?
          </button>
          <button
            className="help-button"
            type="button"
            onClick={handleSuggestWordHelp}
            disabled={gameStatus !== 'playing' || helpUsage.suggestWord}
            aria-label="Suggest a matching word"
            title="Suggest a matching word"
          >
            ?
          </button>
          <button
            className="help-button"
            type="button"
            onClick={handleFlashSolutionHelp}
            disabled={gameStatus !== 'playing' || helpUsage.flashSolution}
            aria-label="Flash full solution"
            title="Flash full solution"
          >
            ?
          </button>
        </div>
      </div>

      {flashHint.visible && (
        <div
          className="flash-solution"
          style={{ top: `${flashHint.top}vh`, left: `${flashHint.left}vw` }}
        >
          {flashHint.word}
        </div>
      )}

      <div className="board">
        {guesses.map((guess, index) => (
          <Line
            key={index}
            guess={index === currentGuessIndex && gameStatus === 'playing' ? currentGuess.join('') : guess}
            solution={solution}
            isCommitted={guess !== null && (index < currentGuessIndex || gameStatus === 'ended')}
          />
        ))}
      </div>
    </main>
  );
}

function getLetterStates(guess: string, solution: string): LetterState[] {
  const states: LetterState[] = Array(5).fill('absent');
  const solutionChars = solution.split('');
  const guessChars = guess.split('');

  // First pass: correct positions
  guessChars.forEach((letter, i) => {
    if (letter === solutionChars[i]) {
      states[i] = 'correct';
      solutionChars[i] = '';
      guessChars[i] = '';
    }
  });

  // Second pass: present but wrong position
  guessChars.forEach((letter, i) => {
    if (letter === '') return;
    const solutionIndex = solutionChars.indexOf(letter);
    if (solutionIndex !== -1) {
      states[i] = 'present';
      solutionChars[solutionIndex] = '';
    }
  });

  return states;
}

function Line({ guess, solution, isCommitted }: { guess: string | null; solution: string; isCommitted: boolean }) {
  const letters = Array.from({ length: 5 }, (_, index) => guess?.[index] ?? '');
  const states: LetterState[] = isCommitted && guess && solution
    ? getLetterStates(guess, solution)
    : Array(5).fill('empty');

  return (
    <div className="line">
      {letters.map((letter, index) => (
        <Cell key={index} character={letter} state={states[index]} />
      ))}
    </div>
  );
}

function Cell({ character, state }: { character: string; state: LetterState }) {
  return <div className={`cell cell--${state}`}>{character}</div>;
}

export default App
