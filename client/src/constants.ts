import type { LanguageCode } from './types/game';

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;
export const ROOM_CODE_LENGTH = 6;

export const LANGUAGE_OPTIONS: Array<{ label: string; value: LanguageCode; flag: string }> = [
  { label: 'English', value: 'en', flag: '🇬🇧' },
  { label: 'Spanish', value: 'es', flag: '🇪🇸' },
  { label: 'Danish', value: 'da', flag: '🇩🇰' },
  { label: 'Lithuanian', value: 'lt', flag: '🇱🇹' },
];
