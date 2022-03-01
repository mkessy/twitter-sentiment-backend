// Create clients and set shared const values outside of the handler.

import { LanguageServiceClient } from "@google-cloud/language";
import { LambdaPayloadDecoder } from "./decoder";

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
const parseJson = E.tryCatchK(
  (body: string) => JSON.parse(body),
  (error: unknown) => `Error parsing body: ${error}`
);

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

/**
 * A simple example includes a HTTP get method to get all items from a DynamoDB table.
 */

export const processTweetSentiment: ProxyHandler = async (event, context) => {
  const payload = pipe(
    E.fromNullable("Error: missing body")(event.body),
    E.chain(parseJson),
    E.chainW(LambdaPayloadDecoder.decode),
    E.map(lambdaPayloadToSentimentDocument)
  );

  if (E.isLeft(payload))
    return {
      statusCode: 403,
      body: JSON.stringify(`Payload error: ${payload.left}`),
    };

  const sentiment = await pipe(
    payload,
    TE.fromEither,
    TE.chain((document) => analyzeSentimentTask({ document })(languageClient))
  )();

  return pipe(
    sentiment,
    E.fold(
      (err) => ({ statusCode: 500, body: JSON.stringify(err) }),
      ([result]) => ({ statusCode: 200, body: JSON.stringify(result) })
    )
  );
};
