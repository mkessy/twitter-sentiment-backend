// Create clients and set shared const values outside of the handler.

import { LanguageServiceClient } from "@google-cloud/language";
import { LambdaPayloadDecoder } from "./decoder";

import {
  Handler,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";

import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
// Get the DynamoDB table name from envißronment variables

const languageClient = new LanguageServiceClient();

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

/**
 * A simple example includes a HTTP get method to get all items from a DynamoDB table.
 */

export const processTweetSentiment: ProxyHandler = async (event, context) => {
  const optionParseJson = O.tryCatchK((body: string) => JSON.parse(body));
  pipe(
    O.fromNullable(event.body),
    O.chain(optionParseJson),
    E.fromOption(() => "Error: Lambda payload invalid"),
    E.chainW((payload) => LambdaPayloadDecoder.decode(payload))
  );

  // Prepares a document, representing the provided text
  const document = {
    content: text,
    type: "PLAIN_TEXT" as const,
  };

  // Detects sentiment of entities in the document
  const [result] = await languageClient.analyzeSentiment({
    document: document,
  });
  console.log(JSON.stringify(result));
  const entities = result.documentSentiment;

  return {
    statusCode: 200,
    body: JSON.stringify(entities),
  };
};
