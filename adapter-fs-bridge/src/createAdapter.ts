import { RPCServer } from "methods/RPCServer";
import { features } from "./methods/features";
import { general } from "./methods/general";

export function createAdapter(port?: number) {
  return new RPCServer({
    port,
    methods: [...general, ...features],
  });
}
