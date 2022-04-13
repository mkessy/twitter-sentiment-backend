import { axiosHttpClientEnv } from "./utils/axiosUtils";
import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/Either";
import * as IO from "fp-ts/IO";
import { inspect } from "util";

import "dotenv/config";

import { twitterAPIService } from "./stream/twitterStreamAPI";
import { getProcessedStream } from "./stream/StreamService";

const streamAPI = twitterAPIService(axiosHttpClientEnv);

// create new 'retrying' instances for each reconnect logic
// call them sequentially based on fail conditions

// TODO put this inside of a main IO function

const main: IO.IO<void> = () => {
  getProcessedStream().subscribe((val) =>
    pipe(
      val,
      E.fold(
        (e) => console.log(`${e}`),
        (processedVal) =>
          console.log(`Processed Value: ${inspect(processedVal)}`)
      )
    )
  );
};
