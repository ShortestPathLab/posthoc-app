import { chain } from "lodash";
import { ParseGridWorkerParameters } from "./parseGrid.worker";

export type GetGridSymbolsReturnType = {
  symbols: string[];
};

export type GetGridSymbolsParameters = Pick<ParseGridWorkerParameters, "map">;

export function getGridSymbols({
  map: m,
}: GetGridSymbolsParameters): GetGridSymbolsReturnType {
  const lines = m.split(/\r?\n/);
  const [, , , , ...grid] = lines;
  return {
    symbols: chain(grid).join("").trim().split("").uniq().value(),
  };
}

onmessage = ({ data }: MessageEvent<GetGridSymbolsParameters>) => {
  postMessage(getGridSymbols(data));
};
