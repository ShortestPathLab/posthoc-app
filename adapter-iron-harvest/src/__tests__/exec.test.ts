import { warthog } from "pathfinding-binaries";
import { describe, expect, it } from "vitest";
import { exec } from "../helpers/exec";

describe("exec", () => {
  it("returns hello", async () => {
    const output = await exec("echo", { params: ["hello"] });
    expect(output).toEqual("hello");
  });

  it("runs node with flags", async () => {
    const output = await exec("node", {
      args: { eval: '"console.log(1+1)"' },
    });
    expect(output).toEqual("2");
  });

  it("runs the warthog solver", async () => {
    const output = await exec(warthog, { flags: ["help"] }, true);
    expect(output.startsWith("==> manual <==")).toBeTruthy();
  });
});
