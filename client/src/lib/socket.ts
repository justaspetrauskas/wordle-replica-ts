import { io, type Socket } from 'socket.io-client';
import type {
  HelpUsage,
  HintKind,
  LanguageCode,
  LetterState,
  PlayerStatus,
  RoomMode,
  SubmittedGuess,
} from '../types/game';

interface ServerToClientEvents {
  room_created: (payload: { roomId: string }) => void;
  room_error: (payload: { message: string }) => void;
  game_started: () => void;
  guess_result: (payload: { guesses: SubmittedGuess[]; status: PlayerStatus }) => void;
  invalid_guess: (payload: { message: string }) => void;
  opponent_progress: (payload: {
    playerId: string;
    rows: LetterState[][];
    status: PlayerStatus;
  }) => void;
  game_over: (payload: { winnerId: string | null; solution: string }) => void;
  player_left: (payload: { playerId: string }) => void;
  hint_result: (payload: {
    hint: HintKind;
    helpUsage: HelpUsage;
    message?: string;
    word?: string;
  }) => void;
}

interface ClientToServerEvents {
  create_room: (payload: { language: LanguageCode; mode: RoomMode; playerId: string }) => void;
  join_room: (payload: { roomId: string; playerId: string }) => void;
  submit_guess: (payload: { roomId: string; playerId: string; guess: string }) => void;
  request_hint: (payload: { roomId: string; playerId: string; hint: HintKind }) => void;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL, {
  autoConnect: false,
});
