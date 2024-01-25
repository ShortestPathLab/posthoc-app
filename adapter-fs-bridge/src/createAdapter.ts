import { RPCServer } from "RPCServer";
import { features, featuresService } from "./methods/features";
import { general } from "./methods/general";

export function createAdapter(port?: number) {
  return new RPCServer({
    port,
    methods: [...general, ...features],
    services: [featuresService],
  });
}
