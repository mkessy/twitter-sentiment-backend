import { processStream } from "./processStream";
import { twitterAPIService } from "./twitterStreamAPI";
import { reconnectStream } from "../utils/reconnect";
import * as O from 'fp-ts-rxjs/Observable'
import * as OE from 'fp-ts-rxjs/ObservableEither'
import * as IO from "fp-ts/IO";
import { axiosHttpClientEnv } from "../utils/axiosUtils";
import { pipe } from "fp-ts/lib/function";
import { NewError } from "../Error/Error";
import { map } from "rxjs/operators";

const streamService = (
  start: (message: string) => IO.IO<void>,
  end: (message: string) => IO.IO<void>
) => {

    const rawStream$ = OE.fromTaskEither(
        twitterAPIService(axiosHttpClientEnv).connectToTweetStream
    ).pipe(map(streamEither => ))



};
