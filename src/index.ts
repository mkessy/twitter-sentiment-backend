import { axiosFetch, axiosHttpClientEnv } from "./utils/axiosUtils";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import * as T from "fp-ts/Task";
import * as E from "fp-ts/Either";
import * as IO from "fp-ts/IO";
import { pipeline } from "stream";

import "dotenv/config";

import { AxiosRequiredConfig } from "./types";
import { connectToTweetStream } from "./stream/twitterStreamAPI";
import {
  parseToJson,
  decodeTransformStream,
  logStream,
  objectModeStream,
  stringifyStream,
} from "./stream/tweetStreamTransforms";
import { NewError } from "./Error/Error";

import {
  capDelay,
  exponentialBackoff,
  constantDelay,
  limitRetries,
  Monoid,
  RetryStatus,
} from "retry-ts";
import { retrying } from "retry-ts/Task";

console.log(process.env.BEARER_TOKEN);
type Stream = NodeJS.ReadableStream;
type Tweet = {
  data: {
    id: string;
    text: string;
  };
};

const policy = capDelay(
  2000,
  Monoid.concat(constantDelay(500), limitRetries(25))
);

const result = retrying(
  policy,
  (status) => () => {
    console.log(status);
    return getTweetStream();
  },
  E.isLeft
);

const getTweetStream = pipe(
  connectToTweetStream(axiosHttpClientEnv),
  TE.map((tweetStream) =>
    IO.of(
      pipeline(
        tweetStream,
        parseToJson,
        stringifyStream,
        process.stdout,
        (err) => console.error("stream closed", err)
      )
    )
  )
);

const runTweetStream = () => {
  return pipe(
    getTweetStream,
    TE.fold(
      (e: NewError) => {
        switch (e._tag) {
          case "HttpResponseStatusError":
            return result; // TODO match on status code and write retry logic for each code type
          default:
            return T.of(E.left(e));
        }
      },
      (streamIO) => T.of(E.right(streamIO))
    ),
    T.map((stream) =>
      pipe(
        stream,
        E.fold(
          (e: NewError) => {
            console.log("unresolvable error", e);
          },
          (streamIO) => {
            console.log("starting stream");
            streamIO();
          }
        )
      )
    )
  );
};

// TODO put this inside of a main IO function
runTweetStream()();
