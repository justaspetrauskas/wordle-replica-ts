export type LetterState = 'correct' | 'present' | 'absent' | 'empty';

export type GameStatus = 'playing' | 'ended';

export type LanguageCode = 'en' | 'es' | 'da' | 'lt';

export interface HelpUsage {
  revealLetter: boolean;
  suggestWord: boolean;
  flashSolution: boolean;
}

export interface FlashHint {
  visible: boolean;
  top: number;
  left: number;
  word: string;
}

export interface RandomWordResponse {
  word: string;
  length: number;
  category: string;
  language: string;
}