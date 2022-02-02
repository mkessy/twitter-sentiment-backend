import * as IO from "fp-ts/IO";
import * as E from "fp-ts/Either";
import { capDelay, exponentialBackoff, constantDelay } from "retry-ts";
import { retrying } from "retry-ts/Task";
import { HttpResponseStatusError } from "../Error/Error";
import { twitterAPIService } from "../stream/twitterStreamAPI";
import { axiosHttpClientEnv } from "./axiosUtils";

export const linearBackOffNetworkError = capDelay(16000, constantDelay(500));

export const exponentialBackoffHTTPError = capDelay(
  320000,
  exponentialBackoff(5000)
);

export const exponentialBackoffRateLimit = exponentialBackoff(60000);

const streamAPI = twitterAPIService(axiosHttpClientEnv);

export const reconnectStream = (error: HttpResponseStatusError) => {
  switch (error._status) {
    case 429:
      return retrying(
        exponentialBackoffRateLimit,
        (status) => IO.of(streamAPI.connectToTweetStream()),
        E.isLeft
      );
    case 403:

    default:
      break;
  }
};
