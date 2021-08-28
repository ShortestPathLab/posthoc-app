import { RPCServer } from "./rpcServer";
import { initialise as initialiseStaticServer } from "./staticServer";

initialiseStaticServer();

const rpcServer = new RPCServer();
rpcServer.listen();
