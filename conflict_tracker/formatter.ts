import type { ConflictEvent, DailyState, StateTransition, VolumeSample, ToneSample } from "./schema";

/**
 * Render a DailyState into the state-machine / changelog markdown format.
 */
export function formatDailyState(state: DailyState): string {
  const lines: string[] = [];

  // group events by date
  const byDate = new Map<string, ConflictEvent[]>();
  for (const e of state.events) {
    const list = byDate.get(e.date) ?? [];
    list.push(e);
    byDate.set(e.date, list);
  }

  // render each date block
  for (const [date, events] of [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const label = formatDateLabel(date);
    lines.push(`${label}:`);

    // group by actor→target
    const chains = groupByChain(events);
    for (const [chain, evts] of chains) {
      lines.push(`         ${chain}`);
      // conditional branches from tags
      const branches = buildBranches(evts);
      for (let i = 0; i < branches.length; i++) {
        const connector = i === branches.length - 1 ? "└──" : "├──";
        lines.push(`         ${connector} ${branches[i]}`);
      }
    }
    lines.push("");
  }

  // transitions section
  if (state.transitions.length > 0) {
    lines.push("TRANSITIONS:");
    for (const t of state.transitions) {
      lines.push(`         ${t.type.toUpperCase()}: ${t.description}`);
    }
    lines.push("");
  }

  // volume spikes
  const spikes = detectVolumeSpikes(state.volume);
  if (spikes.length > 0) {
    lines.push("VOLUME SPIKES:");
    for (const s of spikes) {
      lines.push(`         ${s.date}: ${s.volume.toFixed(0)}% of baseline`);
    }
    lines.push("");
  }

  // tone summary
  if (state.tone.length > 0) {
    const avgTone = state.tone.reduce((a, b) => a + b.tone, 0) / state.tone.length;
    const latest = state.tone[state.tone.length - 1];
    lines.push("SENTIMENT:");
    lines.push(`         avg_tone = ${avgTone.toFixed(2)}`);
    if (latest) lines.push(`         latest   = ${latest.tone.toFixed(2)} (${latest.date})`);
    lines.push(`         signal   = ${avgTone < -3 ? "NEGATIVE" : avgTone > 1 ? "POSITIVE" : "NEUTRAL"}`);
    lines.push("");
  }

  // footer
  lines.push(`status: ${state.transitions.some((t) => t.type === "escalation") ? "ESCALATING" : "ACTIVE"}`);
  lines.push(`events: ${state.events.length} | sources: ${countSources(state.events)} | period: ${state.date}`);

  return lines.join("\n");
}

function formatDateLabel(date: string): string {
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const [, m, d] = date.split("-");
  return `${months[parseInt(m!, 10) - 1]} ${parseInt(d!, 10)}`;
}

function groupByChain(events: ConflictEvent[]): Map<string, ConflictEvent[]> {
  const map = new Map<string, ConflictEvent[]>();
  for (const e of events) {
    const chain = `${e.actor} → ${e.action} → ${e.target}`;
    const list = map.get(chain) ?? [];
    list.push(e);
    map.set(chain, list);
  }
  return map;
}

function buildBranches(events: ConflictEvent[]): string[] {
  const branches: string[] = [];
  const allTags = new Set(events.flatMap((e) => e.tags));

  if (allTags.has("escalation")) {
    branches.push("IF continued → wider conflict");
  }
  if (allTags.has("naval")) {
    branches.push("IF shipping attacked → economic damage outlasts war");
  }
  if (allTags.has("new_front")) {
    branches.push("FIRST TIME: new actor-target pair");
  }
  if (allTags.has("nuclear")) {
    branches.push("IF weaponization proceeds → changes deterrence calculus");
  }
  if (allTags.has("ceasefire_signal")) {
    branches.push("IF both sides engage → possible de-escalation path");
  }
  if (allTags.has("economic")) {
    const tones = events.filter((e) => e.tone != null).map((e) => e.tone!);
    if (tones.length > 0) {
      const avg = tones.reduce((a, b) => a + b, 0) / tones.length;
      branches.push(`market_sentiment = ${avg.toFixed(1)}`);
    }
  }

  return branches;
}

function detectVolumeSpikes(samples: VolumeSample[]): VolumeSample[] {
  if (samples.length < 3) return [];
  const values = samples.map((s) => s.volume);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const std = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length);
  if (std === 0) return [];
  return samples.filter((s) => (s.volume - mean) / std > 1.5);
}

function countSources(events: ConflictEvent[]): number {
  return new Set(events.map((e) => e.source)).size;
}

/**
 * Render events as structured JSON (for programmatic consumption).
 */
export function formatJSON(state: DailyState): string {
  return JSON.stringify(state, null, 2);
}
