import { createAdapter } from "./createAdapter";

export const PORT = process.env.PORT ? +process.env.PORT : undefined;

const server = createAdapter(PORT);

server.listen();
