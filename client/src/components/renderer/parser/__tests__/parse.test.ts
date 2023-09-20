import { describe, expect, it } from "vitest";
import { parse } from "../parse";
import { Context } from "../Context";

describe("parse", () => {
  const result = parse<{
    rect: { x: number; y: string; z: number; w: number };
  }>([{ $: "rect2", y: 4 }], {
    rect2: [
      { $: "rect", x: 2, y: "{{ctx.y + 1}}" },
      { $: "rect", y: "{{1 + 2}} a", z: "{{1 + 2}}", w: "{{ctx.a}}" },
    ],
  });
  const ctx: Context = { a: 1 };
  it("flattens correctly", () => {
    expect(result).toMatchObject([{ $: "rect" }, { $: "rect" }]);
  });
  it("creates a deferred property", () => {
    expect(result[0].x(ctx)).toEqual(2);
  });
  it("evaluates a computed property", () => {
    expect(result[1].z(ctx)).toEqual(3);
  });
  it("evaluates a template string computed property", () => {
    expect(result[1].y(ctx)).toEqual("3 a");
  });
  it("reads from context", () => {
    expect(result[1].w(ctx)).toEqual(1);
  });
  it("propagates context correctly", () => {
    expect(result[0].y(ctx)).toEqual(5);
  });
  it("propagates context correctly, despite an override in context", () => {
    expect(result[0].y({ ...ctx, y: 12 })).toEqual(5);
  });
});
