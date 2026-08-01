import type { LanguageCode } from '../types/game';
import { LanguagePicker } from './LanguagePicker';

interface GameSetupProps {
  selectedLanguage: LanguageCode | '';
  onSelectLanguage: (lang: LanguageCode) => void;
  onStart: () => void;
  onBack?: () => void;
}

export function GameSetup({ selectedLanguage, onSelectLanguage, onStart, onBack }: GameSetupProps) {
  return (
    <main className="game game--setup">
      <div className="setup-card">
        <h1 className="setup-title">Choose game language</h1>
        <LanguagePicker
          selectedLanguage={selectedLanguage}
          onSelectLanguage={onSelectLanguage}
        />
        <button
          className="setup-start-button"
          type="button"
          onClick={onStart}
          disabled={!selectedLanguage}
        >
          Start game
        </button>
        {onBack ? (
          <button className="text-button" type="button" onClick={onBack}>
            Back to home
          </button>
        ) : null}
      </div>
    </main>
  );
}
