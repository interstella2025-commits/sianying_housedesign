import { describe, expect, it } from "vitest";
import { formatDateRangeLabel, isDateWithinRange } from "@/lib/bookkeeping/date-range";

describe("bookkeeping date range", () => {
  it("includes both boundary dates", () => {
    expect(isDateWithinRange("2026-09-01", "2026-09-01", "2026-09-30")).toBe(true);
    expect(isDateWithinRange("2026-09-30", "2026-09-01", "2026-09-30")).toBe(true);
  });

  it("supports open-ended ranges", () => {
    expect(isDateWithinRange("2026-09-05", "2026-09-01")).toBe(true);
    expect(isDateWithinRange("2026-08-31", "2026-09-01")).toBe(false);
    expect(isDateWithinRange("2026-09-05", undefined, "2026-09-30")).toBe(true);
  });

  it("formats a printable range label", () => {
    expect(formatDateRangeLabel("2026-09-01", "2026-09-30")).toBe(
      "2026/9/1～2026/9/30",
    );
  });
});
