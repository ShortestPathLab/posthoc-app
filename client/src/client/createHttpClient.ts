import { lowerFirst, merge } from "lodash-es";
import { Overloads } from "utils/Overloads";
import { ResponseCodeError } from "./ResponseCodeError";

export type RequestOptions<T = string> = {
  /**
   * The expected result type of the request.
   */
  result?: T;
  /**
   * A label for the request in the logs.
   */
  label?: string;
  /**
   * An optional path to append to the default API endpoint.
   */
  path?: string;
  /**
   * An optional request body to send.
   */
  body?: null | FormData | Record<string, unknown>;
};

type RequestHandler<
  O extends Record<string, unknown> = Record<string, unknown>,
> = {
  (options: O & RequestOptions<"raw">): Response | Promise<Response>;
  (options: O & RequestOptions<"blob">): Promise<Blob>;
  (options: O & RequestOptions<"text">): Promise<string>;
  <R>(options: O & RequestOptions<"json">): Promise<R>;
};

type Key = Exclude<
  Parameters<Overloads<RequestHandler>>[0]["result"],
  undefined
>;
type Result<K> = ReturnType<
  Extract<Overloads<RequestHandler>, (o: RequestOptions<K>) => unknown>
>;

const extractions = {
  raw: (r) => r,
  text: (r) => r.text(),
  blob: (r) => r.blob(),
  json: (r) => r.json(),
} satisfies {
  [K in Key]: (r: Response) => Result<K>;
};

type Method = "get" | "post" | "put" | "delete" | "patch" | "head" | "options";

/**
 * Creates an HTTP client with convenience methods for making requests.
 *
 * @param base The base URL of the API.
 * @param getHeaders A function that returns a promise that resolves to an
 * object with headers to include in the request.
 *
 * @returns An object with convenience methods for making requests. Each method
 * is a wrapper around the `fetch` function and takes an options object with
 * properties:
 *
 * - `label`: The label to log for the request. Defaults to `'Request'`.
 * - `path`: The path to append to the base URL. Defaults to an empty string.
 * - `body`: The request body. If given, it must be a `FormData` object or a
 * plain object. If a plain object, it will be stringified as JSON and sent with
 * a `Content-Type` header set to `'application/json'`.
 * - `auth`: Whether to include authentication headers in the request. Defaults
 * to `false`.
 * - `result`: The type of the result. If given, it must be one of `'raw'`,
 * `'blob'`, or `'json'`. Defaults to `'raw'`.
 *
 * Each convenience method returns a promise that resolves to the result of the
 * request. If the response status code is not in the 200 range, a
 * `ResponseCodeError` is thrown. If the promise rejects for any other reason,
 * an `Error` is thrown with the original error as the `cause` property.
 */
export const createClient = <
  O extends Record<string, unknown> = Record<string, unknown>,
>(
  base: string,
  getHeaders: (options: O & RequestOptions) => Promise<Record<string, string>>
) =>
  new Proxy(
    (method: Method) =>
      async <K extends Key>(options: O & RequestOptions<K>) => {
        const { label = "Request", path = "", body, result } = options;
        try {
          console.log(`Making request '${label}'`);
          const response = await fetch(
            `${base}${path}`,
            merge(
              { method, headers: await getHeaders(options) },
              body
                ? body instanceof FormData
                  ? { body }
                  : {
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(body),
                    }
                : {}
            )
          );
          console.log(`'${label}' returned with status ${response.status}`);
          if (!response.ok) throw new ResponseCodeError(response);
          return await extractions[result ?? "raw"](response);
        } catch (e) {
          throw new Error(`Failed to ${lowerFirst(label)}`, {
            cause: e,
          });
        }
      },
    {
      get: (target, method: Method) => target(method),
    }
  ) as unknown as { [K in Method]: RequestHandler<O> };

export const request = createClient("", async () => ({}));
