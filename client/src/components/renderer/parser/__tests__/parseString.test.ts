import { describe, expect, it } from "vitest";
import { parseString } from "../parseString";

describe("parseString", () => {
  it("parses single terms", () => {
    const f = parseString("{{1}}");
    expect(f({})).toEqual(1);
  });
  it("parses multiple terms", () => {
    const f = parseString("{{false && true}}");
    expect(f({})).toEqual(false);
  });
  it("coerces templates into strings", () => {
    const f = parseString("B{{'a' + + 'a'}}a");
    expect(f({})).toEqual("BaNaNa");
  });
});
