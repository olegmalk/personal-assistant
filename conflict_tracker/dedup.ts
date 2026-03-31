import type { ConflictEvent } from "./schema";

/**
 * Deduplicate events by grouping on (date, actor, target, action)
 * and picking the highest-confidence, most-tagged representative.
 */
export function dedup(events: ConflictEvent[]): ConflictEvent[] {
  const map = new Map<string, ConflictEvent>();

  for (const e of events) {
    const key = `${e.date}|${e.actor}|${e.target}|${e.action}`;
    const existing = map.get(key);
    if (!existing || score(e) > score(existing)) {
      map.set(key, e);
    }
  }

  return [...map.values()].sort(
    (a, b) => a.date.localeCompare(b.date) || b.tags.length - a.tags.length
  );
}

const CONFIDENCE_SCORE = { high: 3, medium: 2, low: 1 } as const;

function score(e: ConflictEvent): number {
  return CONFIDENCE_SCORE[e.confidence] + e.tags.length * 0.5 + (e.fatalities ?? 0) * 0.1;
}
