import { createAdapter } from "./createAdapter";
import chalk from "chalk";
import box, { Options as BoxOptions } from "boxen";
import { getConfig } from "./config";
import { emojify } from "node-emoji";

const log = console.log;

const boxOptions: BoxOptions = {
  margin: 1,
  padding: 2,
  titleAlignment: "center",
  textAlignment: "center",
  borderColor: "blueBright",
  borderStyle: "round",
};

const { port, name } = getConfig();

const mainText = `Adapter started on ${chalk.blueBright(
  `http://localhost:${port}/`
)}`;

const hintText = chalk.dim(`(Hint: Add it to Visualiser's connections list)`);

const server = createAdapter(port);

log(
  box(emojify(`:rocket: ${mainText}\n\n${hintText}`), {
    ...boxOptions,
    title: name,
  })
);

server.listen();
