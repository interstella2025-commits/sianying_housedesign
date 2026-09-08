import { describe, expect, it } from "vitest";
import { vendorsForTrade } from "@/lib/bookkeeping/suggestions";

const suggestions = [
  { vendor: "甲木作", trade: "木作" },
  { vendor: "乙木作", trade: "木作工程" },
  { vendor: "甲木作", trade: "木作" },
  { vendor: "丙油漆", trade: "油漆" },
];

describe("vendorsForTrade", () => {
  it("prioritizes exact trade matches and removes duplicate vendors", () => {
    expect(vendorsForTrade(suggestions, " 木作 ")).toEqual(["甲木作", "乙木作"]);
  });

  it("offers related historical trades while the trade is being typed", () => {
    expect(vendorsForTrade(suggestions, "木")).toEqual(["甲木作", "乙木作"]);
  });

  it("returns no vendors before a trade is entered", () => {
    expect(vendorsForTrade(suggestions, "")).toEqual([]);
  });
});
