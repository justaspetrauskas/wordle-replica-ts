import Fastify from "fastify";
import { Server } from "socket.io";
import cors from "@fastify/cors";
import { setupSocket } from "./socket.js";


const app = Fastify({
  logger: true,
});

await app.register(cors, {
  origin: "http://localhost:5174",
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
        origin: "http://localhost:5174",
      },
    });

    setupSocket(io);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();