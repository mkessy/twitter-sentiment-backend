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

export class HttpDataExtractionError extends Error {
  public _tag: "HttpDataExtractionError";
  public _error: unknown;

  private constructor(message: string, error: unknown) {
    super(`HttpDataExtractionError: ${message}`);
    this._tag = "HttpDataExtractionError";
    this._error = error;
  }

  public static of(message: string, e: unknown): HttpDataExtractionError {
    return new HttpDataExtractionError(message, e);
  }
}

export class HttpRequestError extends Error {
  public _tag: "HttpRequestError";
  public _error: unknown;

  private constructor(message: string, error: unknown) {
    super(`HttpRequestError: ${message}`);
    this._tag = "HttpRequestError";
    this._error = error;
  }

  public static of(message: string, e: unknown): HttpRequestError {
    return new HttpRequestError(message, e);
  }
}

export class HttpResponseStatusError extends Error {
  public _tag: "HttpResponseStatusError";
  public _status: number;

  private constructor(message: string, status: number) {
    super(`Network Error: ${message}`);
    this._tag = "HttpResponseStatusError";
    this._status = status;
  }

  public static of(message: string, status: number): HttpResponseStatusError {
    return new HttpResponseStatusError(message, status);
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

export type NewError =
  | BadRequestError
  | ParseError
  | NetworkError
  | HttpRequestError
  | HttpDataExtractionError
  | HttpResponseStatusError;

export const enum ErrorType {
  BadRequestError = "BadRequestError",
  ParseError = "ParseError",
  NetworkError = "NetworkError",
}
