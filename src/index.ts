import {
  axiosFetch,
  axiosFetchAndDecode,
  axiosHttpClientEnv,
} from "./utils/axiosUtils";
import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/Either";
import * as dotenv from "dotenv";
import { AxiosRequestConfig } from "axios";
import {
  AxiosHttpClient,
  AxiosHttpClientEnv,
  AxiosRequestConfigRequired,
} from "./types";

dotenv.config();
type Stream = NodeJS.ReadableStream;
type Tweet = {
  data: {
    id: string;
    text: string;
  };
};

const streamEndpoint =
  "https://api.twitter.com/2/tweets/search/stream?tweet.fields=context_annotations";

const rulesEndpoint = "https://api.twitter.com/2/tweets/search/stream/rules";

// with AxiosRequestConfigRequired I can make allowable calls sum types of this
// config and only use the AxiosHttpClient through those types
const axiosConfig: AxiosRequestConfigRequired = {
  method: "get",
  headers: {
    Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
  },
  timeout: 10000,
  responseType: "json",
};

const run = axiosFetch(rulesEndpoint, axiosConfig);

run(axiosHttpClientEnv)().then((result) => console.log(result));
