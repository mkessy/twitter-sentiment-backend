import { axiosHttpClientEnv } from "./utils/axiosUtils";
import { pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/Either";
import * as IO from "fp-ts/IO";
import StreamService from "./stream/StreamService";

import "dotenv/config";

import { twitterAPIService } from "./stream/twitterStreamAPI";

const streamAPI = twitterAPIService(axiosHttpClientEnv);

// create new 'retrying' instances for each reconnect logic
// call them sequentially based on fail conditions

// TODO put this inside of a main IO function

const main: IO.IO<void> = async () => {
  const connectTolistener = async () => {
    const listener = await StreamService.getListener();

    listener.subscribe({
      next: (v) => {
        console.log(v);
      },
      complete: () => {
        console.log("stream complete signal registered");
        console.log("reconnecting listener...");
        connectTolistener();
      },
    });
  };

  connectTolistener();
};

main();
