import type { LanguageCode } from '../types/game';
import { LanguagePicker } from './LanguagePicker';

interface GameSetupProps {
  selectedLanguage: LanguageCode | '';
  onSelectLanguage: (lang: LanguageCode) => void;
  onStart: () => void;
  onBack?: () => void;
  isStarting?: boolean;
  error?: string;
}

export function GameSetup({
  selectedLanguage,
  onSelectLanguage,
  onStart,
  onBack,
  isStarting = false,
  error = '',
}: GameSetupProps) {
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
          disabled={!selectedLanguage || isStarting}
        >
          {isStarting ? 'Starting…' : 'Start game'}
        </button>
        {error ? <p className="lobby-error" role="alert">{error}</p> : null}
        {onBack ? (
          <button className="text-button" type="button" onClick={onBack}>
            Back to home
          </button>
        ) : null}
      </div>
    </main>
  );
}
