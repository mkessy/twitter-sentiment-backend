import axios, { AxiosResponse } from "axios";
import {
  HttpDataExtractionError,
  HttpRequestError,
  HttpResponseStatusError,
  NewError,
} from "../Error/Error";
import * as TE from "fp-ts/lib/TaskEither";
import * as D from "io-ts/Decoder";
import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/Either";
import * as RTE from "fp-ts/ReaderTaskEither";
import {
  AxiosHttpClient,
  AxiosHttpClientEnv,
  AxiosRequiredConfig,
} from "../types";

import { StatusCodes, getReasonPhrase } from "http-status-codes";

const axiosHttpClient: AxiosHttpClient = {
  request: (url: string, config: AxiosRequiredConfig) =>
    TE.tryCatch(
      () => {
        return axios({
          ...config,
          url,
        });
      },

      (e: any) =>
        HttpRequestError.of("Error running AxiosHttpClient Request", e)
    ),
};

export const axiosHttpClientEnv: AxiosHttpClientEnv = {
  axiosHttpClient: axiosHttpClient,
};

export const axiosRequest = (
  url: string,
  config: AxiosRequiredConfig
): RTE.ReaderTaskEither<AxiosHttpClientEnv, NewError, AxiosResponse> =>
  pipe(
    RTE.asks<AxiosHttpClientEnv, AxiosHttpClient>(
      (env: AxiosHttpClientEnv) => env.axiosHttpClient
    ),
    RTE.chainTaskEitherKW((axiosHttpClient: AxiosHttpClient) =>
      axiosHttpClient.request(url, {
        ...config,
        validateStatus: (_: number) => true,
      })
    )
  );

export const axiosFetch = <T>(
  url: string,
  config: AxiosRequiredConfig
): RTE.ReaderTaskEither<AxiosHttpClientEnv, NewError, T> =>
  pipe(axiosRequest(url, config), RTE.chainTaskEitherK(getData));

export const getData = <T>(
  response: AxiosResponse<T>
): TE.TaskEither<NewError, T> =>
  TE.tryCatch(
    () => Promise.resolve(response.data),
    (e: any) =>
      HttpDataExtractionError.of("Error extracting data from response", e)
  );

export const validateStatus =
  (responsesToHandle: ReadonlyArray<StatusCodes>) =>
  (
    response: AxiosResponse
  ): E.Either<HttpResponseStatusError, AxiosResponse> => {
    if (!responsesToHandle.includes(response.status)) {
      return E.left(
        HttpResponseStatusError.of(
          `Unhandled Http Response Code ${response.status}: ${getReasonPhrase(
            response.status
          )}}`,
          response.status
        )
      );
    }
    return E.right(response);
  };

export const axiosFetchAndDecode = <T>(
  url: string,
  config: AxiosRequiredConfig,
  decoder: D.Decoder<unknown, T>
): RTE.ReaderTaskEither<AxiosHttpClientEnv, NewError | D.DecodeError, T> =>
  pipe(
    axiosRequest(url, config),
    RTE.chainTaskEitherK(getData),
    RTE.chainEitherKW(decoder.decode)
  );
