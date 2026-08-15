# WORDL · ワードル

A two-player Wordle you can share by link, dealt from themed word decks and drawn as torn paper.

Six guesses at a five-letter word, solo or against someone else in the same room. Create a room, send them the six-character code, and you both race the same word — their board appears next to yours as colours only, never their letters. English or Spanish, with the word drawn from a mixed pool, animals or countries. Refresh mid-game and you land back on the same board.

An npm-workspaces monorepo: a React 19 client on Vite and Tailwind v4, and a Fastify + Socket.IO server. Rooms live in server memory — no database, no accounts.

## How it's put together

The server owns the word and does the grading. The client sends five letters and gets back coloured tiles; it never scores a guess itself and never sees the solution until the round is over. That's what keeps a shared room honest, and it's why `client/src/hooks/useGame.ts` is mostly socket handlers.

The scoring itself is in [`server/src/game.ts`](server/src/game.ts), and it's two passes: mark exact-position matches first and blank those letters out of both strings, then look for what's left. Do it in one pass and a guess of `creek` against `crave` lights up both `e`s, which is wrong.

## Running it

Needs both workspaces up, in separate terminals:

```bash
npm install
```

```bash
npm run dev:server
```

```bash
npm run dev
```

The server listens on 3001, Vite serves the client on 5173, and the client talks to `http://localhost:3001` by default. Nothing else to configure — the word API is keyless.

Configuration lives in `server/.env`, which is optional — copy `server/.env.example` to
start, or skip it and take the defaults. Real environment variables win over the file, so a
host that injects its own `PORT` needs no change here.

- `PORT` — the port the server listens on. Defaults to 3001. Vite reads `PORT` too, for its
  own dev server, so keep the backend's copy in `server/.env` rather than exporting it in a
  shell you also start the client from.
- `CLIENT_ORIGIN` — CORS allowlist for both Fastify and Socket.IO, comma-separated.
  Defaults to localhost 5173 and 5174. Add your deployed client origin before going live.
- `VITE_SERVER_URL` — where the client looks for the server. This one is baked in at build
  time, so it belongs in `client/.env` or the build environment, not `server/.env`.
  Defaults to `http://localhost:3001`.

```bash
npm test    # client suite
npm run build
npm run lint
```

## Known gaps

- The server has no tests. `game.ts` is four pure functions, including the scorer, and none of them are covered — `npm test` runs the client suite only.
- Rooms are held in memory, so a server restart drops every game in progress. The client detects the stale code and clears it rather than retrying.
