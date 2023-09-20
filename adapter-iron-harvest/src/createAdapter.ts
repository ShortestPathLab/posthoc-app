import { features } from "./methods/features";
import { general } from "./methods/general";
import { RPCServer } from "./RPCServer";

export function createAdapter(port?: number) {
  return new RPCServer({
    port,
    methods: [...general, ...features],
  });
}
