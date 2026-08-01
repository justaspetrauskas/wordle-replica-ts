import { customAlphabet } from "nanoid";
import type { LetterState } from "./game.js";

export type GameMode = "solo" | "multiplayer";

export type PlayerStatus = "playing" | "won" | "lost";

export type SubmittedGuess = {
  word: string;
  states: LetterState[];
};

export type HelpUsage = {
  revealLetter: boolean;
  suggestWord: boolean;
  flashSolution: boolean;
};

export type Player = {
  id: string;
  guesses: SubmittedGuess[];
  status: PlayerStatus;
  helpUsage: HelpUsage;
};

export type Room = {
  id: string;
  mode: GameMode;
  solution: string;
  wordPool: string[];
  status: "waiting" | "playing" | "finished";
  players: Player[];
};

const MAX_PLAYERS = 2;

const ROOM_CODE_LENGTH = 6;

// I/O/0/1 are left out so a code can be read out loud without ambiguity.
const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const generateRoomCode = customAlphabet(ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH);

const rooms = new Map<string, Room>();

function createRoomId(): string {
  let id = generateRoomCode();

  while (rooms.has(id)) {
    id = generateRoomCode();
  }

  return id;
}

export function createRoom(
  solution: string,
  wordPool: string[],
  mode: GameMode
): Room {
  const id = createRoomId();

  const room: Room = {
    id,
    mode,
    solution,
    wordPool,
    status: "waiting",
    players: [],
  };

  rooms.set(id, room);

  return room;
}

// Codes are typed by hand, so lookups ignore case and stray whitespace.
export function getRoom(roomId: string | undefined) {
  if (!roomId) return undefined;

  return rooms.get(roomId.trim().toUpperCase());
}

export function isRoomFull(room: Room): boolean {
  return room.mode === "solo" || room.players.length >= MAX_PLAYERS;
}

export function addPlayer(room: Room, playerId: string): Player {
  const player: Player = {
    id: playerId,
    guesses: [],
    status: "playing",
    helpUsage: {
      revealLetter: false,
      suggestWord: false,
      flashSolution: false,
    },
  };

  room.players.push(player);

  return player;
}

export function getPlayer(room: Room, playerId: string) {
  return room.players.find((player) => player.id === playerId);
}

// Drops the player from every room they were in and returns the rooms that are
// still alive, so the caller can tell the remaining player what happened.
export function removePlayer(playerId: string): Room[] {
  const affectedRooms: Room[] = [];

  for (const room of rooms.values()) {
    const index = room.players.findIndex((player) => player.id === playerId);

    if (index === -1) continue;

    room.players.splice(index, 1);

    if (room.players.length === 0) {
      rooms.delete(room.id);
      continue;
    }

    affectedRooms.push(room);
  }

  return affectedRooms;
}
