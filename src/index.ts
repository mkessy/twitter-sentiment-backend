import { axiosFetch, axiosHttpClientEnv } from "./utils/axiosUtils";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import * as T from "fp-ts/Task";
import * as E from "fp-ts/Either";
import * as IO from "fp-ts/IO";
import { pipeline } from "stream";

import * as dotenv from "dotenv";
import { AxiosRequiredConfig } from "./types";
import { connectToTweetStream } from "./stream/twitterStreamAPI";
import {
  parseToJson,
  decodeTransformStream,
  logStream,
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

dotenv.config();

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
  Monoid.concat(constantDelay(1), limitRetries(100))
);

const result = retrying(
  policy,
  (status) => () => {
    console.log(status);
    return executeRunTweetStream();
  },
  E.isLeft
);

const executeRunTweetStream = pipe(
  connectToTweetStream(axiosHttpClientEnv),
  TE.map((tweetStream) =>
    IO.of(
      pipeline(tweetStream, parseToJson, process.stdout, (err) =>
        console.error("stream closed")
      )
    )
  )
);

executeRunTweetStream().then((value) => {
  console.log(value);
  if (E.isLeft(value)) {
    result().then((val) => console.log("failed after retrying?", val));
  } else {
    console.log(
      "succeeded",
      pipe(
        value,
        E.map((stream) => stream())
      )
    );
  }
});

/* const runTweetStream = pipe(
  executeRunTweetStream,
  TE.matchEW(
    (e) => result,
    (stream) => {
      console.log("stream sucess");
      return T.of(stream);
    }
  )
)().then((val) => console.log("stream success")); */

/* runTweetStream().then((stream) =>
  pipe(
    stream,
    E.fold(
      (e: NewError) => console.log(e),
      (transformedStream) => transformedStream()
    )
  )
); */
