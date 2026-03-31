import type { ConflictEvent, EventTag } from "./schema";

const ACLED_API = "https://api.acleddata.com/acled/read";

interface AcledEvent {
  event_date: string;
  event_type: string;
  sub_event_type: string;
  actor1: string;
  actor2: string;
  country: string;
  admin1: string;
  location: string;
  latitude: string;
  longitude: string;
  fatalities: string;
  notes: string;
  source: string;
  source_scale: string;
}

interface AcledResponse {
  success: boolean;
  data: AcledEvent[];
  count: number;
}

const ACLED_COUNTRIES = [
  "Iran",
  "Israel",
  "Lebanon",
  "Yemen",
  "Iraq",
  "Saudi Arabia",
  "United Arab Emirates",
  "Bahrain",
  "Kuwait",
  "Qatar",
  "Oman",
];

function normalizeActor(actor: string): string {
  const lower = actor.toLowerCase();
  if (/houthi/i.test(lower)) return "yemen_proxy";
  if (/hezbollah/i.test(lower)) return "hezbollah";
  if (/irgc|revolutionary guard|pasdaran/i.test(lower)) return "irgc";
  if (/iran/i.test(lower)) return "iran";
  if (/israel|idf/i.test(lower)) return "israel";
  if (/united states|us military|coalition/i.test(lower)) return "us";
  if (/iraq.*militia|hashd|pmf/i.test(lower)) return "iraq_militia";
  if (/saudi|uae|emirates|bahrain|kuwait|qatar|oman|gcc/i.test(lower)) return "gcc";
  return actor.slice(0, 30).toLowerCase().replace(/\s+/g, "_");
}

function inferTags(event: AcledEvent): EventTag[] {
  const tags: EventTag[] = [];
  const type = event.event_type.toLowerCase();
  const sub = event.sub_event_type.toLowerCase();
  const notes = event.notes.toLowerCase();

  if (/battle|armed clash/i.test(type)) tags.push("strikes");
  if (/explosion|remote/i.test(type)) tags.push("strikes");
  if (/air.*strike|drone|missile|shelling/i.test(sub)) tags.push("strikes");
  if (/protest|riot/i.test(type)) tags.push("humanitarian");
  if (/strategic/i.test(type)) tags.push("escalation");
  if (/agreement|negotiat|ceasefire/i.test(sub)) tags.push("ceasefire_signal", "diplomacy");
  if (/nuclear|uranium/i.test(notes)) tags.push("nuclear");
  if (/naval|maritime|strait|ship/i.test(notes)) tags.push("naval");
  if (/civilian|humanitarian/i.test(notes)) tags.push("humanitarian");
  if (/proxy|militia/i.test(notes)) tags.push("proxy");

  return tags.length > 0 ? tags : ["strikes"];
}

function acledDateToISO(dateStr: string): string {
  // ACLED format varies: "28 March 2026" or "2026-03-28"
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  return d.toISOString().slice(0, 10);
}

export async function fetchAcledEvents(days: number): Promise<ConflictEvent[]> {
  const key = process.env.ACLED_KEY;
  const email = process.env.ACLED_EMAIL;

  if (!key || !email) {
    console.error("  [acled] skipping: set ACLED_KEY and ACLED_EMAIL env vars");
    console.error("  [acled] register free at https://developer.acleddata.com/");
    return [];
  }

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().slice(0, 10);

  const allEvents: ConflictEvent[] = [];

  // query per country to stay within API limits
  for (const country of ACLED_COUNTRIES) {
    const params = new URLSearchParams({
      key,
      email,
      country,
      event_date: `${sinceStr}|`,
      event_date_where: "BETWEEN",
      limit: "500",
    });

    const url = `${ACLED_API}?${params}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`  [acled] ${country}: ${res.status}`);
        continue;
      }

      const data = (await res.json()) as AcledResponse;
      if (!data.success || !data.data) continue;

      for (const e of data.data) {
        const actor = normalizeActor(e.actor1);
        const target = normalizeActor(e.actor2 || e.country);
        const tags = inferTags(e);

        allEvents.push({
          date: acledDateToISO(e.event_date),
          actor,
          action: e.sub_event_type || e.event_type,
          target,
          location: {
            lat: parseFloat(e.latitude),
            lon: parseFloat(e.longitude),
            label: `${e.location}, ${e.admin1}, ${e.country}`,
          },
          fatalities: parseInt(e.fatalities, 10) || 0,
          source: "acled",
          confidence: "high",
          tags,
          raw_title: e.notes.slice(0, 200),
        });
      }

      console.error(`  [acled] ${country}: ${data.data.length} events`);
    } catch (err: any) {
      console.error(`  [acled] ${country} error: ${err.message}`);
    }
  }

  return allEvents;
}
