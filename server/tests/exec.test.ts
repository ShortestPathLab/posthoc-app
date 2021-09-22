import { exec } from "src/exec";
import { warthog } from "pathfinding-binaries";

describe("exec", () => {
  it("returns hello", async () => {
    const output = await exec("echo", {
      params: ["hello"],
    });
    expect(output).toEqual("hello");
  });

  it("runs node with flags", async () => {
    const output = await exec("node", {
      flags: {
        eval: { value: '"console.log(1+1)"' },
      },
    });
    expect(output).toEqual("2");
  });

  it("runs the warthog solver", async () => {
    const output = await exec(warthog, { flags: { help: {} } }, true);
    console.log(output);
    expect(output).toBeDefined();
  });
});
