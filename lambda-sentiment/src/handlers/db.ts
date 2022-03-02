import {
  DynamoDBClient,
  PutItemCommand,
  PutItemCommandInput,
  PutItemCommandOutput,
} from "@aws-sdk/client-dynamodb";

import { SentimentDataPoint } from "../types";
import { pipe } from "fp-ts/function";

import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from 'fp-ts/TaskEither';

const saveItem = (client: DynamoDBClient) => TE.tryCatchK(
    (data: SentimentDataPoint) => client.send()

)

export const saveSentimentDataPoint = (data: SentimentDataPoint) => pipe(
    RTE.ask<DynamoDBClient>(),
    RTE.chainTaskEitherKW((client) => )

);
