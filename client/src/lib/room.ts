import type { RoomMode } from '../types/game';

const ROOM_ID_KEY = 'wordl_room_id';
const ROOM_MODE_KEY = 'wordl_room_mode';

export interface SavedRoom {
  roomId: string;
  mode: RoomMode;
}

/**
 * The room a refresh should drop the player back into. The mode is stored
 * alongside the code so a solo screen can never reconnect into a multiplayer
 * room (or the other way round).
 */
export function saveRoom(roomId: string, mode: RoomMode) {
  localStorage.setItem(ROOM_ID_KEY, roomId);
  localStorage.setItem(ROOM_MODE_KEY, mode);
}

export function getSavedRoom(): SavedRoom | null {
  const roomId = localStorage.getItem(ROOM_ID_KEY);
  const mode = localStorage.getItem(ROOM_MODE_KEY);

  if (!roomId || (mode !== 'solo' && mode !== 'multiplayer')) return null;

  return { roomId, mode };
}

export function clearSavedRoom() {
  localStorage.removeItem(ROOM_ID_KEY);
  localStorage.removeItem(ROOM_MODE_KEY);
}
