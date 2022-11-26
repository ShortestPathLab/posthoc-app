import { RPCServer } from "adapter";
import { features } from "./methods/features";
import { general } from "./methods/general";
import { solve } from "./methods/solve";

export const port = process.env.PORT ? +process.env.PORT : undefined;

const server = new RPCServer({
  port,
  methods: [...general, ...features, ...solve],
});

server.listen();
