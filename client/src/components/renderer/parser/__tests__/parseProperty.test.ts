import { describe, expect, it } from "vitest";
import { parseProperty } from "../parseProperty";

describe("parseProperty", () => {
  it("parses a simple property", () => {
    const f = parseProperty(3);
    expect(f({})).toEqual(3);
  });
  it("parses nested array", () => {
    const f = parseProperty([1, 2, [1, 2]]);
    expect(f({})).toEqual([1, 2, [1, 2]]);
  });
  it("parses nested object", () => {
    const f = parseProperty({ a: 1, b: { x: 1, y: 2 } });
    expect(f({})).toEqual({ a: 1, b: { x: 1, y: 2 } });
  });
  it("parses mixed object", () => {
    const f = parseProperty({ a: 1, b: [1, 2] });
    expect(f({})).toEqual({ a: 1, b: [1, 2] });
  });
  it("parses computed property", () => {
    const f = parseProperty("{{1}}");
    expect(f({})).toEqual(1);
  });
  it("parses computed with context", () => {
    const f = parseProperty("{{ctx.a}}");
    expect(f({ a: 1 })).toEqual(1);
  });
  it("parses computed with nested context", () => {
    const f = parseProperty("{{ctx.a.b[0]}}");
    expect(f({ a: { b: [1] } })).toEqual(1);
  });
  it("parses string coercion property", () => {
    const f = parseProperty("a {{ctx.a}}");
    expect(f({ a: 2 })).toEqual("a 2");
  });
});
