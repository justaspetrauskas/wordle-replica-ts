import { renderHook, act } from '@testing-library/react';
import { useGameState } from './useGameState';
import { fetchWords } from '../lib/api';
import { MAX_GUESSES, WORD_LENGTH } from '../constants';

vi.mock('../lib/api');

const mockedFetchWords = vi.mocked(fetchWords);

const WORD_POOL = [
  'crane', 'slate', 'raise', 'stare', 'alter',
  'snare', 'least', 'tares', 'reals', 'earns',
];
const SOLUTION = 'crane';

beforeEach(() => {
  vi.clearAllMocks();
  mockedFetchWords.mockResolvedValue(WORD_POOL);
  vi.spyOn(Math, 'random').mockReturnValue(0); // always pick index 0 → 'crane'
  vi.spyOn(window, 'alert').mockImplementation(() => {});
  vi.spyOn(window, 'confirm').mockReturnValue(false);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function startGame() {
  const hook = renderHook(() => useGameState('en'));
  await act(async () => {
    await hook.result.current.startNewGame();
  });
  return hook;
}

function fireKey(key: string) {
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  });
}

// ---------------------------------------------------------------------------

describe('useGameState', () => {
  describe('initial state', () => {
    it('starts with an empty solution', () => {
      const { result } = renderHook(() => useGameState('en'));
      expect(result.current.solution).toBe('');
    });

    it('starts with all-null guesses array of length MAX_GUESSES', () => {
      const { result } = renderHook(() => useGameState('en'));
      expect(result.current.guesses).toHaveLength(MAX_GUESSES);
      expect(result.current.guesses.every((g) => g === null)).toBe(true);
    });

    it('starts with an empty current guess', () => {
      const { result } = renderHook(() => useGameState('en'));
      expect(result.current.currentGuess).toEqual([]);
    });

    it('starts at guess index 0', () => {
      const { result } = renderHook(() => useGameState('en'));
      expect(result.current.currentGuessIndex).toBe(0);
    });

    it('starts with gameStatus "playing"', () => {
      const { result } = renderHook(() => useGameState('en'));
      expect(result.current.gameStatus).toBe('playing');
    });

    it('starts with all help usage flags false', () => {
      const { result } = renderHook(() => useGameState('en'));
      expect(result.current.helpUsage).toEqual({
        revealLetter: false,
        suggestWord: false,
        flashSolution: false,
      });
    });

    it('starts with flashHint not visible', () => {
      const { result } = renderHook(() => useGameState('en'));
      expect(result.current.flashHint.visible).toBe(false);
    });
  });

  describe('startNewGame', () => {
    it('does not fetch when selectedLanguage is empty', async () => {
      const { result } = renderHook(() => useGameState(''));
      await act(async () => {
        await result.current.startNewGame();
      });
      expect(mockedFetchWords).not.toHaveBeenCalled();
    });

    it('calls fetchWords with the selected language', async () => {
      await startGame();
      expect(mockedFetchWords).toHaveBeenCalledWith('en');
    });

    it('sets the solution from the word pool', async () => {
      const hook = await startGame();
      expect(hook.result.current.solution).toBe(SOLUTION);
    });

    it('resets guesses to all-null', async () => {
      const hook = await startGame();
      expect(hook.result.current.guesses.every((g) => g === null)).toBe(true);
    });

    it('resets currentGuessIndex to 0', async () => {
      const hook = await startGame();
      expect(hook.result.current.currentGuessIndex).toBe(0);
    });

    it('resets help usage to all false', async () => {
      const hook = await startGame();
      expect(hook.result.current.helpUsage).toEqual({
        revealLetter: false,
        suggestWord: false,
        flashSolution: false,
      });
    });

    it('resets gameStatus to "playing"', async () => {
      const hook = await startGame();
      expect(hook.result.current.gameStatus).toBe('playing');
    });
  });

  describe('keyboard input — letter keys', () => {
    it('adds a letter to currentGuess when a letter key is pressed', async () => {
      const hook = await startGame();
      fireKey('a');
      expect(hook.result.current.currentGuess).toEqual(['a']);
    });

    it('lowercases the input letter', async () => {
      const hook = await startGame();
      fireKey('A');
      expect(hook.result.current.currentGuess).toEqual(['a']);
    });

    it('accumulates up to WORD_LENGTH letters', async () => {
      const hook = await startGame();
      ['c', 'r', 'a', 'n', 'e'].forEach(fireKey);
      expect(hook.result.current.currentGuess).toHaveLength(WORD_LENGTH);
    });

    it('does not add a 6th letter beyond WORD_LENGTH', async () => {
      const hook = await startGame();
      ['c', 'r', 'a', 'n', 'e', 'x'].forEach(fireKey);
      expect(hook.result.current.currentGuess).toHaveLength(WORD_LENGTH);
    });

    it('ignores non-alpha keys', async () => {
      const hook = await startGame();
      fireKey('1');
      fireKey(' ');
      fireKey('ArrowUp');
      expect(hook.result.current.currentGuess).toEqual([]);
    });
  });

  describe('keyboard input — Backspace', () => {
    it('removes the last letter on Backspace', async () => {
      const hook = await startGame();
      fireKey('c');
      fireKey('r');
      fireKey('Backspace');
      expect(hook.result.current.currentGuess).toEqual(['c']);
    });

    it('does nothing on Backspace when currentGuess is empty', async () => {
      const hook = await startGame();
      fireKey('Backspace');
      expect(hook.result.current.currentGuess).toEqual([]);
    });
  });

  describe('keyboard input — Enter', () => {
    it('does not submit if currentGuess is shorter than WORD_LENGTH', async () => {
      const hook = await startGame();
      ['c', 'r', 'a'].forEach(fireKey);
      fireKey('Enter');
      expect(hook.result.current.guesses[0]).toBeNull();
    });

    it('submits the guess when Enter is pressed with a full guess', async () => {
      const hook = await startGame();
      [...SOLUTION].forEach(fireKey); // correct guess
      fireKey('Enter');
      expect(hook.result.current.guesses[0]).toBe(SOLUTION);
    });

    it('advances currentGuessIndex after a non-winning guess', async () => {
      const hook = await startGame();
      // submit a wrong guess
      ['s', 'l', 'a', 't', 'e'].forEach(fireKey);
      fireKey('Enter');
      expect(hook.result.current.currentGuessIndex).toBe(1);
    });

    it('clears currentGuess after submission', async () => {
      const hook = await startGame();
      ['s', 'l', 'a', 't', 'e'].forEach(fireKey);
      fireKey('Enter');
      expect(hook.result.current.currentGuess).toEqual([]);
    });

    it('sets gameStatus to "ended" after a winning guess', async () => {
      const hook = await startGame();
      [...SOLUTION].forEach(fireKey);
      fireKey('Enter');
      expect(hook.result.current.gameStatus).toBe('ended');
    });

    it('calls window.confirm with a win message after a correct guess', async () => {
      await startGame();
      [...SOLUTION].forEach(fireKey);
      fireKey('Enter');
      expect(window.confirm).toHaveBeenCalledWith('You guessed the word! Restart game?');
    });

    it('sets gameStatus to "ended" after MAX_GUESSES wrong guesses', async () => {
      const hook = await startGame();
      const wrongGuess = ['s', 'l', 'a', 't', 'e'];
      for (let i = 0; i < MAX_GUESSES; i++) {
        wrongGuess.forEach(fireKey);
        fireKey('Enter');
      }
      expect(hook.result.current.gameStatus).toBe('ended');
    });

    it('calls window.confirm with the solution in the lose message', async () => {
      await startGame();
      const wrongGuess = ['s', 'l', 'a', 't', 'e'];
      for (let i = 0; i < MAX_GUESSES; i++) {
        wrongGuess.forEach(fireKey);
        fireKey('Enter');
      }
      expect(window.confirm).toHaveBeenCalledWith(
        `You ran out of guesses. The word was "${SOLUTION}". Restart game?`
      );
    });

    it('does not add input when gameStatus is "ended"', async () => {
      const hook = await startGame();
      [...SOLUTION].forEach(fireKey);
      fireKey('Enter');
      // game is now ended
      fireKey('a');
      expect(hook.result.current.currentGuess).toEqual([]);
    });

    it('restarts game when confirm returns true after winning', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const hook = await startGame();
      [...SOLUTION].forEach(fireKey);
      await act(async () => {
        fireKey('Enter');
        // wait for the re-fetch to settle
        await Promise.resolve();
      });
      // fetchWords should have been called a second time for the new game
      expect(mockedFetchWords).toHaveBeenCalledTimes(2);
      expect(hook.result.current.gameStatus).toBe('playing');
    });
  });

  describe('handleRevealLetterHelp', () => {
    it('marks revealLetter as used', async () => {
      const hook = await startGame();
      act(() => {
        hook.result.current.handleRevealLetterHelp();
      });
      expect(hook.result.current.helpUsage.revealLetter).toBe(true);
    });

    it('calls window.alert with a hint message', async () => {
      const hook = await startGame();
      act(() => {
        hook.result.current.handleRevealLetterHelp();
      });
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringMatching(/^Hint: letter \d+ is "[A-Z]"\.$/)
      );
    });

    it('does nothing when revealLetter is already used', async () => {
      const hook = await startGame();
      act(() => {
        hook.result.current.handleRevealLetterHelp();
      });
      act(() => {
        hook.result.current.handleRevealLetterHelp();
      });
      expect(window.alert).toHaveBeenCalledTimes(1);
    });

    it('does nothing when gameStatus is "ended"', async () => {
      const hook = await startGame();
      [...SOLUTION].forEach(fireKey);
      fireKey('Enter');
      act(() => {
        hook.result.current.handleRevealLetterHelp();
      });
      expect(window.alert).not.toHaveBeenCalled();
    });
  });

  describe('handleSuggestWordHelp', () => {
    it('marks suggestWord as used', async () => {
      const hook = await startGame();
      act(() => {
        hook.result.current.handleSuggestWordHelp();
      });
      expect(hook.result.current.helpUsage.suggestWord).toBe(true);
    });

    it('calls window.alert with a suggested word or no-candidate message', async () => {
      const hook = await startGame();
      act(() => {
        hook.result.current.handleSuggestWordHelp();
      });
      expect(window.alert).toHaveBeenCalledTimes(1);
    });

    it('does nothing when suggestWord is already used', async () => {
      const hook = await startGame();
      act(() => {
        hook.result.current.handleSuggestWordHelp();
      });
      act(() => {
        hook.result.current.handleSuggestWordHelp();
      });
      expect(window.alert).toHaveBeenCalledTimes(1);
    });

    it('does nothing when gameStatus is "ended"', async () => {
      const hook = await startGame();
      [...SOLUTION].forEach(fireKey);
      fireKey('Enter');
      act(() => {
        hook.result.current.handleSuggestWordHelp();
      });
      expect(window.alert).not.toHaveBeenCalled();
    });
  });

  describe('handleFlashSolutionHelp', () => {
    it('marks flashSolution as used', async () => {
      const hook = await startGame();
      act(() => {
        hook.result.current.handleFlashSolutionHelp();
      });
      expect(hook.result.current.helpUsage.flashSolution).toBe(true);
    });

    it('sets flashHint visible to true with the solution word uppercased', async () => {
      const hook = await startGame();
      act(() => {
        hook.result.current.handleFlashSolutionHelp();
      });
      expect(hook.result.current.flashHint.visible).toBe(true);
      expect(hook.result.current.flashHint.word).toBe(SOLUTION.toUpperCase());
    });

    it('hides flashHint after 300 ms', async () => {
      vi.useFakeTimers();
      const hook = await startGame();
      act(() => {
        hook.result.current.handleFlashSolutionHelp();
      });
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(hook.result.current.flashHint.visible).toBe(false);
      vi.useRealTimers();
    });

    it('does nothing when flashSolution is already used', async () => {
      const hook = await startGame();
      act(() => { hook.result.current.handleFlashSolutionHelp(); });
      const wordAfterFirst = hook.result.current.flashHint.word;
      act(() => { hook.result.current.handleFlashSolutionHelp(); });
      expect(hook.result.current.flashHint.word).toBe(wordAfterFirst);
    });

    it('does nothing when gameStatus is "ended"', async () => {
      const hook = await startGame();
      [...SOLUTION].forEach(fireKey);
      fireKey('Enter');
      act(() => {
        hook.result.current.handleFlashSolutionHelp();
      });
      expect(hook.result.current.flashHint.visible).toBe(false);
    });
  });
});
