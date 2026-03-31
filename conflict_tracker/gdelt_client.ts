import type { ConflictEvent, VolumeSample, ToneSample, EventTag } from "./schema";

const GDELT_DOC_API = "https://api.gdeltproject.org/api/v2/doc/doc";

async function fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url);
    if (res.ok) return res;
    if (res.status >= 500 && i < retries - 1) {
      console.error(`  [retry ${i + 1}/${retries}] ${res.status} - waiting ${delay}ms`);
      await Bun.sleep(delay);
      delay *= 2;
      continue;
    }
    throw new Error(`${res.status} ${res.statusText}`);
  }
  throw new Error("unreachable");
}

interface GdeltArticle {
  url: string;
  url_mobile: string;
  title: string;
  seendate: string;
  socialimage: string;
  domain: string;
  language: string;
  sourcecountry: string;
  tone: number;
}

interface GdeltArtlistResponse {
  articles: GdeltArticle[];
}

interface GdeltTimelineResponse {
  timeline: Array<{
    series: Array<{ date: string; value: string }>;
  }>;
}

function buildQuery(keywords: string[], days: number): URLSearchParams {
  const query = keywords.map((k) => `"${k}"`).join(" OR ");
  const params = new URLSearchParams({
    query,
    timespan: `${days}d`,
    maxrecords: "250",
    format: "json",
    sort: "datedesc",
  });
  return params;
}

function inferTags(title: string): EventTag[] {
  const lower = title.toLowerCase();
  const tags: EventTag[] = [];
  const rules: [RegExp, EventTag][] = [
    [/escala|intensif|expand/, "escalation"],
    [/ceasefire|truce|peace talk/, "ceasefire_signal"],
    [/deadline|ultimat/, "deadline"],
    [/diplomat|negotiat|deal|proposal/, "diplomacy"],
    [/nuclear|uranium|heu|enrich/, "nuclear"],
    [/oil|crude|barrel|economic|sanction|trade/, "economic"],
    [/civilian|humanitarian|refugee|casualt/, "humanitarian"],
    [/proxy|houthi|hezbollah|militia/, "proxy"],
    [/strike|bomb|missile|attack|air raid/, "strikes"],
    [/naval|strait|hormuz|ship|fleet/, "naval"],
    [/new front|open.*front/, "new_front"],
    [/de-escalat|withdraw|pullback/, "de_escalation"],
  ];
  for (const [re, tag] of rules) {
    if (re.test(lower)) tags.push(tag);
  }
  return tags.length > 0 ? tags : ["strikes"];
}

function inferActor(title: string): string {
  const lower = title.toLowerCase();
  if (/houthi|yemen/i.test(lower)) return "yemen_proxy";
  if (/hezbollah/i.test(lower)) return "hezbollah";
  if (/irgc|iran.*guard/i.test(lower)) return "irgc";
  if (/iran/i.test(lower)) return "iran";
  if (/israel/i.test(lower)) return "israel";
  if (/u\.?s\.?|united states|pentagon|american/i.test(lower)) return "us";
  if (/iraq/i.test(lower)) return "iraq_militia";
  if (/saudi|uae|gcc|gulf/i.test(lower)) return "gcc";
  return "unknown";
}

function inferTarget(title: string, actor: string): string {
  const lower = title.toLowerCase();
  // try to find a target different from actor
  const actors = ["iran", "israel", "us", "yemen_proxy", "hezbollah", "gcc", "iraq_militia"];
  for (const a of actors) {
    const pattern = a === "us" ? /u\.?s\.?|united states|american/i :
      a === "gcc" ? /saudi|uae|gcc|gulf/i :
      a === "yemen_proxy" ? /houthi|yemen/i :
      new RegExp(a, "i");
    if (pattern.test(lower) && a !== actor) return a;
  }
  return "unknown";
}

function parseGdeltDate(seendate: string): string {
  // format: "20260328T120000Z" → "2026-03-28"
  const y = seendate.slice(0, 4);
  const m = seendate.slice(4, 6);
  const d = seendate.slice(6, 8);
  return `${y}-${m}-${d}`;
}

export async function fetchArticles(
  keywords: string[],
  days: number
): Promise<ConflictEvent[]> {
  const params = buildQuery(keywords, days);
  params.set("mode", "artlist");
  const url = `${GDELT_DOC_API}?${params}`;

  const res = await fetchWithRetry(url);

  const data = (await res.json()) as GdeltArtlistResponse;
  if (!data.articles) return [];

  return data.articles.map((a): ConflictEvent => {
    const actor = inferActor(a.title);
    return {
      date: parseGdeltDate(a.seendate),
      actor,
      action: inferTags(a.title).includes("strikes") ? "strike" : inferTags(a.title)[0] ?? "unknown",
      target: inferTarget(a.title, actor),
      source: "gdelt",
      confidence: "medium",
      tags: inferTags(a.title),
      tone: a.tone,
      url: a.url,
      raw_title: a.title,
    };
  });
}

export async function fetchTimelineVolume(
  keywords: string[],
  days: number
): Promise<VolumeSample[]> {
  const params = buildQuery(keywords, days);
  params.set("mode", "timelinevol");
  const url = `${GDELT_DOC_API}?${params}`;

  const res = await fetchWithRetry(url);

  const data = (await res.json()) as GdeltTimelineResponse;
  if (!data.timeline?.[0]?.series) return [];

  return data.timeline[0].series.map((s) => ({
    date: s.date,
    volume: parseFloat(s.value),
  }));
}

export async function fetchTimelineTone(
  keywords: string[],
  days: number
): Promise<ToneSample[]> {
  const params = buildQuery(keywords, days);
  params.set("mode", "timelinetone");
  const url = `${GDELT_DOC_API}?${params}`;

  const res = await fetchWithRetry(url);

  const data = (await res.json()) as GdeltTimelineResponse;
  if (!data.timeline?.[0]?.series) return [];

  return data.timeline[0].series.map((s) => ({
    date: s.date,
    tone: parseFloat(s.value),
  }));
}
