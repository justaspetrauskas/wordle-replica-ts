import { render, screen } from '@testing-library/react';
import { Line } from './Line';
import { WORD_LENGTH } from '../constants';

describe('Line', () => {
  describe('always renders WORD_LENGTH cells', () => {
    it('renders 5 cells for a committed guess', () => {
      const { container } = render(<Line guess="crane" solution="slate" isCommitted={true} />);
      expect(container.querySelectorAll('.cell')).toHaveLength(WORD_LENGTH);
    });

    it('renders 5 cells when guess is null', () => {
      const { container } = render(<Line guess={null} solution="slate" isCommitted={false} />);
      expect(container.querySelectorAll('.cell')).toHaveLength(WORD_LENGTH);
    });

    it('renders 5 cells for a partial (uncommitted) guess', () => {
      const { container } = render(<Line guess="ab" solution="crane" isCommitted={false} />);
      expect(container.querySelectorAll('.cell')).toHaveLength(WORD_LENGTH);
    });
  });

  describe('uncommitted line — all cells use "empty" state', () => {
    it('gives all cells the cell--empty class when not committed', () => {
      const { container } = render(<Line guess="crane" solution="slate" isCommitted={false} />);
      const cells = container.querySelectorAll('.cell');
      cells.forEach((cell) => {
        expect(cell).toHaveClass('cell--empty');
      });
    });

    it('gives all cells the cell--empty class when guess is null and not committed', () => {
      const { container } = render(<Line guess={null} solution="slate" isCommitted={false} />);
      const cells = container.querySelectorAll('.cell');
      cells.forEach((cell) => {
        expect(cell).toHaveClass('cell--empty');
      });
    });
  });

  describe('committed line — cells reflect letter states', () => {
    it('marks all cells "correct" when guess matches solution exactly', () => {
      const { container } = render(<Line guess="crane" solution="crane" isCommitted={true} />);
      const cells = container.querySelectorAll('.cell');
      cells.forEach((cell) => {
        expect(cell).toHaveClass('cell--correct');
      });
    });

    it('marks all cells "absent" when guess shares no letters with solution', () => {
      // "mirth" shares no letters with "bland"
      const { container } = render(<Line guess="mirth" solution="bland" isCommitted={true} />);
      const cells = container.querySelectorAll('.cell');
      cells.forEach((cell) => {
        expect(cell).toHaveClass('cell--absent');
      });
    });

    it('applies a mix of correct, present, and absent classes', () => {
      // solution: "slate", guess: "crane"
      // a(2)→correct, e(4)→correct, rest→absent
      const { container } = render(<Line guess="crane" solution="slate" isCommitted={true} />);
      const cells = Array.from(container.querySelectorAll('.cell'));
      expect(cells[0]).toHaveClass('cell--absent'); // c
      expect(cells[1]).toHaveClass('cell--absent'); // r
      expect(cells[2]).toHaveClass('cell--correct'); // a
      expect(cells[3]).toHaveClass('cell--absent'); // n
      expect(cells[4]).toHaveClass('cell--correct'); // e
    });
  });

  describe('character display', () => {
    it('shows each character of the guess', () => {
      render(<Line guess="crane" solution="slate" isCommitted={true} />);
      ['c', 'r', 'a', 'n', 'e'].forEach((char) => {
        expect(screen.getAllByText(char).length).toBeGreaterThan(0);
      });
    });

    it('fills missing characters with empty strings for a partial guess', () => {
      const { container } = render(<Line guess="ab" solution="crane" isCommitted={false} />);
      const cells = Array.from(container.querySelectorAll('.cell'));
      expect(cells[0]).toHaveTextContent('a');
      expect(cells[1]).toHaveTextContent('b');
      expect(cells[2]).toHaveTextContent('');
      expect(cells[3]).toHaveTextContent('');
      expect(cells[4]).toHaveTextContent('');
    });

    it('shows all empty strings when guess is null', () => {
      const { container } = render(<Line guess={null} solution="slate" isCommitted={false} />);
      const cells = Array.from(container.querySelectorAll('.cell'));
      cells.forEach((cell) => {
        expect(cell).toHaveTextContent('');
      });
    });
  });

  describe('wrapping element', () => {
    it('renders a container with the "line" class', () => {
      const { container } = render(<Line guess="crane" solution="slate" isCommitted={false} />);
      expect(container.firstChild).toHaveClass('line');
    });
  });
});
