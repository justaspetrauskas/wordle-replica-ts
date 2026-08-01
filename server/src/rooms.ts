export type Player = {
  id: string;
  guesses: string[];
  status: "playing" | "won" | "lost";
};

export type Room = {
  id: string;
  solution: string;
  status: "waiting" | "playing" | "finished";
  players: Player[];
};

const rooms = new Map<string, Room>();

export function createRoom(solution: string): Room {
  const id = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  const room: Room = {
    id,
    solution,
    status: "waiting",
    players: [],
  };

  rooms.set(id, room);

  return room;
}

export function getRoom(roomId: string) {
  return rooms.get(roomId);
}