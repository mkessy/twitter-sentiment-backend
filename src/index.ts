import { axiosHttpClientEnv } from "./utils/axiosUtils";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import * as T from "fp-ts/Task";
import * as E from "fp-ts/Either";
import * as IO from "fp-ts/IO";
import { pipeline } from "stream";

import "dotenv/config";

import { twitterAPIService } from "./stream/twitterStreamAPI";
import { parseToJson, stringifyStream } from "./stream/tweetStreamTransforms";
import { NewError } from "./Error/Error";

import {
  capDelay,
  constantDelay,
  limitRetries,
  Monoid,
  RetryStatus,
} from "retry-ts";
import { retrying } from "retry-ts/Task";

console.log(process.env.BEARER_TOKEN);

const streamAPI = twitterAPIService(axiosHttpClientEnv);

const policy = capDelay(
  2000,
  Monoid.concat(constantDelay(500), limitRetries(25))
);

/* const getTweetStream = pipe(
  streamAPI.connectToTweetStream,
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
 */
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

/* const runTweetStream = () => {
  return pipe(
    connectToStream,
    TE.fold(
      (e: NewError) => {
        switch (e._tag) {
          case "HttpResponseStatusError":
            return connectToStream; // TODO match on status code and write retry logic for each code type
          default:
            return T.of(E.left(e));
        }
      },
      (streamIO) => T.of(E.right(streamIO.pipe(tweetPipe)))
    )
  );
}; */

// TODO put this inside of a main IO function
connectToStream().then((streamEither) => {
  pipe(
    streamEither,
    E.foldW(
      (e: NewError) => {
        console.log(e);
        connectToStream().then((val) => console.log("failed a second time"));
      },
      (stream) =>
        pipeline(stream, parseToJson, stringifyStream, process.stdout, (err) =>
          console.error("stream closed", err)
        )
    )
  );
});
