import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCommonLemmas, loadSenseIndex, loadSynsets } from "./wordnet.js";
import { REJECTED } from "./rejected.js";
import { SPANISH_SETS } from "./spanish.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = join(HERE, "..", "src", "data", "words.generated.ts");
const CACHE_FILE = join(HERE, "datamuse-cache.json");

const WORD_LENGTH = 5;
const PLAYABLE = /^[a-z]{5}$/;
const MAX_SENSE_RANK = 2;
const MIN_THEMED_FREQUENCY = 0.3;
const MIN_MISC_FREQUENCY = 4;
const MISC_POOL_FLOOR = 1;
const MISC_LIMIT = 900;
const MIN_SHIPPABLE = 15;

interface ThemedRoot {
  lemma: string;
  sense: number;
}

const THEMED: Record<string, ThemedRoot> = {
  animals: { lemma: "animal", sense: 1 },
  birds: { lemma: "bird", sense: 1 },
  food: { lemma: "food", sense: 1 },
};

const COUNTRIES = [
  "chile", "china", "congo", "egypt", "gabon", "ghana", "haiti", "india",
  "italy", "japan", "kenya", "libya", "malta", "nauru", "nepal", "niger",
  "palau", "qatar", "samoa", "spain", "sudan", "syria", "tonga", "yemen",
];

interface Cache {
  frequencies: Record<string, number>;
  miscPool: Record<string, number>;
  miscPoolFloor: number;
}

const REFRESH = process.argv.includes("--refresh");

function loadCache(): Cache {
  const empty: Cache = {
    frequencies: {},
    miscPool: {},
    miscPoolFloor: MISC_POOL_FLOOR,
  };

  if (REFRESH) return empty;

  try {
    const stored = JSON.parse(readFileSync(CACHE_FILE, "utf8")) as Partial<Cache>;
    const merged = { ...empty, ...stored };

    if (merged.miscPoolFloor > MIN_MISC_FREQUENCY) {
      console.log(
        `Cached pool was pruned at ${merged.miscPoolFloor}, below the ${MIN_MISC_FREQUENCY} threshold — refetching.`
      );

      return empty;
    }

    return merged;
  } catch {
    return empty;
  }
}

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const out = new Array<R>(items.length);
  let cursor = 0;

  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (cursor < items.length) {
        const index = cursor++;
        out[index] = await fn(items[index]);
      }
    })
  );

  return out;
}

function frequencyOf(tags: string[] | undefined): number {
  const tag = (tags ?? []).find((value) => value.startsWith("f:"));

  return tag ? parseFloat(tag.slice(2)) : 0;
}

function makeFrequencyLookup(cache: Cache) {
  const { frequencies } = cache;

  return async function frequency(word: string): Promise<number> {
    if (word in frequencies) return frequencies[word];

    try {
      const response = await fetch(
        `https://api.datamuse.com/words?sp=${word}&md=f&max=1`
      );
      const data: unknown = await response.json();
      const hit =
        Array.isArray(data) && data[0]?.word === word ? data[0] : undefined;

      frequencies[word] = frequencyOf(hit?.tags);
    } catch {
      frequencies[word] = 0;
    }

    return frequencies[word];
  };
}

function descend(
  synsets: Map<string, { words: string[]; hyponyms: string[] }>,
  root: string
): Map<string, string> {
  const seen = new Set<string>();
  const found = new Map<string, string>();
  const queue = [root];

  while (queue.length > 0) {
    const offset = queue.shift() as string;
    if (seen.has(offset)) continue;
    seen.add(offset);

    const synset = synsets.get(offset);
    if (!synset) continue;

    for (const word of synset.words) {
      const lemma = word.toLowerCase();
      if (!found.has(lemma)) found.set(lemma, offset);
    }

    queue.push(...synset.hyponyms);
  }

  return found;
}

async function buildThemed(
  name: string,
  root: ThemedRoot,
  synsets: ReturnType<typeof loadSynsets>,
  senses: Map<string, string[]>,
  frequency: (word: string) => Promise<number>
): Promise<{ words: string[]; report: string }> {
  const rootOffset = senses.get(root.lemma)?.[root.sense - 1];

  if (!rootOffset) throw new Error(`No synset for ${root.lemma}.${root.sense}`);

  const candidates = [...descend(synsets, rootOffset)].filter(([word]) =>
    PLAYABLE.test(word)
  );

  const primary = candidates.filter(([word, offset]) => {
    const rank = (senses.get(word) ?? []).indexOf(offset) + 1;

    return rank > 0 && rank <= MAX_SENSE_RANK;
  });

  const frequencies = await mapLimit(
    primary.map(([word]) => word),
    8,
    frequency
  );

  const familiar = primary
    .map(([word], index) => ({ word, frequency: frequencies[index] }))
    .filter((row) => row.frequency >= MIN_THEMED_FREQUENCY);

  const rejected = REJECTED[name] ?? [];
  const words = familiar
    .map((row) => row.word)
    .filter((word) => !rejected.includes(word))
    .sort();

  const report =
    `${name.padEnd(10)} ${String(candidates.length).padStart(5)} candidates` +
    ` -> ${String(primary.length).padStart(4)} primary-sense` +
    ` -> ${String(familiar.length).padStart(4)} familiar` +
    ` -> ${String(words.length).padStart(4)} after review`;

  return { words, report };
}

