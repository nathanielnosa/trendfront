import { describe, expect, it } from "vitest";
import { cleanFilters, unwrap } from "./api/blog";
import { formatCount, formatDate, formatReadingTime } from "./format";

describe("formatCount", () => {
  it("leaves small numbers alone", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(999)).toBe("999");
  });

  it("shortens thousands and millions", () => {
    expect(formatCount(1000)).toBe("1k");
    expect(formatCount(1200)).toBe("1.2k");
    expect(formatCount(2_500_000)).toBe("2.5M");
  });
});

describe("formatReadingTime", () => {
  it("never shows less than one minute", () => {
    expect(formatReadingTime(0)).toBe("1 min read");
    expect(formatReadingTime(7)).toBe("7 min read");
  });
});

describe("formatDate", () => {
  it("formats a real date", () => {
    expect(formatDate("2026-10-26T12:00:00Z")).toBe("26 Oct 2026");
  });

  it("returns an empty string for missing or bad input", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate("not a date")).toBe("");
  });
});

describe("unwrap", () => {
  it("accepts a plain list or a paged one", () => {
    expect(unwrap([1, 2])).toEqual([1, 2]);
    expect(unwrap({ count: 1, next: null, previous: null, results: [3] })).toEqual([3]);
  });
});

describe("cleanFilters", () => {
  it("drops empty values but keeps false and 0", () => {
    expect(cleanFilters({ search: "", category: undefined, featured: false, page: 0 })).toEqual({
      featured: false,
      page: 0,
    });
  });
});