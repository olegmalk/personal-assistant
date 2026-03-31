import { test, expect, describe, mock } from "bun:test";
import { dedup } from "./dedup";
import { detectTransitions } from "./transitions";
import { formatDailyState } from "./formatter";
import type { ConflictEvent, DailyState } from "./schema";

// ACLED client is tested via integration (needs API key),
// but we test the merge path through dedup

const makeEvent = (overrides: Partial<ConflictEvent> = {}): ConflictEvent => ({
  date: "2026-03-28",
  actor: "iran",
  action: "strike",
  target: "israel",
  source: "gdelt",
  confidence: "medium",
  tags: ["strikes"],
  ...overrides,
});

describe("dedup", () => {
  test("removes duplicates by date/actor/target/action", () => {
    const events = [
      makeEvent({ confidence: "low" }),
      makeEvent({ confidence: "high" }),
      makeEvent({ confidence: "medium" }),
    ];
    const result = dedup(events);
    expect(result).toHaveLength(1);
    expect(result[0]!.confidence).toBe("high");
  });

  test("keeps different actor-target pairs", () => {
    const events = [
      makeEvent({ actor: "iran", target: "israel" }),
      makeEvent({ actor: "yemen_proxy", target: "israel" }),
    ];
    const result = dedup(events);
    expect(result).toHaveLength(2);
  });

  test("sorts by date then tag count", () => {
    const events = [
      makeEvent({ date: "2026-03-29", tags: ["strikes"] }),
      makeEvent({ date: "2026-03-28", tags: ["strikes", "escalation"] }),
    ];
    const result = dedup(events);
    expect(result[0]!.date).toBe("2026-03-28");
  });
});

describe("detectTransitions", () => {
  test("detects new front", () => {
    const events = [
      makeEvent({ actor: "us", target: "iran", tags: ["strikes"] }),
      makeEvent({ actor: "yemen_proxy", target: "israel", date: "2026-03-29", tags: ["strikes", "new_front"] }),
    ];
    const transitions = detectTransitions(events);
    const newFronts = transitions.filter((t) => t.type === "new_front");
    expect(newFronts.length).toBeGreaterThanOrEqual(1);
  });

  test("detects ceasefire signal", () => {
    const events = [makeEvent({ tags: ["ceasefire_signal"] })];
    const transitions = detectTransitions(events);
    expect(transitions.some((t) => t.type === "ceasefire_signal")).toBe(true);
  });

  test("detects escalation from high strike volume", () => {
    const events = Array.from({ length: 6 }, (_, i) =>
      makeEvent({ actor: `actor_${i}`, target: `target_${i}`, tags: ["strikes"] })
    );
    const transitions = detectTransitions(events);
    expect(transitions.some((t) => t.type === "escalation")).toBe(true);
  });
});

describe("dedup cross-source", () => {
  test("ACLED high-confidence wins over GDELT medium", () => {
    const events = [
      makeEvent({ source: "gdelt", confidence: "medium", actor: "iran", target: "israel" }),
      makeEvent({ source: "acled", confidence: "high", actor: "iran", target: "israel", fatalities: 5 }),
    ];
    const result = dedup(events);
    expect(result).toHaveLength(1);
    expect(result[0]!.source).toBe("acled");
  });

  test("merges events from different sources with different keys", () => {
    const events = [
      makeEvent({ source: "gdelt", actor: "us", target: "iran", action: "strike" }),
      makeEvent({ source: "acled", actor: "yemen_proxy", target: "israel", action: "strike" }),
    ];
    const result = dedup(events);
    expect(result).toHaveLength(2);
  });
});

describe("formatter", () => {
  test("renders state-machine markdown", () => {
    const state: DailyState = {
      date: "2026-03-28",
      events: [
        makeEvent({ actor: "yemen_proxy", action: "missile_strike", target: "israel", tags: ["strikes", "new_front"] }),
        makeEvent({ actor: "us", action: "air_strike", target: "iran", tags: ["strikes", "escalation"] }),
      ],
      transitions: [
        { type: "new_front", description: "yemen_proxy → missile_strike → israel", events: [] },
      ],
      volume: [],
      tone: [{ date: "2026-03-28", tone: -4.5 }],
    };

    const output = formatDailyState(state);
    expect(output).toContain("MAR 28");
    expect(output).toContain("yemen_proxy");
    expect(output).toContain("TRANSITIONS:");
    expect(output).toContain("NEW_FRONT");
    expect(output).toContain("SENTIMENT:");
    expect(output).toContain("status:");
  });

  test("detects escalation status", () => {
    const state: DailyState = {
      date: "2026-03-28",
      events: [makeEvent()],
      transitions: [{ type: "escalation", description: "test", events: [] }],
      volume: [],
      tone: [],
    };
    const output = formatDailyState(state);
    expect(output).toContain("status: ESCALATING");
  });
});
