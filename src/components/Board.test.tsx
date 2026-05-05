import { render } from '@testing-library/react';
import { Board } from './Board';
import { MAX_GUESSES } from '../constants';

function makeGuesses(committed: string[], total = MAX_GUESSES): (string | null)[] {
  const guesses: (string | null)[] = Array(total).fill(null);
  committed.forEach((word, i) => {
    guesses[i] = word;
  });
  return guesses;
}

describe('Board', () => {
  describe('line count', () => {
    it(`renders exactly ${MAX_GUESSES} lines`, () => {
      const { container } = render(
        <Board
          guesses={makeGuesses([])}
          currentGuess={[]}
          currentGuessIndex={0}
          gameStatus="playing"
          solution="crane"
        />
      );
      expect(container.querySelectorAll('.line')).toHaveLength(MAX_GUESSES);
    });
  });

  describe('board container', () => {
    it('renders a container with the "board" class', () => {
      const { container } = render(
        <Board
          guesses={makeGuesses([])}
          currentGuess={[]}
          currentGuessIndex={0}
          gameStatus="playing"
          solution="crane"
        />
      );
      expect(container.firstChild).toHaveClass('board');
    });
  });

  describe('committed lines show evaluated states', () => {
    it('marks cells of a committed correct guess as "correct"', () => {
      const guesses = makeGuesses(['crane']);
      const { container } = render(
        <Board
          guesses={guesses}
          currentGuess={[]}
          currentGuessIndex={1}
          gameStatus="playing"
          solution="crane"
        />
      );
      const firstLineCells = Array.from(container.querySelectorAll('.line')[0].querySelectorAll('.cell'));
      firstLineCells.forEach((cell) => {
        expect(cell).toHaveClass('cell--correct');
      });
    });

    it('shows absent cells for a committed guess with no matching letters', () => {
      // "mirth" shares no letters with "bland"
      const guesses = makeGuesses(['mirth']);
      const { container } = render(
        <Board
          guesses={guesses}
          currentGuess={[]}
          currentGuessIndex={1}
          gameStatus="playing"
          solution="bland"
        />
      );
      const firstLineCells = Array.from(container.querySelectorAll('.line')[0].querySelectorAll('.cell'));
      firstLineCells.forEach((cell) => {
        expect(cell).toHaveClass('cell--absent');
      });
    });
  });

  describe('current guess line', () => {
    it('shows the current guess characters on the active line while playing', () => {
      const { container } = render(
        <Board
          guesses={makeGuesses([])}
          currentGuess={['s', 't', 'a', 'r', 'e']}
          currentGuessIndex={0}
          gameStatus="playing"
          solution="crane"
        />
      );
      const activeLine = container.querySelectorAll('.line')[0];
      const cells = Array.from(activeLine.querySelectorAll('.cell'));
      expect(cells[0]).toHaveTextContent('s');
      expect(cells[1]).toHaveTextContent('t');
      expect(cells[2]).toHaveTextContent('a');
      expect(cells[3]).toHaveTextContent('r');
      expect(cells[4]).toHaveTextContent('e');
    });

    it('shows the current guess on the correct row when guesses have been committed', () => {
      const guesses = makeGuesses(['crane', 'slate']);
      const { container } = render(
        <Board
          guesses={guesses}
          currentGuess={['r', 'a', 'i', 's', 'e']}
          currentGuessIndex={2}
          gameStatus="playing"
          solution="brain"
        />
      );
      const thirdLine = container.querySelectorAll('.line')[2];
      const cells = Array.from(thirdLine.querySelectorAll('.cell'));
      expect(cells[0]).toHaveTextContent('r');
    });

    it('active line cells are in "empty" state (not yet evaluated)', () => {
      const { container } = render(
        <Board
          guesses={makeGuesses([])}
          currentGuess={['c', 'r', 'a', 'n', 'e']}
          currentGuessIndex={0}
          gameStatus="playing"
          solution="crane"
        />
      );
      const activeLine = container.querySelectorAll('.line')[0];
      const cells = Array.from(activeLine.querySelectorAll('.cell'));
      cells.forEach((cell) => {
        expect(cell).toHaveClass('cell--empty');
      });
    });
  });

  describe('empty lines', () => {
    it('future (uncommitted) lines render all-empty cells', () => {
      const guesses = makeGuesses(['crane']);
      const { container } = render(
        <Board
          guesses={guesses}
          currentGuess={[]}
          currentGuessIndex={1}
          gameStatus="playing"
          solution="crane"
        />
      );
      // Lines 2–6 (indices 1–5) have no content yet
      for (let i = 1; i < MAX_GUESSES; i++) {
        const line = container.querySelectorAll('.line')[i];
        const cells = Array.from(line.querySelectorAll('.cell'));
        cells.forEach((cell) => {
          expect(cell).toHaveClass('cell--empty');
          expect(cell).toHaveTextContent('');
        });
      }
    });
  });

  describe('game ended', () => {
    it('committed guesses are still evaluated when game status is "ended"', () => {
      const guesses = makeGuesses(['crane']);
      const { container } = render(
        <Board
          guesses={guesses}
          currentGuess={[]}
          currentGuessIndex={1}
          gameStatus="ended"
          solution="crane"
        />
      );
      const firstLineCells = Array.from(container.querySelectorAll('.line')[0].querySelectorAll('.cell'));
      firstLineCells.forEach((cell) => {
        expect(cell).toHaveClass('cell--correct');
      });
    });

    it('does not show the current typing on any line when game status is "ended"', () => {
      const guesses = makeGuesses(['crane']);
      const { container } = render(
        <Board
          guesses={guesses}
          currentGuess={['s', 't', 'a', 'r', 'e']}
          currentGuessIndex={1}
          gameStatus="ended"
          solution="crane"
        />
      );
      // Row at currentGuessIndex should NOT show the currentGuess letters when game ended
      const secondLine = container.querySelectorAll('.line')[1];
      const cells = Array.from(secondLine.querySelectorAll('.cell'));
      cells.forEach((cell) => {
        expect(cell).toHaveClass('cell--empty');
        expect(cell).toHaveTextContent('');
      });
    });
  });
});
