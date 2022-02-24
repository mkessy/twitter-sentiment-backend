// Create clients and set shared const values outside of the handler.

import { LanguageServiceClient } from "@google-cloud/language";
import { googleAPIOptions } from "./google-nl-creds-api";

import {
  Handler,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
// Get the DynamoDB table name from envißronment variables

import { ListTablesCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({ region: "us-west-2" });
const languageClient = new LanguageServiceClient();

const envVars = process.env;

type ProxyHandler = Handler<APIGatewayProxyEventV2, APIGatewayProxyResultV2>;

/**
 * A simple example includes a HTTP get method to get all items from a DynamoDB table.
 */
export const processTweetSentiment: ProxyHandler = async (event, context) => {
  const text = "Arsenal sucks but Mikel Arteta is a good man";

  // Prepares a document, representing the provided text
  const document = {
    content: text,
    type: "PLAIN_TEXT" as const,
  };

  // Detects sentiment of entities in the document
  const [result] = await languageClient.analyzeEntitySentiment({
    document: document,
  });
  console.log(JSON.stringify(result));
  const entities = result.entities;

  return {
    statusCode: 200,
    body: JSON.stringify(entities),
  };
};
