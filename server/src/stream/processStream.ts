import { observable } from "fp-ts-rxjs";
import { pipe } from "fp-ts/lib/function";
import { fromEvent, Observable, scheduled, merge } from "rxjs";
import { groupBy, bufferCount, mergeAll, map, concatAll } from "rxjs/operators";
import { TweetDecoder } from "../decoders";
import * as R from "fp-ts/Refinement";
import { tryParseChunkToJson } from "./tweetStreamTransforms";
import { Tweet } from "../types";
import { axiosHttpClientEnv, axiosRequest } from "../utils/axiosUtils";
import { postTweetsToLambda } from "./twitterStreamAPI";
import { asyncScheduler } from "rxjs";

export const processStream = (stream: NodeJS.ReadStream) => {
  // all error/stream end events that should trigger clean up of subs
  const close$ = fromEvent(stream, "close");
  const end$ = fromEvent(stream, "end");
  const error$ = fromEvent<Error>(stream, "error");

  // need to catch heartbeat
  const groupedTweets$ = pipe(
    fromEvent(stream, "data"),
    observable.map(tryParseChunkToJson),
    observable.filter(tweetRefinement),
    groupStreamTweets(25)
  );

  //TODO remove magic number for group buffers
};

const groupStreamTweets = (buffCount: number) => (tweets$: Observable<Tweet>) =>
  tweets$.pipe(
    groupBy((tweet) => tweet.matching_rules[0].id),
    map((inner) => inner.pipe(bufferCount(buffCount))),
    mergeAll()
  );

const tweetRefinement = R.fromEitherK((chunk: unknown) =>
  TweetDecoder.decode(chunk)
);
