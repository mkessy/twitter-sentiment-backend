// functions for handling the /2/tweets/search/stream/ endpoints

import { RetryPolicy, RetryStatus } from "retry-ts";
import * as TE from "fp-ts/TaskEither";
import { TweetStreamConfig } from "../types";
import { NewError } from "../Error/Error";

/* declare function connectToTweetStream(): (
  config: TweetStreamConfig
) => () => TE.TaskEither<NewError, NodeJS.ReadableStream>;

declare function runTweetStream(): () => void;

const connectToTweetStream = (config: TweetStreamConfig) => () => {};
 */
