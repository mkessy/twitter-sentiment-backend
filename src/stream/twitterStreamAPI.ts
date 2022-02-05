// functions for handling the /2/tweets/search/stream/ endpoints

import { RetryPolicy, RetryStatus } from "retry-ts";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import * as RTE from "fp-ts/ReaderTaskEither";
import {
  AxiosHttpClientEnv,
  AxiosRequiredConfig,
  GetRulesResponse,
  AddRule,
  AddRulesResponse,
  DeleteRule,
  DeleteRulesResponse,
} from "../types";
import {
  DeleteRulesDecoder,
  GetRulesResponseDecoder,
  AddRulesResponseDecoder,
  DeleteRulesResponseDecoder,
} from "../decoders";
import { ReadableStream } from "node:stream/web";
import * as dotenv from "dotenv";

import { NewError } from "../Error/Error";
import { pipe } from "fp-ts/lib/function";
import {
  axiosFetchAndDecode,
  axiosHttpClientEnv,
  axiosRequest,
  getData,
  validateStatus,
} from "../utils/axiosUtils";
import * as path from "path";
import { DecodeError } from "io-ts/lib/Decoder";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

interface APIConfig {
  endpoint: string;
  axiosConfig: AxiosRequiredConfig;
}

// TODO: remove magic numbers and centralize the config
const tweetStreamConfig: APIConfig = {
  endpoint: "https://api.twitter.com/2/tweets/search/stream",
  axiosConfig: {
    headers: {
      Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
    },
    method: "get",
    responseType: "stream",
    timeout: 25000, // need timeout higher than 20 secs for heartbeat
  },
};

const connectToTweetStream: RTE.ReaderTaskEither<
  AxiosHttpClientEnv,
  NewError,
  NodeJS.ReadStream
> = pipe(
  tweetStreamConfig,
  ({ endpoint, axiosConfig }) => axiosRequest(endpoint, axiosConfig),
  RTE.chainEitherKW(validateStatus([200])),
  RTE.chainTaskEitherK(getData)
);

const getRulesConfig: APIConfig = {
  endpoint: "https://api.twitter.com/2/tweets/search/stream/rules",
  axiosConfig: {
    headers: {
      Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
    },
    method: "get",
    responseType: "json",
    timeout: 5000, // need timeout higher than 20 secs for heartbeat
  },
};

const getTweetStreamRules: RTE.ReaderTaskEither<
  AxiosHttpClientEnv,
  NewError | DecodeError,
  GetRulesResponse
> = pipe(
  getRulesConfig,
  ({ endpoint, axiosConfig }) => axiosRequest(endpoint, axiosConfig),
  RTE.chainEitherKW(validateStatus([200])),
  RTE.chainTaskEitherKW(getData),
  RTE.chainEitherKW(GetRulesResponseDecoder.decode)
);

const addRulesConfig: APIConfig = {
  endpoint: "https://api.twitter.com/2/tweets/search/stream/rules",
  axiosConfig: {
    headers: {
      Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
    },
    method: "post",
    responseType: "json",
    timeout: 5000,
  },
};

const addTweetStreamRules: (
  rules: AddRule
) => RTE.ReaderTaskEither<
  AxiosHttpClientEnv,
  NewError | DecodeError,
  AddRulesResponse
> = (rules) =>
  pipe(
    addRulesConfig,
    ({ endpoint, axiosConfig }) =>
      axiosRequest(endpoint, { ...axiosConfig, data: rules }),
    RTE.chainEitherKW(validateStatus([201])),
    RTE.chainTaskEitherK(getData),
    RTE.chainEitherKW(AddRulesResponseDecoder.decode)
  );

const deleteRulesConfig: APIConfig = {
  endpoint: "https://api.twitter.com/2/tweets/search/stream/rules",
  axiosConfig: {
    headers: {
      Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
    },
    method: "post",
    responseType: "json",
    timeout: 5000,
  },
};

const deleteTweetStreamRules: (
  rules: DeleteRule
) => RTE.ReaderTaskEither<
  AxiosHttpClientEnv,
  NewError | DecodeError,
  DeleteRulesResponse
> = (rules) =>
  pipe(
    deleteRulesConfig,
    ({ endpoint, axiosConfig }) =>
      axiosRequest(endpoint, { ...axiosConfig, data: rules }),
    RTE.chainEitherKW(validateStatus([201])),
    RTE.chainTaskEitherK(getData),
    RTE.chainEitherKW(DeleteRulesResponseDecoder.decode)
  );

export const twitterAPIService = (env: AxiosHttpClientEnv) => ({
  connectToTweetStream: connectToTweetStream(env),
  getTweetStreamRules: getTweetStreamRules(env),
  addTweetStreamRules: (rules: AddRule) => addTweetStreamRules(rules)(env),
  deleteTweetStreamRules: (rules: DeleteRule) =>
    deleteTweetStreamRules(rules)(env),
});
