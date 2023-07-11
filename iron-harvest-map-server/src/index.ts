import { createAdapter } from "./createAdapter";

export const PORT = process.env.PORT ? +process.env.PORT : 8002;

const server = createAdapter(PORT);

server.listen();
