import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  subQuarters,
  subYears,
  format,
} from "date-fns";

export type Period = "daily" | "weekly" | "monthly" | "quarterly" | "annual";

export interface BucketDef {
  key: string;
  label: string;
  start: Date;
  end: Date;
}

const WEEK_OPTS = { weekStartsOn: 1 as const }; // Monday start

/** Returns the start/end range that contains `reference` for a given period. */
export function currentRange(period: Period, reference: Date = new Date()) {
  switch (period) {
    case "daily":
      return { start: startOfDay(reference), end: endOfDay(reference) };
    case "weekly":
      return {
        start: startOfWeek(reference, WEEK_OPTS),
        end: endOfWeek(reference, WEEK_OPTS),
      };
    case "monthly":
      return { start: startOfMonth(reference), end: endOfMonth(reference) };
    case "quarterly":
      return { start: startOfQuarter(reference), end: endOfQuarter(reference) };
    case "annual":
      return { start: startOfYear(reference), end: endOfYear(reference) };
  }
}

/** Builds `count` consecutive buckets of `period` size, ending with the bucket containing `reference`. */
export function buildBuckets(
  period: Period,
  count: number,
  reference: Date = new Date()
): BucketDef[] {
  const buckets: BucketDef[] = [];

  for (let i = count - 1; i >= 0; i--) {
    let ref: Date;
    let labelFmt: string;

    switch (period) {
      case "daily":
        ref = subDays(reference, i);
        labelFmt = "MMM d";
        break;
      case "weekly":
        ref = subWeeks(reference, i);
        labelFmt = "'Wk of' MMM d";
        break;
      case "monthly":
        ref = subMonths(reference, i);
        labelFmt = "MMM yyyy";
        break;
      case "quarterly":
        ref = subQuarters(reference, i);
        labelFmt = "QQQ yyyy";
        break;
      case "annual":
        ref = subYears(reference, i);
        labelFmt = "yyyy";
        break;
    }

    const { start, end } = currentRange(period, ref);
    buckets.push({
      key: start.toISOString(),
      label: format(start, labelFmt),
      start,
      end,
    });
  }

  return buckets;
}

export const DEFAULT_BUCKET_COUNT: Record<Period, number> = {
  daily: 14,
  weekly: 10,
  monthly: 12,
  quarterly: 8,
  annual: 5,
};

export const PERIOD_LABELS: Record<Period, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
};
