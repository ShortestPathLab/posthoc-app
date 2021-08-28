import { Method, Request, Response } from "./Message";

export type CheckConnectionRequest = Request<"ping">;
export type CheckConnectionResponse = Response<number>;

export type CheckConnectionMethod = Method<
  CheckConnectionRequest,
  CheckConnectionResponse
>;
