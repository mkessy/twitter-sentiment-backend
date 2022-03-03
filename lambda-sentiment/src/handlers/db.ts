import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import {
  DynamoDBDocumentClient,
  PutCommand,
  PutCommandInput,
  PutCommandOutput,
} from "@aws-sdk/lib-dynamodb";

import { makeLambdaError } from "./error";

import { SentimentDataPoint } from "../types";

import * as TE from "fp-ts/TaskEither";

const client = new DynamoDBClient({ region: "us-west-2" });
const ddbDocClient = DynamoDBDocumentClient.from(client);

const SentimentDataPointToDynamoParams = (
  data: SentimentDataPoint
): PutCommandInput => ({
  TableName: process.env.DATABASE_TABLE,
  Item: {
    ruleId: data.ruleId,
    timestamp: data.timestamp,
    tweets: data.tweets,
    sentiment: data.sentiment,
  },
});

export const putItem = TE.tryCatchK(
  (data: SentimentDataPoint) =>
    ddbDocClient.send(new PutCommand(SentimentDataPointToDynamoParams(data))),

  (reason: unknown) => makeLambdaError("DynamoDbError", String(reason))
);
