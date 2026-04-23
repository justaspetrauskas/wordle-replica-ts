import type { LanguageCode } from './types/game';

export const RANDOM_WORDS_API_URL = 'https://random-words-api.kushcreates.com/api';
export const WORD_LENGTH = 5;
export const WORD_COUNT = 50;
export const MAX_GUESSES = 6;

export const LANGUAGE_OPTIONS: Array<{ label: string; value: LanguageCode; flag: string }> = [
  { label: 'English', value: 'en', flag: '🇬🇧' },
  { label: 'Spanish', value: 'es', flag: '🇪🇸' },
  { label: 'Danish', value: 'da', flag: '🇩🇰' },
  { label: 'Lithuanian', value: 'lt', flag: '🇱🇹' },
];
