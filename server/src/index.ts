import { CheckConnectionMethod } from "../../protocol/CheckConnection";
import { createRPCMethod as createMethod, RPCServer } from "./RPCServer";
import { initialise as initialiseStaticServer } from "./staticServer";

initialiseStaticServer();

const rpcServer = new RPCServer({
  methods: [
    createMethod<CheckConnectionMethod>("about", async () => ({
      name: "Warthog Visualiser Server",
      version: "1.0.1",
    })),
  ],
});

rpcServer.listen();