async function buildMisc(
  commonLemmas: Set<string>,
  frequency: (word: string) => Promise<number>,
  cache: Cache
): Promise<{ words: string[]; report: string }> {
  const seeds = "abcdefghijklmnopqrstuvwxyz".split("");
  const pool = new Map<string, number>(Object.entries(cache.miscPool));

  if (pool.size === 0) {
    for (const seed of seeds) {
      const response = await fetch(
        `https://api.datamuse.com/words?sp=${seed}${"?".repeat(WORD_LENGTH - 1)}&md=f&max=1000`
      );
      const data: unknown = await response.json();

      if (!Array.isArray(data)) continue;

      for (const entry of data) {
        if (!PLAYABLE.test(entry.word)) continue;
        pool.set(entry.word, frequencyOf(entry.tags));
      }
    }
  }

  const missing = [...pool.entries()]
    .filter(([, value]) => value === 0)
    .map(([word]) => word);

  const refreshed = await mapLimit(missing, 8, frequency);
  missing.forEach((word, index) => pool.set(word, refreshed[index]));

  cache.miscPool = Object.fromEntries(
    [...pool.entries()].filter(([, value]) => value >= MISC_POOL_FLOOR)
  );
  cache.miscPoolFloor = MISC_POOL_FLOOR;

  const isPlural = (word: string) =>
    word.endsWith("s") &&
    (commonLemmas.has(word.slice(0, -1)) ||
      (word.endsWith("es") && commonLemmas.has(word.slice(0, -2))));

  const rejected = REJECTED.misc ?? [];
  const frequent = [...pool.entries()]
    .filter(([, value]) => value >= MIN_MISC_FREQUENCY)
    .filter(([word]) => commonLemmas.has(word));

  const words = frequent
    .filter(([word]) => !isPlural(word))
    .filter(([word]) => !rejected.includes(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, MISC_LIMIT)
    .map(([word]) => word)
    .sort();

  const report =
    `misc       ${String(pool.size).padStart(5)} candidates` +
    ` -> ${String(frequent.length).padStart(4)} common + frequent` +
    ` -> ${String(words.length).padStart(4)} singular, after review`;

  return { words, report };
}

function serialise(sets: Record<string, Record<string, string[]>>): string {
  const lines: string[] = [];

  lines.push("export const WORD_SETS: Record<string, Record<string, readonly string[]>> = {");

  for (const [language, categories] of Object.entries(sets)) {
    lines.push(`  ${language}: {`);

    for (const [category, words] of Object.entries(categories)) {
      lines.push(`    ${category}: [`);

      for (let i = 0; i < words.length; i += 8) {
        const row = words.slice(i, i + 8).map((word) => `"${word}"`).join(", ");
        lines.push(`      ${row},`);
      }

      lines.push("    ],");
    }

    lines.push("  },");
  }

  lines.push("};");

  return lines.join("\n") + "\n";
}

async function main() {
  const cache = loadCache();
  const frequency = makeFrequencyLookup(cache);

  const synsets = loadSynsets();
  const senses = loadSenseIndex();
  const commonLemmas = loadCommonLemmas();

  const reports: string[] = [];
  const english: Record<string, string[]> = {};

  for (const [name, root] of Object.entries(THEMED)) {
    const { words, report } = await buildThemed(
      name,
      root,
      synsets,
      senses,
      frequency
    );

    english[name] = words;
    reports.push(report);
  }

  const misc = await buildMisc(commonLemmas, frequency, cache);
  english.misc = misc.words;
  reports.push(misc.report);

  english.countries = [...COUNTRIES].sort();
  reports.push(`countries  ${String(COUNTRIES.length).padStart(5)} curated (closed set)`);

  const dropped: string[] = [];

  const shippable = (language: string, categories: Record<string, string[]>) =>
    Object.fromEntries(
      Object.entries(categories).filter(([category, words]) => {
        if (words.length >= MIN_SHIPPABLE) return true;

        dropped.push(`${language}/${category} (${words.length})`);

        return false;
      })
    );

  const sets = {
    en: shippable("en", english),
    es: shippable("es", SPANISH_SETS),
  };

  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, serialise(sets));
  writeFileSync(CACHE_FILE, JSON.stringify(cache));

  console.log(reports.join("\n"));

  if (dropped.length > 0) {
    console.log(`\nBelow the ${MIN_SHIPPABLE}-word floor, left out: ${dropped.join(", ")}`);
  }
  console.log("\nSpanish (hand-curated):");

  for (const [category, words] of Object.entries(SPANISH_SETS)) {
    console.log(`  ${category.padEnd(10)} ${words.length}`);
  }

  const thin = Object.entries(sets).flatMap(([language, categories]) =>
    Object.entries(categories)
      .filter(([, words]) => words.length < 40)
      .map(([category, words]) => `${language}/${category} (${words.length})`)
  );

  if (thin.length > 0) console.log(`Thin but shipping: ${thin.join(", ")}`);

  console.log(`\nWrote ${OUT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
