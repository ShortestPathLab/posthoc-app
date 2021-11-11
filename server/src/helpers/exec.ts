import execSh from "exec-sh";
import { entries, join, trim } from "lodash";

const sh = execSh.promise;

export class ExecError extends Error {}

type Param = string | number | boolean;

type Options = {
  params?: Param[];
  flags?: { [K: string]: { value?: Param } };
};

export async function exec(
  path: string,
  { params = [], flags = {} }: Options = {},
  errorsAsOutput?: boolean
) {
  const command = [
    path,
    ...entries(flags).map(([k, v]) =>
      "value" in v ? `--${k} ${v.value}` : `--${k}`
    ),
    ...params,
  ];
  const { stdout, stderr } = await sh(command.join(" "), true);
  if (!stderr) {
    return trim(stdout);
  } else if (errorsAsOutput) {
    return trim(join([stderr, stdout], "\n"));
  } else throw new ExecError(stderr);
}
