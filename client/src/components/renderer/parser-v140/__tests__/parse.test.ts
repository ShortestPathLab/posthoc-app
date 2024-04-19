import { describe, expect, it } from "vitest";
import { Context } from "../Context";
import { parse } from "../parse";

describe("parse", () => {
  const ctx: Context = { a: 1 };
  const result = parse<{
    rect: { x: number; y: string; z: number; w: number };
  }>([{ $: "rect2", y: 4 }], {
    rect2: [
      { $: "rect", x: 2, y: "{{ctx.y + 1}}" },
      { $: "rect", y: "{{1 + 2}} a", z: "{{1 + 2}}", w: "{{ctx.a}}" },
    ],
  })(ctx);
  it("flattens correctly", () => {
    expect(result).toMatchObject([{ $: "rect" }, { $: "rect" }]);
  });
  it("creates a deferred property", () => {
    expect(result[0].x).toEqual(2);
  });
  it("evaluates a computed property", () => {
    expect(result[1].z).toEqual(3);
  });
  it("evaluates a template string computed property", () => {
    expect(result[1].y).toEqual("3 a");
  });
  it("reads from context", () => {
    expect(result[1].w).toEqual(1);
  });
  it("propagates context correctly", () => {
    expect(result[0].y).toEqual(5);
  });
});
