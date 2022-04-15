// dynamo db set-up script

// look up db name from env
// look up table names from env
// aws configuration?
// if tables don't exist, create them
//

import {
  AttributeDefinition,
  CreateTableInput,
  DynamoDBClient,
  CreateTableCommand,
  KeySchemaElement,
  ListTablesCommand,
  ListTablesCommandOutput,
  CreateTableCommandOutput,
  ListTablesCommandInput,
} from "@aws-sdk/client-dynamodb";
import { Lens } from "monocle-ts";
import { flow, pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as T from "fp-ts/Task";
import * as E from "fp-ts/Either";
import * as util from "util";
import { RULES_TABLE, SENTIMENT_TABLE } from "./tableParams";

import { DynamoDBError, NewError } from "../Error/Error";

type DbTables = ListTablesCommandOutput;
const dbTablesLens = Lens.fromProp<DbTables>()("TableNames");
const client = new DynamoDBClient({ region: "us-west-2" });

const createDbTable = (
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

const listDbTables = (
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

const x = listDbTables({})(client);

const seedDb = async () => {
  const tables = pipe(
    TE.Do,
    TE.bind("tables", () => listDbTables({})(client)),
    TE.map(({ tables }) =>
      pipe(dbTablesLens.get(tables), (tables) =>
        [RULES_TABLE, SENTIMENT_TABLE].filter(
          (t) => !tables.includes(t.TableName)
        )
      )
    ),
    TE.chain((createTables) =>
      TE.traverseArray((table: CreateTableInput) =>
        createDbTable(table)(client)
      )(createTables)
    )
    //TE.map((tableOutput) => tableOutput)
  );

  const createdTables = await tables();

  pipe(
    createdTables,
    E.fold(
      (e: NewError) => console.info("Failed to seed database: " + e.message),
      (tables) => console.info("Created tables: " + util.inspect(tables))
    )
  );
};

seedDb();
