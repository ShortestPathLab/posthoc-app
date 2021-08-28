export interface Message {}

export interface Request<T extends string = any, U = any> extends Message {
  method: T;
  params: U;
  id?: string | number;
}

export interface ResponseError {
  code?: number;
  message?: string;
  data?: any;
}

export interface Response<T = any> {
  result?: T;
  error?: ResponseError;
}

export interface Method<
  RequestType extends Request<any> = any,
  ResponseType extends Response = any
> {
  request?: RequestType;
  response?: ResponseType;
}

export type RequestOf<M extends Method> = M extends Method<infer U, any>
  ? U
  : never;
export type ResponseOf<M extends Method> = M extends Method<any, infer U>
  ? U
  : never;

export type Namespace<
  Namespace extends string,
  Method extends string,
  Parameters
> = Request<`${Namespace}/${Method}`, Parameters>;
