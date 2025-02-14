import { chain } from "lodash";
import { getValue } from "./gradient";
import { ParseGridWorkerParameters } from "./parseGrid.worker";
import { usingMessageHandler } from "workers/usingWorker";

export type GetGridSymbolsReturnType = {
  symbols: { symbol: string; value: number }[];
};

export type GetGridSymbolsParameters = Pick<ParseGridWorkerParameters, "map">;

export function getGridSymbols({
  map: m,
}: GetGridSymbolsParameters): GetGridSymbolsReturnType {
  const lines = m.split(/\r?\n/);
  const [, , , , ...grid] = lines;
  return {
    symbols: chain(grid)
      .join("")
      .trim()
      .split("")
      .uniq()
      .map((symbol) => ({
        symbol,
        value: getValue(symbol),
      }))
      .value(),
  };
}

onmessage = usingMessageHandler(
  async ({ data }: MessageEvent<GetGridSymbolsParameters>) =>
    getGridSymbols(data)
);
