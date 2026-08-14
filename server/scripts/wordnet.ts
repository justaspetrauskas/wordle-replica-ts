import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);

const DB_DIR = join(dirname(require.resolve("wordnet/package.json")), "db");

export interface Synset {
  words: string[];
  gloss: string;
  hyponyms: string[];
}

function readLines(file: string): string[] {
  return readFileSync(join(DB_DIR, file), "latin1").split("\n");
}

export function loadSynsets(): Map<string, Synset> {
  const byOffset = new Map<string, Synset>();

  for (const line of readLines("data.noun")) {
    if (!line || line.startsWith("  ")) continue;

    const [body, gloss = ""] = line.split(" | ");
    const fields = body.split(" ");
    const wordCount = parseInt(fields[3], 16);

    const words: string[] = [];
    let i = 4;

    for (let w = 0; w < wordCount; w++) {
      words.push(fields[i]);
      i += 2;
    }

    const pointerCount = parseInt(fields[i], 10);
    i += 1;

    const hyponyms: string[] = [];

    for (let p = 0; p < pointerCount; p++) {
      const symbol = fields[i];
      if (symbol === "~" || symbol === "~i") hyponyms.push(fields[i + 1]);
      i += 4;
    }

    byOffset.set(fields[0], { words, gloss: gloss.trim(), hyponyms });
  }

  return byOffset;
}

export function loadSenseIndex(): Map<string, string[]> {
  const byLemma = new Map<string, string[]>();

  for (const line of readLines("index.noun")) {
    if (!line || line.startsWith("  ")) continue;

    const fields = line.trim().split(/\s+/);
    const synsetCount = parseInt(fields[2], 10);

    byLemma.set(fields[0], fields.slice(fields.length - synsetCount));
  }

  return byLemma;
}

export function loadCommonLemmas(): Set<string> {
  const lemmas = new Set<string>();

  for (const file of ["data.noun", "data.verb", "data.adj", "data.adv"]) {
    for (const line of readLines(file)) {
      if (!line || line.startsWith("  ")) continue;

      const fields = line.split(" | ")[0].split(" ");
      const wordCount = parseInt(fields[3], 16);

      let i = 4;

      for (let w = 0; w < wordCount; w++) {
        const word = fields[i];
        if (word === word.toLowerCase()) lemmas.add(word);
        i += 2;
      }
    }
  }

  return lemmas;
}
