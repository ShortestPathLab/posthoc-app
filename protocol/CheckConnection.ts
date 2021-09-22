import { Method, Request, Response } from "./Message";

export type CheckConnectionRequest = Request<"about">;
export type CheckConnectionResponse = Response<{
  name?: string;
  description?: string;
  version?: string;
}>;

export type CheckConnectionMethod = Method<
  CheckConnectionRequest,
  CheckConnectionResponse
>;
