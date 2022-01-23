import { Console } from "console";
import { string } from "fp-ts";
import { log } from "fp-ts/Console";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as dotenv from "dotenv";

import {
  capDelay,
  exponentialBackoff,
  limitRetries,
  Monoid,
  RetryStatus,
} from "retry-ts";
import { retrying } from "retry-ts/Task";
import { NewError } from "./Error/Error";
import { AxiosRequiredConfig } from "./types";
import {
  axiosFetch,
  axiosHttpClientEnv,
  axiosRequest,
  getData,
  validateStatus,
} from "./utils/axiosUtils";

const env = dotenv.config();

console.log(env.parsed);

const axiosConfig: AxiosRequiredConfig = {
  method: "get",
  headers: {
    Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
  },
  timeout: 10000,
  responseType: "json",
};
const rulesEndpoint = "https://api.twitter.com/2/tweets/search/stream/rules";

const run = pipe(
  axiosRequest(rulesEndpoint, axiosConfig),
  RTE.chainEitherKW(validateStatus([200, 201])),
  RTE.chainTaskEitherK(getData)
);

const api = run(axiosHttpClientEnv);

const policy = capDelay(
  2000,
  Monoid.concat(exponentialBackoff(200), limitRetries(2))
);

const result = retrying<E.Either<NewError, unknown>>(
  policy,
  (status) => {
    console.log(status);
    return api;
  },
  E.isLeft
);
