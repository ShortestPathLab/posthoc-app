export interface Message {}

export interface Request<T extends string = any, U = any> extends Message {
  method: T;
  params?: U;
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

export type ResultOf<R extends Response> = R extends Response<infer U>
  ? U
  : never;

export type NameOf<R extends Request> = R extends Request<infer U> ? U : never;

export type ParamsOf<R extends Request> = R extends Request<any, infer U>
  ? U
  : never;

export type RequestOf<M extends Method> = M extends Method<infer U, any>
  ? U
  : never;
export type ResponseOf<M extends Method> = M extends Method<any, infer U>
  ? U
  : never;

export interface Method<
  RequestType extends Request<any> = Request,
  ResponseType extends Response<any> = any
> {
  name: NameOf<RequestType>;
  handler: (params: ParamsOf<RequestType>) => Promise<ResultOf<ResponseType>>;
}

export type Namespace<
  Namespace extends string,
  Method extends string,
  Parameters
> = Request<`${Namespace}/${Method}`, Parameters>;
