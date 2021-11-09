import { features } from "./methods/features";
import { general } from "./methods/general";
import { solve } from "./methods/solve";
import { RPCServer } from "./RPCServer";

export function createServer(port?: number) {
  return new RPCServer({
    port,
    methods: [...general, ...features, ...solve],
  });
}
