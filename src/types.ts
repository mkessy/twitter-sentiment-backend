import { AxiosRequestConfig, AxiosResponse } from "axios";
import {
  AddRulesDecoder,
  DeleteRulesDecoder,
  GetRulesResponseDecoder,
  AddRulesResponseDecoder,
  DeleteRulesResponseDecoder,
  TweetDecoder,
} from "./decoders";
import * as D from "io-ts/Decoder";
import * as t from "io-ts";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { NewError } from "./Error/Error";
import { some } from "fp-ts/lib/ReadonlyRecord";
import { pipe } from "fp-ts/lib/function";

export interface AxiosHttpClient {
  request(
    url: string,
    config: AxiosRequiredConfig
  ): TE.TaskEither<NewError, AxiosResponse>;
}

type RequireKeys<T, K extends keyof T> = Required<Pick<T, K>> & T;

type Expand<T> = { [K in keyof T]: T[K] };
export type AxiosRequiredConfig = Expand<
  RequireKeys<
    AxiosRequestConfig,
    "method" | "headers" | "timeout" | "responseType"
  >
>;

export interface AxiosHttpClientEnv {
  axiosHttpClient: AxiosHttpClient;
}

export type AddRule = D.TypeOf<typeof AddRulesDecoder>;
export type DeleteRule = D.TypeOf<typeof DeleteRulesDecoder>;
export type GetRulesResponse = D.TypeOf<typeof GetRulesResponseDecoder>;
export type AddRulesResponse = D.TypeOf<typeof AddRulesResponseDecoder>;
export type DeleteRulesResponse = D.TypeOf<typeof DeleteRulesResponseDecoder>;

export type Tweet = D.TypeOf<typeof TweetDecoder>;

// a streamId is [5-10 characters(letters only)]-[5-digit number]
interface StreamIdBrand {
  readonly StreamId: unique symbol;
}
export type StreamId = string & StreamIdBrand;

const isStreamIdString = (value: string): value is StreamId => {
  const lettersRegex = /^[A-Za-z]+$/;
  const numbersRegex = /^[0-9]+$/;
  const [letters, numbers] = value.split("-");
  if (letters === undefined) return false;
  if (numbers === undefined) return false;

  if (letters.length > 10 || letters.length < 5) return false;
  if (numbers.length !== 5) return false;

  if (!lettersRegex.test(letters)) return false;
  if (!numbersRegex.test(numbers)) return false;

  return true;
};

export const StreamIdDecoder: D.Decoder<unknown, StreamId> = pipe(
  D.string,
  D.refine(isStreamIdString, "StreamId")
);
