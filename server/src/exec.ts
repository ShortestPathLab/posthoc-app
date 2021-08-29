import execSh from "exec-sh";
import { entries, trim } from "lodash";

const sh = execSh.promise;

export class ExecError extends Error {}

type Param = string | number | boolean;

type Options = {
  params?: Param[];
  flags?: { [K: string]: Param };
};

export async function exec(
  path: string,
  { params = [], flags = {} }: Options = {}
) {
  const command = [
    path,
    ...entries(flags).map(([k, v]) => `--${k} ${v}`),
    ...params,
  ];
  const { stdout, stderr } = await sh(command.join(" "), true);
  if (!stderr) {
    return trim(stdout);
  } else {
    throw new ExecError(stderr);
  }
}
