// Create clients and set shared const values outside of the handler.

import { LanguageServiceClient } from "@google-cloud/language";
import { LambdaPayloadDecoder } from "./decoder";
import { putItem } from "./db";
import { LambdaError, makeLambdaError, mapErrorToResponseCode } from "./error";

import {
  Handler,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";

import {
  analyzeSentimentTask,
  lambdaPayloadToSentimentDocument,
} from "./utils";

import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
// Get the DynamoDB table name from environment variables

const languageClient = new LanguageServiceClient();
type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

/**
 * A simple example includes a HTTP get method to get all items from a DynamoDB table.
 */

export const processTweetSentiment: ProxyHandler = async (event, context) => {
  const response = await pipe(
    TE.bindTo("payload")(
      pipe(
        E.fromNullable<LambdaError>(
          makeLambdaError(
            "InvalidOrMissingEventBodyError",
            "The event body attribute cannot be empty"
          )
        )(event.body),
        E.chainW(LambdaPayloadDecoder.decode),
        TE.fromEither
      )
    ),
    TE.bindW("doc", ({ payload }) =>
      pipe(lambdaPayloadToSentimentDocument(payload), (sentimentDoc) =>
        analyzeSentimentTask({ document: sentimentDoc })(languageClient)
      )
    ),
    TE.bindW("data", ({ payload, doc }) => {
      const [sentiment] = doc;
      const { ruleId, tweets } = payload;
      return putItem({
        ruleId,
        sentiment,
        tweets,
        timestamp: Date.now().toString(),
      });
    }),
    TE.map(({ data }) => data)
  )();

  return pipe(
    response,
    E.fold(
      // TODO add functions for generating error responses by matching error type
      mapErrorToResponseCode,

      (result) => ({ statusCode: 200, body: JSON.stringify(result) })
    )
  );
};
