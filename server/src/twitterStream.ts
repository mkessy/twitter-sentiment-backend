import { axiosHttpClientEnv } from "./utils/axiosUtils";
import { pipe } from "fp-ts/lib/function";
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

import { capDelay, constantDelay, limitRetries, Monoid } from "retry-ts";
import { retrying } from "retry-ts/Task";
import { reconnectStream } from "./utils/reconnect";
import { TweetDecoder } from "./decoders";
import { processStream } from "./stream/processStream";

console.log(process.env.BEARER_TOKEN);
const streamAPI = twitterAPIService(axiosHttpClientEnv);

const policy = capDelay(
  2000,
  Monoid.concat(constantDelay(500), limitRetries(10))
);

// create new 'retrying' instances for each reconnect logic
// call them sequentially based on fail conditions
const connectToStream = retrying(
  policy,
  (status) => {
    console.log(status);
    return streamAPI.connectToTweetStream;
  },
  E.isLeft
);

// TODO put this inside of a main IO function

const main = IO.of<T.Task<void>>(() =>
  connectToStream().then((streamEither) => {
    pipe(
      streamEither,
      E.foldW(async (e: NewError) => {
        console.log(inspect(e));
        switch (e._tag) {
          case "HttpResponseStatusError":
            const stream = await reconnectStream(e)();
            console.log("failed after retries");
            if (E.isLeft(stream)) main()();
            else break;
          default:
            console.log("unexpected error: re-running main " + e);
            main()();
            break;
        }
      }, processStream)
    );
  })
);

main()();
