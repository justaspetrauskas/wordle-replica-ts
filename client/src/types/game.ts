export type LetterState = 'correct' | 'present' | 'absent' | 'empty';

export type GameStatus = 'playing' | 'ended';

/**
 * Only the languages the shipped word sets cover. Danish and Lithuanian are
 * kept out because no set has been generated for them yet.
 */
export type LanguageCode = 'en' | 'es';

export type CategoryId = 'misc' | 'animals' | 'countries' | 'food';

export type GameMode = 'solo' | 'multiplayer' | 'ai';

/** Modes the server can actually host a room for. */
export type RoomMode = Exclude<GameMode, 'ai'>;

export type LobbyView = 'menu' | 'create' | 'join';

export type RoomStatus = 'idle' | 'pending' | 'waiting' | 'playing' | 'finished';

/** The room lifecycle as the server reports it. */
export type ServerRoomStatus = 'waiting' | 'playing' | 'finished';

export type PlayerStatus = 'playing' | 'won' | 'lost';

export type Outcome = 'won' | 'lost';

export type HintKind = 'revealLetter' | 'suggestWord' | 'flashSolution';

/** A graded state a key can carry. Unlike LetterState there is no 'empty'. */
export type KeyState = Exclude<LetterState, 'empty'>;

/** Best-known state per letter, built from the player's own graded guesses. */
export type KeyboardLetterStates = Record<string, KeyState>;

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

/** Everything the server sends back to rebuild the UI after a refresh. */
export interface RoomReconnectedPayload {
  roomId: string;
  language: LanguageCode;
  category: CategoryId;
  guesses: SubmittedGuess[];
  status: PlayerStatus;
  helpUsage: HelpUsage;
  /** Colours only — never the opponent's letters. */
  opponentRows: LetterState[][];
  opponentStatus: PlayerStatus | null;
  /** True only when the other seat was taken and then given up. */
  opponentLeft: boolean;
  wantsRematch: boolean;
  opponentWantsRematch: boolean;
  roomStatus: ServerRoomStatus;
  /** Only set once the round is over. */
  solution: string | null;
}
