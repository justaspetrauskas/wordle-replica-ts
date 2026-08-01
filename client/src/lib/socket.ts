import { io, type Socket } from 'socket.io-client';
import type { LanguageCode } from '../types/game';

interface ServerToClientEvents {
  room_created: (payload: { roomId: string }) => void;
  room_error: (payload: { message: string }) => void;
  game_started: () => void;
}

interface ClientToServerEvents {
  create_room: (payload: { language: LanguageCode }) => void;
  join_room: (roomId: string) => void;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:3001';

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL, {
  autoConnect: false,
});
