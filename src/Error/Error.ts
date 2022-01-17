// custom error classes, they extend the built-in error object
// so that we have access to the stack trace

export class NetworkError extends Error {
  public _tag: "NetworkError";

  private constructor(message: string) {
    super(`Network Error: ${message}`);
    this._tag = "NetworkError";
  }

  public static of(message: string): NetworkError {
    return new NetworkError(message);
  }
}

export class ParseError extends Error {
  public _tag: "ParseError";

  private constructor(message: string) {
    super(`Error parsing data: ${message}`);
    this._tag = "ParseError";
  }

  public static of(message: string): ParseError {
    return new ParseError(message);
  }
}

export class BadRequestError extends Error {
  public _tag: "BadRequestError";

  private constructor(message: string) {
    super(`${message}`);
    this._tag = "BadRequestError";
  }

  public static of(message: string): BadRequestError {
    return new BadRequestError(message);
  }
}

export type NewError = BadRequestError | ParseError | NetworkError;
export const enum ErrorType {
  BadRequestError = "BadRequestError",
  ParseError = "ParseError",
  NetworkError = "NetworkError",
}
