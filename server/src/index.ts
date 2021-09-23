import { createWarthogServer } from "./createWarthogServer";

export const PORT = process.env.PORT ? +process.env.PORT : undefined;

const server = createWarthogServer(PORT);

server.listen();
