import { AxiosRequestConfig, AxiosResponse } from "axios";
import {
  AddRulesDecoder,
  DeleteRulesDecoder,
  GetRulesResponseDecoder,
  AddRulesResponseDecoder,
  DeleteRulesResponseDecoder,
} from "./decoders";
import * as D from "io-ts/Decoder";
import * as TE from "fp-ts/TaskEither";
import { NewError } from "./Error/Error";

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
