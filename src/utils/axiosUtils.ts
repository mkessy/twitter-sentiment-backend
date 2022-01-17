import axios, { AxiosRequestConfig } from "axios";
import { NetworkError, NewError, ParseError } from "../Error/Error";
import * as TE from "fp-ts/lib/TaskEither";
import * as D from "io-ts/Decoder";
import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/Either";

const axiosGet = async <T>(url: string, config?: AxiosRequestConfig) => {
  console.log(`fetching ${url}`);
  return axios
    .get<T>(url, {
      ...config,
      validateStatus: function (status) {
        return status === 200; //tell axios to throw if the response code is anything but OK
      },
      //timeout: 4000,
    })
    .then((res) => {
      return res.data;
    });
};

const axiosPost = async <T, D>(url: string, data: D) => {
  console.log(`posting ${url}`);
  return axios
    .post<T>(url, data, {
      validateStatus: function (status) {
        return status === 200; //tell axios to throw if the response code is anything but OK
      },
      timeout: 4000,
    })
    .then((res) => {
      return res.data;
    });
};

// wrap the promise returned by axios in a TaskEither monad
export const axiosGetTask = TE.tryCatchK(axiosGet, (reason) =>
  NetworkError.of(String(reason))
);

export const axiosPostTask = TE.tryCatchK(axiosPost, (reason) =>
  NetworkError.of(String(reason))
);

// "safe" fetching with runtime validation provided by the decoder
export const safeFetchAndDecode = <T>(
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
