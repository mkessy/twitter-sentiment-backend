import { observable } from "fp-ts-rxjs";
import { fromEvent, Observable, from } from "rxjs";
import { groupBy, bufferCount, map, mergeMap, concatMap } from "rxjs/operators";
import { TweetDecoder } from "../decoders";
import * as R from "fp-ts/Refinement";
import * as E from "fp-ts/Either";
import { tryParseChunkToJson } from "./tweetStreamTransforms";
import { axiosHttpClientEnv } from "../utils/axiosUtils";
import { postTweetsToLambda } from "./twitterStreamAPI";
import { NewError } from "../Error/Error";
import { ReplaySubject } from "rxjs";
import { flow } from "fp-ts/lib/function";
import { finished } from "stream";

// consumes the stream instance and returns an observable that will complete if the node stream closes for any reason

export const nodeTweetStreamToObservable = (
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

const tweetRefinement = R.fromEitherK((chunk: unknown) =>
  TweetDecoder.decode(chunk)
);

export const groupAndPostToLambda: (
  fa: Observable<unknown>
) => Observable<E.Either<NewError, unknown>> = flow(
  observable.map(tryParseChunkToJson),
  // should catch heartbeat and cancel stream if it isn't detected for a determined amount of time
  observable.filter(tweetRefinement),
  groupBy(
    (tweet) => tweet.matching_rules[0].id,
    (tweet) => tweet,
    () => new ReplaySubject()
  ),
  concatMap((group$) =>
    group$.pipe(
      bufferCount(2), //TODO remove magic number for group buffers
      map((tweets) => [group$.key, tweets] as const)
    )
  ),
  mergeMap(([ruleId, tweets]) =>
    from(postTweetsToLambda({ ruleId, tweets })(axiosHttpClientEnv)())
  ),
  map((v) => {
    console.info("attempted to post tweet group to lambda");
    console.info(`attempt: ${E.isLeft(v) ? "failed" : "succeeded"}`);
    return v;
  })
);
