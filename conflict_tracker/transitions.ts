import type { ConflictEvent, StateTransition } from "./schema";

/**
 * Detect state transitions from a set of events.
 * Groups events by date, scans for patterns that indicate
 * escalation, new fronts, diplomacy shifts, etc.
 */
export function detectTransitions(events: ConflictEvent[]): StateTransition[] {
  const transitions: StateTransition[] = [];

  // group by date
  const byDate = new Map<string, ConflictEvent[]>();
  for (const e of events) {
    const list = byDate.get(e.date) ?? [];
    list.push(e);
    byDate.set(e.date, list);
  }

  // track known actor-target pairs to detect new fronts
  const knownPairs = new Set<string>();

  for (const [, dayEvents] of [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    for (const e of dayEvents) {
      const pair = `${e.actor}→${e.target}`;

      // new_front: actor-target pair we haven't seen before
      if (!knownPairs.has(pair) && e.tags.includes("strikes")) {
        knownPairs.add(pair);
        if (knownPairs.size > 1) {
          transitions.push({
            type: "new_front",
            description: `${e.actor} → ${e.action} → ${e.target}`,
            events: [e],
          });
        } else {
          knownPairs.add(pair);
        }
      }

      // ceasefire signals
      if (e.tags.includes("ceasefire_signal")) {
        transitions.push({
          type: "ceasefire_signal",
          description: `ceasefire signal: ${e.raw_title ?? e.action}`,
          events: [e],
        });
      }

      // deadline detection
      if (e.tags.includes("deadline")) {
        transitions.push({
          type: "deadline",
          description: `deadline: ${e.raw_title ?? e.action}`,
          events: [e],
        });
      }

      // diplomacy shift
      if (e.tags.includes("diplomacy") && e.tags.length > 1) {
        transitions.push({
          type: "diplomacy_shift",
          description: `diplomacy: ${e.raw_title ?? e.action}`,
          events: [e],
        });
      }
    }

    // escalation: high volume of strikes in a single day
    const strikes = dayEvents.filter((e) => e.tags.includes("strikes"));
    if (strikes.length >= 5) {
      transitions.push({
        type: "escalation",
        description: `${strikes.length} strike events in single day`,
        events: strikes,
      });
    }

    // tone-based escalation: very negative avg tone
    const tones = dayEvents.filter((e) => e.tone != null).map((e) => e.tone!);
    if (tones.length > 3) {
      const avgTone = tones.reduce((a, b) => a + b, 0) / tones.length;
      if (avgTone < -5) {
        transitions.push({
          type: "escalation",
          description: `avg tone = ${avgTone.toFixed(1)} (very negative)`,
          events: dayEvents,
        });
      }
    }
  }

  return transitions;
}
