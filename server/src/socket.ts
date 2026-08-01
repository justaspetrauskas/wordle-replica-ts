import { Server } from "socket.io";
import {
  addPlayer,
  createRoom,
  getPlayer,
  getRoom,
  isRoomFull,
  removePlayer,
  type GameMode,
  type HelpUsage,
} from "./rooms.js";
import { fetchWords, type LanguageCode } from "./words.js";
import {
  MAX_GUESSES,
  WORD_LENGTH,
  getLetterStates,
  isValidGuess,
  pickHintLetter,
  pickSuggestion,
} from "./game.js";

type HintKind = keyof HelpUsage;

type CreateRoomPayload = {
  language?: LanguageCode;
  mode?: GameMode;
  playerId?: string;
};

type SubmitGuessPayload = {
  roomId?: string;
  playerId?: string;
  guess?: string;
};

type RequestHintPayload = {
  roomId?: string;
  playerId?: string;
  hint?: HintKind;
};

const HINT_KINDS: HintKind[] = ["revealLetter", "suggestWord", "flashSolution"];

export function setupSocket(io: Server) {
  io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

socket.on("create_room", async (payload: CreateRoomPayload) => {
  const language = payload?.language;
  const playerId = payload?.playerId;
  const mode: GameMode =
    payload?.mode === "solo" ? "solo" : "multiplayer";

  if (!language) {
    socket.emit("room_error", {
      message: "Pick a language first",
    });

    return;
  }

  if (!playerId) {
    socket.emit("room_error", {
      message: "Player identity is missing",
    });

    return;
  }

  try {
    const words = await fetchWords(language);

    if (words.length === 0) {
      throw new Error("No words returned from the word API");
    }

    const solution = words[Math.floor(Math.random() * words.length)];

    const room = createRoom(solution, words, mode);

    addPlayer(room, playerId);

    socket.join(room.id);

    socket.emit("room_created", {
      roomId: room.id,
    });

    console.log(`Room created: ${room.id} (${mode})`);

    if (mode === "solo") {
      room.status = "playing";
      socket.emit("game_started");
    }
  } catch (error) {
    console.error("Failed to create room:", error);

    socket.emit("room_error", {
      message: "Could not create game",
    });
  }
});

socket.on(
  "join_room",
  (payload: { roomId: string; playerId: string }) => {
    const roomId = payload?.roomId ?? "";
    const playerId = payload?.playerId ?? "";
    const room = getRoom(roomId.trim());

    if (!room) {
      socket.emit("room_error", {
        message: "Room not found",
      });

      return;
    }

    if (!playerId) {
      socket.emit("room_error", {
        message: "Player identity is missing",
      });

      return;
    }

    if (room.status === "finished") {
      socket.emit("room_error", {
        message: "That game is already over",
      });

      return;
    }

    if (getPlayer(room, playerId)) {
      socket.emit("room_error", {
        message: "You are already in this room",
      });

      return;
    }

    if (isRoomFull(room)) {
      socket.emit("room_error", {
        message: "Room is full",
      });

      return;
    }

    addPlayer(room, playerId);

    socket.join(room.id);

    room.status = "playing";

    io.to(room.id).emit("game_started");

    console.log(`Game started in room ${room.id}`);
  }
);

socket.on("submit_guess", (payload: SubmitGuessPayload) => {
  const room = getRoom((payload?.roomId ?? "").trim());
  const playerId = payload?.playerId ?? "";
  const player = room ? getPlayer(room, playerId) : undefined;

  if (!room || !player) {
    socket.emit("room_error", {
      message: "Room not found",
    });

    return;
  }

  if (room.status !== "playing" || player.status !== "playing") {
    return;
  }

  const word = (payload?.guess ?? "").trim().toLowerCase();

  if (!isValidGuess(word)) {
    socket.emit("invalid_guess", {
      message: `Guess must be ${WORD_LENGTH} letters`,
    });

    return;
  }

  player.guesses.push({
    word,
    states: getLetterStates(word, room.solution),
  });

  if (word === room.solution) {
    player.status = "won";
  } else if (player.guesses.length >= MAX_GUESSES) {
    player.status = "lost";
  }

  socket.emit("guess_result", {
    guesses: player.guesses,
    status: player.status,
  });

  // Opponent only receives colours, never the actual letters.
  socket.to(room.id).emit("opponent_progress", {
    playerId,
    rows: player.guesses.map((entry) => entry.states),
    status: player.status,
  });

  const winner = room.players.find(
    (entry) => entry.status === "won"
  );

  const isRoundOver = room.players.every(
    (entry) => entry.status !== "playing"
  );

  if (winner || isRoundOver) {
    room.status = "finished";

    io.to(room.id).emit("game_over", {
      winnerId: winner?.id ?? null,
      solution: room.solution,
    });

    console.log(`Round finished in room ${room.id}`);
  }
});

socket.on("request_hint", (payload: RequestHintPayload) => {
  const room = getRoom((payload?.roomId ?? "").trim());
  const playerId = payload?.playerId ?? "";
  const player = room ? getPlayer(room, playerId) : undefined;
  const hint = payload?.hint;

  if (!room || !player || !hint || !HINT_KINDS.includes(hint)) {
    return;
  }

  if (room.status !== "playing" || player.status !== "playing") {
    return;
  }

  if (player.helpUsage[hint]) {
    return;
  }

  player.helpUsage[hint] = true;

  if (hint === "revealLetter") {
    const { index, letter } = pickHintLetter(
      room.solution,
      player.guesses.map((entry) => entry.word)
    );

    socket.emit("hint_result", {
      hint,
      helpUsage: player.helpUsage,
      message: `Hint: letter ${index + 1} is "${letter.toUpperCase()}".`,
    });

    return;
  }

  if (hint === "suggestWord") {
    const suggestion = pickSuggestion(
      room.solution,
      room.wordPool
    );

    socket.emit("hint_result", {
      hint,
      helpUsage: player.helpUsage,
      message: suggestion
        ? `Try this word: ${suggestion.toUpperCase()}`
        : "No candidate word found for this hint.",
    });

    return;
  }

  socket.emit("hint_result", {
    hint,
    helpUsage: player.helpUsage,
    word: room.solution.toUpperCase(),
  });
});
  });
}
