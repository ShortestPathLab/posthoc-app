import { _ } from "utils/chain";
import { getValue } from "./gradient";
import { ParseGridWorkerParameters } from "./parseGrid.worker";
import { usingMessageHandler } from "workers/usingWorker";
import { trim, uniq } from "es-toolkit";
import { join, map, split } from "es-toolkit/compat";

export type GetGridSymbolsReturnType = {
  symbols: { symbol: string; value: number }[];
};

export type GetGridSymbolsParameters = Pick<ParseGridWorkerParameters, "map">;

export function getGridSymbols({ map: m }: GetGridSymbolsParameters): GetGridSymbolsReturnType {
  const lines = m.split(/\r?\n/);
  const [, , , , ...grid] = lines;
  return {
    symbols: _(
      grid,
      (g) => join(g, ""),
      trim,
      (g) => split(g, ""),
      uniq,
      (g) =>
        map(g, (symbol) => ({
          symbol,
          value: getValue(symbol),
        })),
    ),
  };
}

onmessage = usingMessageHandler(async ({ data }: MessageEvent<GetGridSymbolsParameters>) =>
  getGridSymbols(data),
);
