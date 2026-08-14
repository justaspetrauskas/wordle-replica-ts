import Fastify from "fastify";
import { Server } from "socket.io";
import cors from "@fastify/cors";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { setupSocket } from "./socket.js";

// Resolved from this file rather than the working directory, so `dist/` and
// `src/` both land on server/.env. Real environment variables win over it,
// which is what a host that injects PORT needs.
const ENV_FILE = join(dirname(fileURLToPath(import.meta.url)), "..", ".env");

try {
  process.loadEnvFile(ENV_FILE);
} catch {
  /* no .env — the environment and the defaults below cover it */
}

const DEFAULT_PORT = 3001;

function readPort(): number {
  const raw = process.env.PORT;

  if (!raw) return DEFAULT_PORT;

  const port = Number(raw);

  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(
      `PORT must be a whole number from 0 to 65535, got "${raw}"`
    );
  }

  return port;
}

const PORT = readPort();

// Vite picks the first free port from 5173, so both are allowed. Set
// CLIENT_ORIGIN to override for any other host.
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
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
      port: PORT,
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