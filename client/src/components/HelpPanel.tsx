import type { GameStatus, HelpUsage } from '../types/game';

interface HelpPanelProps {
  gameStatus: GameStatus;
  helpUsage: HelpUsage;
  onRevealLetter: () => void;
  onSuggestWord: () => void;
  onFlashSolution: () => void;
}

export function HelpPanel({ gameStatus, helpUsage, onRevealLetter, onSuggestWord, onFlashSolution }: HelpPanelProps) {
  const helpsLeft = Object.values(helpUsage).filter((used) => !used).length;
  const isPlaying = gameStatus === 'playing';

  return (
    <div className="help-panel">
      <span className="help-count">Helps left: {helpsLeft}</span>
      <div className="help-actions">
        <button
          className="help-button"
          type="button"
          onClick={onRevealLetter}
          disabled={!isPlaying || helpUsage.revealLetter}
          aria-label="Reveal one letter in correct index"
          title="Reveal one letter in correct index"
        >
          ?
        </button>
        <button
          className="help-button"
          type="button"
          onClick={onSuggestWord}
          disabled={!isPlaying || helpUsage.suggestWord}
          aria-label="Suggest a matching word"
          title="Suggest a matching word"
        >
          ?
        </button>
        <button
          className="help-button"
          type="button"
          onClick={onFlashSolution}
          disabled={!isPlaying || helpUsage.flashSolution}
          aria-label="Flash full solution"
          title="Flash full solution"
        >
          ?
        </button>
      </div>
    </div>
  );
}
