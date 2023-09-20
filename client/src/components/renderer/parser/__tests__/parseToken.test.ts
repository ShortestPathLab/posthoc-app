import { describe, expect, it } from "vitest";
import { parseToken } from "../parseToken";

describe("parseToken", () => {
  it("parses expressions", () => {
    const f = parseToken("1 + ctx.a + ctx.b");
    expect(
      f({
        a: 2,
        b: 3,
      })
    ).toEqual(6);
  });
});
