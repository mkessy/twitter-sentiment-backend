import { observable } from "fp-ts-rxjs";
import { pipe } from "fp-ts/lib/function";
import { fromEvent, Observable, Observer } from "rxjs";
import { groupBy, bufferCount, mergeAll, map } from "rxjs/operators";
import { TweetDecoder } from "../decoders";
import * as R from "fp-ts/Refinement";
import { tryParseChunkToJson } from "./tweetStreamTransforms";
import { Tweet } from "../types";
import { axiosHttpClientEnv, axiosRequest } from "../utils/axiosUtils";
import { postTweetsToLambda } from "./twitterStreamAPI";

export const processStream = (stream: NodeJS.ReadStream) => {
  const groupedTweets$ = pipe(
    fromEvent(stream, "data"),
    observable.map(tryParseChunkToJson),
    observable.filter(tweetRefinement),
    groupStreamTweets(25),
    observable.map((tweets) =>
      postTweetsToLambda({
        ruleId: tweets[0].matching_rules[0].id,
        tweets,
      })(axiosHttpClientEnv)
    )
    // TODO
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
