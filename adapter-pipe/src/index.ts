import box, { Options as BoxOptions } from "boxen";
import chalk from "chalk";
import { emojify } from "node-emoji";
import { text } from "node:stream/consumers";
import { getConfig } from "./config";
import { readFileSync } from "fs";

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

const mainText = `Pairing code: ${chalk.blueBright(`AH2G1`)}`;

const hintText = chalk.dim(`Keep this process open`);

// const server = createAdapter(port);

log(
  box(emojify(`:rocket: ${mainText}\n\n${hintText}`), {
    ...boxOptions,
    title: name,
  })
);

log(readFileSync(0, "utf-8"));

// server.listen();
