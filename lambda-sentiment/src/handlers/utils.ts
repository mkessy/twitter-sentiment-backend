import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";

import { LanguageServiceClient } from "@google-cloud/language";
import IAnalyzeSentimentRequest from "@google-cloud/language";
import { pipe, flow } from "fp-ts/lib/function";
import { google } from "@google-cloud/language/build/protos/protos";
import { LambdaPayload } from "../types";
import * as A from "fp-ts/Array";

const analyzeSentiment = (client: LanguageServiceClient) =>
  TE.tryCatchK(
    (document: google.cloud.language.v1.IAnalyzeSentimentRequest) =>
      client.analyzeSentiment(document),
    (reason) => `Error: ${reason}`
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
