import Fastify from "fastify";

const app = Fastify({
  logger: true,
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
      port: Number(process.env.PORT ?? 3001),
      host: "0.0.0.0",
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();