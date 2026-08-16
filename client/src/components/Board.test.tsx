import { render, screen } from '@testing-library/react';
import { Board } from './Board';
import type { SubmittedGuess } from '../types/game';
import { MAX_GUESSES } from '../constants';

const CRANE: SubmittedGuess = {
  word: 'crane',
  states: ['absent', 'correct', 'present', 'absent', 'present'],
};

describe('Board', () => {
  it('labels itself as one word per row', () => {
    render(<Board guesses={[]} currentGuess={[]} />);

    expect(screen.getByRole('grid', { name: 'Guess board, one word per row' })).toBeInTheDocument();
  });

  it('labels every row as a numbered guess', () => {
    render(<Board guesses={[]} currentGuess={[]} />);

    for (let row = 1; row <= MAX_GUESSES; row += 1) {
      expect(screen.getByRole('row', { name: `Guess ${row} of ${MAX_GUESSES}` })).toBeInTheDocument();
    }
  });

  it('numbers each row in the gutter', () => {
    const { container } = render(<Board guesses={[]} currentGuess={[]} />);
    const numbers = Array.from(container.querySelectorAll('[aria-hidden]')).map(
      (node) => node.textContent
    );

    expect(numbers).toEqual(['1', '2', '3', '4', '5', '6']);
  });

  it('separates rows more than it separates the tiles within a row', () => {
    const { container } = render(<Board guesses={[]} currentGuess={[]} />);
    const board = container.firstElementChild as HTMLElement;
    const row = screen.getByRole('row', { name: `Guess 1 of ${MAX_GUESSES}` });

    expect(board.className).toContain('gap-y-3');
    expect(row.className).toContain('gap-1.5');
  });

  it('washes only the row that is being typed into', () => {
    render(<Board guesses={[CRANE]} currentGuess={['b']} />);

    const played = screen.getByRole('row', { name: `Guess 1 of ${MAX_GUESSES}` });
    const active = screen.getByRole('row', { name: `Guess 2 of ${MAX_GUESSES}` });
    const later = screen.getByRole('row', { name: `Guess 3 of ${MAX_GUESSES}` });

    expect(active.className).toContain('bg-washi/60');
    expect(played.className).not.toContain('bg-washi/60');
    expect(later.className).not.toContain('bg-washi/60');
  });

  it('describes each graded tile for assistive technology', () => {
    render(<Board guesses={[CRANE]} currentGuess={[]} />);

    expect(screen.getByLabelText('Letter 1: C, not in the word')).toBeInTheDocument();
    expect(screen.getByLabelText('Letter 2: R, right letter, right spot')).toBeInTheDocument();
    expect(screen.getByLabelText('Letter 3: A, right letter, wrong spot')).toBeInTheDocument();
  });

  it('shows the letters being typed in the current row', () => {
    render(<Board guesses={[CRANE]} currentGuess={['b', 'r']} />);

    const active = screen.getByRole('row', { name: `Guess 2 of ${MAX_GUESSES}` });

    expect(active).toHaveTextContent('BR');
  });
});
