import * as IO from "fp-ts/IO";
import * as E from "fp-ts/Either";
import {
  capDelay,
  exponentialBackoff,
  constantDelay,
  RetryPolicy,
  limitRetries,
  Monoid,
} from "retry-ts";
import { retrying } from "retry-ts/Task";
import { NewError, HttpResponseStatusError } from "../Error/Error";
import { twitterAPIService } from "../stream/twitterStreamAPI";
import { axiosHttpClientEnv } from "./axiosUtils";

export const linearBackOffNetworkError = Monoid.concat(
  capDelay(16000, constantDelay(500)),
  limitRetries(10)
);

export const exponentialBackoffHTTPError = Monoid.concat(
  capDelay(10000, exponentialBackoff(5000)),
  limitRetries(10)
);

export const exponentialBackoffRateLimit = Monoid.concat(
  limitRetries(10),
  exponentialBackoff(60000)
);

const streamAPI = twitterAPIService(axiosHttpClientEnv);

export const reconnectStream = (error: NewError) => {
  if (error._tag !== "HttpResponseStatusError")
    return makeConnectStreamRetry(exponentialBackoffHTTPError);
  switch (error._status) {
    case 429:
      return makeConnectStreamRetry(exponentialBackoffRateLimit);
    case 403:
    case 401:
      return makeConnectStreamRetry(exponentialBackoffHTTPError);
    case 500:
    case 501:
    case 502:
    case 503:
    case 504:
    case 511:
      return makeConnectStreamRetry(linearBackOffNetworkError);
    default:
      return makeConnectStreamRetry(exponentialBackoffHTTPError);
  }
};

const makeConnectStreamRetry = (policy: RetryPolicy) =>
  retrying(
    policy,
    (status) => {
      console.log(status);
      return streamAPI.connectToTweetStream;
    },
    E.isLeft
  );
