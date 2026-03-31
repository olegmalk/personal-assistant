export type Confidence = "high" | "medium" | "low";
export type EventTag =
  | "escalation"
  | "de_escalation"
  | "new_front"
  | "ceasefire_signal"
  | "deadline"
  | "diplomacy"
  | "nuclear"
  | "economic"
  | "humanitarian"
  | "proxy"
  | "strikes"
  | "naval";

export interface GeoLocation {
  lat: number;
  lon: number;
  label?: string;
}

export interface ConflictEvent {
  date: string; // YYYY-MM-DD
  actor: string;
  action: string;
  target: string;
  location?: GeoLocation;
  fatalities?: number;
  source: "gdelt" | "acled" | "hrana" | "hengaw" | "manual";
  confidence: Confidence;
  tags: EventTag[];
  tone?: number; // GDELT avg tone (-100 to +100)
  url?: string;
  raw_title?: string;
}

export interface VolumeSample {
  date: string;
  volume: number;
}

export interface ToneSample {
  date: string;
  tone: number;
}

export interface StateTransition {
  type: "new_front" | "escalation" | "de_escalation" | "ceasefire_signal" | "deadline" | "diplomacy_shift";
  description: string;
  events: ConflictEvent[];
}

export interface DailyState {
  date: string;
  events: ConflictEvent[];
  transitions: StateTransition[];
  volume: VolumeSample[];
  tone: ToneSample[];
}
