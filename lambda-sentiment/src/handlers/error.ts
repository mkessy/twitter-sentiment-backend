// error types for the lambda function

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
