import { createServer } from "./createServer";

export const PORT = process.env.PORT ? +process.env.PORT : undefined;

const server = createServer(PORT);

server.listen();
