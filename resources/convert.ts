import { readFile, writeFile } from "fs/promises";
import makeDir from "make-dir";
import { globIterate } from "glob";
import { endsWith, last } from "lodash";
import { basename, resolve } from "path";
import { argv } from "process";
import beautify from "json-beautify";

const folder = last(argv)!;

await makeDir(resolve(__dirname, folder, "converted"), {});

for await (const file of globIterate(`${resolve(__dirname, folder)}/*.json`)) {
  console.log(file);
  const {
    eventList = [],
    events = [],
    render,
    path,
  } = JSON.parse(await readFile(file, "utf-8"));
  const updated = {
    version: "1.0.4",
    render: {
      components: {},
      views: {
        main: {
          components: [
            {
              $: "rect",
              fill: "{{ctx.color[ctx.type]}}",
              width: 1,
              height: 1,
              x: "{{'x' in ctx ? ctx.x : 0}}",
              y: "{{'y' in ctx ? ctx.y : 0}}",
            },
          ],
        },
      },
    },
    path: {
      pivot: {
        x: "{{'x' in ctx ? ctx.x : 0}}",
        y: "{{'y' in ctx ? ctx.y : 0}}",
      },
      scale: 1,
    },
    ...render,
    ...path,
    events: [...eventList, ...events].map((e) => {
      const { variables, ...rest } = e;
      return {
        ...rest,
        ...variables,
      };
    }),
  };
  const name = endsWith(file, ".trace.json")
    ? basename(file)
    : `${basename(file, ".json")}.trace.json`;
  await writeFile(
    resolve(__dirname, folder, "converted", name),
    beautify(updated, null as any, 2, 80)
  );
}
