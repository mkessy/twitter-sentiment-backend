import { observable, observableEither } from "fp-ts-rxjs";
import { pipe } from "fp-ts/lib/function";
import { fromEvent, Observable, scheduled, zip, of, from } from "rxjs";
import {
  groupBy,
  bufferCount,
  mergeAll,
  map,
  takeUntil,
  mergeMap,
  concatMap,
} from "rxjs/operators";
import { TweetDecoder } from "../decoders";
import * as R from "fp-ts/Refinement";
import * as E from "fp-ts/Either";
import { tryParseChunkToJson } from "./tweetStreamTransforms";
import { Tweet } from "../types";
import { axiosHttpClientEnv, axiosRequest } from "../utils/axiosUtils";
import { postTweetsToLambda } from "./twitterStreamAPI";
import { asyncScheduler } from "rxjs";
import { fromTaskEither } from "fp-ts-rxjs/lib/ObservableEither";
import { HttpResponseStatusError, NewError } from "../Error/Error";
import { ReplaySubject } from "rxjs";

export const processStream = (stream: NodeJS.ReadStream) => {
  // all error/stream end events that should trigger clean up of subs
  const close$ = fromEvent(stream, "close");
  const end$ = fromEvent(stream, "end");
  const error$ = fromEvent<Error>(stream, "error");

  const cancelEvents = scheduled([close$, end$, error$], asyncScheduler).pipe(
    mergeAll()
  );

  const groupedTweets$ = pipe(
    fromEvent(stream, "data"),
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
        bufferCount(20), //TODO remove magic number for group buffers
        map((tweets) => [group$.key, tweets] as const)
      )
    ),
    mergeMap(([ruleId, tweets]) =>
      from(postTweetsToLambda({ ruleId, tweets })(axiosHttpClientEnv)())
    ),

    takeUntil(cancelEvents)
  );

  return groupedTweets$;
};

const tweetRefinement = R.fromEitherK((chunk: unknown) =>
  TweetDecoder.decode(chunk)
);
