import { processStream } from "./processStream";
import { twitterAPIService } from "./twitterStreamAPI";
import { reconnectStream } from "../utils/reconnect";
import * as O from "fp-ts-rxjs/Observable";
import * as OE from "fp-ts-rxjs/ObservableEither";
import * as IO from "fp-ts/IO";
import { axiosHttpClientEnv } from "../utils/axiosUtils";
import { pipe } from "fp-ts/lib/function";
import { NewError } from "../Error/Error";
import { map, share } from "rxjs/operators";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";

export const getProcessedStream = () => {
  return pipe(
    OE.fromTaskEither(
      twitterAPIService(axiosHttpClientEnv).connectToTweetStream
    ),
    OE.fold(
      (e) => OE.fromTaskEither(reconnectStream(e)),
      (stream) => O.of(E.right(stream))
    ),
    OE.chain(processStream)
  ).pipe(share());

  //return processStream(rawStream.right).pipe(share());
};
