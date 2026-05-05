import { render, screen } from '@testing-library/react';
import { Cell } from './Cell';
import type { LetterState } from '../types/game';

describe('Cell', () => {
  describe('character rendering', () => {
    it('renders the given character', () => {
      render(<Cell character="A" state="empty" />);
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('renders an empty string when character is empty', () => {
      const { container } = render(<Cell character="" state="empty" />);
      expect(container.firstChild).toHaveTextContent('');
    });

    it('renders a lowercase character', () => {
      render(<Cell character="z" state="correct" />);
      expect(screen.getByText('z')).toBeInTheDocument();
    });
  });

  describe('CSS class based on state', () => {
    const states: LetterState[] = ['correct', 'present', 'absent', 'empty'];

    it.each(states)('applies "cell--%s" class when state is "%s"', (state) => {
      const { container } = render(<Cell character="x" state={state} />);
      expect(container.firstChild).toHaveClass(`cell--${state}`);
    });

    it('always applies the base "cell" class', () => {
      const { container } = render(<Cell character="a" state="absent" />);
      expect(container.firstChild).toHaveClass('cell');
    });

    it('does not apply a class for an unrelated state', () => {
      const { container } = render(<Cell character="a" state="correct" />);
      expect(container.firstChild).not.toHaveClass('cell--absent');
      expect(container.firstChild).not.toHaveClass('cell--present');
      expect(container.firstChild).not.toHaveClass('cell--empty');
    });
  });
});
