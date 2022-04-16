// dynamo db set-up script

// look up db name from env
// look up table names from env
// aws configuration?
// if tables don't exist, create them
//

import {
  CreateTableInput,
  DynamoDBClient,
  CreateTableCommand,
  ListTablesCommand,
  ListTablesCommandOutput,
  CreateTableCommandOutput,
  ListTablesCommandInput,
} from "@aws-sdk/client-dynamodb";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import * as RTE from "fp-ts/ReaderTaskEither";

import { DynamoDBError, NewError } from "../Error/Error";

export const createDbTable = (
  table: CreateTableInput
): RTE.ReaderTaskEither<DynamoDBClient, NewError, CreateTableCommandOutput> =>
  pipe(
    RTE.ask<DynamoDBClient>(),
    RTE.chainTaskEitherKW((dbClient) =>
      TE.tryCatch(
        () => dbClient.send(new CreateTableCommand(table)),
        (reason: unknown) => DynamoDBError.of(String(reason))
      )
    )
  );

export const listDbTables = (
  command: ListTablesCommandInput
): RTE.ReaderTaskEither<DynamoDBClient, NewError, ListTablesCommandOutput> =>
  pipe(
    RTE.ask<DynamoDBClient>(),
    RTE.chainTaskEitherKW((dbClient) =>
      TE.tryCatch(
        () => dbClient.send(new ListTablesCommand(command)),
        (reason: unknown) => DynamoDBError.of(String(reason))
      )
    )
  );
