import { exec } from "../src/exec";

test("exec returns hello", async () => {
  const output = await exec("echo", {
    params: ["hello"],
  });
  expect(output).toEqual("hello");
});

test("exec runs node with flags", async () => {
  const output = await exec("node", {
    flags: {
      eval: "console.log(1+1)",
    },
  });
  expect(output).toEqual("2");
});
