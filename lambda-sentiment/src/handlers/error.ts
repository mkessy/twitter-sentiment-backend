// error types for the lambda function

import { DecodeError } from "io-ts/lib/Decoder";

export type InvalidOrMissingEventBodyError = {
  _tag: "InvalidOrMissingEventBodyError";
  message: string;
};

export type GoogleLanguageServiceError = {
  _tag: "GoogleLanguageServiceError";
  message: string;
};

export type DynamoDbError = {
  _tag: "DynamoDbError";
  message: string;
};

export type LambdaError =
  | InvalidOrMissingEventBodyError
  | GoogleLanguageServiceError
  | DynamoDbError;

export const makeLambdaError = (
  tag:
    | "InvalidOrMissingEventBodyError"
    | "GoogleLanguageServiceError"
    | "DynamoDbError",
  m: string
): LambdaError => {
  switch (tag) {
    case "DynamoDbError":
      return { _tag: "DynamoDbError", message: m } as DynamoDbError;
    case "GoogleLanguageServiceError":
      return {
        _tag: "GoogleLanguageServiceError",
        message: m,
      } as GoogleLanguageServiceError;
    case "InvalidOrMissingEventBodyError":
      return {
        _tag: "InvalidOrMissingEventBodyError",
        message: m,
      } as InvalidOrMissingEventBodyError;
  }
};
type ErrorResponse = { statusCode: number; body: string };
export const mapErrorToResponseCode = (
  error: LambdaError | DecodeError
): ErrorResponse => {
  switch (error._tag) {
    case "DynamoDbError":
      return { statusCode: 500, body: JSON.stringify(error) };
    case "GoogleLanguageServiceError":
      return { statusCode: 500, body: JSON.stringify(error) };
    case "InvalidOrMissingEventBodyError":
      return { statusCode: 403, body: JSON.stringify(error) };
    case "Concat":
    case "Of":
      return { statusCode: 403, body: JSON.stringify(error) };
    default:
      return { statusCode: 500, body: JSON.stringify(error) };
  }
};
