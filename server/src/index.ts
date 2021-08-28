import { CheckConnectionMethod } from "../../protocol/CheckConnection";
import { createRPCMethod as createMethod, RPCServer } from "./RPCServer";
import { initialise as initialiseStaticServer } from "./staticServer";

initialiseStaticServer();

const rpcServer = new RPCServer({
  methods: [
    createMethod<CheckConnectionMethod>("ping", async () => Date.now()),
  ],
});

rpcServer.listen();
