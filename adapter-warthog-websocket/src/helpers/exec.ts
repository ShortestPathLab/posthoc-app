import execSh from "exec-sh";
import { trim } from "es-toolkit";
import { toPairs as entries, join } from "es-toolkit/compat";

const sh = execSh.promise;

export class ExecError extends Error {}

type Param = string | number | boolean;

type Options = {
  params?: Param[];
  args?: { [K: string]: Param };
  flags?: string[];
};

export async function exec(
  path: string,
  { params = [], args = {}, flags = [] }: Options = {},
  errorsAsOutput?: boolean
) {
  const command = [
    path,
    ...entries(args).map(([k, v]) => `--${k} ${v}`),
    ...flags.map((s) => `--${s}`),
    ...params,
  ];
  const { stdout, stderr } = await sh(command.join(" "), true);
  if (!stderr) {
    return trim(stdout);
  } else if (errorsAsOutput) {
    return trim(join([stderr, stdout], "\n"));
  } else throw new ExecError(stderr);
}
