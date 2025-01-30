export class ResponseCodeError extends Error {
  constructor(e: Response) {
    super(`Response contained an error response code (${e.status})`, {
      cause: e,
    });
  }
}
