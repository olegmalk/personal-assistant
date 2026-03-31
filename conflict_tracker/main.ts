import { parseArgs } from "util";
import { fetchArticles, fetchTimelineVolume, fetchTimelineTone } from "./gdelt_client";
import { dedup } from "./dedup";
import { detectTransitions } from "./transitions";
import { formatDailyState, formatJSON } from "./formatter";
import type { DailyState } from "./schema";

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
    source: { type: "string", short: "s", default: "gdelt" },
    json: { type: "boolean", default: false },
  },
  strict: true,
});

const keywords = values.query?.length ? values.query : DEFAULT_KEYWORDS;
const days = parseInt(values.days ?? "3", 10);
const outputJson = values.json || values.format === "json";

async function run() {
  console.error(`[conflict-tracker] fetching GDELT data...`);
  console.error(`  keywords: ${keywords.join(", ")}`);
  console.error(`  window:   ${days} days`);
  console.error("");

  // parallel fetch with graceful degradation
  const [articles, volume, tone] = await Promise.all([
    fetchArticles(keywords, days).catch((e) => {
      console.error(`  [warn] artlist failed: ${e.message}`);
      return [];
    }),
    fetchTimelineVolume(keywords, days).catch((e) => {
      console.error(`  [warn] timeline vol failed: ${e.message}`);
      return [];
    }),
    fetchTimelineTone(keywords, days).catch((e) => {
      console.error(`  [warn] timeline tone failed: ${e.message}`);
      return [];
    }),
  ]);

  console.error(`  articles: ${articles.length}`);
  console.error(`  volume samples: ${volume.length}`);
  console.error(`  tone samples: ${tone.length}`);
  console.error("");

  // dedup
  const events = dedup(articles);
  console.error(`  after dedup: ${events.length} events`);

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
