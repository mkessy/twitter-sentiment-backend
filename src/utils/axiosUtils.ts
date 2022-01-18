import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import {
  HttpDataExtractionError,
  HttpRequestError,
  HttpResponseStatusError,
  NetworkError,
  NewError,
  ParseError,
} from "../Error/Error";
import * as TE from "fp-ts/lib/TaskEither";
import * as D from "io-ts/Decoder";
import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/Either";
import * as RTE from "fp-ts/ReaderTaskEither";
import {
  AxiosHttpClient,
  AxiosHttpClientEnv,
  AxiosRequestConfigRequired,
} from "../types";

import { StatusCodes, getReasonPhrase } from "http-status-codes";
import { ReadonlyNonEmptyArray } from "fp-ts/lib/ReadonlyNonEmptyArray";

const axiosHttpClient: AxiosHttpClient = {
  request: (url: string, config: AxiosRequestConfigRequired) =>
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
  config: AxiosRequestConfigRequired
): RTE.ReaderTaskEither<AxiosHttpClientEnv, NewError, AxiosResponse> =>
  pipe(
    RTE.asks<AxiosHttpClientEnv, AxiosHttpClient>(
      (env: AxiosHttpClientEnv) => env.axiosHttpClient
    ),
    RTE.chainTaskEitherKW((axiosHttpClient: AxiosHttpClient) =>
      axiosHttpClient.request(url, { ...config, validateStatus: (_) => true })
    )
  );

export const axiosFetch = <T>(
  url: string,
  config: AxiosRequestConfigRequired
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
  (response: AxiosResponse): E.Either<NewError, AxiosResponse> => {
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
  config: AxiosRequestConfigRequired,
  decoder: D.Decoder<unknown, T>
): RTE.ReaderTaskEither<AxiosHttpClientEnv, NewError | D.DecodeError, T> =>
  pipe(
    axiosRequest(url, config),
    RTE.chainTaskEitherK(getData),
    RTE.chainEitherKW(decoder.decode)
  );

const axiosPost = async <T, D>(
  url: string,
  data: D,
  config?: AxiosRequestConfigRequired
) => {
  console.log(`posting ${url}`);
  return axios
    .post<T>(url, data, {
      ...config,
    })
    .then((res) => {
      return res.data;
    });
};

// wrap the promise returned by axios in a TaskEither monad
/* export const axiosGetTask = TE.tryCatchK(axiosGet, (reason) =>
  NetworkError.of(String(reason))
);

export const axiosPostTask = TE.tryCatchK(axiosPost, (reason) =>
  NetworkError.of(String(reason))
); */

// "safe" fetching with runtime validation provided by the decoder
/* export const safeFetchAndDecode = <T>(
  url: string,
  decoder: D.Decoder<unknown, T>
): TE.TaskEither<NewError, T> =>
  pipe(
    axiosGetTask<T>(url),
    TE.chainW((a) => {
      //chainW allows us to capture both types of possible errors
      const decoded = decoder.decode(a);
      return E.isLeft(decoded)
        ? TE.left(ParseError.of(String(decoded.left)))
        : TE.right(decoded.right);
    })
  );
 */
