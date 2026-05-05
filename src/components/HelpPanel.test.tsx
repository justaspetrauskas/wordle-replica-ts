import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelpPanel } from './HelpPanel';
import type { GameStatus, HelpUsage } from '../types/game';

// Default props factory — all helps unused, game in progress
function makeProps(overrides?: {
  gameStatus?: GameStatus;
  helpUsage?: Partial<HelpUsage>;
  onRevealLetter?: () => void;
  onSuggestWord?: () => void;
  onFlashSolution?: () => void;
}) {
  return {
    gameStatus: (overrides?.gameStatus ?? 'playing') as GameStatus,
    helpUsage: {
      revealLetter: false,
      suggestWord: false,
      flashSolution: false,
      ...overrides?.helpUsage,
    },
    onRevealLetter: overrides?.onRevealLetter ?? vi.fn(),
    onSuggestWord: overrides?.onSuggestWord ?? vi.fn(),
    onFlashSolution: overrides?.onFlashSolution ?? vi.fn(),
  };
}

describe('HelpPanel', () => {
  describe('Helps left counter', () => {
    it('shows "Helps left: 3" when all helps are unused', () => {
      // All three helps available — expect full count
      render(<HelpPanel {...makeProps()} />);
      expect(screen.getByText('Helps left: 3')).toBeInTheDocument();
    });

    it('shows "Helps left: 2" when one help has been used', () => {
      // One help consumed — counter should decrement by one
      render(<HelpPanel {...makeProps({ helpUsage: { revealLetter: true } })} />);
      expect(screen.getByText('Helps left: 2')).toBeInTheDocument();
    });

    it('shows "Helps left: 0" when all helps have been used', () => {
      // All helps exhausted
      render(
        <HelpPanel
          {...makeProps({
            helpUsage: { revealLetter: true, suggestWord: true, flashSolution: true },
          })}
        />,
      );
      expect(screen.getByText('Helps left: 0')).toBeInTheDocument();
    });
  });

  describe('Button enabled/disabled states while playing', () => {
    it('enables all three buttons when game is playing and no helps used', () => {
      render(<HelpPanel {...makeProps()} />);
      expect(screen.getByRole('button', { name: /reveal one letter/i })).toBeEnabled();
      expect(screen.getByRole('button', { name: /suggest a matching word/i })).toBeEnabled();
      expect(screen.getByRole('button', { name: /flash full solution/i })).toBeEnabled();
    });

    it('disables the "Reveal letter" button when helpUsage.revealLetter is true', () => {
      render(<HelpPanel {...makeProps({ helpUsage: { revealLetter: true } })} />);
      expect(screen.getByRole('button', { name: /reveal one letter/i })).toBeDisabled();
    });

    it('disables the "Suggest word" button when helpUsage.suggestWord is true', () => {
      render(<HelpPanel {...makeProps({ helpUsage: { suggestWord: true } })} />);
      expect(screen.getByRole('button', { name: /suggest a matching word/i })).toBeDisabled();
    });

    it('disables the "Flash solution" button when helpUsage.flashSolution is true', () => {
      render(<HelpPanel {...makeProps({ helpUsage: { flashSolution: true } })} />);
      expect(screen.getByRole('button', { name: /flash full solution/i })).toBeDisabled();
    });
  });

  describe('Button states when game has ended', () => {
    it('disables all buttons when gameStatus is "ended"', () => {
      // Even if helps are unused the game is over — no actions allowed
      render(<HelpPanel {...makeProps({ gameStatus: 'ended' })} />);
      expect(screen.getByRole('button', { name: /reveal one letter/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /suggest a matching word/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /flash full solution/i })).toBeDisabled();
    });
  });

  describe('Callback invocation on click', () => {
    it('calls onRevealLetter (and only onRevealLetter) when its button is clicked', async () => {
      const user = userEvent.setup();
      const onRevealLetter = vi.fn();
      const onSuggestWord = vi.fn();
      const onFlashSolution = vi.fn();

      render(
        <HelpPanel
          {...makeProps({ onRevealLetter, onSuggestWord, onFlashSolution })}
        />,
      );

      await user.click(screen.getByRole('button', { name: /reveal one letter/i }));

      expect(onRevealLetter).toHaveBeenCalledTimes(1);
      expect(onSuggestWord).not.toHaveBeenCalled();
      expect(onFlashSolution).not.toHaveBeenCalled();
    });

    it('calls onSuggestWord (and only onSuggestWord) when its button is clicked', async () => {
      const user = userEvent.setup();
      const onRevealLetter = vi.fn();
      const onSuggestWord = vi.fn();
      const onFlashSolution = vi.fn();

      render(
        <HelpPanel
          {...makeProps({ onRevealLetter, onSuggestWord, onFlashSolution })}
        />,
      );

      await user.click(screen.getByRole('button', { name: /suggest a matching word/i }));

      expect(onSuggestWord).toHaveBeenCalledTimes(1);
      expect(onRevealLetter).not.toHaveBeenCalled();
      expect(onFlashSolution).not.toHaveBeenCalled();
    });

    it('calls onFlashSolution (and only onFlashSolution) when its button is clicked', async () => {
      const user = userEvent.setup();
      const onRevealLetter = vi.fn();
      const onSuggestWord = vi.fn();
      const onFlashSolution = vi.fn();

      render(
        <HelpPanel
          {...makeProps({ onRevealLetter, onSuggestWord, onFlashSolution })}
        />,
      );

      await user.click(screen.getByRole('button', { name: /flash full solution/i }));

      expect(onFlashSolution).toHaveBeenCalledTimes(1);
      expect(onRevealLetter).not.toHaveBeenCalled();
      expect(onSuggestWord).not.toHaveBeenCalled();
    });
  });

  describe('Disabled buttons do not fire callbacks', () => {
    it('does not call onRevealLetter when its button is disabled due to prior use', async () => {
      const user = userEvent.setup();
      const onRevealLetter = vi.fn();

      render(
        <HelpPanel
          {...makeProps({ helpUsage: { revealLetter: true }, onRevealLetter })}
        />,
      );

      await user.click(screen.getByRole('button', { name: /reveal one letter/i }));

      expect(onRevealLetter).not.toHaveBeenCalled();
    });

    it('does not call onSuggestWord when its button is disabled due to prior use', async () => {
      const user = userEvent.setup();
      const onSuggestWord = vi.fn();

      render(
        <HelpPanel
          {...makeProps({ helpUsage: { suggestWord: true }, onSuggestWord })}
        />,
      );

      await user.click(screen.getByRole('button', { name: /suggest a matching word/i }));

      expect(onSuggestWord).not.toHaveBeenCalled();
    });

    it('does not call onFlashSolution when its button is disabled due to prior use', async () => {
      const user = userEvent.setup();
      const onFlashSolution = vi.fn();

      render(
        <HelpPanel
          {...makeProps({ helpUsage: { flashSolution: true }, onFlashSolution })}
        />,
      );

      await user.click(screen.getByRole('button', { name: /flash full solution/i }));

      expect(onFlashSolution).not.toHaveBeenCalled();
    });

    it('does not call any callback when all buttons are disabled because game has ended', async () => {
      const user = userEvent.setup();
      const onRevealLetter = vi.fn();
      const onSuggestWord = vi.fn();
      const onFlashSolution = vi.fn();

      render(
        <HelpPanel
          {...makeProps({
            gameStatus: 'ended',
            onRevealLetter,
            onSuggestWord,
            onFlashSolution,
          })}
        />,
      );

      await user.click(screen.getByRole('button', { name: /reveal one letter/i }));
      await user.click(screen.getByRole('button', { name: /suggest a matching word/i }));
      await user.click(screen.getByRole('button', { name: /flash full solution/i }));

      expect(onRevealLetter).not.toHaveBeenCalled();
      expect(onSuggestWord).not.toHaveBeenCalled();
      expect(onFlashSolution).not.toHaveBeenCalled();
    });
  });
});

// ~180 lines
