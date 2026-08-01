export type LetterState = 'correct' | 'present' | 'absent' | 'empty';

export type GameStatus = 'playing' | 'ended';

export type LanguageCode = 'en' | 'es' | 'da' | 'lt';

export type GameMode = 'solo' | 'multiplayer' | 'ai';

/** Modes the server can actually host a room for. */
export type RoomMode = Exclude<GameMode, 'ai'>;

export type LobbyView = 'menu' | 'create' | 'join';

export type RoomStatus = 'idle' | 'pending' | 'waiting' | 'playing';

export type PlayerStatus = 'playing' | 'won' | 'lost';

export type Outcome = 'won' | 'lost';

export type HintKind = 'revealLetter' | 'suggestWord' | 'flashSolution';

/** A guess the server has graded. The client never grades one itself. */
export interface SubmittedGuess {
  word: string;
  states: LetterState[];
}

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
