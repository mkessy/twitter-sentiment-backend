import {
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
  Method,
  ResponseType,
} from "axios";
import * as D from "io-ts/Decoder";
import * as TE from "fp-ts/TaskEither";
import { NewError } from "./Error/Error";

export interface TweetStreamConfig {
  streamEndpoint: string;
  config: AxiosRequestConfig;
}

export interface AxiosHttpClient {
  request(
    url: string,
    config: AxiosRequestConfig
  ): TE.TaskEither<NewError, AxiosResponse>;
}

export type AxiosRequestConfigRequired = Required<
  Pick<AxiosRequestConfig, "method" | "headers" | "timeout" | "responseType">
>;

export interface AxiosHttpClientEnv {
  axiosHttpClient: AxiosHttpClient;
}

const streamEndpoint =
  "https://api.twitter.com/2/tweets/search/stream?tweet.fields=context_annotations";
const axiosConfig: AxiosRequestConfig = {
  headers: {
    Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
  },
  responseType: "stream",
};
