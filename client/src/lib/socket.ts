import { io, type Socket } from 'socket.io-client';
import type {
  CategoryId,
  HelpUsage,
  HintKind,
  LanguageCode,
  LetterState,
  PlayerStatus,
  RoomMode,
  RoomReconnectedPayload,
  SubmittedGuess,
} from '../types/game';

interface ServerToClientEvents {
  room_created: (payload: { roomId: string }) => void;
  room_error: (payload: { message: string }) => void;
  game_started: (payload: { language: LanguageCode; category: CategoryId }) => void;
  guess_result: (payload: { guesses: SubmittedGuess[]; status: PlayerStatus }) => void;
  invalid_guess: (payload: { message: string }) => void;
  // No playerId: it is the opponent's persistent identity and would be enough
  // to take over their seat.
  opponent_progress: (payload: {
    rows: LetterState[][];
    status: PlayerStatus;
  }) => void;
  game_over: (payload: { winnerId: string | null; solution: string }) => void;
  player_left: () => void;
  hint_result: (payload: {
    hint: HintKind;
    helpUsage: HelpUsage;
    message?: string;
    word?: string;
  }) => void;
  room_reconnected: (payload: RoomReconnectedPayload) => void;
}

// The server authenticates guesses and hints by the socket the request arrived
// on, so no playerId is sent with them.
interface ClientToServerEvents {
  create_room: (payload: {
    language: LanguageCode;
    category: CategoryId;
    mode: RoomMode;
    playerId: string;
  }) => void;
  join_room: (payload: { roomId: string; playerId: string }) => void;
  leave_room: (payload: { roomId: string }) => void;
  submit_guess: (payload: { roomId: string; guess: string }) => void;
  request_hint: (payload: { roomId: string; hint: HintKind }) => void;
  reconnect_room: (payload: { roomId: string; playerId: string }) => void;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL, {
  autoConnect: false,
});
