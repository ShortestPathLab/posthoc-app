import { bundle } from "../src/bundle";
import { resolve } from "path";
import MockClass from "./MockClass";
import { describe, it, expect } from "vitest";

describe("bundle", () => {
  it("bundles the imported lodash library", async () => {
    const file = resolve(__dirname, "./MockClass.ts");
    const output = await bundle(file);
    const M: typeof MockClass = eval(`${output}\nbundle.default`);
    const m = new M();
    expect(m.hi("james")).toBe("James");
  });
});
