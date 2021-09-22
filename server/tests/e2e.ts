import { io, Socket } from "socket.io-client";
import { RPCServer, RPCServerOptions } from "src/RPCServer";

export const PORT = 8002;

async function usingClient(handler: (client: Socket) => Promise<void>) {
  const client = io(`http://localhost:${PORT}/`);
  client.connect();
  await handler(client);
  client.disconnect();
}

async function usingServer(
  options: RPCServerOptions,
  handler: (server: RPCServer) => Promise<void>
) {
  const server = new RPCServer({ port: PORT, ...options });
  await server.listen();
  await handler(server);
  server.close();
}

export async function usingE2E(
  serverOptions: RPCServerOptions,
  handler: (client: Socket, server: RPCServer) => Promise<void>
) {
  return usingServer(serverOptions, (server) =>
    usingClient((client) => handler(client, server))
  );
}
