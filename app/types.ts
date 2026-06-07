// Shared types for the dashboard. Keeps data.ts a pure data dump
// (auto-generated) while letting the UI code consume strongly-typed views.

export type EventType =
  | "Fed"
  | "Macro"
  | "Political"
  | "Earnings"
  | "AI"
  | "IPO"
  | "Banking Crisis"
  | "Geopolitical";

export type Row = {
  date: string;
  qqq: number;
  spy: number | null;
  ndx: number | null;
  et?: EventType;
  en?: string;
  ed?: string;
};

export type CumPoint = {
  date: string;
  qqq: number;
  spy: number;
  et: EventType | null;
  en: string | null;
};

export type TypeStat = {
  type: EventType;
  avg: number;
  vol: number;
  count: number;
  up: number;
  down: number;
};

export type DowStat = {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
  avg: number;
  vol: number;
  count: number;
  up: number;
  down: number;
};

export type MonthStat = {
  month: string;
  monthNum: number;
  avg: number;
  count: number;
  up: number;
  down: number;
};

export type YearStat = {
  year: string;
  avg: number;
  vol: number;
  count: number;
  up: number;
  down: number;
  best: number;
  worst: number;
};

export type YearMonthStat = {
  ym: string;
  year: string;
  month: string;
  avg: number;
  count: number;
};

export type DistBin = { range: string; count: number };

export type RollingVolPoint = { date: string; vol: number };

export type PrePostPoint = {
  day: "D-2" | "D-1" | "D0" | "D+1" | "D+2" | "D+3" | "D+4" | "D+5";
} & Partial<Record<EventType, number>>;

export type Streaks = {
  up: { len: number; start: string; end: string };
  down: { len: number; start: string; end: string };
};

export type TopEventDay = {
  date: string;
  qqq: number;
  spy: number | null;
  ndx: number | null;
  et: EventType;
  en: string;
  ed: string;
};

export type SpreadByType = { type: EventType; avg: number; n: number };

export type CalendarMonth = {
  ym: string;
  days: Array<{
    date: string;
    qqq: number;
    et?: EventType | null;
    en?: string | null;
  }>;
};

export type Summary = {
  total_days: number;
  event_days: number;
  avg_all: number;
  avg_event: number;
  avg_non_event: number;
  vol_event: number;
  vol_non_event: number;
  best: Row;
  worst: Row;
  big_moves: number;
  avg_noevent: number;
};
