import { applyScope } from "../applyScope";
import { describe, expect, it } from "vitest";

describe("applyScope", () => {
  it("correctly propagates context", () => {
    const result = applyScope<{ a: number; b: number }>(
      { a: ({ b }) => b() + 1 },
      { a: ({ a }) => a() * 3 }
    );
    expect(result.a({ b: 3 })).toEqual(12);
    expect(result.a({ b: () => 3 })).toEqual(12);
  });
  it("correctly chains contexts", () => {
    const result = applyScope<{ a: number; b: number }>(
      { a: ({ b }) => b() + 1 },
      { a: ({ a }) => a() * 3 }
    );
    const result2 = applyScope<{ a: number; b: number }>(
      { b: ({ b }) => b() + 3 },
      result
    );
    expect(result2.a({ b: 3 })).toEqual(21);
    expect(result2.a({ b: () => 3 })).toEqual(21);
  });
});
