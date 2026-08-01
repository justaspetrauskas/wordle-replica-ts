import { Server } from "socket.io";
import {createRoom, getRoom } from "./rooms.js";
import { getRandomWord } from "./words.js";

export function setupSocket(io: Server) {
  io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    socket.on("create_room", async ({ language }) => {
  try {
    const solution = await getRandomWord(language);

    const room = createRoom(solution);

    room.players.push({
        id: socket.id,
        guesses: [],
        status: "playing",
    });

    socket.join(room.id);

    socket.emit("room_created", {
      roomId: room.id,
    });

    console.log(`Room created: ${room.id}`);
  } catch (error) {
    console.error("Failed to create room:", error);

    socket.emit("room_error", {
      message: "Could not create game",
    });
  }
});

    socket.on("join_room", (roomId: string) => {
  const room = getRoom(roomId);

  if (!room) {
    socket.emit("room_error", {
      message: "Room not found",
    });

    return;
  }

  if (room.players.length >= 2) {
    socket.emit("room_error", {
      message: "Room is full",
    });

    return;
  }

  room.players.push({
    id: socket.id,
    guesses: [],
    status: "playing",
  });

  socket.join(roomId);

  room.status = "playing";

  io.to(roomId).emit("game_started");

  console.log(`Game started in room ${roomId}`);
});

    socket.on("disconnect", () => {
      console.log("Player disconnected:", socket.id);
    });
  });
}