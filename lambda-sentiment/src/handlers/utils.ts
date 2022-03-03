import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";

import {
  LambdaError,
  GoogleLanguageServiceError,
  makeLambdaError,
} from "./error";

import { LanguageServiceClient } from "@google-cloud/language";
import { pipe, flow } from "fp-ts/lib/function";
import { google } from "@google-cloud/language/build/protos/protos";
import { LambdaPayload } from "../types";
import * as A from "fp-ts/Array";

const analyzeSentiment = (client: LanguageServiceClient) =>
  TE.tryCatchK(
    (document: google.cloud.language.v1.IAnalyzeSentimentRequest) =>
      client.analyzeSentiment(document),
    (reason) => makeLambdaError("GoogleLanguageServiceError", String(reason))
  );

export const analyzeSentimentTask = (
  document: google.cloud.language.v1.IAnalyzeSentimentRequest
) =>
  pipe(
    RTE.ask<LanguageServiceClient>(),
    RTE.chainTaskEitherKW((client) => analyzeSentiment(client)(document))
  );

export const lambdaPayloadToSentimentDocument = (payload: LambdaPayload) =>
  pipe(
    payload.tweets,
    A.reduce("", (acc, curr) => `${acc}\n${curr.data?.text}`),
    (documentText) => ({ content: documentText, type: "PLAIN_TEXT" as const })
  );

export const parseJson = E.tryCatchK(
  (body: string) => JSON.parse(body),
  (error: unknown) =>
    makeLambdaError(
      "InvalidOrMissingEventBodyError",
      `Error parsing body: ${error}`
    )
);

// TO DO
//export const makeErrorResponse;
