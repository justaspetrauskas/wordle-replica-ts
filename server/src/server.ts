import Fastify from "fastify";
import { Server } from "socket.io";
import cors from "@fastify/cors";
import { setupSocket } from "./socket.js";


// Vite picks the first free port from 5173, so both are allowed. Set
// CLIENT_ORIGIN to override for any other host.
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173", "http://localhost:5174"];

const app = Fastify({
  logger: true,
});

await app.register(cors, {
  origin: CLIENT_ORIGIN,
});

app.get("/health", async () => {
  return {
    status: "ok",
  };
});

app.get("/api/hello", async () => {
  return {
    message: "Hello from the Wordle backend!",
  };
});

const start = async () => {
  try {
    await app.listen({
      port: 3001,
      host: "0.0.0.0",
    });

    const io = new Server(app.server, {
      cors: {
        origin: CLIENT_ORIGIN,
      },
    });

    setupSocket(io);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();