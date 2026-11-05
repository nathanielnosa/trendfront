import { describe, expect, it } from "vitest";
import { paginationItems } from "./paginationItems";

describe("paginationItems", () => {
  it("shows every page when there are few", () => {
    expect(paginationItems(1, 1)).toEqual([1]);
    expect(paginationItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("adds a gap only on the far side near the start", () => {
    expect(paginationItems(1, 10)).toEqual([1, 2, 3, 4, 5, "gap", 10]);
    expect(paginationItems(3, 10)).toEqual([1, 2, 3, 4, 5, "gap", 10]);
  });

  it("adds a gap on both sides in the middle", () => {
    expect(paginationItems(5, 10)).toEqual([1, "gap", 4, 5, 6, "gap", 10]);
  });

  it("adds a gap only on the near side near the end", () => {
    expect(paginationItems(10, 10)).toEqual([1, "gap", 6, 7, 8, 9, 10]);
  });
});