import { RPCServer } from "methods/RPCServer";
import { features } from "./methods/features";
import { general } from "./methods/general";
import { solve } from "./methods/solve";

export function createAdapter(port?: number) {
  return new RPCServer({
    port,
    methods: [...general, ...features, ...solve],
  });
}
