import { fromEvent, Observable, from } from "rxjs";
import { TweetDecoder } from "../decoders";
import * as R from "fp-ts/Refinement";
import * as E from "fp-ts/Either";
import { tryParseChunkToJson, tweetRefinement } from "./tweetStreamTransforms";
import { axiosHttpClientEnv } from "../utils/axiosUtils";
import { postTweetsToLambda } from "./twitterStreamAPI";
import { NewError } from "../Error/Error";
import { ReplaySubject } from "rxjs";
import { pipe } from "fp-ts/lib/function";
import { finished } from "stream/promises";
import { streamMachine } from "./streamService";

// consumes the stream instance and returns an observable that will complete if the node stream closes for any reason

export const processTweetStream = (stream: NodeJS.ReadStream) => {
  if (!stream.isPaused) {
    stream.pause();
  }
  stream.on("data", (data) => {
    pipe(
      tryParseChunkToJson(data),
      TweetDecoder.decode,
      E.foldW(
        (e) => console.log(e),
        (tweet) => console.log(tweet)
      )
    );
  });
  stream.resume();

  return finished(stream);
};

export const tearDownStream = async (stream: NodeJS.ReadStream) => {
  stream.destroy();
};

/* export const nodeTweetStreamToObservable = (
  stream: NodeJS.ReadStream,
  callback: (err: unknown) => void
) => {
  if (!stream.isPaused) stream.pause();

  const data$ = fromEvent<unknown>(stream, "data");

  const cleanUp = finished(stream, (err: unknown) => {
    console.info(`encountered an error: ${err}`);
    console.info(`tearing node stream down`);
    callback(err);
    cleanUp();
    stream.destroy();
  });

  stream.resume();
  return [data$, cleanUp] as const;
};
 */
