import type { LanguageCode } from '../types/game';
import { LANGUAGE_OPTIONS } from '../constants';

interface LanguagePickerProps {
  selectedLanguage: LanguageCode | '';
  onSelectLanguage: (lang: LanguageCode) => void;
}

export function LanguagePicker({ selectedLanguage, onSelectLanguage }: LanguagePickerProps) {
  return (
    <div className="language-flags" role="radiogroup" aria-label="Choose language">
      {LANGUAGE_OPTIONS.map((option) => (
        <button
          key={option.value}
          className={`language-flag ${selectedLanguage === option.value ? 'language-flag--active' : ''}`}
          type="button"
          role="radio"
          aria-checked={selectedLanguage === option.value}
          aria-label={option.label}
          title={option.label}
          onClick={() => onSelectLanguage(option.value)}
        >
          <span className="language-flag-emoji" aria-hidden="true">{option.flag}</span>
          <span className="language-flag-label">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
