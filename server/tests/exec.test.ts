import { exec } from "../src/exec";

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
        eval: "console.log(1+1)",
      },
    });
    expect(output).toEqual("2");
  });
});
