import execSh from "exec-sh";
import { entries, trim } from "lodash";

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
  console.log(command.join(" "));
  const { stdout, stderr } = await sh(command.join(" "), true);
  if (!stderr) {
    return trim(stdout);
  } else if (errorsAsOutput) {
    return trim(stderr);
  } else throw new ExecError(stderr);
}
