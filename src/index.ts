import { axiosGetTask } from "./utils/axiosUtils";
import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/Either";
import * as dotenv from "dotenv";
import { AxiosRequestConfig } from "axios";
import * as util from "util";
import { string } from "fp-ts";

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
const axiosConfig: AxiosRequestConfig = {
  headers: {
    Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
  },
  responseType: "stream",
};

console.log(process.env.BEARER_TOKEN);

const run = axiosGetTask<Stream>(streamEndpoint, axiosConfig);

run().then((data) => {
  pipe(
    data,
    E.fold(
      (error) => console.log(error),
      (tweetStream) => {
        tweetStream.on("data", (tweet) => {
          try {
            const json = JSON.parse(tweet);
            console.log("##########################################");
            console.log(json.data.text);
            console.log(util.inspect(json.data.context_annotations));
          } catch (e) {
            console.log("heartbeat");
          }
        });
      }
    )
  );
});
