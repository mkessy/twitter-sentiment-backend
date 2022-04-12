import { axiosHttpClientEnv } from "./utils/axiosUtils";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import * as T from "fp-ts/Task";
import * as E from "fp-ts/Either";
import * as IO from "fp-ts/IO";
import { inspect } from "util";
import { fromEvent, merge, Observable } from "rxjs";
import { groupBy, map, bufferCount, mergeAll, tap } from "rxjs/operators";
import * as R from "fp-ts/Refinement";
import { observable, observableEither } from "fp-ts-rxjs";
import { tryParseChunkToJson } from "./stream/tweetStreamTransforms";

import "dotenv/config";

import { twitterAPIService } from "./stream/twitterStreamAPI";
import {
  decodeTransformStream,
  parseToJson,
  stringifyStream,
} from "./stream/tweetStreamTransforms";
import { NewError } from "./Error/Error";

import { reconnectStream } from "./utils/reconnect";
import { processStream } from "./stream/processStream";
import { getProcessedStream } from "./stream/streamService";

const streamAPI = twitterAPIService(axiosHttpClientEnv);

// create new 'retrying' instances for each reconnect logic
// call them sequentially based on fail conditions

// TODO put this inside of a main IO function

const main: IO.IO<void> = () => {
  getProcessedStream().subscribe((val) =>
    pipe(
      val,
      E.fold(
        (e) => console.log(`${e}`),
        (processedVal) =>
          console.log(`Processed Value: ${inspect(processedVal)}`)
      )
    )
  );
};
