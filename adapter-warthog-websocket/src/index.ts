import box, { Options as BoxOptions } from "boxen";
import chalk from "chalk";
import { emojify } from "node-emoji";
import { getConfig } from "./config";
import { createAdapter } from "./createAdapter";

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

const hintText = chalk.dim(`(Hint: Add it to Waypoint's connections list)`);

const server = createAdapter(port);

log(
  box(emojify(`:rocket: ${mainText}\n\n${hintText}`), {
    ...boxOptions,
    title: name,
  })
);

server.listen();
