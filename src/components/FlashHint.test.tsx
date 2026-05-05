import { render, screen } from '@testing-library/react';
import { FlashHint } from './FlashHint';
import type { FlashHint as FlashHintType } from '../types/game';

function makeHint(overrides?: Partial<FlashHintType>): FlashHintType {
  return {
    visible: true,
    top: 30,
    left: 40,
    word: 'CRANE',
    ...overrides,
  };
}

describe('FlashHint', () => {
  describe('visibility', () => {
    it('renders nothing when visible is false', () => {
      const { container } = render(<FlashHint hint={makeHint({ visible: false })} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders the hint element when visible is true', () => {
      render(<FlashHint hint={makeHint()} />);
      expect(screen.getByText('CRANE')).toBeInTheDocument();
    });
  });

  describe('word display', () => {
    it('displays the word provided', () => {
      render(<FlashHint hint={makeHint({ word: 'STARE' })} />);
      expect(screen.getByText('STARE')).toBeInTheDocument();
    });

    it('displays an empty string when word is empty', () => {
      const { container } = render(<FlashHint hint={makeHint({ word: '' })} />);
      expect(container.firstChild).toBeInTheDocument();
      expect(container.firstChild).toHaveTextContent('');
    });
  });

  describe('positioning styles', () => {
    it('sets top style from hint.top as viewport height units', () => {
      const { container } = render(<FlashHint hint={makeHint({ top: 25, left: 50 })} />);
      expect(container.firstChild).toHaveStyle({ top: '25vh' });
    });

    it('sets left style from hint.left as viewport width units', () => {
      const { container } = render(<FlashHint hint={makeHint({ top: 25, left: 60 })} />);
      expect(container.firstChild).toHaveStyle({ left: '60vw' });
    });

    it('applies the "flash-solution" CSS class', () => {
      const { container } = render(<FlashHint hint={makeHint()} />);
      expect(container.firstChild).toHaveClass('flash-solution');
    });
  });
});
