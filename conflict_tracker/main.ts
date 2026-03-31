import { parseArgs } from "util";
import { fetchArticles, fetchTimelineVolume, fetchTimelineTone } from "./gdelt_client";
import { fetchAcledEvents } from "./acled_client";
import { dedup } from "./dedup";
import { detectTransitions } from "./transitions";
import { formatDailyState, formatJSON } from "./formatter";
import type { ConflictEvent, DailyState } from "./schema";

const DEFAULT_KEYWORDS = [
  "iran war",
  "strait hormuz",
  "tehran strikes",
  "iran israel",
  "houthi red sea",
  "iran ceasefire",
  "iran nuclear",
];

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    query: { type: "string", short: "q", multiple: true },
    days: { type: "string", short: "d", default: "3" },
    format: { type: "string", short: "f", default: "state" },
    source: { type: "string", short: "s", default: "all" },
    json: { type: "boolean", default: false },
  },
  strict: true,
});

const keywords = values.query?.length ? values.query : DEFAULT_KEYWORDS;
const days = parseInt(values.days ?? "3", 10);
const outputJson = values.json || values.format === "json";

const source = values.source ?? "all";
const useGdelt = source === "all" || source === "gdelt";
const useAcled = source === "all" || source === "acled";

async function run() {
  console.error(`[conflict-tracker] sources: ${source}`);
  console.error(`  keywords: ${keywords.join(", ")}`);
  console.error(`  window:   ${days} days`);
  console.error("");

  // parallel fetch with graceful degradation
  const fetches: Promise<any>[] = [];

  // GDELT
  if (useGdelt) {
    fetches.push(
      fetchArticles(keywords, days).catch((e) => {
        console.error(`  [warn] gdelt artlist failed: ${e.message}`);
        return [];
      }),
      fetchTimelineVolume(keywords, days).catch((e) => {
        console.error(`  [warn] gdelt timeline vol failed: ${e.message}`);
        return [];
      }),
      fetchTimelineTone(keywords, days).catch((e) => {
        console.error(`  [warn] gdelt timeline tone failed: ${e.message}`);
        return [];
      }),
    );
  } else {
    fetches.push(Promise.resolve([]), Promise.resolve([]), Promise.resolve([]));
  }

  // ACLED
  if (useAcled) {
    fetches.push(
      fetchAcledEvents(days).catch((e) => {
        console.error(`  [warn] acled failed: ${e.message}`);
        return [];
      }),
    );
  } else {
    fetches.push(Promise.resolve([]));
  }

  const [articles, volume, tone, acledEvents] = await Promise.all(fetches);

  console.error(`  gdelt articles: ${articles.length}`);
  console.error(`  acled events:   ${(acledEvents as ConflictEvent[]).length}`);
  console.error(`  volume samples: ${volume.length}`);
  console.error(`  tone samples:   ${tone.length}`);
  console.error("");

  // merge + dedup
  const allEvents = [...(articles as ConflictEvent[]), ...(acledEvents as ConflictEvent[])];
  const events = dedup(allEvents);
  console.error(`  after dedup: ${events.length} events (from ${allEvents.length} raw)`);

  // detect transitions
  const transitions = detectTransitions(events);
  console.error(`  transitions: ${transitions.length}`);
  console.error("");

  // build daily state
  const today = new Date().toISOString().slice(0, 10);
  const state: DailyState = {
    date: today,
    events,
    transitions,
    volume,
    tone,
  };

  // output
  if (outputJson) {
    console.log(formatJSON(state));
  } else {
    console.log(formatDailyState(state));
  }
}

run().catch((err) => {
  console.error(`[conflict-tracker] ERROR: ${err.message}`);
  process.exit(1);
});
