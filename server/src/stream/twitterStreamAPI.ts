// functions for handling the /2/tweets/search/stream/ endpoints

import * as RTE from "fp-ts/ReaderTaskEither";
import {
  AxiosHttpClientEnv,
  AxiosRequiredConfig,
  GetRulesResponse,
  AddRule,
  AddRulesResponse,
  DeleteRule,
  DeleteRulesResponse,
  Tweet,
  LambdaSentimentPayload,
} from "../types";
import {
  DeleteRulesDecoder,
  GetRulesResponseDecoder,
  AddRulesResponseDecoder,
  DeleteRulesResponseDecoder,
  LambdaResponseDecoder,
} from "../decoders";

import "dotenv/config";

import { NewError } from "../Error/Error";
import { pipe } from "fp-ts/lib/function";
import { axiosRequest, getData, validateStatus } from "../utils/axiosUtils";
import { DecodeError } from "io-ts/lib/Decoder";

console.log("from api service");
console.log(process.env.BEARER_TOKEN);

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
  rules: AddRule,
  dryRun: boolean
) => RTE.ReaderTaskEither<
  AxiosHttpClientEnv,
  NewError | DecodeError,
  AddRulesResponse
> = (rules, dryRun) =>
  pipe(
    addRulesConfig,
    ({ endpoint, axiosConfig }) =>
      axiosRequest(`${endpoint}?dry_run=${dryRun}`, {
        ...axiosConfig,
        data: rules,
      }),
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
  rules: DeleteRule,
  dryRun: boolean
) => RTE.ReaderTaskEither<
  AxiosHttpClientEnv,
  NewError | DecodeError,
  DeleteRulesResponse
> = (rules, dryRun) =>
  pipe(
    deleteRulesConfig,
    ({ endpoint, axiosConfig }) =>
      axiosRequest(`${endpoint}?dry_run=${dryRun}`, {
        ...axiosConfig,
        data: rules,
      }),
    RTE.chainEitherKW(validateStatus([201])),
    RTE.chainTaskEitherK(getData),
    RTE.chainEitherKW(DeleteRulesResponseDecoder.decode)
  );

const postToLambdaConfig: APIConfig = {
  endpoint: `${process.env.LAMBDA_URL}`,
  axiosConfig: {
    headers: {},
    method: "post",
    responseType: "json",
    timeout: 5000,
  },
};

export const postTweetsToLambda = (lambdaPayload: LambdaSentimentPayload) =>
  pipe(
    postToLambdaConfig,
    ({ endpoint, axiosConfig }) =>
      axiosRequest(endpoint, { ...axiosConfig, data: lambdaPayload }),
    RTE.chainEitherKW(validateStatus([200])),
    RTE.chainTaskEitherK(getData)
    //RTE.chainEitherKW(LambdaResponseDecoder.decode)
  );

export const twitterAPIService = (env: AxiosHttpClientEnv) => ({
  connectToTweetStream: connectToTweetStream(env),
  getTweetStreamRules: getTweetStreamRules(env),
  addTweetStreamRules: (rules: AddRule, dryRun: boolean) =>
    addTweetStreamRules(rules, dryRun)(env),
  deleteTweetStreamRules: (rules: DeleteRule, dryRun: boolean) =>
    deleteTweetStreamRules(rules, dryRun)(env),
});
