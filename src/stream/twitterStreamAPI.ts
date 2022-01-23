// functions for handling the /2/tweets/search/stream/ endpoints

import { RetryPolicy, RetryStatus } from "retry-ts";
import * as TE from "fp-ts/TaskEither";
import * as RTE from "fp-ts/ReaderTaskEither";
import { AxiosHttpClientEnv, AxiosRequiredConfig } from "../types";
import { ReadableStream } from "node:stream/web";
import * as dotenv from "dotenv";

import { NewError } from "../Error/Error";
import { pipe } from "fp-ts/lib/function";
import { axiosRequest, getData, validateStatus } from "../utils/axiosUtils";
dotenv.config();

interface TweetStreamConfig {
  streamEndpoint: string;
  axiosConfig: AxiosRequiredConfig;
}

// TODO: remove magic numbers and centralize the config
const tweetStreamConfig: TweetStreamConfig = {
  streamEndpoint: "https://api.twitter.com/2/tweets/search/stream",
  axiosConfig: {
    headers: {
      Authorization: `Barer ${process.env.BEARER_TOKEN}`,
    },
    method: "get",
    responseType: "stream",
    timeout: 25000, // need timeout higher than 20 secs for heartbeat
  },
};

declare function runTweetStream(): () => void;

export const connectToTweetStream: RTE.ReaderTaskEither<
  AxiosHttpClientEnv,
  NewError,
  NodeJS.ReadStream
> = pipe(
  tweetStreamConfig,
  ({ streamEndpoint, axiosConfig }) =>
    axiosRequest(streamEndpoint, axiosConfig),
  RTE.chainEitherKW(validateStatus([200])),
  RTE.chainTaskEitherK(getData)
);

type RulesResponse = string;
type Rules = string;
